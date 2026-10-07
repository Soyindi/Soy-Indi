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
    expect(vcard).toContain('URL;TYPE=INDI_PROFILE:https://soyindi.cl/c/carlos-mendoza');
    expect(vcard).toContain('NOTE;CHARSET=UTF-8:Consultor estratégico de crecimiento B2B.\\nPerfil digital: https://soyindi.cl/c/carlos-mendoza');
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

  it('debe mapear correctamente dirección física en componentes ADR y LABEL según RFC 6350', () => {
    const cardWithLocation: VCardOptions = {
      ...sampleCard,
      address: 'Av. Providencia 1208, Oficina 702, Santiago, Chile',
    };
    const vcard = generateVCardString(cardWithLocation);
    expect(vcard).toContain('ADR;TYPE=WORK;CHARSET=UTF-8:;;Av. Providencia 1208\\, Oficina 702\\, Santiago\\, Chile;;;;');
    expect(vcard).toContain('LABEL;TYPE=WORK;CHARSET=UTF-8:Av. Providencia 1208\\, Oficina 702\\, Santiago\\, Chile');
  });

  it('debe incrustar la propiedad PHOTO codificada en Base64 para visualización en agenda telefónica', () => {
    const cardWithPhoto: VCardOptions = {
      ...sampleCard,
      photoBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...',
    };
    const vcard = generateVCardString(cardWithPhoto);
    expect(vcard).toContain('PHOTO;ENCODING=b;TYPE=JPEG:/9j/4AAQSkZJRgABAQEASABIAAD...');
  });

  it('debe truncar campos de texto que excedan los límites de seguridad contra Buffer Overflow', () => {
    const oversizedCard: VCardOptions = {
      ...sampleCard,
      title: 'A'.repeat(200), // Excede MAX_TITLE_CHARS (100)
      profession: 'B'.repeat(300), // Excede MAX_PROFESSION_CHARS (120)
    };
    const vcard = generateVCardString(oversizedCard);
    expect(vcard).toContain(`FN;CHARSET=UTF-8:${'A'.repeat(100)}`);
    expect(vcard).not.toContain('A'.repeat(101));
    expect(vcard).toContain(`TITLE;CHARSET=UTF-8:${'B'.repeat(120)}`);
    expect(vcard).not.toContain('B'.repeat(121));
  });

  it('debe descartar fotos Base64 masivas que excedan el límite seguro para mitigar CVE-2023-41064', () => {
    // Foto sobredimensionada (> 250 KB)
    const giantPhotoBase64 = 'data:image/jpeg;base64,' + 'A'.repeat(250 * 1024);
    const vulnerableCard: VCardOptions = {
      ...sampleCard,
      photoBase64: giantPhotoBase64,
    };
    const vcard = generateVCardString(vulnerableCard);
    expect(vcard).not.toContain('PHOTO;ENCODING=b;TYPE=JPEG:');
  });
});


