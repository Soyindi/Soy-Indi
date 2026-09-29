import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get('title') || 'Tarjeta Profesional';
    const role = searchParams.get('role') || 'Identidad Digital INDI';
    const about = searchParams.get('about') || 'Conecta directamente en un solo clic';
    const photo = searchParams.get('photo');

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#090a10',
            backgroundImage: 'radial-gradient(circle at 50% 10%, rgba(99, 102, 241, 0.25) 0%, transparent 60%)',
            fontFamily: 'sans-serif',
            color: 'white',
            padding: '60px 40px',
            position: 'relative',
          }}
        >
          {/* Tarjeta Mock Central */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '32px',
              border: '2px solid rgba(255, 255, 255, 0.12)',
              padding: '48px 64px',
              maxWidth: '850px',
              width: '100%',
              boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6)',
            }}
          >
            {/* Foto o Iniciales */}
            <div
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '55px',
                backgroundColor: '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                border: '3px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)',
              }}
            >
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt={title}
                  style={{ width: '100%', height: '100%', borderRadius: '55px', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '42px', fontWeight: 'bold', color: 'white' }}>
                  {title.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <div style={{ fontSize: '44px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px', textAlign: 'center' }}>
              {title}
            </div>

            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#22d3ee',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: '20px',
              }}
            >
              {role}
            </div>

            <div
              style={{
                fontSize: '22px',
                color: '#cbd5e1',
                textAlign: 'center',
                lineHeight: 1.4,
                maxWidth: '650px',
              }}
            >
              {about}
            </div>
          </div>

          {/* Footer Branding */}
          <div
            style={{
              position: 'absolute',
              bottom: '30px',
              display: 'flex',
              alignItems: 'center',
              fontSize: '18px',
              color: '#64748b',
              letterSpacing: '0.1em',
              fontWeight: 600,
            }}
          >
            INDI.BIO • IDENTIDAD DIGITAL EN EL EDGE
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate image: ${e.message}`, {
      status: 500,
    });
  }
}
