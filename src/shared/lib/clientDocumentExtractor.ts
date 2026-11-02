/**
 * ============================================================================
 * CLIENT-SIDE DOCUMENT EXTRACTOR (Isomorphic Web Worker / Browser PDF Parser)
 * ============================================================================
 * Permite la extracción de texto de documentos PDF directamente en el navegador
 * del usuario utilizando unpdf / pdfjs-dist.
 * 
 * Ventajas Arquitecturales Críticas (2026 Standards):
 * 1. Neutraliza el límite estricto de 4.5 MB de Vercel / AWS Lambda en Serverless Functions.
 * 2. Reduce cargas de 5MB–25MB a payloads JSON ligeros de 5KB–25KB (Ahorro > 99.8% de red).
 * 3. Elimina errores HTTP 413 (Payload Too Large) y fallos de serialización JSON.
 * 4. Extracción instantánea en cliente con fallback seguro para SSR / Server Actions.
 */

export interface ScannedPageAttachment {
  pageNumber: number;
  base64: string;
  mimeType: string;
}

export interface ClientDocumentExtractionResult {
  text: string;
  scannedPages: ScannedPageAttachment[];
}

export async function extractTextFromPdfClient(file: File): Promise<string> {
  const res = await extractPdfWithScannedAttachmentsClient(file);
  return res.text;
}

/**
 * Extrae el texto espacial 2D del documento (PDF o DOCX) y, si detecta páginas anexas
 * dentro de un PDF híbrido con capa de texto vacía o insuficiente (< 160 caracteres,
 * como diplomas escaneados o certificados con títulos vectorizados/aplanados),
 * renderiza dichas páginas en un canvas ligero (WebP ~35KB) para OCR multimodal.
 */
export async function extractPdfWithScannedAttachmentsClient(
  file: File
): Promise<ClientDocumentExtractionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();

    // Si es un documento .docx
    if (file.name.toLowerCase().endsWith('.docx') || file.type.includes('wordprocessingml')) {
      const { extractTextFromDocxArrayBuffer } = await import('@/shared/lib/docxTextExtractor');
      const docxText = await extractTextFromDocxArrayBuffer(arrayBuffer);
      return {
        text: docxText ? docxText.trim() : '',
        scannedPages: [],
      };
    }

    const uint8 = new Uint8Array(arrayBuffer);
    let extractedText = '';
    const scannedPages: ScannedPageAttachment[] = [];

    // 1. Extracción espacial 2D layout-aware
    const { extractSpatialTextFromPdf } = await import('@/shared/lib/spatialDocumentExtractor');
    const spatialText = await extractSpatialTextFromPdf(uint8.slice());
    if (spatialText && spatialText.trim().length > 20) {
      extractedText = spatialText.trim();
    } else {
      const { extractText } = await import('unpdf');
      const res = await extractText(uint8.slice());
      const text = Array.isArray(res.text) ? res.text.join('\n\n') : (res.text || '');
      extractedText = text.trim();
    }

    // 2. Detectar páginas escaneadas o con texto aplanado (< 160 chars) en navegador
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        const { getDocumentProxy } = await import('unpdf');
        const pdf = await getDocumentProxy(uint8.slice());
        const numPages = pdf.numPages || 0;

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          if (scannedPages.length >= 6) break;
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageRawText = ((textContent.items || []) as any[])
            .map((it) => String(it?.str || ''))
            .join(' ')
            .trim();

          // Si es una página sin texto digital o con texto insuficiente (< 160 chars, ej. diploma escaneado o título en imagen)
          if (pageRawText.length < 160 && typeof (page as any).render === 'function') {
            const baseViewport = page.getViewport({ scale: 1.0 });
            const maxDim = Math.max(baseViewport.width || 600, baseViewport.height || 800);
            const scale = Math.min(1.5, 960 / maxDim);
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            canvas.width = Math.round(viewport.width);
            canvas.height = Math.round(viewport.height);
            const ctx = canvas.getContext('2d');

            if (ctx) {
              await (page as any).render({ canvasContext: ctx, viewport }).promise;
              let dataUrl = canvas.toDataURL('image/webp', 0.65);
              let mimeType = 'image/webp';
              if (!dataUrl.startsWith('data:image/webp')) {
                dataUrl = canvas.toDataURL('image/jpeg', 0.65);
                mimeType = 'image/jpeg';
              }
              const base64 = dataUrl.split(',')[1] || '';
              if (base64.length > 100 && base64.length < 250000) {
                scannedPages.push({
                  pageNumber: pageNum,
                  base64,
                  mimeType,
                });
              }
            }
          }
        }
      } catch (renderErr) {
        console.warn('[clientDocumentExtractor] Aviso renderizando páginas escaneadas:', renderErr);
      }
    }

    return {
      text: extractedText,
      scannedPages,
    };
  } catch (err) {
    console.warn('[clientDocumentExtractor] Error extrayendo texto en cliente:', err);
    return {
      text: '',
      scannedPages: [],
    };
  }
}
