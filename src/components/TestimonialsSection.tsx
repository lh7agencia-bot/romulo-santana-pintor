import { Star } from 'lucide-react';
import { TESTIMONIALS } from '../data/siteData';

export function TestimonialsSection() {
  return (
    <section id="depoimentos" className="scroll-mt-20 bg-[#0B3D91] py-20 lg:py-24 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl mb-12">
          <p className="text-sm font-semibold text-blue-200 mb-2">Confiança Comprovada</p>
          <h2 className="headline-balance text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Depoimentos de Clientes Atendidos
          </h2>
          <p className="mt-3 text-base text-blue-100 leading-relaxed">
            Avaliações reais sobre pontualidade, limpeza de obra e qualidade do acabamento em residências e pontos comerciais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item) => (
            <article
              key={item.name}
              className="flex flex-col justify-between rounded-2xl border border-white/15 bg-white/10 p-7"
            >
              <div>
                <div
                  aria-label="5 de 5 estrelas"
                  className="flex items-center gap-1 text-amber-300 mb-4"
                >
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-current" aria-hidden="true" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-blue-50">{item.quote}</p>
              </div>

              <div className="mt-6 pt-5 border-t border-white/15">
                <h3 className="text-base font-bold text-white">{item.name}</h3>
                <p className="mt-0.5 text-xs text-blue-200">{item.context}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
