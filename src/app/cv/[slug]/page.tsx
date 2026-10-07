import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/shared/api/db';
import { smartCvs } from '@/entities/schema';
import { eq, sql } from 'drizzle-orm';
import { CVFormValues } from '@/entities/cv/schemas';
import { PublicCvViewer } from '@/features/ai-smart-cv/components/PublicCvViewer';
import { Sparkles, ArrowLeft, FileText } from 'lucide-react';

interface PublicCvPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: PublicCvPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const cv = await db.query.smartCvs.findFirst({
      where: eq(smartCvs.slug, slug),
    });

    if (!cv || !cv.isPublic) {
      return {
        title: 'Currículum Digital | INDI',
        description: 'Currículum profesional en formato interactivo y compatible con ATS.',
      };
    }

    const content = cv.content as any;
    const name = content?.fullName || cv.title;
    const role = cv.targetRole;
    const ogImageUrl = `https://soyindi.cl/api/og?type=cv&title=${encodeURIComponent(name)}&role=${encodeURIComponent(role)}&about=${encodeURIComponent('Currículum profesional ATS verificado en el Edge.')}&verified=1`;

    return {
      title: `${name} • ${role} | Smart CV`,
      description: `Revisa la trayectoria profesional y credenciales verificables de ${name} (${role}) en INDI. Descarga su CV en PDF vectorial ATS.`,
      alternates: {
        canonical: `https://soyindi.cl/cv/${slug}`,
      },
      openGraph: {
        title: `${name} • ${role} | Smart CV`,
        description: `Revisa la trayectoria profesional de ${name} (${role}) en INDI. Descarga su CV vectorial ATS.`,
        url: `https://soyindi.cl/cv/${slug}`,
        siteName: 'INDI Smart CV',
        type: 'profile',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${name} — Smart CV`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${name} • ${role} | Smart CV`,
        description: `Revisa la trayectoria profesional de ${name} (${role}) en INDI.`,
        images: [ogImageUrl],
      },
    };
  } catch (err) {
    return {
      title: 'Currículum Digital | INDI',
    };
  }
}

export default async function PublicCvPage({ params }: PublicCvPageProps) {
  const { slug } = await params;

  let cvRecord = null;
  try {
    cvRecord = await db.query.smartCvs.findFirst({
      where: eq(smartCvs.slug, slug),
    });
  } catch (err) {
    console.error('Error buscando Smart CV por slug:', err);
  }

  // Si no existe o no es público, mostrar vista de cortesía amigable
  if (!cvRecord || !cvRecord.isPublic) {
    return (
      <div className="min-h-screen bg-[#090a10] text-zinc-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
          <FileText className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Currículum en Preparación o Privado
        </h1>
        <p className="text-sm text-zinc-400 max-w-md mb-8 leading-relaxed">
          El currículum con el enlace &quot;{slug}&quot; no se encuentra disponible públicamente en este momento o su autor lo ha configurado como privado.
        </p>
        <Link
          href="/"
          className="min-h-[44px] inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 hover:opacity-95 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Inicio de INDI</span>
        </Link>
      </div>
    );
  }

  const cvData: CVFormValues = {
    title: cvRecord.title,
    targetRole: cvRecord.targetRole,
    slug: cvRecord.slug || slug,
    isPublic: cvRecord.isPublic,
    templateId: cvRecord.templateId,
    content: cvRecord.content as any,
  };

  return (
    <PublicCvViewer
      cv={cvData}
      slug={slug}
      atsScore={cvRecord.atsScore}
    />
  );
}
