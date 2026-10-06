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
  const defaultModel = options.model || 'meta/llama-3.2-11b-vision-instruct';

  // 1. Intentar NVIDIA NIM si existe la API Key
  if (nvidiaApiKey) {
    try {
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${nvidiaApiKey}`,
        },
        body: JSON.stringify({
          model: defaultModel,
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
            modelUsed: defaultModel,
          };
        }
      } else {
        const errText = await response.text();
        console.warn(`[NVIDIA NIM Warning] Status ${response.status}: ${errText}`);
      }
    } catch (err: any) {
      console.warn('[NVIDIA NIM Warning] Error de conexión, intentando failover:', err?.message);
    }
  }

  // 2. Failover a Google Gemini (Directo / Vercel AI SDK compatible)
  if (geminiApiKey) {
    try {
      const systemMsg = messages.find((m) => m.role === 'system')?.content || '';
      const userMsgs = messages.filter((m) => m.role !== 'system');
      const combinedPrompt = systemMsg
        ? `${systemMsg}\n\n${userMsgs.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')}`
        : userMsgs.map((m) => m.content).join('\n\n');

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
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
            modelUsed: 'gemini-1.5-flash',
          };
        }
      }
    } catch (geminiErr: any) {
      console.warn('[Gemini Failover Warning]:', geminiErr?.message);
    }
  }

  // 3. Failover a OpenRouter
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
