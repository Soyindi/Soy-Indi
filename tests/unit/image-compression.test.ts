import { describe, it, expect } from 'vitest';
import {
  calculateAspectRatioFit,
  compressImageClient,
} from '@/shared/lib/imageCompression';
import { cardFormSchema } from '@/entities/card/schemas';

describe('Image Compression Engine & Proportional Geometry', () => {
  it('debe mantener proporciones en imágenes horizontales (landscape) que exceden la dimensión máxima', () => {
    // 2400 x 1200 redimensionada con maxDimension = 1200
    const dims = calculateAspectRatioFit(2400, 1200, 1200);
    expect(dims.width).toBe(1200);
    expect(dims.height).toBe(600);
  });

  it('debe mantener proporciones en imágenes verticales (portrait) que exceden la dimensión máxima', () => {
    // 1000 x 2000 redimensionada con maxDimension = 1000
    const dims = calculateAspectRatioFit(1000, 2000, 1000);
    expect(dims.width).toBe(500);
    expect(dims.height).toBe(1000);
  });

  it('no debe alterar las dimensiones si la imagen es menor que la dimensión máxima', () => {
    const dims = calculateAspectRatioFit(400, 300, 800);
    expect(dims.width).toBe(400);
    expect(dims.height).toBe(300);
  });

  it('debe manejar dimensiones cuadradas 1:1 correctamente', () => {
    const dims = calculateAspectRatioFit(1600, 1600, 800);
    expect(dims.width).toBe(800);
    expect(dims.height).toBe(800);
  });

  it('debe retornar fallback seguro para dimensiones degeneradas o 0', () => {
    const dims = calculateAspectRatioFit(0, 0, 800);
    expect(dims.width).toBe(1);
    expect(dims.height).toBe(1);
  });

  it('debe retornar fallback de seguridad en entorno Node/SSR sin fallar', async () => {
    // En Node.js (Vitest sin canvas nativo), compressImageClient debe retornar el archivo original como fallback
    const mockFile = new File(['mock content'], 'avatar.jpg', { type: 'image/jpeg' });
    const result = await compressImageClient(mockFile, { maxDimension: 800 });
    expect(result.file).toBeDefined();
    expect(result.originalSize).toBe(mockFile.size);
  });
});

describe('CardFormSchema photoUrl Data URL & Web URL Contract', () => {
  const baseCard = {
    slug: 'elena-torres',
    title: 'Elena Torres',
    profession: 'Directora de Operaciones',
    themeConfig: {
      themeId: 'stellar',
      primaryColorOklch: '#6366f1',
      backgroundColorOklch: '#0f172a',
      particleBehavior: 'interactive' as const,
      particleIntensity: 'balanced' as const,
      fontFamily: 'sans',
      enableGlassRefraction: true,
    },
  };

  it('debe aceptar URLs HTTP/HTTPS públicas estándar', () => {
    const res = cardFormSchema.safeParse({
      ...baseCard,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    });
    expect(res.success).toBe(true);
  });

  it('debe aceptar Data URLs en base64 generadas por el compresor WebP/PNG', () => {
    const res = cardFormSchema.safeParse({
      ...baseCard,
      photoUrl: 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v39gAA=',
    });
    expect(res.success).toBe(true);
  });

  it('debe aceptar photoUrl vacío o null', () => {
    const resNull = cardFormSchema.safeParse({
      ...baseCard,
      photoUrl: null,
    });
    expect(resNull.success).toBe(true);

    const resEmpty = cardFormSchema.safeParse({
      ...baseCard,
      photoUrl: '',
    });
    expect(resEmpty.success).toBe(true);
  });

  it('debe rechazar cadenas que no son ni URL válida ni Data URL de imagen', () => {
    const res = cardFormSchema.safeParse({
      ...baseCard,
      photoUrl: 'javascript:alert(1)',
    });
    expect(res.success).toBe(false);

    const resRandom = cardFormSchema.safeParse({
      ...baseCard,
      photoUrl: 'archivo-local-inexistente.jpg',
    });
    expect(resRandom.success).toBe(false);
  });
});
