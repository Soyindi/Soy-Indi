import { describe, it, expect, vi, beforeEach } from 'vitest';
import { upsertCardAction } from '@/features/card-builder/actions';
import { getCardByIdAction } from '@/features/card-builder/dashboard-actions';

// Mock de la base de datos y cache de Next.js
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Almacén en memoria para simular Turso / SQLite
let memoryCards: any[] = [];

vi.mock('@/shared/api/db', () => ({
  db: {
    query: {
      cards: {
        findFirst: vi.fn(async ({ where }: any) => {
          // Evaluar condiciones simuladas
          return memoryCards.find((c) => {
            if (where?._type === 'eq_slug') {
              return c.slug === where.val;
            }
            if (where?._type === 'and_id_user') {
              return c.id === where.id && c.userId === where.userId;
            }
            if (where?._type === 'slug_collision_edit') {
              return c.slug === where.slug && c.id !== where.id;
            }
            return false;
          }) || null;
        }),
        findMany: vi.fn(async ({ where }: any) => {
          if (where?.userId) {
            return memoryCards.filter((c) => c.userId === where.userId);
          }
          return memoryCards;
        }),
      },
    },
    insert: vi.fn(() => ({
      values: vi.fn(async (data: any) => {
        memoryCards.push({ ...data });
        return { success: true };
      }),
    })),
    update: vi.fn(() => ({
      set: vi.fn((updateData: any) => ({
        where: vi.fn(async (cond: any) => {
          const idx = memoryCards.findIndex((c) => c.id === cond.id);
          if (idx !== -1) {
            memoryCards[idx] = { ...memoryCards[idx], ...updateData };
          }
          return { success: true };
        }),
      })),
    })),
  },
}));

// Mock de drizzle-orm preservando sql y exportaciones originales
vi.mock('drizzle-orm', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    eq: vi.fn((col: any, val: any) => ({ col, val, _type: 'eq' })),
    ne: vi.fn((col: any, val: any) => ({ col, val, _type: 'ne' })),
    and: vi.fn((...conditions: any[]) => {
      const idCond = conditions.find((c) => c?.col?.name === 'id' || (c?.val && typeof c.val === 'string' && c.val.startsWith('card-')));
      const userCond = conditions.find((c) => c?.col?.name === 'user_id' || (c?.val && typeof c.val === 'string' && c.val.startsWith('user-')));
      const slugCond = conditions.find((c) => c?.col?.name === 'slug');
      const neIdCond = conditions.find((c) => c?._type === 'ne');

      if (slugCond && neIdCond) {
        return { _type: 'slug_collision_edit', slug: slugCond.val, id: neIdCond.val };
      }
      if (idCond && userCond) {
        return { _type: 'and_id_user', id: idCond.val, userId: userCond.val };
      }
      return { _type: 'and_generic', conditions };
    }),
    desc: vi.fn(),
  };
});


describe('Multi-Card Independence & Explicit Edit Mode Suite', () => {
  const testUserA = 'user-owner-123';
  const testUserB = 'user-intruder-456';

  const baseCardInput = {
    title: 'Ana Silva',
    profession: 'Software Architect',
    about: 'Arquitecta de soluciones cloud.',
    slug: 'tarjeta-alpha',
    themeConfig: {
      themeId: 'stellar',
      primaryColorOklch: '#6366f1',
      backgroundColorOklch: '#090a10',
      particleBehavior: 'ambient' as const,
      particleIntensity: 'balanced' as const,
      cardFinish: 'classic' as const,
      surfaceTexture: 'radial-glow' as const,
    },
  };

  beforeEach(() => {
    // Reset estado en memoria
    memoryCards = [
      {
        id: 'card-1',
        userId: testUserA,
        slug: 'tarjeta-alpha',
        title: 'Ana Silva V1',
        profession: 'Software Architect',
      },
    ];
  });

  it('debe rechazar la creación de una segunda tarjeta si intenta reutilizar un slug existente (sin cardId)', async () => {
    // Simular que el findFirst de slug encuentra la tarjeta existente
    const { db } = await import('@/shared/api/db');
    (vi.mocked(db.query.cards.findFirst) as any).mockImplementationOnce(async () => memoryCards[0]);

    const result = await upsertCardAction(
      {
        ...baseCardInput,
        slug: 'tarjeta-alpha', // Mismo slug ya existente
      },
      undefined, // Sin cardId (creación)
      testUserA
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('ya está en uso');
    // La tarjeta original no debe haber sido mutada
    expect(memoryCards.length).toBe(1);
  });

  it('debe permitir crear una segunda tarjeta independiente con un slug único y nuevo ID generado', async () => {
    const { db } = await import('@/shared/api/db');
    // Slug no colisiona
    (vi.mocked(db.query.cards.findFirst) as any).mockImplementationOnce(async () => null);

    const result = await upsertCardAction(
      {
        ...baseCardInput,
        slug: 'tarjeta-beta',
        title: 'Segunda Tarjeta Beta',
      },
      undefined, // Modo creación
      testUserA
    );

    expect(result.success).toBe(true);
    expect(result.data?.slug).toBe('tarjeta-beta');
    expect(result.data?.id).toBeDefined();
    // Se insertó como segunda tarjeta independiente
    expect(memoryCards.length).toBe(2);
    expect(memoryCards[1].slug).toBe('tarjeta-beta');
  });

  it('debe permitir editar una tarjeta existente cuando se provee su cardId legítimo', async () => {
    const { db } = await import('@/shared/api/db');
    // Retorna la tarjeta original perteneciente a testUserA
    (vi.mocked(db.query.cards.findFirst) as any).mockImplementationOnce(async () => memoryCards[0]);

    const result = await upsertCardAction(
      {
        ...baseCardInput,
        title: 'Ana Silva Actualizada',
      },
      'card-1', // cardId legítimo
      testUserA
    );

    expect(result.success).toBe(true);
    expect(result.data?.id).toBe('card-1');
  });

  it('debe bloquear la edición de una tarjeta perteneciente a otro usuario (Guardrail Anti-IDOR)', async () => {
    const { db } = await import('@/shared/api/db');
    // Intruso intentando buscar la tarjeta del usuario A -> findFirst retorna null por filtro userId
    (vi.mocked(db.query.cards.findFirst) as any).mockImplementationOnce(async () => null);

    const result = await upsertCardAction(
      {
        ...baseCardInput,
        title: 'Intento de Hackeo',
      },
      'card-1', // ID de la tarjeta del usuario A
      testUserB // Usuario intruso B
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('no tienes permisos');
  });

  it('getCardByIdAction debe rechazar el acceso si el cardId no pertenece al usuario autenticado', async () => {
    const { db } = await import('@/shared/api/db');
    (vi.mocked(db.query.cards.findFirst) as any).mockImplementationOnce(async () => null);

    const result = await getCardByIdAction('card-1', testUserB);
    expect(result.success).toBe(false);
    expect(result.error).toContain('no tienes permisos');
  });
});
