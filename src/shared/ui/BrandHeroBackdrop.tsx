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
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
      data-testid="brand-hero-backdrop"
    >
      {/* 1 · Malla Espacial Vectorial / Cybernetic Dot Matrix (Linear / Raycast Style) */}
      <div
        className="absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_25%,black_20%,transparent_80%)]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* 2 · Halo de Luz Bioluminiscente Superior Central (Indigo / Violeta Cósmico) */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[540px] h-[540px] sm:w-[840px] sm:h-[840px] rounded-full bg-gradient-to-b from-indigo-500/20 via-indigo-600/10 to-transparent blur-[120px] sm:blur-[160px]" />

      {/* 3 · Rayo Láser Fotónico Central (Cyan Puro de INDI) */}
      <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] sm:w-[480px] sm:h-[480px] rounded-full bg-cyan-400/14 blur-[90px] sm:blur-[130px]" />

      {/* 4 · Resplandor Perimétrico Inferior de Transición Suave */}
      <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[340px] h-[340px] sm:w-[520px] sm:h-[520px] rounded-full bg-teal-400/8 blur-[110px]" />

      {/* 5 · Velo Gradiente de Conexión Suave al Canvas */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950/90" />
    </div>
  );
}
