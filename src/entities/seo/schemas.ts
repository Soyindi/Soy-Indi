import { z } from 'zod';

/**
 * Esquema Zod de validación de peticiones para IndexNow API (W3C / Search Engines RFC)
 * Protocolo de notificación push instantáneo para Bing, Yandex, Naver y motores compatibles.
 */
export const IndexNowSubmissionSchema = z.object({
  host: z.string().default('soyindi.cl'),
  key: z.string().min(8).max(128).optional(),
  keyLocation: z.string().url().optional(),
  urlList: z.array(z.string().url()).min(1).max(10000),
});

export type IndexNowSubmission = z.infer<typeof IndexNowSubmissionSchema>;

/**
 * Clave criptográfica fija canónica para IndexNow en INDI 2026.
 * Esta clave se expone públicamente en `https://soyindi.cl/[key].txt`
 * para que los motores de búsqueda verifiquen la propiedad del dominio.
 */
export const INDEXNOW_API_KEY =
  process.env.INDEXNOW_KEY || '6d8c9735a29840e6988849b251e604f3';

export const INDEXNOW_KEY_LOCATION = `https://soyindi.cl/${INDEXNOW_API_KEY}.txt`;
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
