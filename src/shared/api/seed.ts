import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { db } from './db';
import { user, cards, smartCvs, presentations } from '@/entities/schema';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  console.log('🌱 Iniciando sembrado de datos en Turso LibSQL...');

  const demoUserId = 'usr_demo_indi_2026';
  const demoEmail = 'demo@indi.bio';

  // 1. Sembrar o actualizar Usuario Demo Principal
  const existingUser = await db.query.user.findFirst({
    where: eq(user.email, demoEmail),
  });

  if (!existingUser) {
    await db.insert(user).values({
      id: demoUserId,
      name: 'Matías Riquelme',
      email: demoEmail,
      emailVerified: true,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
      trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      subscriptionEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });
    console.log('✅ Usuario demo creado:', demoEmail);
  } else {
    console.log('ℹ️ Usuario demo ya existe en Turso:', existingUser.email);
  }

  const targetUserId = existingUser ? existingUser.id : demoUserId;

  // 2. Sembrar Tarjeta Digital de Demostración
  const existingCard = await db.query.cards.findFirst({
    where: eq(cards.slug, 'matias-riquelme'),
  });

  if (!existingCard) {
    await db.insert(cards).values({
      id: 'crd_matias_riquelme_2026',
      userId: targetUserId,
      slug: 'matias-riquelme',
      title: 'Matías Riquelme',
      profession: 'Ingeniero de Software & Arquitecto Cloud',
      about: 'Especialista en arquitecturas web distribuidas, Edge computing y sistemas de alta concurrencia con Next.js 16 y LibSQL.',
      whatsapp: '+56912345678',
      phone: '+56912345678',
      emailContact: 'contacto@matiasriquelme.dev',
      websiteUrl: 'https://matiasriquelme.dev',
      linkedinUrl: 'https://linkedin.com/in/matias-riquelme',
      instagramUrl: 'https://instagram.com/matias.riquelme',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      address: 'Av. Providencia 1208, Santiago, Chile',
      themeConfig: {
        themeId: 'stellar',
        primaryColorOklch: '#6366f1',
        backgroundColorOklch: '#090a10',
        particleBehavior: 'interactive',
        particleIntensity: 'balanced',
        fontFamily: 'Inter',
        enableGlassRefraction: true,
      },
      isActive: true,
      viewsCount: 142,
      clicksCount: 38,
    });
    console.log('✅ Tarjeta digital sembrada: /c/matias-riquelme');
  }

  // 3. Sembrar Smart CV Calibrado ATS
  const existingCv = await db.query.smartCvs.findFirst({
    where: eq(smartCvs.userId, targetUserId),
  });

  if (!existingCv) {
    await db.insert(smartCvs).values({
      id: 'cv_matias_riquelme_2026',
      userId: targetUserId,
      title: 'CV Ejecutivo — Staff Software Engineer',
      targetRole: 'Staff Software Engineer / Tech Lead',
      atsScore: 94,
      content: {
        fullName: 'Matías Riquelme',
        email: 'matias@indi.bio',
        phone: '+56 9 8765 4321',
        location: 'Santiago, Chile / Remoto Global',
        rut: '18.492.041-K',
        summary: 'Ingeniero de Software y Arquitecto de Soluciones Cloud con más de 8 años diseñando plataformas SaaS distribuidas de alta concurrencia.',
        experience: [
          {
            company: 'INDI Cloud Platform',
            role: 'Staff Software Engineer & Arquitecto',
            period: '2024 - Presente',
            bullets: [
              'Diseñé la arquitectura serverless sobre Turso LibSQL y Cloudflare Edge reduciendo la latencia P99 en un 85%.',
              'Lideré la migración a Feature-Sliced Design (FSD), eliminando dependencias circulares y acelerando el ciclo de entrega en un 40%.',
              'Implementé el motor vectorial de generación de PDFs con jsPDF logrando compatibilidad del 100% con parsers ATS.',
            ],
          },
          {
            company: 'Tech Enterprise Solutions',
            role: 'Senior Fullstack Engineer',
            period: '2021 - 2024',
            bullets: [
              'Escalé sistemas distribuidos que procesaron más de 50 millones de transacciones mensuales con 99.99% de disponibilidad.',
              'Implementé autenticación centralizada con políticas OAuth 2.0 y sesiones HttpOnly blindadas contra ataques XSS/CSRF.',
            ],
          },
        ],
        skills: [
          'TypeScript',
          'Next.js 16',
          'React 19',
          'Drizzle ORM',
          'Turso / SQLite',
          'Cloudflare Workers & R2',
          'Zod',
          'Tailwind CSS v4',
          'Docker',
          'Arquitectura FSD',
        ],
        education: [
          {
            degree: 'Ingeniería Civil en Computación e Informática',
            institution: 'Universidad Técnica',
            year: '2019',
            credentialType: 'DEGREE',
          },
        ],
      },
    });
    console.log('✅ Smart CV sembrado en Turso');
  }

  // 4. Sembrar Presentación Cinemática Orbital 16:9
  const existingPres = await db.query.presentations.findFirst({
    where: eq(presentations.slug, 'pitch-deck-2026'),
  });

  if (!existingPres) {
    await db.insert(presentations).values({
      id: 'pres_pitch_deck_2026',
      userId: targetUserId,
      title: 'INDI: El Nuevo Estándar de Identidad Digital 2026',
      slug: 'pitch-deck-2026',
      isPublic: true,
      viewsCount: 89,
      slidesData: [
        {
          id: 'slide-1',
          title: 'INDI: El Futuro del Networking y la Identidad Digital',
          subtitle: 'Reemplazando el papel con enlaces vivos, Smart CVs y Presentaciones Cinemáticas',
          visualType: 'concept',
          layout: 'standard',
          badgeText: 'VISIÓN SAAS 2026',
          keyPoints: [
            '88% de las tarjetas impresas de papel terminan en la basura en menos de una semana.',
            'Conexión instantánea a WhatsApp y vCard descargable en 1 clic.',
            'Cero costos de infraestructura perimetral gracias a Turso LibSQL Serverless.',
          ],
        },
        {
          id: 'slide-2',
          title: 'Métricas de Crecimiento y Adopción',
          subtitle: 'Rendimiento y telemetría de alta resiliencia en el Edge',
          visualType: 'metrics',
          layout: 'kpi-cards',
          badgeText: 'TELEMETRÍA EN VIVO',
          keyPoints: [
            '3.4x más conversaciones cerradas mediante enlace directo a WhatsApp.',
            'Score 98+ garantizado en Google Lighthouse.',
            'Latencia de lectura P95 inferior a 25ms a nivel global.',
          ],
          metricsData: [
            { label: 'Conversión WhatsApp', value: '42.8%', change: '+340%', trend: 'up' },
            { label: 'Score Lighthouse', value: '98/100', change: 'Top 1%', trend: 'up' },
            { label: 'Latencia Edge Turso', value: '<25ms', change: '-85%', trend: 'up' },
          ],
        },
      ],
      themeSettings: {
        id: 'orbital-dark',
        name: 'Orbital Cyber',
        primaryColor: '#6366f1',
        accentColor: '#22d3ee',
        backgroundGradient: 'radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #090a10 70%)',
        enableParticles: true,
        fontFamily: 'sans',
      },
    });
    console.log('✅ Presentación sembrada: /p/pitch-deck-2026');
  }

  console.log('🎉 Sembrado completado exitosamente en Turso!');
}

seedDatabase()
  .then(() => {
    console.log('✨ Seed finalizado con éxito');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error sembrando base de datos:', err);
    process.exit(1);
  });

