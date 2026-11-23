import { useState } from 'react';
import { Maximize2, Paintbrush, X } from 'lucide-react';
import { GALLERY_ITEMS, GalleryItem } from '../data/siteData';

type FilterType = 'Todas' | 'Residencial' | 'Comercial';

export function GallerySection() {
  const [filter, setFilter] = useState<FilterType>('Todas');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const visibleItems =
    filter === 'Todas'
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === filter);

  return (
    <section id="galeria" className="scroll-mt-20 bg-slate-50 py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-12">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[#0B3D91] mb-2">Portfólio Real</p>
            <h2 className="headline-balance text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
              Galeria de Obras Realizadas
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Registros reais de pinturas residenciais e comerciais executadas com foco em proteção do espaço e acabamento uniforme. Clique para ampliar.
            </p>
          </div>

          <div
            role="group"
            aria-label="Filtrar galeria por categoria"
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 self-start md:self-auto shrink-0"
          >
            {(['Todas', 'Residencial', 'Comercial'] as FilterType[]).map((cat) => {
              const active = filter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(cat)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#0B3D91] text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleItems.map((item) => {
            const hasFailed = Boolean(failedImages[item.id]);
            return (
              <button
                key={item.id}
                type="button"
                aria-label={`Ampliar foto: ${item.title}`}
                onClick={() => setActiveItem(item)}
                className="group text-left overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B3D91]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  {hasFailed ? (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-6 text-center">
                      <Paintbrush className="h-8 w-8 text-[#0B3D91] mb-2" />
                      <p className="text-sm font-medium text-slate-700">{item.title}</p>
                    </div>
                  ) : (
                    <img
                      src={item.image}
                      alt={item.alt}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedImages((prev) => ({ ...prev, [item.id]: true }))
                      }
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  )}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/45 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  >
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-white">
                      <Maximize2 className="h-3.5 w-3.5" />
                      Ver foto ampliada
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                    <span className="font-semibold text-[#0B3D91]">{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>Rômulo Santana</span>
                  </p>
                  <h3 className="mt-1.5 text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accessible Lightbox Modal */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 sm:p-6"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Fechar foto ampliada"
              onClick={() => setActiveItem(null)}
              className="absolute top-3 right-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900/90 text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex max-h-[70vh] w-full items-center justify-center bg-slate-900">
              <img
                src={activeItem.image}
                alt={activeItem.alt}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
            </div>

            <div className="p-6">
              <p className="text-xs font-semibold text-[#0B3D91]">
                {activeItem.category} · Rômulo Santana
              </p>
              <h3 className="mt-1 text-xl font-bold text-slate-900">{activeItem.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{activeItem.subtitle}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
