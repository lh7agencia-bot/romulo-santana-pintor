import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { GallerySection } from './components/GallerySection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FaqSection } from './components/FaqSection';
import { ContactSection } from './components/ContactSection';
import { Footer, WhatsAppFab } from './components/Footer';
import { SceneModeId } from './data/siteData';

const PaintSimulator3D = lazy(() => import('./components/PaintSimulator3D'));

function SimulatorPlaceholder({ onActivate }: { onActivate: () => void }) {
  return (
    <section
      id="simulador-3d"
      className="scroll-mt-20 bg-white py-20 lg:py-24 border-y border-slate-200/80"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl mb-8">
          <p className="text-sm font-semibold text-[#0B3D91] mb-2">
            Simulador Interativo 3D · Fachadas e Interiores
          </p>
          <h2 className="headline-balance text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
            Visualize Cores e Texturas na Fachada 3D
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Carregando modelo arquitetônico 3D otimizado para interação em todos os eixos e zoom de detalhes.
          </p>
        </div>

        <div className="flex h-[560px] sm:h-[590px] lg:h-[620px] w-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 p-8 text-center">
          <div className="h-9 w-9 rounded-full border-2 border-[#0B3D91] border-t-transparent animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-900">
            Preparando visualizador 3D de fachadas...
          </p>
          <p className="mt-1 text-xs text-slate-600">
            O carregamento dinâmico otimiza a velocidade inicial do site.
          </p>
          <button
            type="button"
            onClick={onActivate}
            className="mt-4 rounded-lg bg-[#0B3D91] px-4 py-2 text-xs font-semibold text-white hover:bg-[#093277] cursor-pointer"
          >
            Carregar Simulador 3D Agora
          </button>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [externalSceneMode, setExternalSceneMode] = useState<SceneModeId | undefined>(undefined);
  const [shouldLoad3D, setShouldLoad3D] = useState<boolean>(false);
  const simulatorSentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldLoad3D) return;
    if (window.location.hash === '#simulador-3d') {
      setShouldLoad3D(true);
      return;
    }
    const target = simulatorSentinelRef.current;
    if (!target || typeof IntersectionObserver === 'undefined') {
      setShouldLoad3D(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad3D(true);
          observer.disconnect();
        }
      },
      { rootMargin: '420px 0px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [shouldLoad3D]);

  const handleSelectFacadeSimulator = (mode: SceneModeId) => {
    setExternalSceneMode(mode);
    setShouldLoad3D(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ServicesSection onSelectFacadeSimulator={handleSelectFacadeSimulator} />
        <div ref={simulatorSentinelRef}>
          {shouldLoad3D ? (
            <Suspense fallback={<SimulatorPlaceholder onActivate={() => setShouldLoad3D(true)} />}>
              <PaintSimulator3D selectedSceneFromExternal={externalSceneMode} />
            </Suspense>
          ) : (
            <SimulatorPlaceholder onActivate={() => setShouldLoad3D(true)} />
          )}
        </div>
        <GallerySection />
        <TestimonialsSection />
        <FaqSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
