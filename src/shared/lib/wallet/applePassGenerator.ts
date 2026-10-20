/**
 * Generador de Pases Nativos para Apple Wallet (INDI 2026)
 * Estructura oficial pass.json compatible con iOS Wallet, WatchOS y macOS.
 */

export interface ApplePassInput {
  slug: string;
  title: string;
  profession: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  backgroundColorHex?: string;
}

export function generateApplePassJson(input: ApplePassInput): Record<string, any> {
  const canonicalUrl = `https://soyindi.cl/c/${input.slug}`;

  return {
    formatVersion: 1,
    passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID || 'pass.cl.soyindi.card',
    serialNumber: `INDI-${input.slug.toUpperCase()}`,
    teamIdentifier: process.env.APPLE_TEAM_ID || 'INDI2026',
    organizationName: 'INDI',
    description: `Tarjeta Digital de ${input.title}`,
    logoText: 'INDI',
    foregroundColor: 'rgb(255, 255, 255)',
    backgroundColor: 'rgb(15, 23, 42)',
    labelColor: 'rgb(148, 163, 184)',
    barcodes: [
      {
        format: 'PKBarcodeFormatQR',
        message: canonicalUrl,
        messageEncoding: 'iso-8859-1',
        altText: canonicalUrl,
      },
    ],
    generic: {
      primaryFields: [
        {
          key: 'name',
          label: 'TITULAR',
          value: input.title,
        },
      ],
      secondaryFields: [
        {
          key: 'profession',
          label: 'ESPECIALIDAD',
          value: input.profession,
        },
      ],
      auxiliaryFields: [
        ...(input.phone
          ? [
              {
                key: 'phone',
                label: 'TELÉFONO / WHATSAPP',
                value: input.phone,
              },
            ]
          : []),
        ...(input.email
          ? [
              {
                key: 'email',
                label: 'CORREO',
                value: input.email,
              },
            ]
          : []),
      ],
      backFields: [
        {
          key: 'cardUrl',
          label: 'PERFIL OFICIAL INDI',
          value: canonicalUrl,
        },
        ...(input.address
          ? [
              {
                key: 'address',
                label: 'DIRECCIÓN',
                value: input.address,
              },
            ]
          : []),
        {
          key: 'platform',
          label: 'INDI 2026',
          value: 'Tarjeta de identidad profesional y networking. Creado con soyindi.cl',
        },
      ],
    },
  };
}
