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
  const apiKey = process.env.NVIDIA_API_KEY || process.env.NVIDIA_NIM_API_KEY;
  const defaultModel = options.model || 'meta/llama-3.2-11b-vision-instruct';

  // Si no hay API key configurada de NVIDIA, retornar inmediatamente para ejecutar failover
  if (!apiKey) {
    return {
      success: false,
      error: 'NVIDIA_API_KEY no configurada. Activando fallback de inferencia.',
    };
  }

  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: defaultModel,
        messages,
        temperature: options.temperature ?? 0.2,
        max_tokens: options.maxTokens ?? 3000,
        response_format: options.responseFormat,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[NVIDIA NIM Warning] Status ${response.status}: ${errText}`);
      return {
        success: false,
        error: `NVIDIA NIM API responded with ${response.status}: ${errText}`,
      };
    }

    const data = await response.json();
    const messageContent = data.choices?.[0]?.message?.content;

    if (!messageContent) {
      return { success: false, error: 'Respuesta vacía de NVIDIA NIM.' };
    }

    return {
      success: true,
      content: messageContent,
      modelUsed: defaultModel,
    };
  } catch (err: any) {
    console.error('[NVIDIA NIM Connection Error]:', err);
    return {
      success: false,
      error: err.message || 'Error de conexión con NVIDIA NIM',
    };
  }
}
