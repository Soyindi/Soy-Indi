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

export async function callNvidiaNimChat(
  messages: NvidiaChatMessage[],
  options: NvidiaNimOptions = {}
): Promise<{ success: boolean; content?: string; error?: string; modelUsed?: string }> {
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

  // 1. Intentar NVIDIA NIM si existe la API Key probando modelos candidatos activos
  if (nvidiaApiKey) {
    for (const targetModel of candidateModels) {
      try {
        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${nvidiaApiKey}`,
          },
          signal: AbortSignal.timeout(8000),
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
            return {
              success: true,
              content: messageContent,
              modelUsed: targetModel,
            };
          }
        } else {
          const errText = await response.text();
          console.warn(`[NVIDIA NIM Warning] Status ${response.status} en ${targetModel}: ${errText}`);
          // Si el modelo expiró (410) o no se encuentra (404), continuar con el siguiente candidato
          if (response.status === 410 || response.status === 404) {
            continue;
          }
        }
      } catch (err: any) {
        console.warn(`[NVIDIA NIM Warning] Error de conexión en ${targetModel}:`, err?.message);
      }
    }
  }

  // 2. Groq LPU Ultra-Low Latency Cloud (Velocidad extrema < 200ms con Qwen 3.8 27B / GPT-OSS 120B)
  if (groqApiKey) {
    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
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
          return {
            success: true,
            content: groqContent,
            modelUsed: 'groq/qwen3.8-27b',
          };
        }
      } else {
        const groqErr = await groqRes.text();
        console.warn(`[Groq Failover Warning] Status ${groqRes.status}:`, groqErr);
      }
    } catch (groqErr: any) {
      console.warn('[Groq Failover Warning]:', groqErr?.message);
    }
  }

  // 3. Failover a Google Gemini 2.0 Flash (Latencia <800ms, Context Caching & JSON Mode)
  if (geminiApiKey) {
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
          return {
            success: true,
            content: geminiText,
            modelUsed: 'gemini-2.0-flash',
          };
        }
      }
    } catch (geminiErr: any) {
      console.warn('[Gemini Failover Warning]:', geminiErr?.message);
    }
  }

  // 4. Failover a OpenRouter
  if (openRouterApiKey) {
    try {
      const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://soyindi.cl',
          'X-Title': 'INDI Presentations AI Engine',
        },
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
          return {
            success: true,
            content: orContent,
            modelUsed: 'openrouter/gemini-2.0-flash-001',
          };
        }
      }
    } catch (orErr: any) {
      console.warn('[OpenRouter Failover Warning]:', orErr?.message);
    }
  }

  return {
    success: false,
    error: 'Sin proveedores de IA configurados o activos. Activando fallback determinista.',
  };
}
