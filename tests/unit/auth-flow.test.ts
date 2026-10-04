import { describe, it, expect } from 'vitest';
import { AuthRedirectParamsSchema, sanitizeCallbackUrl } from '@/entities/auth/schemas';

describe('Auth Redirection & Flow Validation Suite', () => {
  it('debe validar y permitir rutas relativas seguras por defecto', () => {
    const validParams = {
      mode: 'login',
      callbackUrl: '/dashboard',
    };

    const result = AuthRedirectParamsSchema.safeParse(validParams);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mode).toBe('login');
      expect(result.data.callbackUrl).toBe('/dashboard');
    }
  });

  it('debe permitir modo signup con redirección a /start', () => {
    const signupParams = {
      mode: 'signup',
      callbackUrl: '/start',
    };

    const result = AuthRedirectParamsSchema.safeParse(signupParams);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mode).toBe('signup');
      expect(result.data.callbackUrl).toBe('/start');
    }
  });

  it('debe rechazar ataques de Open Redirect con URLs absolutas externas', () => {
    const maliciousParams = {
      mode: 'login',
      callbackUrl: 'https://malicious-site.com/steal-session',
    };

    const result = AuthRedirectParamsSchema.safeParse(maliciousParams);
    expect(result.success).toBe(false);
  });

  it('debe rechazar protocol-relative URLs (ej. //evil.com)', () => {
    const maliciousProtocolRelative = {
      mode: 'login',
      callbackUrl: '//evil.com/phishing',
    };

    const result = AuthRedirectParamsSchema.safeParse(maliciousProtocolRelative);
    expect(result.success).toBe(false);
  });

  it('debe aplicar fallback seguro con sanitizeCallbackUrl ante entradas inválidas o nulas', () => {
    expect(sanitizeCallbackUrl(null, '/dashboard')).toBe('/dashboard');
    expect(sanitizeCallbackUrl(undefined, '/dashboard')).toBe('/dashboard');
    expect(sanitizeCallbackUrl('', '/dashboard')).toBe('/dashboard');
    expect(sanitizeCallbackUrl('https://hacker.com', '/dashboard')).toBe('/dashboard');
    expect(sanitizeCallbackUrl('//malicious.com', '/dashboard')).toBe('/dashboard');
    expect(sanitizeCallbackUrl('/cards/new', '/dashboard')).toBe('/cards/new');
    expect(sanitizeCallbackUrl('/start', '/dashboard')).toBe('/start');
  });

  it('debe proteger el acceso al dashboard redirigiendo al portal de login con callbackUrl seguro', () => {
    const targetDashboard = '/dashboard?tab=cards';
    const safeUrl = sanitizeCallbackUrl(targetDashboard, '/dashboard');
    expect(safeUrl).toBe('/dashboard?tab=cards');

    const expectedLoginRedirect = `/login?callbackUrl=${encodeURIComponent(safeUrl)}`;
    expect(expectedLoginRedirect).toContain('/login?callbackUrl=%2Fdashboard%3Ftab%3Dcards');
  });
});
