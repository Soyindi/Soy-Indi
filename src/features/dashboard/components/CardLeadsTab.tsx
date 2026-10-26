'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Download,
  Phone,
  Mail,
  Building,
  Calendar,
  Trash2,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Inbox
} from 'lucide-react';
import { getCardLeadsAction, deleteCardLeadAction, CardLeadItem } from '@/features/card-builder/lead-actions';
import { getWhatsAppDigits } from '@/shared/lib/phone';

export function CardLeadsTab() {
  const [leads, setLeads] = useState<CardLeadItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await getCardLeadsAction();
      if (res.success && res.leads) {
        setLeads(res.leads);
      }
    } catch (error) {
      console.error('Error al cargar leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este contacto captado?')) return;
    setDeletingId(id);
    try {
      const res = await deleteCardLeadAction(id);
      if (res.success) {
        setLeads((prev) => prev.filter((lead) => lead.id !== id));
      }
    } catch (err) {
      console.error('Error al borrar lead:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const term = searchTerm.toLowerCase();
    return (
      lead.name.toLowerCase().includes(term) ||
      (lead.company && lead.company.toLowerCase().includes(term)) ||
      (lead.email && lead.email.toLowerCase().includes(term)) ||
      (lead.phone && lead.phone.includes(term)) ||
      lead.cardTitle.toLowerCase().includes(term)
    );
  });

  const exportCsv = () => {
    if (leads.length === 0) return;

    const headers = ['Nombre', 'Teléfono', 'Email', 'Empresa', 'Tarjeta', 'Fecha', 'Nota'];
    const rows = leads.map((l) => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.company || '').replace(/"/g, '""')}"`,
      `"${l.cardTitle.replace(/"/g, '""')}"`,
      `"${new Date(l.createdAt).toLocaleDateString('es-CL')}"`,
      `"${(l.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads-indi-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera & Métricas de Leads */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Mini-CRM Activo</span>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
            Contactos Captados ({leads.length})
          </h2>
          <p className="mt-1 text-xs text-neutral-400 sm:text-sm">
            Personas que escanearon tu tarjeta e intercambiaron sus datos contigo.
          </p>
        </div>

        {leads.length > 0 && (
          <button
            onClick={exportCsv}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white transition hover:bg-white/10 active:scale-95 sm:self-start"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>
        )}
      </div>

      {/* Buscador de Contactos */}
      {leads.length > 0 && (
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, empresa, email o teléfono..."
            className="h-11 w-full rounded-2xl border border-white/10 bg-neutral-900/60 pl-10 pr-4 text-sm text-white placeholder-neutral-500 backdrop-blur-md transition focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      )}

      {/* Listado de Contactos */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-white/5 bg-neutral-900/40 p-5"
            />
          ))}
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-neutral-900/20 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-neutral-500">
            <Inbox className="h-7 w-7" />
          </div>
          <h3 className="text-base font-semibold text-white">Aún no has recibido contactos</h3>
          <p className="mt-1 max-w-sm text-xs text-neutral-400 sm:text-sm">
            Comparte tu tarjeta digital en eventos o redes. Cuando alguien pulse &quot;Intercambiar Contacto&quot;, sus datos aparecerán listos aquí.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AnimatePresence>
            {filteredLeads.map((lead) => {
              const cleanPhone = lead.phone ? getWhatsAppDigits(lead.phone) : '';
              const whatsappUrl = cleanPhone
                ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hola ${lead.name}, un gusto. Vi que me dejaste tus datos en mi tarjeta INDI...`)}`
                : null;

              return (
                <motion.div
                  key={lead.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col justify-between rounded-2xl border border-white/10 bg-neutral-900/60 p-5 backdrop-blur-md transition hover:border-emerald-500/30"
                >
                  <div>
                    {/* Header de la tarjeta de lead */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-base font-bold text-white">{lead.name}</h4>
                        {lead.company && (
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-400">
                            <Building className="h-3 w-3 text-neutral-500" />
                            <span>{lead.company}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        disabled={deletingId === lead.id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50"
                        title="Eliminar contacto"
                        aria-label={`Eliminar contacto de ${lead.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Nota o mensaje breve */}
                    {lead.note && (
                      <p className="mt-3 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-xs text-neutral-300">
                        &quot;{lead.note}&quot;
                      </p>
                    )}

                    {/* Metadatos de contacto */}
                    <div className="mt-4 space-y-1.5 text-xs text-neutral-300">
                      {lead.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-emerald-400" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                      {lead.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-sky-400" />
                          <span>{lead.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[11px] text-neutral-500 pt-1">
                        <Calendar className="h-3 w-3" />
                        <span>Captado el {new Date(lead.createdAt).toLocaleDateString('es-CL')} desde</span>
                        <a
                          href={`/c/${lead.cardSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-emerald-400 hover:underline flex items-center gap-0.5"
                        >
                          <span>{lead.cardTitle}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Acciones de 1 toque */}
                  <div className="mt-5 flex items-center gap-2 pt-3 border-t border-white/5">
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition hover:bg-emerald-500/25 active:scale-95"
                      >
                        <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Escribir por WhatsApp</span>
                      </a>
                    )}
                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}?subject=${encodeURIComponent(`Contacto desde tu tarjeta INDI`)}`}
                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-medium text-neutral-200 transition hover:bg-white/10 active:scale-95"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        <span>Email</span>
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
