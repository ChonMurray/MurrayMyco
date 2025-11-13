"use client";

import { useEffect, useRef, useState } from "react";
import BackgroundMycelium2D from "./BackgroundMycelium2D";
import { useMyceliumSettings } from "@/state/useMyceliumSettings";

export default function BackgroundMyceliumGPU() {
  const {
    opacity,
    walkers,
    stepsPerFrame,
    devicePixelRatioCap,
    gridAlign,
    workgroupSize,
    ringOuterMinPx,
    ringOuterFrac,
    ringInnerMinPx,
    ringInnerFrac,
    respawnMarginMinPx,
    respawnMarginFrac,
    ringRefreshInterval,
    torusEdgePadPx,
  } = useMyceliumSettings();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fail = (m: string): never => {
      throw new Error(`[DLA-GPU-FAIL] ${m}`);
    };

    let dispose: null | (() => void) = null;

    const start = async (canvas: HTMLCanvasElement) => {
      if (!("gpu" in navigator)) {
        return;
      }
      const nav = navigator as Navigator & { gpu: GPU };
      const adapter = await nav.gpu.requestAdapter();
      if (!adapter) fail("No GPU adapter");
      const device: GPUDevice = await (adapter as GPUAdapter).requestDevice();

      type WebGPUCanvas = HTMLCanvasElement & { getContext(contextId: "webgpu"): GPUCanvasContext | null };
      const context = (canvas as WebGPUCanvas).getContext("webgpu");
      if (!context) fail("WebGPU context unavailable");
      console.info("[DLA] Using WebGPU background");

      const presentationFormat = nav.gpu.getPreferredCanvasFormat();
      const gpuCtx = context as GPUCanvasContext;
      gpuCtx.configure({ device, format: presentationFormat, alphaMode: "premultiplied" });

      // Determine device pixel grid size (rectangular), aligned to 32 for GPU-friendly tiling
      const roundUp = (v: number, m: number) => Math.max(m, Math.ceil(v / m) * m);
      const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), devicePixelRatioCap);
      const gridW = roundUp(window.innerWidth * dpr, gridAlign);
      const gridH = roundUp(window.innerHeight * dpr, gridAlign);

      // Create occupancy ping-pong textures
      const makeOcc = () => device.createTexture({
        size: { width: gridW, height: gridH },
        format: "rgba8unorm",
        usage:
          GPUTextureUsage.STORAGE_BINDING |
          GPUTextureUsage.TEXTURE_BINDING |
          GPUTextureUsage.COPY_SRC |
          GPUTextureUsage.COPY_DST |
          GPUTextureUsage.RENDER_ATTACHMENT,
      });
      let occA = makeOcc();
      let occB = makeOcc();
      // Clear occA to black and seed a center pixel alpha=1
      {
        const encoder = device.createCommandEncoder();
        const view = occA.createView();
        const pass = encoder.beginRenderPass({
          colorAttachments: [{ view, loadOp: "clear", clearValue: { r: 0, g: 0, b: 0, a: 0 }, storeOp: "store" }],
        });
        pass.end();
        device.queue.submit([encoder.finish()]);
        // Seed center pixel alpha channel to 1
        const seed = new Uint8Array([0, 0, 0, 255]);
        const cx = Math.floor(gridW / 2);
        const cy = Math.floor(gridH / 2);
        device.queue.writeTexture(
          { texture: occA, origin: { x: cx, y: cy } },
          seed,
          { bytesPerRow: 4, rowsPerImage: 1 },
          { width: 1, height: 1 }
        );
      }

      // Walkers buffer (packed 16-bit x|y in u32 to halve bandwidth)
      if (gridW > 0xffff || gridH > 0xffff) fail("grid dimensions must be <= 65535 for packed walkers");
      const walkerData = new Uint32Array(walkers);
      for (let i = 0; i < walkers; i++) {
        const x = Math.floor(Math.random() * gridW) & 0xffff;
        const y = Math.floor(Math.random() * gridH) & 0xffff;
        walkerData[i] = (y << 16) | x;
      }
      const walkersBuf = device.createBuffer({
        size: walkerData.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
        mappedAtCreation: true,
      });
      new Uint32Array(walkersBuf.getMappedRange()).set(walkerData);
      walkersBuf.unmap();

      // Uniforms: gridW, gridH, walkers, frame, stepsPerDispatch, padding (8x u32 = 32 bytes)
      const uniformBuf = device.createBuffer({ size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });

      // Globals: atomic radius^2 tracker
      const radiusBuf = device.createBuffer({ size: 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC, mappedAtCreation: true });
      new Uint32Array(radiusBuf.getMappedRange()).set(new Uint32Array([1]));
      radiusBuf.unmap();

      // RNG state buffer per walker (avoid expensive hashing)
      const rngInit = new Uint32Array(walkers);
      for (let i = 0; i < walkers; i++) {
        // simple seeding; different from walkerData
        rngInit[i] = (Math.imul(i + 1, 1664525) ^ (Math.random() * 0x7fffffff)) >>> 0;
      }
      const rngBuf = device.createBuffer({
        size: rngInit.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
        mappedAtCreation: true,
      });
      new Uint32Array(rngBuf.getMappedRange()).set(rngInit);
      rngBuf.unmap();

      // Sampler for display
      const sampler = device.createSampler({ magFilter: "nearest", minFilter: "nearest" });

      // UI color uniform (vec4<f32>) from CSS variable --fg-primary
      const colorBuf = device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
      const parseCssColor = (css: string): [number, number, number, number] => {
        const s = css.trim();
        if (s.startsWith('#')) {
          const v = s.slice(1);
          const r = parseInt(v.slice(0, 2), 16);
          const g = parseInt(v.slice(2, 4), 16);
          const b = parseInt(v.slice(4, 6), 16);
          return [r / 255, g / 255, b / 255, 1];
        }
        const m = s.match(/rgba?\(([^)]+)\)/i);
        if (m) {
          const parts = m[1].split(',').map((p) => parseFloat(p.trim()));
          const [r, g, b, a] = [parts[0] / 255, parts[1] / 255, parts[2] / 255, (parts[3] ?? 1)];
          return [r, g, b, a];
        }
        return [1, 1, 1, 1];
      };
      const cssColor = getComputedStyle(document.documentElement).getPropertyValue('--fg-primary');
      if (!cssColor || cssColor.trim() === '') fail("Missing CSS var --fg-primary");
      const [cr, cg, cb, ca] = parseCssColor(cssColor);
      device.queue.writeBuffer(colorBuf, 0, new Float32Array([cr, cg, cb, ca]));

      // Compute shader WGSL
      const computeWGSL = /* wgsl */ `
        struct Params { gridW: u32, gridH: u32, walkers: u32, frame: u32, steps: u32, _pad0: u32, _pad1: u32, _pad2: u32 };
        // Packed walker coords: low 16 bits = x, high 16 bits = y
        @group(0) @binding(0) var<storage, read_write> walkersBuf : array<u32>;
        @group(0) @binding(1) var occWrite : texture_storage_2d<rgba8unorm, write>;
        @group(0) @binding(2) var occRead : texture_2d<f32>;
        @group(0) @binding(3) var<uniform> params : Params;
        struct Globals { radiusSqr: atomic<u32> };
        @group(0) @binding(4) var<storage, read_write> globals : Globals;
        @group(0) @binding(5) var<storage, read_write> rngBuf : array<u32>;

        fn lcg_next(x: u32) -> u32 { return x * 1664525u + 1013904223u; }
        fn wrap_delta(d: i32, size: i32) -> i32 {
          var dd = d % size;
          if (dd < 0) { dd = dd + size; }
          let half = size / 2;
          if (dd > half) { dd = dd - size; }
          return dd;
        }

        @compute @workgroup_size(${workgroupSize})
        fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
          let idx = gid.x;
          if (idx >= params.walkers) { return; }
          let packed = walkersBuf[idx];
          var pos = vec2<u32>(packed & 0xFFFFu, packed >> 16);
          var rng = rngBuf[idx];
          let gw = i32(params.gridW);
          let gh = i32(params.gridH);
          let cx = gw / 2;
          let cy = gh / 2;

          // Cache frontier and define ring using toroidal distance (rectangular wrap)
          let cachedR2 = atomicLoad(&globals.radiusSqr);
          var baseR = sqrt(max(1.0, f32(cachedR2)));
          let gwf = f32(gw);
          let ghf = f32(gh);
          let minDim = min(gwf, ghf);
          let torusMaxR = 0.5 * sqrt(gwf * gwf + ghf * ghf) - f32(${torusEdgePadPx});
          var ringOut = max(f32(${ringOuterMinPx}), f32(${ringOuterFrac}) * minDim);
          var ringIn  = max(f32(${ringInnerMinPx}),  f32(${ringInnerFrac})  * minDim);
          var maxR = min(torusMaxR, baseR + ringOut);
          var minR = max(1.0, baseR - ringIn);
          var maxR2 = maxR * maxR;
          var minR2 = minR * minR;

          for (var s: u32 = 0u; s < params.steps; s = s + 1u) {
            // Periodically refresh ring from latest frontier radius
            if ((s & ${ringRefreshInterval}u) == 0u) {
              let r2now = atomicLoad(&globals.radiusSqr);
              baseR = sqrt(max(1.0, f32(r2now)));
              maxR = min(torusMaxR, baseR + ringOut);
              minR = max(1.0, baseR - ringIn);
              maxR2 = maxR * maxR;
              minR2 = minR * minR;
            }
            var dx0f = f32(wrap_delta(i32(pos.x) - cx, gw));
            var dy0f = f32(wrap_delta(i32(pos.y) - cy, gh));
            var r0_2 = dx0f*dx0f + dy0f*dy0f;
            if (r0_2 > maxR2 || r0_2 < minR2) {
              // respawn directly on ring to avoid wasted steps
              rng = lcg_next(rng);
              let angleBits = (rng >> 8) & 0x00FFFFFFu;
              let angle = f32(angleBits) * (6.28318530718 / 16777216.0);
              rng = lcg_next(rng);
              let jitter = (f32(rng & 0xFFFFu) / 65536.0) * ringIn;
              let R = clamp(baseR + jitter, 1.0, torusMaxR);
              let nx = i32(round(f32(cx) + R * cos(angle)));
              let ny = i32(round(f32(cy) + R * sin(angle)));
              pos.x = u32((nx % gw + gw) % gw);
              pos.y = u32((ny % gh + gh) % gh);
            }
            rng = lcg_next(rng);
            let dir = rng & 3u;
            switch dir {
              case 0u: { pos.x = (pos.x + 1u) % params.gridW; }
              case 1u: { pos.x = (pos.x + params.gridW - 1u) % params.gridW; }
              case 2u: { pos.y = (pos.y + 1u) % params.gridH; }
              default: { pos.y = (pos.y + params.gridH - 1u) % params.gridH; }
            }
            // 4-neighborhood check in occRead
            let gx = i32(pos.x);
            let gy = i32(pos.y);
            let l = (gx + gw - 1) % gw;
            let r = (gx + 1) % gw;
            let u = (gy + gh - 1) % gh;
            let d = (gy + 1) % gh;
            let near =
              textureLoad(occRead, vec2<i32>(l, gy), 0).a > 0.0 ||
              textureLoad(occRead, vec2<i32>(r, gy), 0).a > 0.0 ||
              textureLoad(occRead, vec2<i32>(gx, u), 0).a > 0.0 ||
              textureLoad(occRead, vec2<i32>(gx, d), 0).a > 0.0;
            if (near) {
              textureStore(occWrite, vec2<i32>(gx, gy), vec4<f32>(0.0, 0.0, 0.0, 1.0));
              // update radius^2 atomically using toroidal (wrapped) distance
              var dx = wrap_delta(gx - cx, gw);
              var dy = wrap_delta(gy - cy, gh);
              let rs = u32(dx * dx + dy * dy);
              atomicMax(&globals.radiusSqr, rs);
              // respawn
              rng = lcg_next(rng);
              let angleBits = (rng >> 8) & 0x00FFFFFFu;
              let angle = f32(angleBits) * (6.28318530718 / 16777216.0);
              let currR2 = atomicLoad(&globals.radiusSqr);
              let baseR_now = sqrt(f32(currR2));
              let margin = max(f32(${respawnMarginMinPx}), f32(${respawnMarginFrac}) * minDim);
              rng = lcg_next(rng);
              let jitterBits = (rng >> 4) & 0x0000FFFFu;
              let jitter = f32(jitterBits) * (margin / 65536.0);
              let R = min(torusMaxR, baseR_now + margin + jitter);
              let nx = i32(round(f32(cx) + R * cos(angle)));
              let ny = i32(round(f32(cy) + R * sin(angle)));
              pos.x = u32((nx % gw + gw) % gw);
              pos.y = u32((ny % gh + gh) % gh);
            }
          }

          walkersBuf[idx] = ((pos.y & 0xFFFFu) << 16) | (pos.x & 0xFFFFu);
          rngBuf[idx] = rng;
        }
      `;

      const computeModule = device.createShaderModule({ code: computeWGSL });
      const computePipeline = device.createComputePipeline({
        layout: "auto",
        compute: { module: computeModule, entryPoint: "main" },
      });

      // Render pipeline to display occ texture
      const renderWGSL = /* wgsl */ `
        @group(0) @binding(0) var tex : texture_2d<f32>;
        @group(0) @binding(1) var samp : sampler;
        @group(0) @binding(2) var<uniform> color : vec4<f32>;
        struct VSOut { @builtin(position) pos: vec4<f32>, @location(0) uv: vec2<f32> };
        @vertex fn vs(@builtin(vertex_index) vid: u32) -> VSOut {
          var pos = array<vec2<f32>, 6>(
            vec2<f32>(-1.0, -1.0), vec2<f32>( 1.0, -1.0), vec2<f32>(-1.0,  1.0),
            vec2<f32>(-1.0,  1.0), vec2<f32>( 1.0, -1.0), vec2<f32>( 1.0,  1.0));
          var uv  = array<vec2<f32>, 6>(
            vec2<f32>(0.0, 1.0), vec2<f32>(1.0, 1.0), vec2<f32>(0.0, 0.0),
            vec2<f32>(0.0, 0.0), vec2<f32>(1.0, 1.0), vec2<f32>(1.0, 0.0));
          var out: VSOut;
          out.pos = vec4<f32>(pos[vid], 0.0, 1.0);
          out.uv = uv[vid];
          return out;
        }
        @fragment fn fs(in: VSOut) -> @location(0) vec4<f32> {
          let a = textureSample(tex, samp, in.uv).a;
          if (a < 0.01) { discard; }
          // premultiplied alpha output using the site's foreground color
          return vec4<f32>(color.rgb * a, a);
        }
      `;
      const renderModule = device.createShaderModule({ code: renderWGSL });
      const renderPipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: { module: renderModule, entryPoint: "vs" },
        fragment: { module: renderModule, entryPoint: "fs", targets: [{ format: presentationFormat }] },
        primitive: { topology: "triangle-list" },
      });

      // Bind groups (will be updated as we ping-pong)
      const makeComputeBG = (writeTex: GPUTexture, readTex: GPUTexture) => device.createBindGroup({
        layout: computePipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: walkersBuf } },
          { binding: 1, resource: writeTex.createView() },
          { binding: 2, resource: readTex.createView() },
          { binding: 3, resource: { buffer: uniformBuf } },
          { binding: 4, resource: { buffer: radiusBuf } },
          { binding: 5, resource: { buffer: rngBuf } },
        ],
      });
      let computeBG = makeComputeBG(occB, occA);

      const makeRenderBG = (readTex: GPUTexture) => device.createBindGroup({
        layout: renderPipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: readTex.createView() },
          { binding: 1, resource: sampler },
          { binding: 2, resource: { buffer: colorBuf } },
        ],
      });
      let renderBG = makeRenderBG(occA);

      let frame = 0;
      // Use the full requested steps per frame on GPU to reduce CPU-GPU sync overhead
      const stepsPerDispatch = Math.max(1, Math.floor(stepsPerFrame));

      const loop = () => {
        frame++;
        const encoder = device.createCommandEncoder();

        // Copy occA -> occB (so occB starts as persistent occupancy)
        encoder.copyTextureToTexture(
          { texture: occA },
          { texture: occB },
          { width: gridW, height: gridH }
        );

        // Update uniforms
        const u = new Uint32Array([gridW >>> 0, gridH >>> 0, walkers >>> 0, frame >>> 0, stepsPerDispatch >>> 0, 0, 0, 0]);
        device.queue.writeBuffer(uniformBuf, 0, u);

        // Compute pass reads occA, writes occB
        {
          const pass = encoder.beginComputePass();
          pass.setPipeline(computePipeline);
          pass.setBindGroup(0, computeBG);
          const wgSize = Math.max(1, Math.floor(workgroupSize));
          const workgroups = Math.ceil(walkers / wgSize);
          pass.dispatchWorkgroups(workgroups);
          pass.end();
        }

        // Swap: occA <= occB
        [occA, occB] = [occB, occA];
        computeBG = makeComputeBG(occB, occA);
        renderBG = makeRenderBG(occA);

        // Render to screen sampling occA
        const view = gpuCtx.getCurrentTexture().createView();
        const pass = encoder.beginRenderPass({
          colorAttachments: [{ view, loadOp: "clear", clearValue: { r: 0, g: 0, b: 0, a: 0 }, storeOp: "store" }],
        });
        pass.setPipeline(renderPipeline);
        pass.setBindGroup(0, renderBG);
        pass.draw(6, 1, 0, 0);
        pass.end();

        device.queue.submit([encoder.finish()]);
        rafRef.current = requestAnimationFrame(loop);
      };

      // Size canvas logical buffer to grid and stretch to full viewport
      (canvas as HTMLCanvasElement).width = gridW;
      (canvas as HTMLCanvasElement).height = gridH;
      // Styles handled by CSS class on the canvas element
      const maybeRecreateOnResize = () => {
        const ndpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), devicePixelRatioCap);
        const roundUp = (v: number, m: number) => Math.max(m, Math.ceil(v / m) * m);
        const nw = roundUp(window.innerWidth * ndpr, gridAlign);
        const nh = roundUp(window.innerHeight * ndpr, gridAlign);
        if (nw !== gridW || nh !== gridH) {
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          // Destroy and restart with new dimensions
          walkersBuf.destroy();
          uniformBuf.destroy();
          occA.destroy();
          occB.destroy();
          radiusBuf.destroy();
          rngBuf.destroy();
          start(canvas).catch((e) => { throw e; });
        }
      };
      window.addEventListener("resize", maybeRecreateOnResize);
      rafRef.current = requestAnimationFrame(loop);

      dispose = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        walkersBuf.destroy();
        uniformBuf.destroy();
        occA.destroy();
        occB.destroy();
        radiusBuf.destroy();
        rngBuf.destroy();
        colorBuf.destroy();
        // device lost is managed by browser; no explicit destroy
        window.removeEventListener("resize", maybeRecreateOnResize);
      };
    };

    const kickoff = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        rafRef.current = requestAnimationFrame(kickoff);
        return;
      }
      start(canvas).catch((e) => { throw e; });
    };
    rafRef.current = requestAnimationFrame(kickoff);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); if (dispose) dispose(); };
  }, [walkers, stepsPerFrame, devicePixelRatioCap, gridAlign, workgroupSize, ringOuterMinPx, ringOuterFrac, ringInnerMinPx, ringInnerFrac, respawnMarginMinPx, respawnMarginFrac, ringRefreshInterval, torusEdgePadPx]);

  if (!mounted || !("gpu" in navigator)) {
    return <BackgroundMycelium2D />;
  }

  return (
    <div aria-hidden className="myco-bg fixed inset-0 z-0 pointer-events-none" data-opacity={opacity}>
      <canvas ref={canvasRef} className="myco-canvas" />
    </div>
  );
}


