import * as THREE from 'three';

export interface ProceduralTexturePack {
  smoothBumpMap: THREE.CanvasTexture;
  grafiatoBumpMap: THREE.CanvasTexture;
  woodAlbedoMap: THREE.CanvasTexture;
  woodBumpMap: THREE.CanvasTexture;
  concreteMap: THREE.CanvasTexture;
  grassMap: THREE.CanvasTexture;
  contactShadowMap: THREE.CanvasTexture;
  dispose: () => void;
}

function makeNoiseBump(
  size: number,
  drawFn: (ctx: CanvasRenderingContext2D, size: number) => void,
  repeatX: number,
  repeatY: number,
  anisotropy: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  drawFn(ctx, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = anisotropy;
  return texture;
}

function makeColorTexture(
  size: number,
  drawFn: (ctx: CanvasRenderingContext2D, size: number) => void,
  repeatX: number,
  repeatY: number,
  anisotropy: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  drawFn(ctx, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = anisotropy;
  return texture;
}

export function createProceduralTexturePack(maxAnisotropy: number): ProceduralTexturePack {
  const anisotropy = Math.max(1, Math.min(maxAnisotropy, 8));

  // Fine plaster / roller stipple bump map
  const smoothBumpMap = makeNoiseBump(
    256,
    (ctx, size) => {
      const img = ctx.createImageData(size, size);
      let seed = 1337;
      const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.floor(118 + rand() * 24);
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    },
    4,
    4,
    anisotropy,
  );

  // Exterior Grafiato / Textura Projetada bump map (vertical mineral grooves + aggregate)
  const grafiatoBumpMap = makeNoiseBump(
    256,
    (ctx, size) => {
      ctx.fillStyle = '#9c9c9c';
      ctx.fillRect(0, 0, size, size);
      let seed = 4242;
      const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };

      // Mineral stipple base
      for (let i = 0; i < 4200; i++) {
        const x = rand() * size;
        const y = rand() * size;
        const r = 0.8 + rand() * 1.8;
        const shade = Math.floor(110 + rand() * 110);
        ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
        ctx.fillRect(x, y, r, r);
      }

      // Vertical troweled grafiato scratches
      for (let i = 0; i < 160; i++) {
        const x = rand() * size;
        const y = rand() * size;
        const h = 14 + rand() * 44;
        const w = 1.2 + rand() * 1.6;
        ctx.fillStyle = rand() > 0.3 ? 'rgba(35,35,35,0.68)' : 'rgba(235,235,235,0.45)';
        ctx.fillRect(x, y, w, h);
        if (y + h > size) {
          ctx.fillRect(x, 0, w, y + h - size);
        }
      }
    },
    5,
    4,
    anisotropy,
  );

  // Warm cedar / freijó wood slats for soffits & pivot door
  const woodAlbedoMap = makeColorTexture(
    256,
    (ctx, size) => {
      ctx.fillStyle = '#9b673c';
      ctx.fillRect(0, 0, size, size);
      const slats = 8;
      const slatW = size / slats;
      let seed = 9001;
      const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
      for (let s = 0; s < slats; s++) {
        const x0 = s * slatW;
        const tone = Math.floor((rand() - 0.5) * 20);
        ctx.fillStyle = `rgb(${156 + tone}, ${103 + Math.floor(tone * 0.7)}, ${60 + Math.floor(tone * 0.5)})`;
        ctx.fillRect(x0 + 1, 0, slatW - 2, size);

        // Wood grain lines
        for (let g = 0; g < 18; g++) {
          const gx = x0 + 2 + rand() * (slatW - 4);
          ctx.fillStyle = rand() > 0.5 ? 'rgba(72,40,18,0.18)' : 'rgba(205,152,98,0.14)';
          ctx.fillRect(gx, 0, 1 + rand() * 1.2, size);
        }
        // Slat shadow seam
        ctx.fillStyle = '#4a2e19';
        ctx.fillRect(x0, 0, 2, size);
      }
    },
    2,
    2,
    anisotropy,
  );

  const woodBumpMap = makeNoiseBump(
    256,
    (ctx, size) => {
      ctx.fillStyle = '#909090';
      ctx.fillRect(0, 0, size, size);
      const slats = 8;
      const slatW = size / slats;
      for (let s = 0; s < slats; s++) {
        ctx.fillStyle = '#262626';
        ctx.fillRect(s * slatW, 0, 2, size);
      }
    },
    2,
    2,
    anisotropy,
  );

  // Concrete paving / driveway texture
  const concreteMap = makeColorTexture(
    256,
    (ctx, size) => {
      ctx.fillStyle = '#cfd4da';
      ctx.fillRect(0, 0, size, size);
      let seed = 777;
      const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
      for (let i = 0; i < 3200; i++) {
        const x = rand() * size;
        const y = rand() * size;
        const v = Math.floor(192 + rand() * 28);
        ctx.fillStyle = `rgb(${v},${v + 2},${v + 4})`;
        ctx.fillRect(x, y, 2, 2);
      }
      // Subtle expansion joints
      ctx.strokeStyle = 'rgba(130, 138, 148, 0.38)';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, size - 2, size - 2);
      ctx.beginPath();
      ctx.moveTo(size / 2, 0);
      ctx.lineTo(size / 2, size);
      ctx.moveTo(0, size / 2);
      ctx.lineTo(size, size / 2);
      ctx.stroke();
    },
    6,
    6,
    anisotropy,
  );

  // Landscaped lawn texture
  const grassMap = makeColorTexture(
    256,
    (ctx, size) => {
      ctx.fillStyle = '#5d7c4c';
      ctx.fillRect(0, 0, size, size);
      let seed = 5511;
      const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
      for (let i = 0; i < 3600; i++) {
        const x = rand() * size;
        const y = rand() * size;
        const g = Math.floor(105 + rand() * 40);
        ctx.fillStyle = `rgb(${Math.floor(g * 0.72)}, ${g}, ${Math.floor(g * 0.56)})`;
        ctx.fillRect(x, y, 2, 3);
      }
    },
    8,
    8,
    anisotropy,
  );

  // Soft radial contact shadow sprite
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const sCtx = shadowCanvas.getContext('2d')!;
  const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 124);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.48)');
  grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.18)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 256, 256);
  const contactShadowMap = new THREE.CanvasTexture(shadowCanvas);

  return {
    smoothBumpMap,
    grafiatoBumpMap,
    woodAlbedoMap,
    woodBumpMap,
    concreteMap,
    grassMap,
    contactShadowMap,
    dispose: () => {
      smoothBumpMap.dispose();
      grafiatoBumpMap.dispose();
      woodAlbedoMap.dispose();
      woodBumpMap.dispose();
      concreteMap.dispose();
      grassMap.dispose();
      contactShadowMap.dispose();
    },
  };
}
