import { MessageCircle } from 'lucide-react';
import { BRAND_INFO, buildWhatsAppUrl } from '../data/siteData';

const FOOTER_LINKS = [
  { label: 'Serviços', href: '#servicos' },
  { label: 'Simulador 3D', href: '#simulador-3d' },
  { label: 'Galeria', href: '#galeria' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contato', href: '#contato' },
];

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 py-12">
      <div className="mx-auto max-w-6xl px-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="font-display text-base font-bold text-white">{BRAND_INFO.fullTitle}</p>
          <p className="text-sm text-slate-400">{BRAND_INFO.tagline}</p>
          <p className="text-xs text-slate-400">
            {BRAND_INFO.address} · WhatsApp {BRAND_INFO.phoneDisplay}
          </p>
        </div>

        <nav aria-label="Links do rodapé" className="flex flex-wrap items-center gap-5 text-sm">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-slate-300 hover:text-white transition-colors whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export function WhatsAppFab() {
  const url = buildWhatsAppUrl(BRAND_INFO.defaultWhatsAppMessage);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Conversar pelo WhatsApp com ${BRAND_INFO.name} no número ${BRAND_INFO.phoneDisplay}`}
      className="fixed bottom-5 right-5 z-30 hidden md:inline-flex items-center gap-2 rounded-full bg-[#0B3D91] px-4 py-2.5 text-xs font-semibold text-white shadow-lg border border-white/15 hover:bg-[#093277] transition-colors"
    >
      <MessageCircle className="h-4 w-4" aria-hidden="true" />
      <span>WhatsApp</span>
    </a>
  );
}
