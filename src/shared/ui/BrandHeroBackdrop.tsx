/**
 * Fondo ambiental de marca para el hero (Zero-Media Backdrop).
 *
 * Política "Single Logo Protagonist":
 * - El único logotipo visible en el hero es el lockup vertical (`stackedHero`).
 * - Este fondo NO renderiza imágenes, pósters ni video: un póster WebP del logo
 *   desenfocado detrás del hero se percibía como pantalla de precarga (splash)
 *   en móvil y como "flash" póster→video en escritorio (regresión de a4767fd).
 * - Halo 100% CSS: 0 bytes de red, 0 JavaScript (Server Component), 0 CLS,
 *   idéntico en móvil y escritorio. Gradiente final garantiza contraste WCAG AA.
 */
export function BrandHeroBackdrop() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
      data-testid="brand-hero-backdrop"
    >
      <div className="absolute top-[-16%] left-1/2 -translate-x-1/2 w-[480px] h-[480px] sm:w-[720px] sm:h-[720px] rounded-full bg-indigo-600/16 blur-[120px] sm:blur-[160px]" />
      <div className="absolute bottom-[-24%] left-1/2 -translate-x-1/2 w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] rounded-full bg-cyan-500/8 blur-[120px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950" />
    </div>
  );
}
