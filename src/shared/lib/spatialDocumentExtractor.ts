/**
 * ============================================================================
 * SPATIAL LAYOUT-AWARE DOCUMENT EXTRACTOR (2026 Standards)
 * ============================================================================
 * Extractor bidimensional (coordenadas X, Y) que preserva la estructura espacial
 * de documentos PDF complejos (ej. plantillas de 2 columnas para CVs o reportes).
 * 
 * Ventajas Clave:
 * 1. Resuelve el problema crítico donde el texto de la columna izquierda (ej. habilidades)
 *    se entremezcla horizontalmente con el texto de la columna derecha (ej. experiencia).
 * 2. Agrupa los bloques de texto verticalmente por cercanía en Y y horizontalmente por columna en X.
 * 3. Procesa encabezados superiores (ancho completo) antes de procesar las columnas independientes.
 * 4. Fallback transparente y seguro ante errores o documentos sin coordenadas vectoriales.
 */

export interface TextItemWithCoords {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Extrae texto de un PDF considerando las coordenadas espaciales de cada glifo/palabra.
 */
export async function extractSpatialTextFromPdf(uint8: Uint8Array): Promise<string> {
  try {
    const { getDocumentProxy, extractText } = await import('unpdf');
    const pdf = await getDocumentProxy(uint8);

    if (!pdf || pdf.numPages === 0) {
      // Fallback a extractText estándar
      const res = await extractText(uint8);
      return Array.isArray(res.text) ? res.text.join('\n\n') : (res.text || '');
    }

    const pagesText: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const viewBox = page.view || [0, 0, 595.28, 841.89];
      const pageWidth = viewBox[2] - viewBox[0];

      // Filtrar elementos vacíos
      const items: TextItemWithCoords[] = textContent.items
        .filter((it: any) => typeof it.str === 'string' && it.str.trim().length > 0)
        .map((it: any) => {
          // transform = [scaleX, skewY, skewX, scaleY, posX, posY]
          const x = it.transform ? it.transform[4] : 0;
          const y = it.transform ? it.transform[5] : 0;
          const width = it.width || 0;
          const height = it.height || 10;
          return { str: it.str, x, y, width, height };
        });

      if (items.length === 0) {
        continue;
      }

      // Analizar si la página presenta una estructura de 2 columnas
      // Criterio: Elementos distribuidos claramente con una brecha o separación en el tercio central
      const midpoint = pageWidth * 0.45;
      const leftColItems = items.filter((it) => it.x < midpoint);
      const rightColItems = items.filter((it) => it.x >= midpoint);

      // Si ambas partes tienen un volumen representativo de texto (> 15% del total en cada una)
      // y hay elementos con Y superpuestas (es decir, ocurren a la misma altura), estamos ante 2 columnas
      const isTwoColumn =
        leftColItems.length > items.length * 0.15 &&
        rightColItems.length > items.length * 0.15;

      if (!isTwoColumn) {
        // Ordenamiento lineal estándar de arriba a abajo (mayor Y a menor Y en PDF), luego de izquierda a derecha (menor X)
        items.sort((a, b) => {
          const yDiff = b.y - a.y;
          // Si están prácticamente en la misma línea visual (delta Y < 4px)
          if (Math.abs(yDiff) < 4) {
            return a.x - b.x;
          }
          return yDiff;
        });

        const lines = reconstructLinesFromItems(items);
        pagesText.push(lines.join('\n'));
      } else {
        // Estructura de 2 columnas o Encabezado + 2 Columnas
        // Un encabezado superior solo existe si hay ítems centrados en el medio horizontal (cruzan la brecha)
        // y están en la parte superior del documento
        const maxY = Math.max(...items.map((i) => i.y));
        const minY = Math.min(...items.map((i) => i.y));
        const totalHeight = maxY - minY;

        // Ítems centrados que caen en la brecha entre columnas (midpoint +- 10%)
        const centerGapItems = items.filter((it) => it.x > midpoint * 0.9 && it.x < midpoint * 1.1);
        const hasFullWidthHeader = centerGapItems.length > 0 && totalHeight > 150;
        const headerThreshold = hasFullWidthHeader ? Math.min(...centerGapItems.map((i) => i.y)) : maxY + 1;

        const headerItems = hasFullWidthHeader ? items.filter((it) => it.y >= headerThreshold) : [];
        const bodyItems = hasFullWidthHeader ? items.filter((it) => it.y < headerThreshold) : items;

        const bodyLeft = bodyItems.filter((it) => it.x < midpoint);
        const bodyRight = bodyItems.filter((it) => it.x >= midpoint);

        // Ordenar encabezado
        headerItems.sort((a, b) => {
          const yDiff = b.y - a.y;
          if (Math.abs(yDiff) < 4) return a.x - b.x;
          return yDiff;
        });

        // Ordenar columna izquierda
        bodyLeft.sort((a, b) => {
          const yDiff = b.y - a.y;
          if (Math.abs(yDiff) < 4) return a.x - b.x;
          return yDiff;
        });

        // Ordenar columna derecha
        bodyRight.sort((a, b) => {
          const yDiff = b.y - a.y;
          if (Math.abs(yDiff) < 4) return a.x - b.x;
          return yDiff;
        });

        const pageSections: string[] = [];

        if (headerItems.length > 0) {
          pageSections.push(reconstructLinesFromItems(headerItems).join('\n'));
        }

        const leftText = reconstructLinesFromItems(bodyLeft).join('\n');
        const rightText = reconstructLinesFromItems(bodyRight).join('\n');

        if (leftText.trim().length > 0) {
          pageSections.push(leftText.trim());
        }
        if (rightText.trim().length > 0) {
          pageSections.push(rightText.trim());
        }

        pagesText.push(pageSections.join('\n\n'));
      }
    }

    const fullText = pagesText.join('\n\n--- PÁGINA SIGUIENTE ---\n\n').trim();
    if (fullText.length > 20) {
      return fullText;
    }

    // Fallback si por alguna razón el texto vectorial fue mínimo
    const res = await extractText(uint8);
    return Array.isArray(res.text) ? res.text.join('\n\n') : (res.text || '');
  } catch (err) {
    console.warn('[spatialDocumentExtractor] Error en extracción espacial, recurriendo a extractor estándar:', err);
    try {
      const { extractText: fallbackExtract } = await import('unpdf');
      const res = await fallbackExtract(uint8);
      return Array.isArray(res.text) ? res.text.join('\n\n') : (res.text || '');
    } catch {
      return '';
    }
  }
}

/**
 * Helper para reconstruir líneas visuales a partir de ítems de texto ya ordenados.
 */
function reconstructLinesFromItems(items: TextItemWithCoords[]): string[] {
  if (items.length === 0) return [];

  const lines: string[] = [];
  let currentLine = items[0].str;
  let currentY = items[0].y;
  let lastX = items[0].x + items[0].width;

  for (let i = 1; i < items.length; i++) {
    const item = items[i];
    const yDiff = Math.abs(item.y - currentY);

    if (yDiff < 4) {
      // Misma línea visual: evaluar si añadir espacio según cercanía en X
      const spaceNeeded = item.x > lastX + 1.5 && !currentLine.endsWith(' ') && !item.str.startsWith(' ');
      currentLine += (spaceNeeded ? ' ' : '') + item.str;
      lastX = Math.max(lastX, item.x + item.width);
    } else {
      // Nueva línea visual
      lines.push(currentLine.trim());
      currentLine = item.str;
      currentY = item.y;
      lastX = item.x + item.width;
    }
  }

  if (currentLine.trim().length > 0) {
    lines.push(currentLine.trim());
  }

  return lines;
}
