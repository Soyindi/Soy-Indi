import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldCheck, ArrowLeft, Lock, Globe, Server, Clock, AlertTriangle, Mail, FileCheck } from 'lucide-react';
import { BrandLogo } from '@/shared/ui/BrandLogo';
import { DATA_SUBPROCESSORS_REGISTRY } from '@/shared/lib/dataPrivacy';
import { LEGAL_ENTITY_CONFIG, ARCOP_LEGAL_SLA } from '@/entities/privacy/compliance-config';

export const metadata: Metadata = {
  title: 'Política de Privacidad y Derechos ARCOP (Ley N° 21.719) | INDI Chile',
  description:
    'Política oficial de Privacidad, Protección de Datos Personales (Ley N° 21.719), Transferencias Internacionales, Subprocesadores y Canal ARCOP de INDI (soyindi.cl).',
  alternates: {
    canonical: 'https://soyindi.cl/privacy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header de Navegación */}
        <header className="flex items-center justify-between pb-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 group">
            <BrandLogo size="md" showText={false} />
            <div>
              <span className="text-sm font-black text-white block">INDI • Gobernanza Legal Chile</span>
              <span className="text-[11px] font-mono text-cyan-400">
                Versión {LEGAL_ENTITY_CONFIG.policyVersion} • Actualizado: {LEGAL_ENTITY_CONFIG.lastUpdatedDate}
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
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-cyan-950/30 via-zinc-900/80 to-indigo-950/30 border border-cyan-500/30 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Cumplimiento Integral Ley N° 21.719 • Ley N° 21.663 • Decreto N° 662</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Política de Privacidad, Transparencia y Derechos ARCOP
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            El presente instrumento regula el tratamiento de datos personales efectuado a través de{' '}
            <strong>{LEGAL_ENTITY_CONFIG.canonicalDomain}</strong>, dando estricto cumplimiento a los artículos 4, 11, 14 ter, 14 quáter, 14 quinquies, 14 sexies y 15 de la{' '}
            <strong>Ley N° 21.719 sobre Protección de los Datos Personales de la República de Chile</strong>.
          </p>
        </section>

        {/* 1. Identificación del Responsable y DPO (Art. 14 ter letra a) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-cyan-400" />
            <span>1. Identificación del Responsable del Tratamiento y Delegado (DPO)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-1.5">
              <span className="text-zinc-400 font-mono uppercase text-[10px]">Nombre o Razón Social</span>
              <p className="text-white font-semibold">{LEGAL_ENTITY_CONFIG.legalName}</p>
              <span className="text-zinc-400 font-mono uppercase text-[10px] block pt-2">RUT / RUN</span>
              <p className="text-zinc-200 font-mono">{LEGAL_ENTITY_CONFIG.rut}</p>
              <span className="text-zinc-400 font-mono uppercase text-[10px] block pt-2">Domicilio Legal en Chile</span>
              <p className="text-zinc-200">{LEGAL_ENTITY_CONFIG.legalAddress}</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-1.5">
              <span className="text-zinc-400 font-mono uppercase text-[10px]">Representante Legal</span>
              <p className="text-white font-semibold">{LEGAL_ENTITY_CONFIG.legalRepresentative}</p>
              <span className="text-zinc-400 font-mono uppercase text-[10px] block pt-2">Delegado de Protección de Datos (DPO) y Canal ARCOP</span>
              <p className="text-cyan-300 font-mono font-bold">{LEGAL_ENTITY_CONFIG.dpoEmail}</p>
              <span className="text-zinc-400 font-mono uppercase text-[10px] block pt-2">Soporte y Teléfono</span>
              <p className="text-zinc-200">
                {LEGAL_ENTITY_CONFIG.supportEmail} • {LEGAL_ENTITY_CONFIG.contactPhone}
              </p>
            </div>
          </div>
        </section>

        {/* 2. Finalidades y Bases de Licitud (Art. 14 ter letra b) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <span>2. Finalidades del Tratamiento y Base de Licitud (Art. 12 y 13 Ley N° 21.719)</span>
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white/5 text-zinc-300 font-mono text-[11px] border-b border-white/10">
                  <th className="p-3.5">Finalidad Específica</th>
                  <th className="p-3.5">Datos Tratados (Minimización)</th>
                  <th className="p-3.5">Base Legal de Licitud</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                <tr>
                  <td className="p-3.5 font-semibold text-white">Creación de cuenta y autenticación segura</td>
                  <td className="p-3.5">Nombre, correo electrónico, hash de contraseña o token OAuth Google</td>
                  <td className="p-3.5 text-emerald-300 font-mono">Ejecución de contrato SaaS (Art. 13 letra b) y Consentimiento (Art. 12)</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-white">Publicación de Tarjeta Digital QR/NFC y Smart CV ATS</td>
                  <td className="p-3.5">Datos curriculares, especialidad, enlaces y foto que el titular decide publicar</td>
                  <td className="p-3.5 text-emerald-300 font-mono">Consentimiento expreso del titular (Art. 12) y Ejecución contractual</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-white">Facturación de planes pagados y prevención de fraude</td>
                  <td className="p-3.5">ID de transacción, estado de pago, monto CLP y registro contable</td>
                  <td className="p-3.5 text-cyan-300 font-mono">Obligación legal tributaria SII (Art. 13 letra a) y Contrato</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-white">Seguridad perimetral, rate-limiting y mitigación de ataques</td>
                  <td className="p-3.5">IP truncada/anonimizada y metadatos técnicos de sesión</td>
                  <td className="p-3.5 text-indigo-300 font-mono">Interés legítimo en ciberseguridad (Art. 13 letra c y Ley N° 21.663)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-400">
            <strong>Protección de Menores (Art. 14 quáter):</strong> El servicio está dirigido a profesionales y mayores de 14 años. No recopilamos intencionalmente datos de niños o niñas menores de 14 años sin la autorización verificada de su padre, madre o representante legal.
          </p>
        </section>

        {/* 3. Decisiones Automatizadas e Inteligencia Artificial (Art. 14 ter letra f y Art. 8 ter) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-400" />
            <span>3. Transparencia en Asistencia de IA y Cero Perfilamiento Automatizado</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            INDI incluye herramientas opcionales de asistencia editorial para redactar viñetas de currículum (metodología STAR) y calcular compatibilidad técnica frente a sistemas ATS. Antes de enviar cualquier fragmento de texto al motor de lenguaje, nuestro motor de sanitización (<code className="text-cyan-300">maskSensitiveDataForAi</code>) reemplaza automáticamente RUTs y teléfonos por tokens neutros (<code className="text-emerald-300">[RUT_PROTEGIDO]</code>, <code className="text-emerald-300">[TELEFONO_PROTEGIDO]</code>). INDI <strong>no adopta decisiones automatizadas con efectos jurídicos</strong> ni realiza perfilamiento discriminatorio sobre los usuarios.
          </p>
        </section>

        {/* 4. Subprocesadores y Transferencias Internacionales (Art. 14 ter letras c y d, Art. 15 y 27) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <span>4. Encargados de Tratamiento (Subprocesadores) y Transferencias Internacionales</span>
          </h2>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Para operar con alta disponibilidad perimetral, utilizamos infraestructura cloud bajo contratos de encargo de tratamiento (DPA) y <strong>Cláusulas Contractuales Modelo (Standard Contractual Clauses - Art. 27 Ley N° 21.719)</strong>:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {DATA_SUBPROCESSORS_REGISTRY.map((sub, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-white">{sub.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono text-[10px]">
                    {sub.location}
                  </span>
                </div>
                <p className="text-zinc-400 text-[11px]">{sub.purpose}</p>
                <p className="text-[10px] font-mono text-emerald-400 pt-1">Garantía jurídica: {sub.dpaStatus}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Plazos de Conservación y Supresión (Art. 14 ter letra e) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>5. Criterios y Plazos de Conservación de Datos</span>
          </h2>
          <ul className="list-disc list-inside space-y-2 text-xs text-zinc-300">
            <li>
              <strong>Datos de cuenta activa (Plan Comunitario y Planes Pro/Max):</strong> Se conservan mientras el usuario mantenga su cuenta activa y no solicite su supresión.
            </li>
            <li>
              <strong>Supresión inmediata por Derecho de Cancelación:</strong> Al ejecutar la acción de eliminación en el panel (<code className="text-rose-300">deleteAndAnonymizeUserAccountAction</code>), las tarjetas, Smart CVs, sesiones OAuth y prospectos se eliminan de inmediato en bloque (<code className="text-cyan-300">db.batch()</code>).
            </li>
            <li>
              <strong>Registros contables y tributarios:</strong> Los comprobantes de pago se conservan de forma anonimizada durante el plazo legal de prescripción tributaria exigido por el Servicio de Impuestos Internos (SII - Art. 200 del Código Tributario, hasta 6 años).
            </li>
          </ul>
        </section>

        {/* 6. Ejercicio de Derechos ARCOP y Bloqueo Temporal (Art. 4 y 11) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-400" />
            <span>6. Canal y Procedimiento para Ejercer Derechos ARCOP (Art. 4 y 11)</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Todo titular puede ejercer gratuitamente sus derechos de <strong>Acceso, Rectificación, Cancelación/Supresión, Oposición, Portabilidad y Bloqueo Temporal</strong> por dos vías expeditas:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-2">
              <span className="font-bold text-emerald-400 block">Vía 1: Autoservicio Instantáneo en Panel</span>
              <p className="text-zinc-300">
                Inicia sesión en{' '}
                <Link href="/dashboard" className="text-cyan-400 underline">
                  /dashboard
                </Link>{' '}
                (pestaña Privacidad / Derechos ARCOP) para descargar tu copia portátil en JSON, rectificar tu nombre al instante o eliminar y anonimizar tu cuenta en tiempo real.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-2">
              <span className="font-bold text-cyan-400 block">Vía 2: Solicitud Directa al DPO (Sin Iniciar Sesión)</span>
              <p className="text-zinc-300">
                Escribe a{' '}
                <a href={`mailto:${LEGAL_ENTITY_CONFIG.dpoEmail}`} className="text-cyan-300 font-mono underline">
                  {LEGAL_ENTITY_CONFIG.dpoEmail}
                </a>{' '}
                indicando tu requerimiento. Plazo máximo legal de respuesta:{' '}
                <strong>{ARCOP_LEGAL_SLA.standardResponseCalendarDays} días corridos</strong> (prorrogables una vez por otros {ARCOP_LEGAL_SLA.maxExtensionCalendarDays} días) y{' '}
                <strong>{ARCOP_LEGAL_SLA.temporaryBlockBusinessDays} días hábiles</strong> para solicitudes de <strong>Bloqueo Temporal</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Ciberseguridad y Notificación de Brechas (Art. 14 quinquies y sexies + Ley N° 21.663) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>7. Medidas de Ciberseguridad y Protocolo de Notificación de Brechas</span>
          </h2>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Aplicamos cifrado en tránsito mediante <strong>TLS 1.3 (HTTPS HSTS estricto)</strong>, cifrado en reposo <strong>AES-256</strong> en Turso LibSQL y Cloudflare R2, sesiones firmadas <code className="text-cyan-300">HttpOnly</code> y control de acceso multi-tenant anti-IDOR. Ante cualquier vulneración de seguridad que comprometa datos personales, activamos nuestro protocolo de respuesta en 3 etapas: (1) Contención criptográfica inmediata y rotación de secretos; (2) Notificación sin dilación indebida a la <strong>Agencia de Protección de Datos Personales</strong> y al CSIRT/ANCI cuando corresponda bajo la Ley N° 21.663; y (3) Comunicación directa en lenguaje claro a los titulares afectados si se ven comprometidos datos sensibles o financieros.
          </p>
        </section>
      </div>
    </div>
  );
}
