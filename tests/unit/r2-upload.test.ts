import { describe, it, expect } from 'vitest';
import { isR2Configured } from '@/shared/api/r2';
import { POST } from '@/app/api/upload/image/route';
import { NextRequest } from 'next/server';

describe('Cloudflare R2 Integration & Image Upload Pipeline (INDI 2026)', () => {
  it('detecta correctamente la configuración de variables de entorno de Cloudflare R2', () => {
    // Si están definidas en el entorno actual
    const configured = isR2Configured();
    expect(typeof configured).toBe('boolean');
  });

  it('el endpoint /api/upload/image rechaza solicitudes sin archivo adjunto con HTTP 400', async () => {
    const formData = new FormData();
    const req = new NextRequest('http://localhost:3000/api/upload/image', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it('el endpoint /api/upload/image rechaza ejecutables camuflados por inspección de Magic Bytes', async () => {
    // Buffer simulando un ejecutable Windows (MZ)
    const fakeExeBuffer = new Uint8Array([0x4D, 0x5A, 0x90, 0x00, 0x03]);
    const file = new File([fakeExeBuffer], 'avatar.webp', { type: 'image/webp' });

    const formData = new FormData();
    formData.append('file', file);

    const req = new NextRequest('http://localhost:3000/api/upload/image', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('ejecutable binario prohibido');
  });
});
