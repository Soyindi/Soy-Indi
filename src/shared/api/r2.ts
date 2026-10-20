import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * Cliente S3 para Cloudflare R2 (INDI 2026)
 * Almacenamiento perimetral con $0 Egress y compatibilidad universal S3 API.
 */
const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || 'soyindi';
const publicDomain = process.env.R2_PUBLIC_DOMAIN || '';

export const isR2Configured = (): boolean => {
  return Boolean(accountId && accessKeyId && secretAccessKey && publicDomain);
};

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined,
  credentials: {
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || '',
  },
});

export interface UploadToR2Params {
  key: string;
  buffer: Buffer | Uint8Array;
  contentType: string;
}

export interface UploadToR2Result {
  url: string;
  key: string;
  sizeBytes: number;
}

/**
 * Sube un objeto a Cloudflare R2 y retorna su URL pública accesible
 */
export async function uploadObjectToR2(params: UploadToR2Params): Promise<UploadToR2Result> {
  if (!isR2Configured()) {
    throw new Error('Cloudflare R2 no está configurado en variables de entorno');
  }

  const cleanKey = params.key.replace(/^\/+/, '');

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: cleanKey,
      Body: params.buffer,
      ContentType: params.contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  const cleanDomain = publicDomain.replace(/\/+$/, '');
  const url = `${cleanDomain}/${cleanKey}`;

  return {
    url,
    key: cleanKey,
    sizeBytes: params.buffer.byteLength,
  };
}

export interface PresignedUploadUrlParams {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}

export interface PresignedUploadUrlResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

/**
 * Genera una URL prefirmada PUT para subida directa desde el navegador a Cloudflare R2 sin proxy
 */
export async function getPresignedR2UploadUrl(params: PresignedUploadUrlParams): Promise<PresignedUploadUrlResult> {
  if (!isR2Configured()) {
    throw new Error('Cloudflare R2 no está configurado en variables de entorno');
  }

  const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
  const cleanKey = params.key.replace(/^\/+/, '');

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: cleanKey,
    ContentType: params.contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  });

  const uploadUrl = await getSignedUrl(r2Client, command, {
    expiresIn: params.expiresInSeconds || 300,
  });

  const cleanDomain = publicDomain.replace(/\/+$/, '');
  const publicUrl = `${cleanDomain}/${cleanKey}`;

  return {
    uploadUrl,
    publicUrl,
    key: cleanKey,
  };
}
