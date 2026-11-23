import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSimulatorWhatsAppUrl,
  coerceFinishForScene,
  getAvailableCameras,
  getAvailableFinishes,
  getFinishMaterialProps,
  getLightingRigConfig,
  validateQuoteForm,
} from './simulatorLogic';
import { PAINT_COLORS, TRIM_COLORS } from '../data/siteData';

test('facade modes include textura finish while interior mode excludes it', () => {
  const facadeFinishes = getAvailableFinishes('fachada-residencial');
  assert.equal(facadeFinishes.some((f) => f.id === 'textura'), true);

  const commercialFinishes = getAvailableFinishes('fachada-comercial');
  assert.equal(commercialFinishes.some((f) => f.id === 'textura'), true);

  const interiorFinishes = getAvailableFinishes('ambiente-interno');
  assert.equal(interiorFinishes.some((f) => f.id === 'textura'), false);
  assert.equal(coerceFinishForScene('ambiente-interno', 'textura'), 'acetinado');
});

test('finish material properties calibrate roughness and texture flags accurately', () => {
  const fosco = getFinishMaterialProps('fosco');
  const acetinado = getFinishMaterialProps('acetinado');
  const semibrilho = getFinishMaterialProps('semibrilho');
  const textura = getFinishMaterialProps('textura');

  assert.ok(fosco.roughness > acetinado.roughness);
  assert.ok(acetinado.roughness > semibrilho.roughness);
  assert.equal(textura.useTexturedMap, true);
  assert.ok(textura.bumpScale > fosco.bumpScale);
});

test('camera presets match each scene mode', () => {
  const resCams = getAvailableCameras('fachada-residencial');
  const comCams = getAvailableCameras('fachada-comercial');
  const intCams = getAvailableCameras('ambiente-interno');

  assert.equal(resCams.length, 3);
  assert.equal(comCams.length, 3);
  assert.equal(intCams.length, 3);
  assert.equal(resCams[0].label, 'Fachada Geral');
  assert.equal(comCams[0].label, 'Vitrine Geral');
  assert.equal(intCams[0].label, 'Ambiente');
});

test('night facade lighting activates sconces and lowers sun intensity', () => {
  const dayRig = getLightingRigConfig('fachada-residencial', 'manha');
  const nightRig = getLightingRigConfig('fachada-residencial', 'noturno');

  assert.equal(dayRig.sconceIntensity, 0);
  assert.ok(nightRig.sconceIntensity > 2);
  assert.ok(dayRig.sunIntensity > nightRig.sunIntensity);
});

test('WhatsApp simulator URL embeds selected facade colors and finish', () => {
  const url = buildSimulatorWhatsAppUrl({
    sceneMode: 'fachada-residencial',
    primaryColor: PAINT_COLORS[0],
    trimColor: TRIM_COLORS[0],
    finish: 'textura',
    lighting: 'manha',
  });

  const decoded = decodeURIComponent(url);
  assert.match(decoded, /Fachada Residencial 3D/);
  assert.match(decoded, /Azul Marinho Clássico/);
  assert.match(decoded, /Branco Neve/);
  assert.match(decoded, /Textura Projetada/);
});

test('quote form validation rejects invalid inputs and accepts valid data', () => {
  const invalid = validateQuoteForm({
    name: 'A',
    email: 'not-an-email',
    serviceType: 'Fachada / Área Externa',
    message: 'Oi',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.message);

  const valid = validateQuoteForm({
    name: 'Marcelo Oliveira',
    email: 'marcelo@exemplo.com',
    serviceType: 'Fachada / Área Externa',
    message: 'Pintura de fachada residencial de dois pavimentos em Laranjeiras.',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});
