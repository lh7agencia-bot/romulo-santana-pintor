import {
  BRAND_INFO,
  CameraPresetOption,
  FinishId,
  FINISH_OPTIONS,
  FinishOption,
  LightingId,
  PaintColorOption,
  SceneModeId,
  buildWhatsAppUrl,
} from '../data/siteData';

export interface FinishMaterialConfig {
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  bumpScale: number;
  useTexturedMap: boolean;
}

export interface LightingRigConfig {
  skyHex: string;
  fogHex: string;
  sunColor: string;
  sunIntensity: number;
  sunPosition: [number, number, number];
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  rimIntensity: number;
  sconceIntensity: number;
  interiorGlowIntensity: number;
  toneMappingExposure: number;
}

export interface SimulatorSummaryInput {
  sceneMode: SceneModeId;
  primaryColor: PaintColorOption;
  trimColor: PaintColorOption;
  finish: FinishId;
  lighting: LightingId;
}

export interface QuoteFormValues {
  name: string;
  email: string;
  serviceType: string;
  message: string;
}

export interface QuoteFormValidation {
  valid: boolean;
  errors: Partial<Record<keyof QuoteFormValues, string>>;
}

export function getAvailableFinishes(sceneMode: SceneModeId): FinishOption[] {
  if (sceneMode === 'ambiente-interno') {
    return FINISH_OPTIONS.filter((f) => f.id !== 'textura');
  }
  return FINISH_OPTIONS;
}

export function coerceFinishForScene(sceneMode: SceneModeId, current: FinishId): FinishId {
  const allowed = getAvailableFinishes(sceneMode);
  if (allowed.some((f) => f.id === current)) {
    return current;
  }
  return 'acetinado';
}

export function getAvailableCameras(sceneMode: SceneModeId): CameraPresetOption[] {
  if (sceneMode === 'fachada-residencial') {
    return [
      {
        id: 'geral',
        label: 'Fachada Geral',
        position: [9.0, 4.3, 12.8],
        target: [0, 1.75, 0.4],
      },
      {
        id: 'platibanda',
        label: 'Platibanda & Varanda',
        position: [-5.6, 5.1, 7.2],
        target: [-0.2, 3.5, 0.8],
      },
      {
        id: 'muro',
        label: 'Muro & Entrada',
        position: [5.4, 2.2, 8.2],
        target: [0.4, 1.4, 2.2],
      },
    ];
  }

  if (sceneMode === 'fachada-comercial') {
    return [
      {
        id: 'geral',
        label: 'Vitrine Geral',
        position: [8.0, 3.6, 11.2],
        target: [0, 1.65, 0.2],
      },
      {
        id: 'platibanda',
        label: 'Testeira & Letreiro',
        position: [-4.2, 4.6, 6.8],
        target: [0, 3.5, 0.5],
      },
      {
        id: 'muro',
        label: 'Entrada & Vitrine',
        position: [3.2, 1.9, 6.2],
        target: [0.2, 1.5, 0.2],
      },
    ];
  }

  return [
    {
      id: 'ambiente',
      label: 'Ambiente',
      position: [4.8, 2.7, 5.4],
      target: [0, 1.5, -0.3],
    },
    {
      id: 'boiserie',
      label: 'Boiserie',
      position: [-2.2, 2.2, 4.0],
      target: [0, 1.75, -1.6],
    },
    {
      id: 'rolo',
      label: 'Pintura & Rolo',
      position: [2.4, 1.35, 3.0],
      target: [1.0, 0.45, 0.55],
    },
  ];
}

export function getFinishMaterialProps(finish: FinishId): FinishMaterialConfig {
  switch (finish) {
    case 'fosco':
      return {
        roughness: 0.92,
        metalness: 0.02,
        clearcoat: 0.0,
        clearcoatRoughness: 0.8,
        bumpScale: 0.012,
        useTexturedMap: false,
      };
    case 'acetinado':
      return {
        roughness: 0.52,
        metalness: 0.05,
        clearcoat: 0.25,
        clearcoatRoughness: 0.45,
        bumpScale: 0.008,
        useTexturedMap: false,
      };
    case 'semibrilho':
      return {
        roughness: 0.24,
        metalness: 0.08,
        clearcoat: 0.65,
        clearcoatRoughness: 0.18,
        bumpScale: 0.004,
        useTexturedMap: false,
      };
    case 'textura':
      return {
        roughness: 0.86,
        metalness: 0.02,
        clearcoat: 0.0,
        clearcoatRoughness: 0.9,
        bumpScale: 0.055,
        useTexturedMap: true,
      };
  }
}

export function getLightingRigConfig(
  sceneMode: SceneModeId,
  lighting: LightingId,
): LightingRigConfig {
  if (sceneMode === 'ambiente-interno') {
    return {
      skyHex: '#EEF2F6',
      fogHex: '#EEF2F6',
      sunColor: '#FFF5E4',
      sunIntensity: 1.45,
      sunPosition: [5.5, 7.5, 6.0],
      hemiSky: '#DCEBFF',
      hemiGround: '#CBB89D',
      hemiIntensity: 0.65,
      rimIntensity: 0.45,
      sconceIntensity: 0,
      interiorGlowIntensity: 0.2,
      toneMappingExposure: 1.0,
    };
  }

  switch (lighting) {
    case 'manha':
      return {
        skyHex: '#DCE9F7',
        fogHex: '#DCE9F7',
        sunColor: '#FFF9EC',
        sunIntensity: 2.35,
        sunPosition: [10, 14, 9],
        hemiSky: '#CFE4FF',
        hemiGround: '#8B857C',
        hemiIntensity: 0.9,
        rimIntensity: 0.45,
        sconceIntensity: 0.0,
        interiorGlowIntensity: 0.35,
        toneMappingExposure: 1.06,
      };
    case 'entardecer':
      return {
        skyHex: '#F3DAC4',
        fogHex: '#EED2BC',
        sunColor: '#FFB870',
        sunIntensity: 2.5,
        sunPosition: [-12, 5.5, 9],
        hemiSky: '#F4C6A0',
        hemiGround: '#5F5B66',
        hemiIntensity: 0.72,
        rimIntensity: 0.65,
        sconceIntensity: 1.35,
        interiorGlowIntensity: 0.85,
        toneMappingExposure: 1.08,
      };
    case 'noturno':
      return {
        skyHex: '#131D2E',
        fogHex: '#131D2E',
        sunColor: '#7EA6E0',
        sunIntensity: 0.65,
        sunPosition: [-8, 12, 8],
        hemiSky: '#294066',
        hemiGround: '#181E29',
        hemiIntensity: 0.5,
        rimIntensity: 0.45,
        sconceIntensity: 3.2,
        interiorGlowIntensity: 1.45,
        toneMappingExposure: 1.15,
      };
  }
}

export function buildSimulatorWhatsAppUrl(input: SimulatorSummaryInput): string {
  const finishObj = FINISH_OPTIONS.find((f) => f.id === input.finish);
  const finishLabel = finishObj ? finishObj.label : 'Acetinado';
  const sceneLabel =
    input.sceneMode === 'fachada-residencial'
      ? 'Fachada Residencial 3D'
      : input.sceneMode === 'fachada-comercial'
        ? 'Fachada Comercial 3D'
        : 'Ambiente Interno 3D';

  const message =
    input.sceneMode === 'ambiente-interno'
      ? `Olá, ${BRAND_INFO.name}! Testei a cor "${input.primaryColor.name}" (${input.primaryColor.hex}) com acabamento ${finishLabel} no simulador ${sceneLabel} e gostaria de um orçamento.`
      : `Olá, ${BRAND_INFO.name}! Simulei na ${sceneLabel} a cor principal "${input.primaryColor.name}" (${input.primaryColor.hex}) com detalhes em "${input.trimColor.name}" (${input.trimColor.hex}) e acabamento ${finishLabel}. Gostaria de solicitar um orçamento!`;

  return buildWhatsAppUrl(message);
}

export function validateQuoteForm(values: QuoteFormValues): QuoteFormValidation {
  const errors: Partial<Record<keyof QuoteFormValues, string>> = {};
  const trimmedName = values.name.trim();
  const trimmedEmail = values.email.trim();
  const trimmedMessage = values.message.trim();

  if (trimmedName.length < 2) {
    errors.name = 'Informe seu nome completo.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
    errors.email = 'Informe um e-mail válido.';
  }

  if (!values.serviceType.trim()) {
    errors.serviceType = 'Selecione o tipo de serviço.';
  }

  if (trimmedMessage.length < 5) {
    errors.message = 'Descreva brevemente o ambiente ou fachada para estimativa.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
