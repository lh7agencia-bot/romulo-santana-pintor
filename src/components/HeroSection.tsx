import { useState } from 'react';
import { ArrowRight, MapPin, Phone, Paintbrush } from 'lucide-react';
import { BRAND_INFO, HERO_IMAGE, buildWhatsAppUrl } from '../data/siteData';

const HERO_PILLARS = [
  { title: 'Residencial', subtitle: 'Casas, sobrados e apartamentos' },
  { title: 'Comercial', subtitle: 'Lojas, vitrines e escritórios' },
  { title: 'Proteção Total', subtitle: 'Isolamento de pisos e esquadrias' },
  { title: 'Serra - ES', subtitle: 'Atendimento na Grande Vitória' },
];

export function HeroSection() {
  const [imgError, setImgError] = useState(false);
  const whatsappUrl = buildWhatsAppUrl(BRAND_INFO.defaultWhatsAppMessage);

  return (
    <section id="inicio" className="scroll-mt-20 bg-white pt-10 pb-14 lg:pt-14 lg:pb-18 border-b border-slate-200/80">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Copy Column */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-sm font-semibold text-[#0B3D91] mb-3">
              {BRAND_INFO.tagline}
            </p>
            <h1 className="headline-balance text-[clamp(2.25rem,4vw,3.35rem)] font-bold tracking-tight leading-[1.1] text-slate-900">
              {BRAND_INFO.fullTitle}
            </h1>
            <p className="mt-5 text-base lg:text-lg text-slate-600 leading-relaxed max-w-xl">
              Acabamento refinado para casas, apartamentos, fachadas e pontos comerciais em Serra - ES. Proteção completa do ambiente, tintas de alto desempenho e entrega no prazo combinado.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#0B3D91]" aria-hidden="true" />
                {BRAND_INFO.shortLocation}
              </span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span className="inline-flex items-center gap-1.5 tabular-nums font-medium text-slate-800">
                <Phone className="h-4 w-4 text-[#0B3D91]" aria-hidden="true" />
                {BRAND_INFO.phoneDisplay}
              </span>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#0B3D91] px-5 py-3 text-sm font-semibold text-white hover:bg-[#093277] transition-colors whitespace-nowrap shrink-0"
              >
                Solicitar Orçamento via WhatsApp
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#simulador-3d"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                Simular Fachada em 3D
              </a>
            </div>
          </div>

          {/* Right Media Column */}
          <div className="lg:col-span-6">
            <div className="relative h-full min-h-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              {imgError ? (
                <div className="flex h-full min-h-[320px] w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-8 text-center">
                  <Paintbrush className="h-10 w-10 text-[#0B3D91] mb-3" />
                  <p className="text-sm font-semibold text-slate-800">{HERO_IMAGE.captionTitle}</p>
                </div>
              ) : (
                <img
                  src={HERO_IMAGE.src}
                  alt={HERO_IMAGE.alt}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover aspect-[4/3] lg:aspect-auto"
                />
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-16 text-white">
                <p className="text-sm font-semibold">{HERO_IMAGE.captionTitle}</p>
                <p className="mt-0.5 text-xs text-slate-200">{HERO_IMAGE.captionSubtitle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width 4-column Value Strip */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6 border-t border-slate-200 pt-8">
          {HERO_PILLARS.map((item) => (
            <div key={item.title}>
              <p className="font-display text-base font-bold text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm text-slate-600">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
