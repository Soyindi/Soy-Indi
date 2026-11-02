/**
 * Utility to extract clean, unformatted plain text and paragraphs from Microsoft Word (.docx) files.
 * .docx files are standard ZIP archives containing 'word/document.xml'.
 * Uses native DecompressionStream ('deflate-raw') or standard Uint8Array parsing without heavyweight dependencies.
 */

function findZipEntry(buffer: Uint8Array, fileName: string): { offset: number; compressedSize: number; uncompressedSize: number; compressionMethod: number } | null {
  // Look for Central Directory headers (0x02014b50) or Local File Headers (0x04034b50)
  // Standard zip local file header signature: 0x50 0x4b 0x03 0x04
  let pos = 0;
  const maxPos = buffer.length - 30;

  while (pos < maxPos) {
    if (buffer[pos] === 0x50 && buffer[pos + 1] === 0x4b && buffer[pos + 2] === 0x03 && buffer[pos + 3] === 0x04) {
      // Local file header found
      const compressionMethod = buffer[pos + 8] | (buffer[pos + 9] << 8);
      const compressedSize = buffer[pos + 18] | (buffer[pos + 19] << 8) | (buffer[pos + 20] << 16) | (buffer[pos + 21] << 24);
      const uncompressedSize = buffer[pos + 22] | (buffer[pos + 23] << 8) | (buffer[pos + 24] << 16) | (buffer[pos + 25] << 24);
      const fileNameLength = buffer[pos + 26] | (buffer[pos + 27] << 8);
      const extraFieldLength = buffer[pos + 28] | (buffer[pos + 29] << 8);

      const entryNameBytes = buffer.subarray(pos + 30, pos + 30 + fileNameLength);
      const entryName = new TextDecoder().decode(entryNameBytes);

      const dataOffset = pos + 30 + fileNameLength + extraFieldLength;

      if (entryName === fileName) {
        return {
          offset: dataOffset,
          compressedSize,
          uncompressedSize,
          compressionMethod,
        };
      }

      // Skip past this local header and its data if compressedSize is known and valid
      if (compressedSize > 0) {
        pos = dataOffset + compressedSize;
      } else {
        pos += 4;
      }
    } else {
      pos++;
    }
  }

  return null;
}

export async function extractTextFromDocxArrayBuffer(arrayBuffer: ArrayBuffer): Promise<string> {
  const uint8 = new Uint8Array(arrayBuffer);
  const entry = findZipEntry(uint8, 'word/document.xml');

  if (!entry) {
    throw new Error('Archivo Word no contiene "word/document.xml" válido.');
  }

  let xmlString = '';

  if (entry.compressionMethod === 0) {
    // Uncompressed (Stored)
    const rawXml = uint8.subarray(entry.offset, entry.offset + entry.uncompressedSize);
    xmlString = new TextDecoder('utf-8').decode(rawXml);
  } else if (entry.compressionMethod === 8) {
    // Deflate
    const compressedData = uint8.subarray(entry.offset, entry.offset + entry.compressedSize);
    
    // Check if DecompressionStream is available (Node 18+, Edge, modern browsers)
    if (typeof DecompressionStream !== 'undefined') {
      const ds = new DecompressionStream('deflate-raw');
      const writer = ds.writable.getWriter();
      writer.write(compressedData);
      writer.close();
      const response = new Response(ds.readable);
      xmlString = await response.text();
    } else {
      // Fallback: Node.js zlib if in Node environment
      const zlib = await import('node:zlib');
      const decompressed = zlib.inflateRawSync(compressedData);
      xmlString = new TextDecoder('utf-8').decode(decompressed);
    }
  } else {
    throw new Error(`Método de compresión ZIP no soportado en DOCX: ${entry.compressionMethod}`);
  }

  return parseWordXmlToPlainText(xmlString);
}

/**
 * Parses raw Word XML into clean paragraphs with bullets and spaces
 */
export function parseWordXmlToPlainText(xml: string): string {
  // Replace paragraph endings <w:p ...> or </w:p> with newline
  let text = xml.replace(/<\/w:p>/gi, '\n');
  
  // Replace line breaks <w:br/> with newline
  text = text.replace(/<w:br[^>]*\/>/gi, '\n');

  // Replace tabs <w:tab/> with standard space or tab
  text = text.replace(/<w:tab[^>]*\/>/gi, '    ');

  // Extract text nodes <w:t ...>content</w:t>
  const paragraphs: string[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    // Extract all <w:t...> text
    const textMatches = line.match(/<w:t(?:\s+[^>]*)?>([\s\S]*?)<\/w:t>/gi);
    if (textMatches && textMatches.length > 0) {
      let lineContent = '';
      for (const m of textMatches) {
        const cleanInner = m.replace(/<w:t(?:\s+[^>]*)?>/i, '').replace(/<\/w:t>/i, '');
        // decode basic xml entities
        const decoded = cleanInner
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'");
        lineContent += decoded;
      }
      if (lineContent.trim().length > 0) {
        paragraphs.push(lineContent.trim());
      }
    }
  }

  return paragraphs.join('\n');
}
