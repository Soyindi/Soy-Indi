'use client';

import { useEffect } from 'react';
import { SystemErrorFallback } from '@/shared/ui/SystemErrorFallback';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registrar el error en la consola del cliente para diagnóstico
    console.error('[Global App Boundary Caught Error]:', error);
  }, [error]);

  const isDatabase = error?.message?.toLowerCase().includes('database') ||
                     error?.message?.toLowerCase().includes('turso') ||
                     error?.message?.toLowerCase().includes('sqlite');

  const isAi = error?.message?.toLowerCase().includes('nim') ||
               error?.message?.toLowerCase().includes('groq') ||
               error?.message?.toLowerCase().includes('gemini') ||
               error?.message?.toLowerCase().includes('ai');

  return (
    <div className="min-h-screen bg-[#080A12] flex items-center justify-center p-4">
      <SystemErrorFallback
        error={error}
        reset={reset}
        type={isDatabase ? 'database_timeout' : isAi ? 'ai_unavailable' : 'general'}
      />
    </div>
  );
}
