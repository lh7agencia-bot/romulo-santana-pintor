import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Sun,
  Moon,
  Sunset,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  FinishId,
  LightingId,
  LIGHTING_OPTIONS,
  PAINT_COLORS,
  PaintColorOption,
  PaintTarget,
  SCENE_MODES,
  SceneModeId,
  TRIM_COLORS,
} from '../data/siteData';
import {
  buildSimulatorWhatsAppUrl,
  coerceFinishForScene,
  getAvailableCameras,
  getAvailableFinishes,
  getFinishMaterialProps,
  getLightingRigConfig,
} from '../utils/simulatorLogic';
import { createProceduralTexturePack, ProceduralTexturePack } from '../three/proceduralTextures';
import {
  BuiltSceneResult,
  SceneSharedMaterials,
  buildCommercialFacadeScene,
  buildInteriorRoomScene,
  buildResidentialFacadeScene,
} from '../three/facadeBuilders';

interface PaintSimulator3DProps {
  selectedSceneFromExternal?: SceneModeId;
}

const _camPosTarget = new THREE.Vector3();
const _orbitTarget = new THREE.Vector3();

function detectSoftwareGl(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function PaintSimulator3D({ selectedSceneFromExternal }: PaintSimulator3DProps) {
  const [sceneMode, setSceneMode] = useState<SceneModeId>('fachada-residencial');
  const [paintTarget, setPaintTarget] = useState<PaintTarget>('primary');
  const [primaryColor, setPrimaryColor] = useState<PaintColorOption>(PAINT_COLORS[3]); // Areia Mineral default on facade
  const [trimColor, setTrimColor] = useState<PaintColorOption>(TRIM_COLORS[0]); // Branco Neve
  const [finish, setFinish] = useState<FinishId>('acetinado');
  const [lighting, setLighting] = useState<LightingId>('manha');
  const [cameraPresetId, setCameraPresetId] = useState<string>('geral');
  const [controlsOpen, setControlsOpen] = useState<boolean>(true);
  const [webglError, setWebglError] = useState<boolean>(false);
  const [sceneReady, setSceneReady] = useState<boolean>(false);

  const mountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    textures: ProceduralTexturePack;
    sharedMats: SceneSharedMaterials;
    dirLight: THREE.DirectionalLight;
    hemiLight: THREE.HemisphereLight;
    rimLight: THREE.DirectionalLight;
    currentBuilt: BuiltSceneResult | null;
    isTransitioning: boolean;
    desiredCamPos: THREE.Vector3;
    desiredTarget: THREE.Vector3;
    isSoftwareGl: boolean;
    requestRender: () => void;
  } | null>(null);

  useEffect(() => {
    if (selectedSceneFromExternal) {
      setSceneMode(selectedSceneFromExternal);
    }
  }, [selectedSceneFromExternal]);

  const isFacade = sceneMode !== 'ambiente-interno';
  const availableFinishes = getAvailableFinishes(sceneMode);
  const availableCameras = getAvailableCameras(sceneMode);
  const activeFinishObj = availableFinishes.find((f) => f.id === finish) ?? availableFinishes[0];
  const activePalette = isFacade && paintTarget === 'trim' ? TRIM_COLORS : PAINT_COLORS;
  const activeSelectedSwatch = isFacade && paintTarget === 'trim' ? trimColor : primaryColor;
  const whatsappUrl = buildSimulatorWhatsAppUrl({
    sceneMode,
    primaryColor,
    trimColor,
    finish,
    lighting,
  });

  // Mount Three.js WebGLRenderer once
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return;
    }

    const width = container.clientWidth || 960;
    const height = container.clientHeight || 560;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };
    const onContextRestored = () => {
      setWebglError(false);
      requestRender();
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#DCE9F7');
    scene.fog = new THREE.Fog('#DCE9F7', 22, 52);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(9.0, 4.3, 12.8);

    // Mandatory studio environment map via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    const textures = createProceduralTexturePack(renderer.capabilities.getMaxAnisotropy());

    const sharedMats: SceneSharedMaterials = {
      primaryWall: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(PAINT_COLORS[3].hex),
        roughness: 0.52,
        metalness: 0.04,
        clearcoat: 0.2,
        clearcoatRoughness: 0.45,
        envMapIntensity: 0.35,
        bumpMap: textures.smoothBumpMap,
        bumpScale: 0.008,
      }),
      trimDetail: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(TRIM_COLORS[0].hex),
        roughness: 0.48,
        metalness: 0.04,
        clearcoat: 0.18,
        clearcoatRoughness: 0.5,
        envMapIntensity: 0.35,
        bumpMap: textures.smoothBumpMap,
        bumpScale: 0.006,
      }),
      sconceEmissive: new THREE.MeshStandardMaterial({
        color: 0xffe4b8,
        emissive: new THREE.Color(0xffc778),
        emissiveIntensity: 0.1,
        roughness: 0.3,
      }),
      interiorGlow: new THREE.MeshStandardMaterial({
        color: 0xf4ead8,
        emissive: new THREE.Color(0xffdfa8),
        emissiveIntensity: 0.35,
        roughness: 0.85,
      }),
    };

    // 3-point warm/cool lighting rig
    const hemiLight = new THREE.HemisphereLight('#CFE4FF', '#8B857C', 0.9);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight('#FFF9EC', 2.35);
    dirLight.position.set(10, 14, 9);
    dirLight.castShadow = !isSoftwareGl;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 42;
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.top = 10;
    dirLight.shadow.camera.bottom = -10;
    dirLight.shadow.bias = -0.0005;
    dirLight.shadow.normalBias = 0.02;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight('#D9E6FF', 0.45);
    rimLight.position.set(-10, 8, -10);
    scene.add(rimLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.zoomSpeed = 1.05;
    controls.rotateSpeed = 0.9;
    controls.minDistance = 2.0;
    controls.maxDistance = 24;
    controls.minPolarAngle = 0.02;
    controls.maxPolarAngle = Math.PI - 0.12;
    controls.target.set(0, 1.75, 0.4);
    controls.update();

    let frameId = 0;
    let timeoutId = 0;
    let disposed = false;
    let renderBusy = false;
    let renderDirty = false;
    let lastTime = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            timeoutId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            timeoutId = window.setTimeout(cb, 10);
          }
        };
        timeoutId = window.setTimeout(poll, 5);
      } else {
        timeoutId = window.setTimeout(cb, 16);
      }
    }

    function requestRender() {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame((now) => {
        if (disposed) return;
        const delta = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;
        renderDirty = false;

        const engine = engineRef.current;
        let keepAnimating = false;

        if (engine && engine.isTransitioning) {
          if (engine.isSoftwareGl) {
            camera.position.copy(engine.desiredCamPos);
            controls.target.copy(engine.desiredTarget);
            engine.isTransitioning = false;
          } else {
            const lambda = 7.5;
            camera.position.x = THREE.MathUtils.damp(camera.position.x, engine.desiredCamPos.x, lambda, delta);
            camera.position.y = THREE.MathUtils.damp(camera.position.y, engine.desiredCamPos.y, lambda, delta);
            camera.position.z = THREE.MathUtils.damp(camera.position.z, engine.desiredCamPos.z, lambda, delta);
            controls.target.x = THREE.MathUtils.damp(controls.target.x, engine.desiredTarget.x, lambda, delta);
            controls.target.y = THREE.MathUtils.damp(controls.target.y, engine.desiredTarget.y, lambda, delta);
            controls.target.z = THREE.MathUtils.damp(controls.target.z, engine.desiredTarget.z, lambda, delta);

            const posDist = camera.position.distanceTo(engine.desiredCamPos);
            const tgtDist = controls.target.distanceTo(engine.desiredTarget);
            if (posDist < 0.03 && tgtDist < 0.03) {
              camera.position.copy(engine.desiredCamPos);
              controls.target.copy(engine.desiredTarget);
              engine.isTransitioning = false;
            } else {
              keepAnimating = true;
            }
          }
        }

        controls.update();
        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (renderDirty || keepAnimating) {
            requestRender();
          }
        };

        if (isSoftwareGl) {
          afterDraw(done);
        } else {
          done();
        }
      });
    }

    const onControlsStart = () => {
      if (engineRef.current) {
        engineRef.current.isTransitioning = false;
      }
    };
    const onControlsChange = () => {
      requestRender();
    };
    controls.addEventListener('start', onControlsStart);
    controls.addEventListener('change', onControlsChange);

    engineRef.current = {
      scene,
      camera,
      renderer,
      controls,
      textures,
      sharedMats,
      dirLight,
      hemiLight,
      rimLight,
      currentBuilt: null,
      isTransitioning: false,
      desiredCamPos: new THREE.Vector3(8.8, 4.4, 11.4),
      desiredTarget: new THREE.Vector3(0, 2.3, 0),
      isSoftwareGl,
      requestRender,
    };

    const handleResize = () => {
      if (!container || disposed) return;
      const w = container.clientWidth || 960;
      const h = container.clientHeight || 560;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', onControlsStart);
      controls.removeEventListener('change', onControlsChange);
      controls.dispose();
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);

      if (engineRef.current?.currentBuilt) {
        scene.remove(engineRef.current.currentBuilt.root);
        engineRef.current.currentBuilt.dispose();
      }

      sharedMats.primaryWall.dispose();
      sharedMats.trimDetail.dispose();
      sharedMats.sconceEmissive.dispose();
      sharedMats.interiorGlow.dispose();
      textures.dispose();
      envTexture.dispose();
      renderer.dispose();
      if (canvas.parentElement === container) {
        container.removeChild(canvas);
      }
      engineRef.current = null;
    };
  }, []);

  // Swap 3D scene architecture when sceneMode changes
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    if (engine.currentBuilt) {
      engine.scene.remove(engine.currentBuilt.root);
      engine.currentBuilt.dispose();
      engine.currentBuilt = null;
    }

    let built: BuiltSceneResult;
    if (sceneMode === 'fachada-residencial') {
      built = buildResidentialFacadeScene(engine.sharedMats, engine.textures, engine.isSoftwareGl);
    } else if (sceneMode === 'fachada-comercial') {
      built = buildCommercialFacadeScene(engine.sharedMats, engine.textures, engine.isSoftwareGl);
    } else {
      built = buildInteriorRoomScene(engine.sharedMats, engine.textures);
    }

    engine.scene.add(built.root);
    engine.currentBuilt = built;

    // Reset camera to default preset for this scene
    const presets = getAvailableCameras(sceneMode);
    const defaultCam = presets[0];
    setCameraPresetId(defaultCam.id);
    _camPosTarget.set(...defaultCam.position);
    _orbitTarget.set(...defaultCam.target);
    engine.camera.position.copy(_camPosTarget);
    engine.controls.target.copy(_orbitTarget);
    engine.desiredCamPos.copy(_camPosTarget);
    engine.desiredTarget.copy(_orbitTarget);
    engine.isTransitioning = false;
    engine.controls.update();

    if (!engine.isSoftwareGl) {
      engine.renderer.compile(engine.scene, engine.camera);
    }
    setSceneReady(true);
    engine.requestRender();
  }, [sceneMode]);

  // Sync colors, finish, and lighting into Three.js materials and lights
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const finishProps = getFinishMaterialProps(finish);
    engine.sharedMats.primaryWall.color.set(primaryColor.hex);
    engine.sharedMats.primaryWall.roughness = finishProps.roughness;
    engine.sharedMats.primaryWall.metalness = finishProps.metalness;
    engine.sharedMats.primaryWall.clearcoat = finishProps.clearcoat;
    engine.sharedMats.primaryWall.clearcoatRoughness = finishProps.clearcoatRoughness;
    engine.sharedMats.primaryWall.bumpMap = finishProps.useTexturedMap
      ? engine.textures.grafiatoBumpMap
      : engine.textures.smoothBumpMap;
    engine.sharedMats.primaryWall.bumpScale = finishProps.bumpScale;
    engine.sharedMats.primaryWall.needsUpdate = true;

    engine.sharedMats.trimDetail.color.set(trimColor.hex);
    engine.sharedMats.trimDetail.roughness = Math.min(finishProps.roughness, 0.72);
    engine.sharedMats.trimDetail.needsUpdate = true;

    const rig = getLightingRigConfig(sceneMode, lighting);
    engine.scene.background = new THREE.Color(rig.skyHex);
    engine.scene.fog = new THREE.Fog(rig.fogHex, 22, 52);
    engine.dirLight.color.set(rig.sunColor);
    engine.dirLight.intensity = rig.sunIntensity;
    engine.dirLight.position.set(...rig.sunPosition);
    engine.hemiLight.color.set(rig.hemiSky);
    engine.hemiLight.groundColor.set(rig.hemiGround);
    engine.hemiLight.intensity = rig.hemiIntensity;
    engine.rimLight.intensity = rig.rimIntensity;
    engine.renderer.toneMappingExposure = rig.toneMappingExposure;

    engine.sharedMats.sconceEmissive.emissiveIntensity = rig.sconceIntensity > 0 ? 1.8 : 0.1;
    engine.sharedMats.interiorGlow.emissiveIntensity = rig.interiorGlowIntensity;

    if (engine.currentBuilt) {
      for (const light of engine.currentBuilt.sconceLights) {
        light.intensity = rig.sconceIntensity;
      }
    }

    engine.requestRender();
  }, [sceneMode, primaryColor, trimColor, finish, lighting]);

  // Keyboard shortcut H to toggle bottom controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (e.key.toLowerCase() === 'h') {
        setControlsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSceneModeChange = (nextMode: SceneModeId) => {
    setSceneMode(nextMode);
    setFinish((prev) => coerceFinishForScene(nextMode, prev));
    if (nextMode === 'ambiente-interno') {
      setPaintTarget('primary');
    }
  };

  const handleCameraPreset = (presetId: string) => {
    const preset = availableCameras.find((c) => c.id === presetId);
    const engine = engineRef.current;
    if (!preset || !engine) return;
    setCameraPresetId(preset.id);
    engine.desiredCamPos.set(...preset.position);
    engine.desiredTarget.set(...preset.target);
    engine.isTransitioning = true;
    engine.requestRender();
  };

  const handleSelectColor = (color: PaintColorOption) => {
    if (isFacade && paintTarget === 'trim') {
      setTrimColor(color);
    } else {
      setPrimaryColor(color);
    }
  };

  const handleZoomStep = (factor: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    const offset = _camPosTarget.copy(engine.camera.position).sub(engine.controls.target);
    const currentDist = offset.length();
    const nextDist = THREE.MathUtils.clamp(currentDist * factor, 2.0, 24);
    offset.normalize().multiplyScalar(nextDist);
    engine.desiredCamPos.copy(engine.controls.target).add(offset);
    engine.desiredTarget.copy(engine.controls.target);
    engine.isTransitioning = true;
    engine.requestRender();
  };

  const activeSceneLabel =
    SCENE_MODES.find((m) => m.id === sceneMode)?.label ?? 'Fachada Residencial';

  return (
    <section id="simulador-3d" className="scroll-mt-20 bg-white py-20 lg:py-24 border-y border-slate-200/80">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[#0B3D91] mb-2">
              Simulador Interativo 3D · Fachadas e Interiores
            </p>
            <h2 className="headline-balance text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
              Visualize Cores e Texturas na Fachada 3D
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Alterne entre fachada residencial, fachada comercial e ambiente interno. Teste cores de parede e molduras, compare texturas externas e observe a pintura sob luz do dia, fim de tarde ou iluminação noturna.
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
            <div
              role="group"
              aria-label="Selecionar modelo 3D"
              className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200"
            >
              {SCENE_MODES.map((mode) => {
                const active = sceneMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => handleSceneModeChange(mode.id)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-[#0B3D91] text-white shadow-sm'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
                    }`}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>

            <div className="text-xs font-medium text-slate-600 flex items-center gap-2">
              <span className="font-semibold text-slate-900">{primaryColor.name}</span>
              {isFacade && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Detalhes: {trimColor.name}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span>Acabamento {activeFinishObj.label}</span>
            </div>
          </div>
        </div>

        {/* 3D Viewport Frame */}
        <div
          data-testid="simulator-3d-viewport"
          data-webgl-ready={sceneReady ? 'true' : 'false'}
          data-scene-mode={sceneMode}
          data-primary-color={primaryColor.id}
          data-trim-color={trimColor.id}
          data-finish={finish}
          data-lighting={lighting}
          data-camera-preset={cameraPresetId}
          className="relative h-[560px] sm:h-[590px] lg:h-[620px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm"
        >
          {webglError ? (
            <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 p-8 text-center">
              <p className="text-base font-semibold text-slate-900">
                Visualizador 3D indisponível neste dispositivo
              </p>
              <p className="mt-2 max-w-md text-sm text-slate-600">
                Seu navegador desativou a aceleração WebGL. Você ainda pode solicitar uma simulação de cores diretamente pelo WhatsApp.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0B3D91] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#093277]"
              >
                <MessageCircle className="h-4 w-4" />
                Solicitar Simulação no WhatsApp
              </a>
            </div>
          ) : (
            <div ref={mountRef} className="h-full w-full cursor-grab active:cursor-grabbing" />
          )}

          {/* Top Bar Overlays (flex row prevents mobile collision between spec card and zoom/reset controls) */}
          <div className="pointer-events-none absolute inset-x-3 sm:inset-x-4 top-3 sm:top-4 z-10 flex items-start justify-between gap-2.5">
            <div className="min-w-0 max-w-sm rounded-xl bg-slate-900/90 px-3.5 py-2.5 text-white border border-white/10 shadow-md">
              <div className="flex items-center gap-2">
                <span
                  className="h-3.5 w-3.5 rounded-sm border border-white/40 shrink-0"
                  style={{ backgroundColor: primaryColor.hex }}
                  aria-hidden="true"
                />
                <p className="text-xs sm:text-sm font-semibold leading-tight truncate">
                  {activeSceneLabel} · {primaryColor.name}
                </p>
              </div>
              <p className="mt-1 text-[11px] sm:text-xs text-slate-300 leading-snug line-clamp-2">
                {activeFinishObj.description}
                {isFacade ? ` · Molduras em ${trimColor.name}` : ''}
              </p>
            </div>

            <div className="pointer-events-auto flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleZoomStep(0.8)}
                aria-label="Aproximar zoom 3D"
                title="Aproximar zoom"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-slate-800 border border-slate-200 shadow-sm hover:bg-white transition-colors cursor-pointer"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleZoomStep(1.25)}
                aria-label="Afastar zoom 3D"
                title="Afastar zoom"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-slate-800 border border-slate-200 shadow-sm hover:bg-white transition-colors cursor-pointer"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleCameraPreset(availableCameras[0].id)}
                aria-label="Resetar posição da câmera 3D"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/95 px-2.5 sm:px-3 text-xs font-semibold text-slate-800 border border-slate-200 shadow-sm hover:bg-white transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Centralizar</span>
              </button>
            </div>
          </div>

          {/* Collapsible Bottom Control Dock */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 z-10 w-[min(940px,calc(100%-1.25rem))] -translate-x-1/2 flex flex-col items-center">
            <button
              type="button"
              aria-expanded={controlsOpen}
              aria-label={controlsOpen ? 'Ocultar controles 3D' : 'Mostrar controles 3D'}
              onClick={() => setControlsOpen((v) => !v)}
              className="mb-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-900/95 px-3.5 py-1.5 text-xs font-semibold text-white border border-white/15 shadow-sm hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {controlsOpen ? (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Ocultar Controles
                </>
              ) : (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Mostrar Controles
                </>
              )}
            </button>

            {controlsOpen && (
              <div className="w-full max-h-[220px] sm:max-h-none overflow-y-auto rounded-xl bg-white/95 border border-slate-200/90 shadow-lg p-2.5 sm:p-3.5 text-slate-900">
                <div className="flex flex-col gap-2.5">
                  {/* Row 1: Target Switch (for Facade) + Color Swatches + Finish */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {isFacade ? (
                        <div
                          role="group"
                          aria-label="Área para pintar"
                          className="inline-flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200 mr-1"
                        >
                          <button
                            type="button"
                            aria-pressed={paintTarget === 'primary'}
                            onClick={() => setPaintTarget('primary')}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                              paintTarget === 'primary'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Parede
                          </button>
                          <button
                            type="button"
                            aria-pressed={paintTarget === 'trim'}
                            onClick={() => setPaintTarget('trim')}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                              paintTarget === 'trim'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Moldura
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-600 mr-1">Cor:</span>
                      )}

                      <div className="flex flex-wrap items-center gap-1.5">
                        {activePalette.map((color) => {
                          const isSelected = activeSelectedSwatch.id === color.id;
                          return (
                            <button
                              key={color.id}
                              type="button"
                              aria-label={`Selecionar cor ${color.name}`}
                              aria-pressed={isSelected}
                              title={color.name}
                              onClick={() => handleSelectColor(color)}
                              className={`h-7 w-7 rounded-full border transition-transform cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B3D91] ${
                                isSelected
                                  ? 'ring-2 ring-[#0B3D91] ring-offset-2 border-slate-900 scale-105'
                                  : 'border-slate-300 hover:scale-105'
                              }`}
                              style={{ backgroundColor: color.hex }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Finish Selector */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-600">Acabamento:</span>
                      <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                        {availableFinishes.map((opt) => {
                          const active = finish === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              aria-pressed={active}
                              onClick={() => setFinish(opt.id)}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                active
                                  ? 'bg-slate-900 text-white'
                                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Lighting (for Facades) + Camera Presets + Quote CTA */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-200/80">
                    <div className="flex flex-wrap items-center gap-2">
                      {isFacade && (
                        <div
                          role="group"
                          aria-label="Iluminação da fachada"
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 border border-slate-200"
                        >
                          {LIGHTING_OPTIONS.map((opt) => {
                            const active = lighting === opt.id;
                            const Icon =
                              opt.id === 'manha' ? Sun : opt.id === 'entardecer' ? Sunset : Moon;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                aria-pressed={active}
                                onClick={() => setLighting(opt.id)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                  active
                                    ? 'bg-white text-[#0B3D91] shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <Icon className="h-3.5 w-3.5" />
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <div
                        role="group"
                        aria-label="Ângulos de câmera"
                        className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-0.5 border border-slate-200"
                      >
                        {availableCameras.map((cam) => {
                          const active = cameraPresetId === cam.id;
                          return (
                            <button
                              key={cam.id}
                              type="button"
                              aria-pressed={active}
                              onClick={() => handleCameraPreset(cam.id)}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                active
                                  ? 'bg-white text-slate-900 shadow-sm'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {cam.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B3D91] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#093277] transition-colors whitespace-nowrap shrink-0"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Orçar cor
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default PaintSimulator3D;

