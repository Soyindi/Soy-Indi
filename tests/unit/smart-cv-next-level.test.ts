import { describe, it, expect } from 'vitest';
import {
  buildDeterministicTailoredCv,
  buildDeterministicApplicationPitches,
  translateCvDeterministically,
  mapCardToCvPatch,
  mapCvToCardDraft,
} from '@/features/ai-smart-cv/lib/cv-career-copilot';
import {
  cvContentSchema,
  tailorCvToJobSchema,
  generateApplicationPitchSchema,
  translateCvSchema,
} from '@/entities/cv/schemas';
import { telemetryViewSchema } from '@/entities/telemetry/schemas';
import { buildCvPdfDocument } from '@/features/ai-smart-cv/lib/pdf-engine';

describe('Smart CV 2.0 — Career Copilot, Bilingual ATS, Sync & Telemetry', () => {
  const sampleCvContent = cvContentSchema.parse({
    fullName: 'Matías Riquelme',
    email: 'matias@soyindi.cl',
    phone: '+56985325222',
    location: 'Santiago, Chile',
    summary: 'Ingeniero de Software con experiencia en aplicaciones web escalables.',
    skills: ['TypeScript', 'Next.js'],
    experience: [
      {
        company: 'INDI Tech',
        role: 'Ingeniero de Software',
        period: '2024 - Presente',
        bullets: [
          'Colaboré en tareas generales de soporte y mantenimiento.',
          'Optimicé consultas SQLite y Edge Caching reduciendo latencia en 45% para 10.000 usuarios.',
        ],
        detailedBullets: [],
      },
    ],
    education: [
      {
        degree: 'Ingeniería en Informática',
        institution: 'Universidad de Chile',
        year: '2022',
        credentialType: 'DEGREE',
      },
    ],
    language: 'es',
    showQrOnPdf: true,
  });

  it('Tailor to Job: adapta el CV priorizando logros con métricas e inyectando keywords sin inventar empresas', () => {
    const jobText =
      'Buscamos Ingeniero de Software Senior con experiencia en TypeScript, Next.js, PostgreSQL, Docker y AWS para liderar optimización de latencia.';
    const tailored = buildDeterministicTailoredCv(sampleCvContent, jobText, 'Ingeniero de Software Senior');

    expect(tailored.tailoredRole).toBe('Ingeniero de Software Senior');
    expect(tailored.tailoredExperience).toHaveLength(1);
    expect(tailored.tailoredExperience[0].company).toBe('INDI Tech');
    // El bullet con métrica (45%) y coincidencia de latencia debe quedar primero
    expect(tailored.tailoredExperience[0].bullets[0]).toContain('45%');
    expect(tailored.tailoredSkills.length).toBeGreaterThanOrEqual(sampleCvContent.skills.length);

    const parsedInput = tailorCvToJobSchema.safeParse({
      jobDescriptionText: jobText,
      targetRole: 'Ingeniero de Software Senior',
      cvContent: sampleCvContent,
    });
    expect(parsedInput.success).toBe(true);
  });

  it('Pitch Multicanal: genera mensajes para LinkedIn, WhatsApp y Correo con el enlace canónico soyindi.cl/cv/[slug]', () => {
    const pitch = buildDeterministicApplicationPitches({
      cvContent: sampleCvContent,
      targetRole: 'Tech Lead',
      cvSlug: 'matias-riquelme',
      companyName: 'Buk Chile',
      hiringManagerName: 'Camila',
      language: 'es',
    });

    expect(pitch.canonicalCvUrl).toBe('https://soyindi.cl/cv/matias-riquelme');
    expect(pitch.linkedinDm).toContain('Camila');
    expect(pitch.linkedinDm).toContain('Buk Chile');
    expect(pitch.linkedinDm).toContain('https://soyindi.cl/cv/matias-riquelme');
    expect(pitch.whatsappPitch).toContain('https://soyindi.cl/cv/matias-riquelme');
    expect(pitch.formalEmail.subject).toContain('Tech Lead');
    expect(pitch.formalEmail.body).toContain('45%');

    const validSchema = generateApplicationPitchSchema.safeParse({
      cvContent: sampleCvContent,
      targetRole: 'Tech Lead',
      cvSlug: 'matias-riquelme',
    });
    expect(validSchema.success).toBe(true);
  });

  it('Switch Bilingüe ES ⇄ EN: traduce rol, período y renderiza PDF en inglés sin errores', () => {
    const translated = translateCvDeterministically(sampleCvContent, 'Ingeniero de Software', 'en');
    expect(translated.language).toBe('en');
    expect(translated.targetRole).toBe('Software Engineer');
    expect(translated.experience[0].period).toContain('Present');

    const validSchema = translateCvSchema.safeParse({
      cvContent: sampleCvContent,
      targetRole: 'Ingeniero de Software',
      targetLanguage: 'en',
    });
    expect(validSchema.success).toBe(true);

    // Verificar que el motor PDF genera el documento en inglés con showQrOnPdf activo
    const doc = buildCvPdfDocument({
      title: 'CV Matías',
      targetRole: translated.targetRole,
      slug: 'matias-riquelme',
      templateId: 'executive-modern',
      isPublic: true,
      content: {
        ...sampleCvContent,
        language: 'en',
        showQrOnPdf: true,
      },
    });
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it('Puente Tarjeta Digital ⇄ Smart CV: mapea datos bidireccionalmente sin pérdida', () => {
    const cardPatch = mapCardToCvPatch({
      slug: 'matias-card',
      title: 'Matías Riquelme',
      profession: 'Arquitecto Cloud',
      about: 'Especialista en Next.js y Edge.',
      phone: '+56911112222',
      emailContact: 'hola@soyindi.cl',
      linkedinUrl: 'https://linkedin.com/in/matias',
      address: 'Santiago, Chile',
    });

    expect(cardPatch.targetRole).toBe('Arquitecto Cloud');
    expect(cardPatch.contentPatch.indiCardSlug).toBe('matias-card');
    expect(cardPatch.contentPatch.email).toBe('hola@soyindi.cl');

    const cardDraft = mapCvToCardDraft({
      title: 'CV Matías',
      targetRole: 'Arquitecto Cloud',
      templateId: 'executive-modern',
      content: sampleCvContent,
    });
    expect(cardDraft.title).toBe('Matías Riquelme');
    expect(cardDraft.profession).toBe('Arquitecto Cloud');
    expect(cardDraft.emailContact).toBe('matias@soyindi.cl');
  });

  it('Telemetría de Descargas PDF: valida payload con eventType pdf_download', () => {
    const parsed = telemetryViewSchema.safeParse({
      slug: 'matias-riquelme',
      entityType: 'cv',
      eventType: 'pdf_download',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.eventType).toBe('pdf_download');
    }
  });
});
