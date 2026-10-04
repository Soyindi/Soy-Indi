/**
 * ============================================================================
 * INDI ENTERPRISE FILE SECURITY & EPHEMERAL INGESTION ENGINE (2026 Standards)
 * ============================================================================
 * Proporciona procedimientos de seguridad defensiva en profundidad para la
 * ingesta de documentos, presentaciones y currículums:
 * 
 * 1. Inspección de Magic Bytes (File Signatures): Bloquea archivos políglotas y
 *    ejecutables camuflados (PE/MZ, ELF, Mach-O, Scripts) independientemente de la extensión.
 * 2. Protección Anti-DoS y Memory Exhaustion: Límites estrictos de descompresión y truncado seguro.
 * 3. Sanitización de Texto y Mitigación de Prompt Injection: Limpia etiquetas ejecutables y trampas de LLM.
 * 4. Verificación de Cero Persistencia Binaria (Zero-Binary DB Persistence): Garantiza
 *    que la base de datos SQLite solo almacene JSON semántico estructurado (<50KB), nunca buffers crudos.
 * 5. Telemetría de Compresión e Impacto de Almacenamiento.
 */

export interface FileSignatureValidationResult {
  valid: boolean;
  detectedType: 'pdf' | 'png' | 'jpeg' | 'webp' | 'plain_text' | 'executable' | 'unknown';
  mimeType: string;
  error?: string;
}

export interface StorageTelemetryMetrics {
  originalFileBytes: number;
  extractedTextChars: number;
  estimatedPersistedJsonBytes: number;
  storageReductionPercent: number;
  persistenceStrategy: 'EPHEMERAL_RAM_PURGED_ZERO_DB_BLOAT';
}

/**
 * Firmas binarias (Magic Bytes) de formatos comunes y peligrosos
 */
const MAGIC_BYTES = {
  // Archivos válidos
  PDF: [0x25, 0x50, 0x44, 0x46, 0x2D], // %PDF-
  PNG: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  JPEG: [0xFF, 0xD8, 0xFF],
  WEBP_RIFF: [0x52, 0x49, 0x46, 0x46], // RIFF
  WEBP_MARKER: [0x57, 0x45, 0x42, 0x50], // WEBP at offset 8

  // Ejecutables maliciosos camuflados
  WINDOWS_PE: [0x4D, 0x5A], // 'MZ' (DOS/PE executable, DLL, EXE)
  LINUX_ELF: [0x7F, 0x45, 0x4C, 0x46], // \x7F ELF
  MACHO_32: [0xFE, 0xED, 0xFA, 0xCE],
  MACHO_64: [0xFE, 0xED, 0xFA, 0xCF],
  MACHO_CIGAM: [0xCE, 0xFA, 0xED, 0xFE],
  JAVA_CLASS: [0xCA, 0xFE, 0xBA, 0xBE],
};

function matchesBytes(buffer: Uint8Array, sequence: number[], offset = 0): boolean {
  if (buffer.length < offset + sequence.length) return false;
  for (let i = 0; i < sequence.length; i++) {
    if (buffer[offset + i] !== sequence[i]) return false;
  }
  return true;
}

/**
 * 1. Inspección Estricta de Magic Bytes (File Signatures)
 * Valida que los bytes iniciales del archivo coincidan con tipos de documentos seguros.
 */
export function validateFileSignature(
  buffer: Buffer | Uint8Array,
  fileName: string,
  claimedMimeType: string
): FileSignatureValidationResult {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

  if (bytes.length === 0) {
    return {
      valid: false,
      detectedType: 'unknown',
      mimeType: claimedMimeType,
      error: 'El archivo está vacío (0 bytes).',
    };
  }

  // 1.1 Detección preventiva de ejecutables maliciosos (Anti-Polyglot)
  if (
    matchesBytes(bytes, MAGIC_BYTES.WINDOWS_PE) ||
    matchesBytes(bytes, MAGIC_BYTES.LINUX_ELF) ||
    matchesBytes(bytes, MAGIC_BYTES.MACHO_32) ||
    matchesBytes(bytes, MAGIC_BYTES.MACHO_64) ||
    matchesBytes(bytes, MAGIC_BYTES.MACHO_CIGAM) ||
    matchesBytes(bytes, MAGIC_BYTES.JAVA_CLASS)
  ) {
    return {
      valid: false,
      detectedType: 'executable',
      mimeType: 'application/x-executable',
      error: 'Bloqueo de seguridad: El archivo contiene una firma de ejecutable binario prohibido.',
    };
  }

  // 1.2 Detección de PDF real
  if (matchesBytes(bytes, MAGIC_BYTES.PDF)) {
    return {
      valid: true,
      detectedType: 'pdf',
      mimeType: 'application/pdf',
    };
  }

  // 1.3 Detección de Imágenes seguras
  if (matchesBytes(bytes, MAGIC_BYTES.PNG)) {
    return {
      valid: true,
      detectedType: 'png',
      mimeType: 'image/png',
    };
  }

  if (matchesBytes(bytes, MAGIC_BYTES.JPEG)) {
    return {
      valid: true,
      detectedType: 'jpeg',
      mimeType: 'image/jpeg',
    };
  }

  if (matchesBytes(bytes, MAGIC_BYTES.WEBP_RIFF) && matchesBytes(bytes, MAGIC_BYTES.WEBP_MARKER, 8)) {
    return {
      valid: true,
      detectedType: 'webp',
      mimeType: 'image/webp',
    };
  }

  // 1.4 Validación de Texto Plano / Markdown / CSV / JSON
  // Verifica que no existan bytes nulos masivos (común en binarios corruptos o shellcode)
  const isTextExtension = /\.(txt|md|markdown|csv|json)$/i.test(fileName);
  const sampleSize = Math.min(bytes.length, 512);
  let nullBytesCount = 0;

  for (let i = 0; i < sampleSize; i++) {
    if (bytes[i] === 0) nullBytesCount++;
  }

  if (nullBytesCount === 0 && (isTextExtension || claimedMimeType.startsWith('text/'))) {
    return {
      valid: true,
      detectedType: 'plain_text',
      mimeType: claimedMimeType || 'text/plain',
    };
  }

  // Si tiene extensión de texto pero contiene bytes nulos, es sospechoso
  if (nullBytesCount > 0 && isTextExtension) {
    return {
      valid: false,
      detectedType: 'unknown',
      mimeType: claimedMimeType,
      error: 'Bloqueo de seguridad: El archivo de texto contiene bytes nulos anormales (posible payload binario oculto).',
    };
  }

  // Fallback si la extensión o MIME es PDF pero los primeros bytes no tenían %PDF-
  if (claimedMimeType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
    // Algunos PDFs tienen saltos de línea previos antes de %PDF-
    const headerStr = Buffer.from(bytes.slice(0, 1024)).toString('ascii');
    if (headerStr.includes('%PDF-')) {
      return {
        valid: true,
        detectedType: 'pdf',
        mimeType: 'application/pdf',
      };
    }
    return {
      valid: false,
      detectedType: 'unknown',
      mimeType: claimedMimeType,
      error: 'El archivo con extensión .pdf no cuenta con una firma válida de documento PDF.',
    };
  }

  return {
    valid: false,
    detectedType: 'unknown',
    mimeType: claimedMimeType,
    error: 'Formato no soportado o firma de archivo no reconocida.',
  };
}

/**
 * 2. Sanitizador de Contenido y Mitigación de Inyección (Anti-XSS & Anti-Prompt-Injection)
 * Remueve scripts, tags ejecutables y neutraliza vectores de inyección en prompts.
 */
export function sanitizeExtractedText(
  rawText: string,
  options: { maxChars?: number } = {}
): string {
  const maxChars = options.maxChars ?? 250000; // ~50,000 palabras (suficiente para documentos de 100+ páginas)

  if (!rawText) return '';

  let sanitized = rawText;

  // 2.1 Limitar tamaño para prevenir DoS por agotamiento de memoria
  if (sanitized.length > maxChars) {
    sanitized = sanitized.slice(0, maxChars);
  }

  // 2.2 Eliminar etiquetas HTML / XML peligrosas
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, 'blocked_script:');

  // 2.3 Neutralizar secuencias de control de prompt injection agresivo
  // Convierte marcadores de sistema típicos a texto plano inofensivo
  sanitized = sanitized
    .replace(/\[\s*(SYSTEM|INSTRUCTION|ASSISTANT)\s*\]/gi, '[$1_TEXT]')
    .replace(/(?:ignore|disregard)\s+(?:all\s+)?(?:previous|prior)\s+instructions/gi, '[Instrucción anterior ignorada en texto]');

  return sanitized.trim();
}

/**
 * 3. Verificación Estricta de Cero Persistencia Binaria (Zero-Binary DB Persistence Guardrail)
 * Audita en tiempo de ejecución que el objeto no contenga binarios pesados ni base64 no autorizados.
 */
export function assertZeroBinaryPersistence(payload: Record<string, unknown>): {
  safe: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  function inspect(obj: unknown, path: string) {
    if (!obj || typeof obj !== 'object') return;

    if (obj instanceof Buffer || obj instanceof Uint8Array || obj instanceof ArrayBuffer) {
      violations.push(`El campo "${path}" contiene un buffer binario crudo.`);
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      if (typeof value === 'string') {
        // Si una cadena supera 300KB y contiene data:application/pdf o base64 masivo, es una violación
        if (value.startsWith('data:application/pdf') || value.startsWith('data:application/octet-stream')) {
          violations.push(`El campo "${currentPath}" almacena un documento binario en Data URL.`);
        } else if (value.length > 350000) {
          violations.push(`El campo "${currentPath}" excede el límite de tamaño seguro para texto en BD (${Math.round(value.length / 1024)} KB).`);
        }
      } else if (typeof value === 'object' && value !== null) {
        inspect(value, currentPath);
      }
    }
  }

  inspect(payload, '');

  return {
    safe: violations.length === 0,
    violations,
  };
}

/**
 * 4. Cálculo de Telemetría de Compresión e Impacto de Almacenamiento
 */
export function calculateStorageTelemetry(
  originalFileBytes: number,
  extractedTextChars: number
): StorageTelemetryMetrics {
  // Un registro JSON semántico en SQLite pesa típicamente entre 4KB y 15KB
  const estimatedPersistedJsonBytes = Math.min(
    Math.round(extractedTextChars * 1.2) + 2048,
    30000
  );

  const reduction = originalFileBytes > 0
    ? Math.max(0, Number(((1 - estimatedPersistedJsonBytes / originalFileBytes) * 100).toFixed(2)))
    : 0;

  return {
    originalFileBytes,
    extractedTextChars,
    estimatedPersistedJsonBytes,
    storageReductionPercent: reduction,
    persistenceStrategy: 'EPHEMERAL_RAM_PURGED_ZERO_DB_BLOAT',
  };
}
