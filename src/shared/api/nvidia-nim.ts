/**
 * ============================================================================
 * CLIENTE RESILIENTE DE INFERENCIA NVIDIA NIM (build.nvidia.com)
 * ============================================================================
 * Conecta con los microservicios de inferencia de NVIDIA para modelos de frontera:
 * - deepseek-ai/deepseek-r1 (razonamiento y deducción SCQA)
 * - meta/llama-3.3-70b-instruct (extracción estructurada JSON)
 * - qwen/qwen2.5-vl-72b-instruct (visión multimodal)
 * Con fallback automático a OpenRouter / Gemini Flash y heurísticas locales.
 */

interface NvidiaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface NvidiaNimOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: 'json_object' };
}

import {
  isProviderAvailable,
  recordProviderSuccess,
  recordProviderFailure,
  generateRequestKey,
  getCachedResponse,
  setCachedResponse,
  withInFlightCoalescing,
} from '@/shared/lib/aiCircuitBreaker';

export async function callNvidiaNimChat(
  messages: NvidiaChatMessage[],
  options: NvidiaNimOptions = {}
): Promise<{ success: boolean; content?: string; error?: string; modelUsed?: string }> {
  // 0. Micro-Caché Semántica: Retornar de inmediato (<1ms) si el prompt exacto ya fue resuelto
  const requestKey = generateRequestKey(messages, options);
  const cached = getCachedResponse(requestKey);
  if (cached) {
    return {
      success: true,
      content: cached.content,
      modelUsed: cached.modelUsed,
    };
  }

  // Deduplicación concurrente (Request Coalescing): Si dos componentes piden lo mismo al unísono
  return withInFlightCoalescing(requestKey, async () => {
    const nvidiaApiKey = process.env.NVIDIA_API_KEY || process.env.NVIDIA_NIM_API_KEY;
    const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    const groqApiKey = process.env.GROQ_API_KEY;

    // Modelos activos verificados en endpoint público de NVIDIA NIM
    const candidateModels = [
      options.model,
      'meta/llama-3.2-11b-vision-instruct',
      'meta/llama-3.2-90b-vision-instruct',
    ].filter(Boolean) as string[];

    // 1. Groq LPU Ultra-Low Latency Cloud (Velocidad extrema < 200ms con Qwen 3.8 27B)
    // Protegido por Circuit Breaker: si Groq está saturado (429/500), se salta instantáneamente a NVIDIA
    if (groqApiKey && isProviderAvailable('groq')) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(6000),
          body: JSON.stringify({
            model: 'qwen/qwen3.8-27b',
            messages,
            temperature: options.temperature ?? 0.2,
            max_tokens: options.maxTokens ?? 3000,
            response_format: options.responseFormat,
          }),
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const groqContent = groqData.choices?.[0]?.message?.content;
          if (groqContent) {
            recordProviderSuccess('groq');
            setCachedResponse(requestKey, groqContent, 'groq/qwen3.8-27b');
            return {
              success: true,
              content: groqContent,
              modelUsed: 'groq/qwen3.8-27b',
            };
          }
        } else {
          recordProviderFailure('groq');
          const groqErr = await groqRes.text();
          console.warn(`[Groq Failover Warning] Status ${groqRes.status}:`, groqErr);
        }
      } catch (groqErr: any) {
        recordProviderFailure('groq');
        console.warn('[Groq Failover Warning]:', groqErr?.message);
      }
    }

    // 2. NVIDIA NIM Frontier Models (Fallback activo o cuando no se dispone de Groq)
    if (nvidiaApiKey && isProviderAvailable('nvidia')) {
      for (const targetModel of candidateModels) {
        try {
          const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${nvidiaApiKey}`,
            },
            signal: AbortSignal.timeout(5000),
            body: JSON.stringify({
              model: targetModel,
              messages,
              temperature: options.temperature ?? 0.2,
              max_tokens: options.maxTokens ?? 3000,
              response_format: options.responseFormat,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const messageContent = data.choices?.[0]?.message?.content;
            if (messageContent) {
              recordProviderSuccess('nvidia');
              setCachedResponse(requestKey, messageContent, targetModel);
              return {
                success: true,
                content: messageContent,
                modelUsed: targetModel,
              };
            }
          } else {
            const errText = await response.text();
            console.warn(`[NVIDIA NIM Warning] Status ${response.status} en ${targetModel}: ${errText}`);
            if (response.status === 410 || response.status === 404) {
              continue;
            }
            if (response.status === 429 || response.status >= 500) {
              recordProviderFailure('nvidia');
              break; // Pasar al siguiente proveedor en la jerarquía
            }
          }
        } catch (err: any) {
          recordProviderFailure('nvidia');
          console.warn(`[NVIDIA NIM Warning] Error de conexión en ${targetModel}:`, err?.message);
        }
      }
    }

    // 3. Failover a Google Gemini 2.0 Flash (Latencia <800ms, Context Caching & JSON Mode)
    if (geminiApiKey && isProviderAvailable('gemini')) {
      try {
        const systemMsg = messages.find((m) => m.role === 'system')?.content || '';
        const userMsgs = messages.filter((m) => m.role !== 'system');
        const combinedPrompt = systemMsg
          ? `${systemMsg}\n\n${userMsgs.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')}`
          : userMsgs.map((m) => m.content).join('\n\n');

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(6000),
            body: JSON.stringify({
              contents: [{ parts: [{ text: combinedPrompt }] }],
              generationConfig: {
                temperature: options.temperature ?? 0.2,
                maxOutputTokens: options.maxTokens ?? 3000,
                responseMimeType: options.responseFormat?.type === 'json_object' ? 'application/json' : undefined,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const geminiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (geminiText) {
            recordProviderSuccess('gemini');
            setCachedResponse(requestKey, geminiText, 'gemini-2.0-flash');
            return {
              success: true,
              content: geminiText,
              modelUsed: 'gemini-2.0-flash',
            };
          }
        } else {
          recordProviderFailure('gemini');
        }
      } catch (geminiErr: any) {
        recordProviderFailure('gemini');
        console.warn('[Gemini Failover Warning]:', geminiErr?.message);
      }
    }

    // 4. Failover a OpenRouter
    if (openRouterApiKey && isProviderAvailable('openrouter')) {
      try {
        const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://soyindi.cl',
            'X-Title': 'INDI Presentations AI Engine',
          },
          signal: AbortSignal.timeout(6000),
          body: JSON.stringify({
            model: 'google/gemini-2.0-flash-001',
            messages,
            temperature: options.temperature ?? 0.2,
            max_tokens: options.maxTokens ?? 3000,
            response_format: options.responseFormat,
          }),
        });

        if (openRouterRes.ok) {
          const orData = await openRouterRes.json();
          const orContent = orData.choices?.[0]?.message?.content;
          if (orContent) {
            recordProviderSuccess('openrouter');
            setCachedResponse(requestKey, orContent, 'openrouter/gemini-2.0-flash-001');
            return {
              success: true,
              content: orContent,
              modelUsed: 'openrouter/gemini-2.0-flash-001',
            };
          }
        } else {
          recordProviderFailure('openrouter');
        }
      } catch (orErr: any) {
        recordProviderFailure('openrouter');
        console.warn('[OpenRouter Failover Warning]:', orErr?.message);
      }
    }

    return {
      success: false,
      error: 'Sin proveedores de IA configurados o activos. Activando fallback determinista.',
    };
  });
}
