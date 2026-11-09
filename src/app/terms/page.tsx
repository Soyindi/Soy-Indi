import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldCheck, ArrowLeft, Scale, ShoppingBag, RefreshCcw, CheckCircle2, FileText } from 'lucide-react';
import { BrandLogo } from '@/shared/ui/BrandLogo';
import { LEGAL_ENTITY_CONFIG, ARCOP_LEGAL_SLA } from '@/entities/privacy/compliance-config';

export const metadata: Metadata = {
  title: 'Términos y Condiciones y Reglamento de Comercio Electrónico | INDI Chile',
  description:
    'Términos y Condiciones de Contratación, Identificación del Proveedor, Derecho a Retracto y Garantía Legal (Ley N° 19.496 y Decreto N° 14) de INDI (soyindi.cl).',
  alternates: {
    canonical: 'https://soyindi.cl/terms',
  },
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header de Navegación */}
        <header className="flex items-center justify-between pb-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 group">
            <BrandLogo size="md" showText={false} />
            <div>
              <span className="text-sm font-black text-white block">INDI • Contratación Electrónica Chile</span>
              <span className="text-[11px] font-mono text-emerald-400">
                Ley N° 19.496 • Decreto N° 14 Economía • {LEGAL_ENTITY_CONFIG.policyVersion}
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="min-h-[44px] px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>
        </header>

        {/* Hero Normativo */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/30 via-zinc-900/80 to-cyan-950/30 border border-emerald-500/30 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
            <Scale className="w-4 h-4" />
            <span>Ley N° 19.496 del Consumidor • Reglamento de Comercio Electrónico (Decreto N° 14)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Términos y Condiciones de Uso y Contratación Electrónica
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            El presente documento establece las condiciones contractuales aplicables al uso de la plataforma SaaS{' '}
            <strong>{LEGAL_ENTITY_CONFIG.tradeName}</strong> ({LEGAL_ENTITY_CONFIG.canonicalDomain}), redactadas íntegramente en idioma castellano conforme a la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores y el Decreto Supremo N° 14 del Ministerio de Economía, Fomento y Turismo.
          </p>
        </section>

        {/* 1. Identificación Completa del Proveedor (Art. 3 Decreto N° 14) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <span>1. Identificación del Proveedor / Vendedor (Art. 3 Decreto N° 14)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-1.5">
              <p><strong className="text-white">Razón Social / Titular:</strong> {LEGAL_ENTITY_CONFIG.legalName}</p>
              <p><strong className="text-white">RUT / RUN:</strong> {LEGAL_ENTITY_CONFIG.rut}</p>
              <p><strong className="text-white">Domicilio Legal:</strong> {LEGAL_ENTITY_CONFIG.legalAddress}</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-1.5">
              <p><strong className="text-white">Representante Legal:</strong> {LEGAL_ENTITY_CONFIG.legalRepresentative}</p>
              <p><strong className="text-white">Correo de Atención al Cliente:</strong> {LEGAL_ENTITY_CONFIG.supportEmail}</p>
              <p><strong className="text-white">Teléfono / WhatsApp Soporte:</strong> {LEGAL_ENTITY_CONFIG.contactPhone}</p>
            </div>
          </div>
        </section>

        {/* 2. Características Técnicas, Disponibilidad Previa (Stock Digital) y Desglose de Costos */}
        <section className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>2. Especificaciones en Castellano, Disponibilidad y Costo Total</span>
          </h2>
          <ul className="list-disc list-inside space-y-2.5 text-xs text-zinc-300 leading-relaxed">
            <li>
              <strong>Naturaleza del Servicio (100% Digital / SaaS):</strong> INDI provee herramientas digitales inmediatas en navegador web: Tarjetas Digitales con código QR/vCard 4.0 y Smart CVs exportables en formato PDF A4 vectorial (210 × 297 mm) optimizados para lectura ATS en español.
            </li>
            <li>
              <strong>Plan Comunitario Gratuito Permanente (\$0 CLP):</strong> Todo usuario registrado accede sin costo, sin requerir tarjeta de crédito ni datos bancarios, a 1 Tarjeta Digital interactiva y 1 Smart CV ATS, ampliables mediante el programa comunitario de invitación.
            </li>
            <li>
              <strong>Control Previo de Disponibilidad:</strong> Por tratarse de aprovisionamiento cloud automatizado en tiempo real, la disponibilidad del servicio se verifica antes de cualquier contratación, garantizando entrega instantánea sin quiebres de inventario.
            </li>
            <li>
              <strong>Desglose Transparente del Costo Total:</strong> En caso de contratar planes opcionales pagados, el resumen pre-pago informa en Pesos Chilenos (CLP) el valor final con impuestos incluidos y <strong>Costo de Despacho/Envío: \$0 CLP</strong> (entrega electrónica inmediata en cuenta).
            </li>
          </ul>
        </section>

        {/* 3. Derecho a Retracto (10 Días Corridos - Art. 3 bis Ley N° 19.496) y Garantía Legal (6 Meses) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
            <RefreshCcw className="w-5 h-5 text-indigo-400" />
            <span>3. Derecho a Retracto ({ARCOP_LEGAL_SLA.retractPeriodCalendarDays} Días Corridos) y Garantía Legal ({ARCOP_LEGAL_SLA.legalWarrantyMonths} Meses)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-2">
              <span className="font-bold text-emerald-400 block">Derecho a Retracto (Art. 3 bis Ley N° 19.496)</span>
              <p className="text-zinc-300 leading-relaxed">
                En toda contratación electrónica de planes pagados, reconocemos al consumidor el derecho a retractarse dentro de los <strong>{ARCOP_LEGAL_SLA.retractPeriodCalendarDays} días corridos</strong> contados desde la contratación y antes de haber consumido íntegramente las prestaciones exclusivas del plan, solicitándolo al correo <code className="text-cyan-300">{LEGAL_ENTITY_CONFIG.supportEmail}</code>.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-2">
              <span className="font-bold text-cyan-400 block">Garantía Legal y Continuidad de Servicio</span>
              <p className="text-zinc-300 leading-relaxed">
                Conforme a la Ley N° 19.496, ante cualquier falla técnica imputable a la plataforma que impida el uso del servicio contratado, el usuario tiene derecho durante <strong>{ARCOP_LEGAL_SLA.legalWarrantyMonths} meses</strong> a la reposición funcional inmediata del servicio, bonificación de período o devolución íntegra del monto pagado.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Proceso de Confirmación y Comprobante */}
        <section className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>4. Perfeccionamiento del Contrato y Envío de Comprobante</span>
          </h2>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Toda activación de cuenta o transacción presenta un resumen previo inequívoco y genera un comprobante electrónico verificable con identificador único, fecha, hora y detalle del plan, disponible en el panel del usuario y remitido al correo electrónico registrado.
          </p>
        </section>
      </div>
    </div>
  );
}
