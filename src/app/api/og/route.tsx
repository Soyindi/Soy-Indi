import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * Edge Open Graph Image Generator (INDI 2026)
 * Cumple estrictamente con la Matriz de Zona Segura 1:1 (630x630 px dentro de 1200x630 px)
 * Garantiza que WhatsApp, Telegram, iMessage, LinkedIn y X nunca recorten
 * los datos vitales ni avatares en miniaturas móviles cuadradas.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Parámetros semánticos y alias compactos
    const title = searchParams.get('title') || searchParams.get('n') || 'Identidad Profesional';
    const role = searchParams.get('role') || searchParams.get('r') || 'Ecosistema Digital INDI';
    const about = searchParams.get('about') || searchParams.get('d') || 'Conecta directamente en un solo clic.';
    const photo = searchParams.get('photo') || searchParams.get('av');
    const entityType = searchParams.get('type') || searchParams.get('t') || 'card'; // 'card' | 'cv' | 'presentation'
    const isVerified = searchParams.get('verified') === '1' || searchParams.get('v') === '1';
    const customBadge = searchParams.get('badge');

    // Resolver badge visual contextual
    let defaultBadge = 'VERIFICADO • PRO';
    let badgeColor = '#4f46e5'; // Indigo
    let badgeBg = 'rgba(79, 70, 229, 0.2)';
    let badgeBorder = 'rgba(99, 102, 241, 0.4)';

    if (entityType === 'cv') {
      defaultBadge = 'SMART CV • ATS A4 READY';
      badgeColor = '#06b6d4'; // Cyan
      badgeBg = 'rgba(6, 182, 212, 0.2)';
      badgeBorder = 'rgba(34, 211, 238, 0.4)';
    } else if (entityType === 'presentation') {
      defaultBadge = 'PRESENTACIÓN • 16:9 ORBITAL';
      badgeColor = '#a855f7'; // Purple
      badgeBg = 'rgba(168, 85, 247, 0.2)';
      badgeBorder = 'rgba(192, 132, 252, 0.4)';
    }

    const badgeText = customBadge || defaultBadge;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#07080d',
            backgroundImage:
              'radial-gradient(circle at 50% 20%, rgba(79, 70, 229, 0.3) 0%, transparent 70%), radial-gradient(circle at 10% 80%, rgba(6, 182, 212, 0.15) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
            fontFamily: 'sans-serif',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* AURA LATERAL IZQUIERDA (285px) */}
          <div
            style={{
              width: '285px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.4,
            }}
          />

          {/* MATRIZ DE ZONA SEGURA CENTRAL 1:1 (630x630 px) */}
          <div
            style={{
              width: '630px',
              height: '630px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '40px 32px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '44px',
              border: '2px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 32px 64px rgba(0, 0, 0, 0.8)',
            }}
          >
            {/* Header: Badge Contextual */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '999px',
                backgroundColor: badgeBg,
                border: `1px solid ${badgeBorder}`,
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: badgeColor,
                textTransform: 'uppercase',
              }}
            >
              {isVerified && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill={badgeColor} style={{ marginRight: '6px' }}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              )}
              <span>{badgeText}</span>
            </div>

            {/* Bloque Central: Avatar + Nombre + Rol */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                width: '100%',
              }}
            >
              {/* Foto de Perfil o Iniciales con Halo */}
              <div
                style={{
                  width: '112px',
                  height: '112px',
                  borderRadius: '56px',
                  backgroundColor: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  border: '3px solid rgba(255, 255, 255, 0.35)',
                  boxShadow: '0 0 32px rgba(99, 102, 241, 0.55)',
                  overflow: 'hidden',
                }}
              >
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo}
                    alt={title}
                    style={{ width: '100%', height: '100%', borderRadius: '56px', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '42px', fontWeight: 800, color: 'white' }}>
                    {title.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Nombre / Título */}
              <div
                style={{
                  fontSize: title.length > 22 ? '34px' : '40px',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: '#ffffff',
                  marginBottom: '8px',
                  lineHeight: 1.15,
                  maxWidth: '540px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {title}
              </div>

              {/* Especialidad / Rol */}
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: badgeColor,
                  letterSpacing: '0.04em',
                  marginBottom: '14px',
                  maxWidth: '520px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {role}
              </div>

              {/* Descripción breve / Elevator Pitch */}
              <div
                style={{
                  fontSize: '16px',
                  color: '#94a3b8',
                  lineHeight: 1.4,
                  maxWidth: '500px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {about}
              </div>
            </div>

            {/* Footer de Zona Segura: Branding Canónico */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#64748b',
                letterSpacing: '0.12em',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              <span>SOYINDI.CL</span>
              <span style={{ color: '#475569' }}>•</span>
              <span>IDENTIDAD DIGITAL VIVA</span>
            </div>
          </div>

          {/* AURA LATERAL DERECHA (285px) */}
          <div
            style={{
              width: '285px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.4,
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        },
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate Open Graph Image: ${e.message}`, {
      status: 500,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  }
}
