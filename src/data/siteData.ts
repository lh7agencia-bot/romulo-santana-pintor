export type SceneModeId = 'fachada-residencial' | 'fachada-comercial' | 'ambiente-interno';

export type FinishId = 'fosco' | 'acetinado' | 'semibrilho' | 'textura';

export type LightingId = 'manha' | 'entardecer' | 'noturno';

export type PaintTarget = 'primary' | 'trim';

export interface PaintColorOption {
  id: string;
  name: string;
  hex: string;
  note: string;
}

export interface FinishOption {
  id: FinishId;
  label: string;
  description: string;
}

export interface LightingOption {
  id: LightingId;
  label: string;
}

export interface CameraPresetOption {
  id: string;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
}

export interface ServiceItem {
  number: string;
  kicker: string;
  title: string;
  description: string;
  bullets: string[];
}

export interface GalleryItem {
  id: string;
  category: 'Residencial' | 'Comercial';
  title: string;
  subtitle: string;
  image: string;
  alt: string;
}

export interface TestimonialItem {
  quote: string;
  name: string;
  context: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const BRAND_INFO = {
  name: 'Rômulo Santana',
  fullTitle: 'Rômulo Santana - Pintura Residencial e Comercial',
  tagline: 'Cor que transforma ambientes',
  address: 'R. Putiri - Mata da Serra, Serra - ES, 29168-152',
  shortLocation: 'Mata da Serra, Serra - ES',
  phoneDisplay: '(27) 97400-9227',
  whatsappNumber: '5527974009227',
  email: 'contato@romulosantana.com.br',
  defaultWhatsAppMessage:
    'Olá, Rômulo Santana! Vi seu site e gostaria de solicitar um orçamento de pintura.',
};

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${BRAND_INFO.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const HERO_IMAGE = {
  src: '/src/assets/images/obra-4.jpg',
  alt: 'Fachada residencial moderna pintada por Rômulo Santana em acabamento acrílico e tom terroso',
  captionTitle: 'Obra Executada · Pintura Externa e Fachada',
  captionSubtitle: 'Proteção climática e precisão nos recortes arquitetônicos',
};

export const SCENE_MODES: { id: SceneModeId; label: string; badge: string }[] = [
  { id: 'fachada-residencial', label: 'Fachada Residencial', badge: 'Externo 3D' },
  { id: 'fachada-comercial', label: 'Fachada Comercial', badge: 'Loja 3D' },
  { id: 'ambiente-interno', label: 'Ambiente Interno', badge: 'Sala 3D' },
];

export const PAINT_COLORS: PaintColorOption[] = [
  {
    id: 'azul-marinho',
    name: 'Azul Marinho Clássico',
    hex: '#0B3D91',
    note: 'Profundidade sofisticada e destaque arquitetônico',
  },
  {
    id: 'branco-arquitetonico',
    name: 'Branco Arquitetônico',
    hex: '#F3F4F0',
    note: 'Luminosidade limpa que amplia o volume construído',
  },
  {
    id: 'cinza-platina',
    name: 'Cinza Platina',
    hex: '#8C959E',
    note: 'Neutro contemporâneo ideal para fachadas modernas',
  },
  {
    id: 'areia-mineral',
    name: 'Areia Mineral',
    hex: '#D4BEA2',
    note: 'Tom terroso acolhedor com ótima estabilidade ao sol',
  },
  {
    id: 'verde-salvia',
    name: 'Verde Sálvia',
    hex: '#6E8272',
    note: 'Equilíbrio orgânico em harmonia com paisagismo',
  },
  {
    id: 'terracota-suave',
    name: 'Terracota Suave',
    hex: '#B36A4E',
    note: 'Personalidade quente para planos de destaque externo',
  },
  {
    id: 'grafite-urbano',
    name: 'Grafite Urbano',
    hex: '#363C44',
    note: 'Contraste elegante para platibandas e fachadas comerciais',
  },
  {
    id: 'preto-fosco',
    name: 'Preto Fosco',
    hex: '#1D2127',
    note: 'Acabamento de alto impacto para vitrines e pórticos',
  },
];

export const TRIM_COLORS: PaintColorOption[] = [
  {
    id: 'trim-branco',
    name: 'Branco Neve',
    hex: '#F8FAFC',
    note: 'Recorte nítido para molduras, beirais e pingadeiras',
  },
  {
    id: 'trim-grafite',
    name: 'Cinza Grafite',
    hex: '#3B424C',
    note: 'Contraste arquitetônico contemporâneo em esquadrias',
  },
  {
    id: 'trim-travertino',
    name: 'Bege Travertino',
    hex: '#D8CEBC',
    note: 'Suavidade mineral para pórticos e muros',
  },
  {
    id: 'trim-preto',
    name: 'Preto Fosco',
    hex: '#1B1F24',
    note: 'Emolduramento marcante em fachadas modernas',
  },
  {
    id: 'trim-corten',
    name: 'Bronze Cobre',
    hex: '#6E4C3B',
    note: 'Tom metálico aquecido para detalhes e pilares',
  },
];

export const FINISH_OPTIONS: FinishOption[] = [
  {
    id: 'fosco',
    label: 'Fosco',
    description: 'Fosco · Disfarça ondulações com toque aveludado',
  },
  {
    id: 'acetinado',
    label: 'Acetinado',
    description: 'Acetinado · Toque sedoso e fácil limpeza',
  },
  {
    id: 'semibrilho',
    label: 'Semibrilho',
    description: 'Semibrilho · Reflexo intenso e alta lavabilidade',
  },
  {
    id: 'textura',
    label: 'Textura Projetada',
    description: 'Textura Projetada · Relevo mineral resistente à chuva e sol',
  },
];

export const LIGHTING_OPTIONS: LightingOption[] = [
  { id: 'manha', label: 'Dia' },
  { id: 'entardecer', label: 'Fim de Tarde' },
  { id: 'noturno', label: 'Noturno' },
];

export const SERVICES: ServiceItem[] = [
  {
    number: '01.',
    kicker: 'Casas, sobrados e apartamentos',
    title: 'Pintura Residencial Completa',
    description:
      'Execução criteriosa em ambientes internos e externos com proteção integral de pisos, esquadrias e mobiliário, garantindo uniformidade de cor e toque acetinado ou fosco.',
    bullets: [
      'Proteção com lona e fita crepe',
      'Correção de fissuras e massa corrida',
      'Acabamento sem respingos',
    ],
  },
  {
    number: '02.',
    kicker: 'Lojas, escritórios e espaços de atendimento',
    title: 'Pintura Comercial e Corporativa',
    description:
      'Renovação ágil para pontos comerciais com planejamento de horário para reduzir interrupções na sua operação, valorizando a vitrine e a identidade visual do espaço.',
    bullets: [
      'Cronograma ágil e pontual',
      'Tintas laváveis de alta resistência',
      'Atendimento noturno ou em finais de semana',
    ],
  },
  {
    number: '03.',
    kicker: 'Proteção contra sol, chuva e maresia',
    title: 'Fachadas e Muros Externos',
    description:
      'Tratamento de superfícies expostas com seladores, impermeabilizantes e tintas acrílicas premium indicadas para o clima litorâneo do Espírito Santo.',
    bullets: [
      'Selagem e fundo preparador',
      'Alta durabilidade contra intempéries',
      'Cores estáveis ao sol',
    ],
  },
  {
    number: '04.',
    kicker: 'Base perfeita antes da primeira demão',
    title: 'Preparação, Nivelamento e Texturas',
    description:
      'Lixamento técnico, emassamento fino, aplicação de textura projetada ou grafiato e repintura de portas, grades e estruturas metálicas.',
    bullets: [
      'Massa acrílica e PVA',
      'Esmalte sintético em madeiras e metais',
      'Superfícies lisas ao toque',
    ],
  },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'fachada-residencial',
    category: 'Residencial',
    title: 'Pintura de Fachada Residencial Moderna',
    subtitle: 'Fachada em dois pavimentos · Acabamento texturizado e acrílico',
    image: '/src/assets/images/obra-4.jpg',
    alt: 'Pintura de Fachada Residencial Moderna',
  },
  {
    id: 'fachada-comercial',
    category: 'Comercial',
    title: 'Pintura de Fachada Comercial em Shopping',
    subtitle: 'Loja comercial · Acabamento preto fosco de alto padrão',
    image: '/src/assets/images/obra-3.jpg',
    alt: 'Pintura de Fachada Comercial em Shopping',
  },
  {
    id: 'molduras-externas',
    category: 'Residencial',
    title: 'Acabamento Externo e Molduras Arquitetônicas',
    subtitle: 'Área externa e pergolado · Cinza contemporâneo',
    image: '/src/assets/images/obra-1.jpg',
    alt: 'Acabamento Externo e Molduras Arquitetônicas',
  },
  {
    id: 'sala-cozinha',
    category: 'Residencial',
    title: 'Pintura Interna de Sala e Cozinha Integrada',
    subtitle: 'Ambiente interno · Preparação e demãos de acabamento',
    image: '/src/assets/images/obra-2.jpg',
    alt: 'Pintura Interna de Sala e Cozinha Integrada',
  },
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    quote:
      '“O Rômulo transformou a fachada da nossa casa. Chegou no horário combinado, protegeu todas as esquadrias de vidro e entregou um acabamento muito liso, sem nenhuma mancha.”',
    name: 'Marcelo Oliveira',
    context: 'Pintura residencial externa · Serra',
  },
  {
    quote:
      '“Contratei para pintar sala, quartos e teto antes da mudança. Ambiente limpo ao final de cada dia, recortes perfeitos no rodapé e ótimo auxílio na escolha do tom acetinado.”',
    name: 'Fernanda Ribeiro',
    context: 'Pintura de apartamento · Mata da Serra',
  },
  {
    quote:
      '“Precisávamos renovar nossa loja fora do horário de funcionamento. A equipe cumpriu o prazo à risca, cuidou de cada detalhe da vitrine e o resultado ficou impecável.”',
    name: 'Eduardo Mendes',
    context: 'Pintura comercial · Grande Vitória',
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Como funciona o orçamento e a visita técnica?',
    answer:
      'Você pode enviar fotos ou medidas aproximadas pelo WhatsApp (27) 97400-9227 para uma estimativa inicial ou agendar uma visita técnica presencial em Serra e região. Avaliamos o estado das paredes, indicamos o tipo de tinta ideal e enviamos o orçamento detalhado.',
  },
  {
    question: 'Os móveis, pisos e tomadas ficam protegidos durante a pintura?',
    answer:
      'Sim. Antes de abrir qualquer lata de tinta, isolamos pisos com lona e papelão ondulado, protegemos esquadrias, vidros e tomadas com fita crepe de alta precisão e cobrimos móveis com plástico protetor.',
  },
  {
    question: 'Qual tipo de tinta devo escolher: fosca, acetinada ou semibrilho?',
    answer:
      'O acabamento fosco disfarça melhor pequenas imperfeições do reboco e cria visual sofisticado em fachadas e tetos. O acetinado oferece toque sedoso e limpeza prática em salas e corredores. Já o semibrilho ou esmalte destaca portas, grades e áreas de alta lavabilidade.',
  },
  {
    question: 'Quanto tempo leva em média uma pintura residencial ou comercial?',
    answer:
      'Um apartamento padrão de 2 quartos leva em média de 3 a 5 dias úteis, dependendo do preparo de massa necessário. Fachadas residenciais e lojas comerciais têm cronograma ajustado por etapa, inclusive com opção de turno noturno para comércios.',
  },
  {
    question: 'Quais regiões são atendidas?',
    answer:
      'Atendemos toda a cidade de Serra - ES (Mata da Serra, Laranjeiras, Colina de Laranjeiras, Jardim Limoeiro, Morada de Laranjeiras, Jacaraípe e região) e municípios da Grande Vitória, incluindo Vitória, Vila Velha e Cariacica.',
  },
];
