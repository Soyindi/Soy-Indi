/**
 * ============================================================================
 * INDI CLIENT-SIDE IMAGE COMPRESSION PIPELINE (WebP / Canvas 2D)
 * ============================================================================
 * Inspirado y adaptado con rigor Staff Engineer desde JoyasJP_Definitive.
 * Permite comprimir en el navegador fotos de tarjetas de presentación,
 * avatares, currículums (fotos y diplomas) y presentaciones interactivas.
 * 
 * Ventajas:
 * 1. Cero sobrecarga de red al servidor.
 * 2. Conversión automática a formato WebP optimizado con calidad y dimensiones configurables.
 * 3. Sanitización de nombres de archivo y exportación en objeto File nativo y Data URL (Base64).
 * 4. Fallback de seguridad transparente para SSR o entornos sin canvas.
 */

export interface ImageCompressionOptions {
  /** Ancho o alto máximo en píxeles (default: 1200) */
  maxDimension?: number;
  /** Factor de calidad de compresión WebP entre 0.1 y 1.0 (default: 0.82) */
  quality?: number;
  /** Tipo de salida deseado (default: 'image/webp') */
  mimeType?: 'image/webp' | 'image/jpeg' | 'image/png';
  /** Omitir compresión si el archivo ya es WebP y pesa menos de este umbral en bytes (default: 300KB) */
  bypassThresholdBytes?: number;
}

export interface CompressedImageResult {
  file: File;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  compressionRatioPercent: number;
  width: number;
  height: number;
}

/**
 * Calcula las nuevas dimensiones de la imagen manteniendo estrictamente la relación de aspecto.
 */
export function calculateAspectRatioFit(
  srcWidth: number,
  srcHeight: number,
  maxDimension: number
): { width: number; height: number } {
  if (srcWidth <= 0 || srcHeight <= 0 || maxDimension <= 0) {
    return { width: Math.max(1, srcWidth), height: Math.max(1, srcHeight) };
  }

  let width = srcWidth;
  let height = srcHeight;

  if (width > height) {
    if (width > maxDimension) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    }
  } else {
    if (height > maxDimension) {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  return {
    width: Math.max(1, width),
    height: Math.max(1, height),
  };
}

/**
 * Comprime un archivo File o Blob de imagen utilizando la API de HTMLCanvasElement y WebP.
 * Devuelve un objeto con el File comprimido, la representación Data URL y métricas de ahorro.
 */
export function compressImageClient(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<CompressedImageResult> {
  const {
    maxDimension = 1200,
    quality = 0.82,
    mimeType = 'image/webp',
    bypassThresholdBytes = 300 * 1024,
  } = options;

  return new Promise((resolve, reject) => {
    // Fallback de seguridad para SSR o entornos sin soporte de FileReader/Canvas
    if (typeof window === 'undefined' || !window.FileReader || !window.HTMLCanvasElement) {
      const emptyResult: CompressedImageResult = {
        file,
        dataUrl: '',
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatioPercent: 0,
        width: 0,
        height: 0,
      };
      return resolve(emptyResult);
    }

    // Si ya es WebP y está por debajo del umbral de tamaño
    if (file.type === 'image/webp' && file.size < bypassThresholdBytes) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = (e.target?.result as string) || '';
        resolve({
          file,
          dataUrl,
          originalSize: file.size,
          compressedSize: file.size,
          compressionRatioPercent: 0,
          width: 0,
          height: 0,
        });
      };
      reader.onerror = () => reject(new Error('Error al leer archivo'));
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) {
        return reject(new Error('No se pudo leer el archivo de imagen'));
      }

      const img = new Image();
      img.onerror = (err) => reject(err);
      img.onload = () => {
        const { width, height } = calculateAspectRatioFit(img.width, img.height, maxDimension);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({
            file,
            dataUrl: rawDataUrl,
            originalSize: file.size,
            compressedSize: file.size,
            compressionRatioPercent: 0,
            width: img.width,
            height: img.height,
          });
        }

        // Renderizado de alta calidad en canvas
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Exportación a Data URL y Blob
        const dataUrl = canvas.toDataURL(mimeType, quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve({
                file,
                dataUrl: rawDataUrl,
                originalSize: file.size,
                compressedSize: file.size,
                compressionRatioPercent: 0,
                width,
                height,
              });
            }

            const rawName = file.name || 'foto-perfil';
            const nameWithoutExt = rawName.substring(0, rawName.lastIndexOf('.')) || rawName;
            const ext = mimeType === 'image/webp' ? 'webp' : mimeType === 'image/png' ? 'png' : 'jpg';

            const compressedFile = new File([blob], `${nameWithoutExt}.${ext}`, {
              type: mimeType,
              lastModified: Date.now(),
            });

            const savedBytes = Math.max(0, file.size - compressedFile.size);
            const ratio = file.size > 0 ? Math.round((savedBytes / file.size) * 100) : 0;

            resolve({
              file: compressedFile,
              dataUrl,
              originalSize: file.size,
              compressedSize: compressedFile.size,
              compressionRatioPercent: ratio,
              width,
              height,
            });
          },
          mimeType,
          quality
        );
      };

      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
  });
}
