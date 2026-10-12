import { z } from 'zod';

/**
 * Esquema Zod canónico para las Redes Sociales Oficiales de INDI
 */
export const brandSocialLinksSchema = z.object({
  instagramUrl: z.string().url().or(z.literal('')).default('https://instagram.com/soyindi.cl'),
  linkedinUrl: z.string().url().or(z.literal('')).default('https://www.linkedin.com/company/soyindi'),
  xUrl: z.string().url().or(z.literal('')).default('https://x.com/soyindicorporate'),
  whatsappUrl: z.string().url().or(z.literal('')).default('https://wa.me/56985350038'),
  youtubeUrl: z.string().url().or(z.literal('')).default(''),
  tiktokUrl: z.string().url().or(z.literal('')).default('https://www.tiktok.com/@soyindi.cl'),
});

export type BrandSocialLinks = z.infer<typeof brandSocialLinksSchema>;

/**
 * Redes Sociales Oficiales Canónicas de INDI (2026)
 * Valores iniciales verificados
 */
export const OFFICIAL_BRAND_SOCIALS: BrandSocialLinks = {
  instagramUrl: 'https://www.instagram.com/soyindi.cl',
  linkedinUrl: 'https://www.linkedin.com/in/soyindi-cl',
  tiktokUrl: 'https://www.tiktok.com/@soyindi.cl',
  xUrl: 'https://x.com/soyindicorporate',
  whatsappUrl: 'https://wa.me/56985350038',
  youtubeUrl: '',
};
