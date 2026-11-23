import { Check } from 'lucide-react';
import { SERVICES, SceneModeId } from '../data/siteData';

interface ServicesSectionProps {
  onSelectFacadeSimulator?: (mode: SceneModeId) => void;
}

export function ServicesSection({ onSelectFacadeSimulator }: ServicesSectionProps) {
  return (
    <section id="servicos" className="scroll-mt-20 bg-slate-50 py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl mb-12">
          <p className="text-sm font-semibold text-[#0B3D91] mb-2">Especialidades</p>
          <h2 className="headline-balance text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
            Serviços de Pintura Residencial e Comercial
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Cada projeto começa pela preparação técnica da superfície e segue até a limpeza final do ambiente, com escolha orientada da tinta certa para cada uso.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SERVICES.map((service) => {
            const isFacadeCard = service.number === '03.';
            return (
              <article
                key={service.number}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 lg:p-8"
              >
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                    <span className="font-display text-sm font-bold text-[#0B3D91] tabular-nums">
                      {service.number}
                    </span>
                    <span className="text-xs font-medium text-slate-500">{service.kicker}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{service.title}</h3>
                  <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-4">
                  <ul className="space-y-2">
                    {service.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-center gap-2.5 text-sm text-slate-700"
                      >
                        <Check className="h-4 w-4 text-[#0B3D91] shrink-0" aria-hidden="true" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {isFacadeCard && onSelectFacadeSimulator && (
                    <div className="pt-1">
                      <a
                        href="#simulador-3d"
                        onClick={() => onSelectFacadeSimulator('fachada-residencial')}
                        className="inline-flex items-center text-xs font-semibold text-[#0B3D91] hover:underline"
                      >
                        Simular fachada no visualizador 3D
                      </a>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
