import { describe, it, expect } from 'vitest';
import { generateVCardString, VCardOptions } from '@/shared/lib/vcard';

describe('vCard 3.0 / RFC 2426 Deterministic Generator', () => {
  const sampleCard: VCardOptions = {
    slug: 'carlos-mendoza',
    title: 'Carlos Mendoza',
    profession: 'Especialista en Marketing Digital',
    about: 'Consultor estratégico de crecimiento B2B.',
    phone: '+56987654321',
    whatsapp: '+56987654321',
    emailContact: 'carlos@mendoza.com',
    websiteUrl: 'https://carlosmendoza.com',
    linkedinUrl: 'https://linkedin.com/in/carlosmendoza',
    instagramUrl: 'https://instagram.com/carlosmendoza',
  };

  it('debe generar una estructura vCard válida con cabeceras y finalizadores RFC', () => {
    const vcard = generateVCardString(sampleCard);
    expect(vcard).toContain('BEGIN:VCARD');
    expect(vcard).toContain('VERSION:3.0');
    expect(vcard).toContain('END:VCARD');
  });

  it('debe formatear correctamente nombre completo y componentes N (apellidos y nombre)', () => {
    const vcard = generateVCardString(sampleCard);
    expect(vcard).toContain('FN;CHARSET=UTF-8:Carlos Mendoza');
    expect(vcard).toContain('N;CHARSET=UTF-8:Mendoza;Carlos;;;');
  });

  it('debe mapear correctamente cargo, teléfono, email y redes sociales', () => {
    const vcard = generateVCardString(sampleCard);
    expect(vcard).toContain('TITLE;CHARSET=UTF-8:Especialista en Marketing Digital');
    expect(vcard).toContain('TEL;TYPE=CELL,VOICE:+56987654321');
    expect(vcard).toContain('EMAIL;TYPE=PREF,INTERNET:carlos@mendoza.com');
    expect(vcard).toContain('URL;TYPE=WORK:https://carlosmendoza.com');
    expect(vcard).toContain('X-SOCIALPROFILE;TYPE=linkedin:https://linkedin.com/in/carlosmendoza');
  });

  it('debe incluir enlace al perfil INDI y nota explicativa', () => {
    const vcard = generateVCardString(sampleCard);
    expect(vcard).toContain('URL;TYPE=INDI_PROFILE:https://indi.bio/c/carlos-mendoza');
    expect(vcard).toContain('NOTE;CHARSET=UTF-8:Consultor estratégico de crecimiento B2B.\\nPerfil digital: https://indi.bio/c/carlos-mendoza');
  });

  it('debe manejar nombres de una sola palabra sin romper la sección N', () => {
    const singleNameCard: VCardOptions = {
      slug: 'indibio',
      title: 'INDI',
      profession: 'Identidad Digital',
    };
    const vcard = generateVCardString(singleNameCard);
    expect(vcard).toContain('FN;CHARSET=UTF-8:INDI');
    expect(vcard).toContain('N;CHARSET=UTF-8:INDI;;;;');
  });
});
