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
  bypassCache?: boolean;
  preserveSensitiveData?: boolean;
}

import {
  isProviderAvailable,
  isProviderAvailableAsync,
  recordProviderSuccess,
  recordProviderFailure,
  generateRequestKey,
  getCachedResponse,
  getCachedResponseAsync,
  setCachedResponse,
  withInFlightCoalescing,
} from '@/shared/lib/aiCircuitBreaker';
import { maskSensitiveDataForAi } from '@/shared/lib/dataPrivacy';

export async function callNvidiaNimChat(
  messages: NvidiaChatMessage[],
  options: NvidiaNimOptions = {}
): Promise<{ success: boolean; content?: string; error?: string; modelUsed?: string }> {
  // Privacy-by-Design (Ley N° 21.719): Enmascarar RUTs y teléfonos en mensajes antes de enviar a APIs externas de IA,
  // salvo en pipelines autorizados de ingestión/extracción de documentos propios (preserveSensitiveData)
  // donde el usuario necesita expresamente recuperar sus datos de contacto reales y teléfonos de referencias.
  const shouldMask = !options.preserveSensitiveData;
  const sanitizedMessages: NvidiaChatMessage[] = messages.map((msg) => ({
    ...msg,
    content:
      shouldMask && msg.role === 'user'
        ? maskSensitiveDataForAi(msg.content, { maskRut: true, maskPhone: true, maskEmail: false }).sanitizedText
        : msg.content,
  }));

  // 0. Micro-Caché Semántica Distribuida (Redis + Memoria LRU): Retornar de inmediato si ya fue resuelto y no se solicitó bypass
  const requestKey = generateRequestKey(sanitizedMessages, options);
  if (!options.bypassCache) {
    const cached = (await getCachedResponseAsync(requestKey)) || getCachedResponse(requestKey);
    if (cached) {
      return {
        success: true,
        content: cached.content,
        modelUsed: cached.modelUsed,
      };
    }
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
      'meta/llama-3.3-70b-instruct',
      'meta/llama-3.1-70b-instruct',
      'deepseek-ai/deepseek-r1',
    ].filter(Boolean) as string[];

    // 1. Google Gemini (Tier Free Primario / Respaldo Masivo con Ventana de 1M Tokens)
    // Modelos verificados con respuesta 200 OK en tiempo real: gemini-flash-latest / gemini-2.5-flash / gemini-flash-lite-latest
    if (geminiApiKey && (await isProviderAvailableAsync('gemini'))) {
      const geminiModels = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-flash-lite-latest', 'gemini-3-flash-preview'];
      for (const gemModel of geminiModels) {
        try {
          const systemMsg = sanitizedMessages.find((m) => m.role === 'system')?.content || '';
          const userMsgs = sanitizedMessages.filter((m) => m.role !== 'system');
          const combinedPrompt = systemMsg
            ? `${systemMsg}\n\n${userMsgs.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')}`
            : userMsgs.map((m) => m.content).join('\n\n');

          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${gemModel}:generateContent?key=${geminiApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: AbortSignal.timeout(options.maxTokens && options.maxTokens > 1500 ? 20000 : 10000),
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
              setCachedResponse(requestKey, geminiText, gemModel);
              return {
                success: true,
                content: geminiText,
                modelUsed: gemModel,
              };
            }
          } else {
            const errBody = await geminiRes.text();
            console.warn(`[Gemini Warning] Status ${geminiRes.status} en ${gemModel}:`, errBody.slice(0, 200));
            if (geminiRes.status === 429 || geminiRes.status >= 500) {
              recordProviderFailure('gemini');
              break;
            }
          }
        } catch (geminiErr: any) {
          console.warn(`[Gemini Failover Warning] ${gemModel}:`, geminiErr?.message);
        }
      }
    }

    // 2. Groq LPU Ultra-Low Latency Cloud (Velocidad extrema < 350ms con modelos activos 2026)
    // Protegido por Circuit Breaker: si Groq está saturado (429/500), se salta instantáneamente a NVIDIA
    if (groqApiKey && (await isProviderAvailableAsync('groq'))) {
      const groqModels = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b', 'llama-3.3-70b-versatile'];
      for (const groqModel of groqModels) {
        try {
          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${groqApiKey}`,
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(options.maxTokens && options.maxTokens > 1500 ? 15000 : 10000),
            body: JSON.stringify({
              model: groqModel,
              messages: sanitizedMessages,
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
              setCachedResponse(requestKey, groqContent, `groq/${groqModel}`);
              return {
                success: true,
                content: groqContent,
                modelUsed: `groq/${groqModel}`,
              };
            }
          } else {
            const groqErr = await groqRes.text();
            console.warn(`[Groq Failover Warning] Status ${groqRes.status} en ${groqModel}:`, groqErr);
            if (groqRes.status === 404 || groqRes.status === 410) {
              continue; // Modelo retirado o no disponible en este tier, probar siguiente modelo del pool
            }
            if (groqRes.status === 429 || groqRes.status >= 500) {
              recordProviderFailure('groq');
              break;
            }
          }
        } catch (groqErr: any) {
          console.warn(`[Groq Failover Warning] ${groqModel}:`, groqErr?.message);
        }
      }
    }

    // 3. NVIDIA NIM Frontier Models (Fallback activo o cuando no se dispone de Groq/Gemini)
    if (nvidiaApiKey && (await isProviderAvailableAsync('nvidia'))) {
      for (const targetModel of candidateModels) {
        try {
          const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${nvidiaApiKey}`,
            },
            signal: AbortSignal.timeout(options.maxTokens && options.maxTokens > 1500 ? 15000 : 10000),
            body: JSON.stringify({
              model: targetModel,
              messages: sanitizedMessages,
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
              continue; // Probar siguiente modelo candidato
            }
            if (response.status === 429 || response.status >= 500) {
              recordProviderFailure('nvidia');
              break; // Pasar al siguiente proveedor en la jerarquía
            }
          }
        } catch (err: any) {
          console.warn(`[NVIDIA NIM Warning] Error de conexión en ${targetModel}:`, err?.message);
        }
      }
      recordProviderFailure('nvidia');
    }

    // 3. Failover a Google Gemini 2.0 Flash (Latencia <800ms, Context Caching & JSON Mode)
    if (geminiApiKey && (await isProviderAvailableAsync('gemini'))) {
      try {
        const systemMsg = sanitizedMessages.find((m) => m.role === 'system')?.content || '';
        const userMsgs = sanitizedMessages.filter((m) => m.role !== 'system');
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
    if (openRouterApiKey && (await isProviderAvailableAsync('openrouter'))) {
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
            messages: sanitizedMessages,
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
