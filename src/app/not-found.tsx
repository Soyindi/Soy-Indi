import { SystemErrorFallback } from '@/shared/ui/SystemErrorFallback';

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen bg-[#080A12] flex items-center justify-center p-4">
      <SystemErrorFallback
        type="not_found"
        title="Página o Recurso No Encontrado"
        description="El perfil, currículum vitae o presentación que intentas abrir no existe o el enlace fue modificado."
        actionText="Volver al Portal Principal"
        showHomeButton={true}
      />
    </div>
  );
}
