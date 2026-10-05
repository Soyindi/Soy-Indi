import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as postCvRoute } from '@/app/api/cv/parse/route';
import { POST as postPresentationRoute } from '@/app/api/presentations/parse/route';

// Mock de Server Actions para probar la capa de enrutamiento y deserialización
vi.mock('@/features/ai-smart-cv/actions', () => ({
  parseCvDocumentAction: vi.fn(async (formData: FormData) => {
    const file = formData.get('file');
    const extractedText = formData.get('extractedText');
    if (!file && !extractedText) return { success: false, error: 'No se ha adjuntado ningún archivo ni texto de currículum.' };
    return {
      success: true,
      data: {
        fullName: 'Test Candidate',
        headline: 'Senior Full Stack Engineer',
        email: 'candidate@test.com',
      },
    };
  }),
  parseCredentialDocumentAction: vi.fn(async (formData: FormData, currentEducation: any[]) => {
    const file = formData.get('file');
    if (!file) return { success: false, error: 'No se ha adjuntado ningún título o diploma.' };
    return {
      success: true,
      credential: {
        credentialName: 'Magíster en Inteligencia Artificial',
        issuingOrganization: 'Universidad de Chile',
        issueDate: '2026',
      },
    };
  }),
}));

vi.mock('@/features/orbital-presentations/actions', () => ({
  parsePresentationDocumentAction: vi.fn(async (formData: FormData) => {
    const file = formData.get('file');
    const extractedText = formData.get('extractedText');
    if (!file && !extractedText) return { success: false, error: 'No se ha adjuntado ningún archivo ni texto de documento.' };
    return {
      success: true,
      extractedText: typeof extractedText === 'string' ? extractedText : 'Extracted presentation content for testing.',
      fileName: (formData.get('fileName') as string) || 'slides-deck.pdf',
    };
  }),
}));

describe('Document Upload & Ingestion Native Route Handlers (/api/*)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Route: POST /api/cv/parse', () => {
    it('procesa exitosamente un currículum vitae multipart/form-data', async () => {
      const formData = new FormData();
      const mockFile = new File(['CV test content'], 'resume.pdf', { type: 'application/pdf' });
      formData.append('file', mockFile);
      formData.append('type', 'cv');

      const req = new NextRequest('http://localhost:3000/api/cv/parse', {
        method: 'POST',
        body: formData,
      });

      const response = await postCvRoute(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.fullName).toBe('Test Candidate');
      expect(json.data.headline).toBe('Senior Full Stack Engineer');
    });

    it('procesa exitosamente una credencial o título universitario con JSON de educación previa', async () => {
      const formData = new FormData();
      const mockFile = new File(['Diploma image content'], 'diploma.webp', { type: 'image/webp' });
      formData.append('file', mockFile);
      formData.append('type', 'credential');
      formData.append(
        'currentEducation',
        JSON.stringify([{ degree: 'Ingeniería', institution: 'UChile', year: '2024' }])
      );

      const req = new NextRequest('http://localhost:3000/api/cv/parse', {
        method: 'POST',
        body: formData,
      });

      const response = await postCvRoute(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.credential.credentialName).toBe('Magíster en Inteligencia Artificial');
    });

    it('procesa exitosamente un currículum usando texto extraído en el cliente (bypaseando límites de red)', async () => {
      const formData = new FormData();
      formData.append('extractedText', 'Juan Pérez - Ingeniero de Software Senior con experiencia en React y Cloud.');
      formData.append('fileName', 'cv-pesado-15mb.pdf');
      formData.append('type', 'cv');

      const req = new NextRequest('http://localhost:3000/api/cv/parse', {
        method: 'POST',
        body: formData,
      });

      const response = await postCvRoute(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.fullName).toBe('Test Candidate');
    });

    it('retorna error amigable cuando no se proporciona archivo ni texto', async () => {
      const formData = new FormData();
      const req = new NextRequest('http://localhost:3000/api/cv/parse', {
        method: 'POST',
        body: formData,
      });

      const response = await postCvRoute(req);
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toContain('No se ha adjuntado');
    });
  });

  describe('Route: POST /api/presentations/parse', () => {
    it('procesa exitosamente un archivo de presentación (PDF / Documento)', async () => {
      const formData = new FormData();
      const mockFile = new File(['Diapositivas y pitch deck'], 'pitch.pdf', { type: 'application/pdf' });
      formData.append('file', mockFile);

      const req = new NextRequest('http://localhost:3000/api/presentations/parse', {
        method: 'POST',
        body: formData,
      });

      const response = await postPresentationRoute(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.extractedText).toBe('Extracted presentation content for testing.');
      expect(json.fileName).toBe('slides-deck.pdf');
    });

    it('procesa exitosamente una presentación con texto extraído en cliente (0 bytes transferidos de PDF)', async () => {
      const formData = new FormData();
      formData.append('extractedText', '# Visión Estratégica Q4\nMetas y objetivos de crecimiento acelerado.');
      formData.append('fileName', 'pitch-deck-20mb.pdf');

      const req = new NextRequest('http://localhost:3000/api/presentations/parse', {
        method: 'POST',
        body: formData,
      });

      const response = await postPresentationRoute(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.extractedText).toContain('Visión Estratégica');
    });

    it('retorna error controlado cuando no se provee archivo de presentación', async () => {
      const formData = new FormData();
      const req = new NextRequest('http://localhost:3000/api/presentations/parse', {
        method: 'POST',
        body: formData,
      });

      const response = await postPresentationRoute(req);
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toContain('No se ha adjuntado');
    });
  });
});
