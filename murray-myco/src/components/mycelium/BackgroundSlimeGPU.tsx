"use client";

import { useEffect, useRef, useState } from "react";
import { useMyceliumSettings } from "@/state/useMyceliumSettings";
import BackgroundMycelium2D from "./BackgroundMycelium2D";

export default function BackgroundSlimeGPU() {
  const {
    opacity,
    walkers,
    stepsPerFrame,
    devicePixelRatioCap,
    gridAlign,
    workgroupSize,
    slimeSensorAngleMilliRad,
    slimeSensorDistance,
    slimeTurnAngleMilliRad,
    slimeMoveSpeedMilliPx,
    slimeDepositMilli,
    slimeDecayMilli,
    slimeSpawnMode,
    slimeSpawnRadiusFrac,
  } = useMyceliumSettings();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const fail = (m: string): never => { throw new Error(`[SLIME-GPU-FAIL] ${m}`); };
    let dispose: null | (() => void) = null;

    const start = async (canvas: HTMLCanvasElement) => {
      if (!("gpu" in navigator)) return;
      const nav = navigator as Navigator & { gpu: GPU };
      const adapter = await nav.gpu.requestAdapter();
      if (!adapter) fail("No GPU adapter");
      const device: GPUDevice = await (adapter as GPUAdapter).requestDevice();

      type WebGPUCanvas = HTMLCanvasElement & { getContext(contextId: "webgpu"): GPUCanvasContext | null };
      const context = (canvas as WebGPUCanvas).getContext("webgpu");
      if (!context) fail("WebGPU context unavailable");
      const presentationFormat = nav.gpu.getPreferredCanvasFormat();
      const gpuCtx = context as GPUCanvasContext;
      gpuCtx.configure({ device, format: presentationFormat, alphaMode: "premultiplied" });

      const roundUp = (v: number, m: number) => Math.max(m, Math.ceil(v / m) * m);
      const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), devicePixelRatioCap);
      const gridW = roundUp(window.innerWidth * dpr, gridAlign);
      const gridH = roundUp(window.innerHeight * dpr, gridAlign);

      const makeTrail = () => device.createTexture({
        size: { width: gridW, height: gridH },
        format: "rgba8unorm",
        usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
      });
      const trailA = makeTrail();
      const trailB = makeTrail();
      {
        const enc = device.createCommandEncoder();
        const pass = enc.beginRenderPass({ colorAttachments: [{ view: trailA.createView(), loadOp: "clear", clearValue: { r: 0, g: 0, b: 0, a: 0 }, storeOp: "store" }] });
        pass.end();
        device.queue.submit([enc.finish()]);
      }

      // Agents buffer: pos.xy f32, angle f32, rng u32
      const agentCount = walkers;
      const agentStride = 16;
      const agentData = new ArrayBuffer(agentStride * agentCount);
      const f32 = new Float32Array(agentData);
      const u32 = new Uint32Array(agentData);
      for (let i = 0; i < agentCount; i++) {
        const base = ((agentStride * i) >>> 2);
        const cx = gridW * 0.5;
        const cy = gridH * 0.5;
        if (slimeSpawnMode === "center") {
          const r = Math.min(gridW, gridH) * slimeSpawnRadiusFrac;
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * r;
          f32[base + 0] = cx + Math.cos(angle) * radius;
          f32[base + 1] = cy + Math.sin(angle) * radius;
          f32[base + 2] = Math.random() * Math.PI * 2;
        } else {
          f32[base + 0] = Math.random() * gridW;
          f32[base + 1] = Math.random() * gridH;
          f32[base + 2] = Math.random() * Math.PI * 2;
        }
        u32[base + 3] = (Math.imul(i + 1, 1664525) ^ (Math.random() * 0x7fffffff)) >>> 0;
      }
      const agentsBuf = device.createBuffer({ size: agentData.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC, mappedAtCreation: true });
      new Uint8Array(agentsBuf.getMappedRange()).set(new Uint8Array(agentData));
      agentsBuf.unmap();

      const ipBuf = device.createBuffer({ size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
      const fpBuf = device.createBuffer({ size: 64, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
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

      const agentsWGSL = /* wgsl */ `
        struct IParams { gridW:u32, gridH:u32, agents:u32, frame:u32, steps:u32, _p0:u32, _p1:u32, _p2:u32 };
        struct FParams { sensorDist:f32, sensorAngle:f32, turnAngle:f32, moveSpeed:f32, deposit:f32, decay:f32, diffuse:f32, _pf:f32 };
        struct Agent { pos: vec2<f32>, angle: f32, rng: u32 };
        @group(0) @binding(0) var<storage, read_write> agents : array<Agent>;
        @group(0) @binding(1) var trailWrite : texture_storage_2d<rgba8unorm, write>;
        @group(0) @binding(2) var trailRead : texture_2d<f32>;
        @group(0) @binding(3) var<uniform> ip : IParams;
        @group(0) @binding(4) var<uniform> fp : FParams;

        fn lcg_next(x: u32) -> u32 { return x * 1664525u + 1013904223u; }

        fn sensor_value(p: vec2<f32>, angle: f32, offsetAngle: f32, dist: f32, gw:i32, gh:i32) -> f32 {
          let dir = vec2<f32>(cos(angle + offsetAngle), sin(angle + offsetAngle));
          var s = p + dir * dist;
          var ix = ((i32(round(s.x)) % gw) + gw) % gw;
          var iy = ((i32(round(s.y)) % gh) + gh) % gh;
          return textureLoad(trailRead, vec2<i32>(ix, iy), 0).a;
        }

        @compute @workgroup_size(${workgroupSize})
        fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
          let idx = gid.x;
          if (idx >= ip.agents) { return; }
          var a = agents[idx];
          let gw = i32(ip.gridW);
          let gh = i32(ip.gridH);

          for (var s:u32=0u; s<ip.steps; s=s+1u) {
            let f = sensor_value(a.pos, a.angle, 0.0, fp.sensorDist, gw, gh);
            let l = sensor_value(a.pos, a.angle, -fp.sensorAngle, fp.sensorDist, gw, gh);
            let r = sensor_value(a.pos, a.angle, fp.sensorAngle, fp.sensorDist, gw, gh);
            if (f >= l && f >= r) {
            } else if (l > r) {
              a.angle = a.angle - fp.turnAngle;
            } else if (r > l) {
              a.angle = a.angle + fp.turnAngle;
            } else {
              a.rng = lcg_next(a.rng);
              let t = select(-1.0, 1.0, (a.rng & 1u) == 1u);
              a.angle = a.angle + t * fp.turnAngle;
            }
            // move
            let dir = vec2<f32>(cos(a.angle), sin(a.angle));
            var np = a.pos + dir * fp.moveSpeed;
            if (np.x < 0.0) { np.x = np.x + f32(gw); }
            if (np.y < 0.0) { np.y = np.y + f32(gh); }
            if (np.x >= f32(gw)) { np.x = np.x - f32(gw); }
            if (np.y >= f32(gh)) { np.y = np.y - f32(gh); }
            a.pos = np;
            // deposit
            let ix = ((i32(round(a.pos.x)) % gw) + gw) % gw;
            let iy = ((i32(round(a.pos.y)) % gh) + gh) % gh;
            textureStore(trailWrite, vec2<i32>(ix, iy), vec4<f32>(0.0, 0.0, 0.0, fp.deposit));
          }
          agents[idx] = a;
        }
      `;

      const diffuseWGSL = /* wgsl */ `
        struct IParams { gridW:u32, gridH:u32, agents:u32, frame:u32, steps:u32, _p0:u32, _p1:u32, _p2:u32 };
        struct FParams { sensorDist:f32, sensorAngle:f32, turnAngle:f32, moveSpeed:f32, deposit:f32, decay:f32, diffuse:f32, _pf:f32 };
        @group(0) @binding(0) var trailWrite : texture_storage_2d<rgba8unorm, write>;
        @group(0) @binding(1) var trailRead : texture_2d<f32>;
        @group(0) @binding(2) var<uniform> ip : IParams;
        @group(0) @binding(3) var<uniform> fp : FParams;

        @compute @workgroup_size(8,8,1)
        fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
          let x = i32(gid.x);
          let y = i32(gid.y);
          if (x >= i32(ip.gridW) || y >= i32(ip.gridH)) { return; }
          let gw = i32(ip.gridW);
          let gh = i32(ip.gridH);
          var sum = 0.0;
          for (var oy:i32=-1; oy<=1; oy=oy+1) {
            for (var ox:i32=-1; ox<=1; ox=ox+1) {
              let nx = (x + ox + gw) % gw;
              let ny = (y + oy + gh) % gh;
              let v = textureLoad(trailRead, vec2<i32>(nx, ny), 0).a;
              sum = sum + v;
            }
          }
          let center = textureLoad(trailRead, vec2<i32>(x, y), 0).a;
          let blurred = mix(center, sum / 9.0, fp.diffuse);
          let decayed = max(0.0, blurred * (1.0 - fp.decay));
          textureStore(trailWrite, vec2<i32>(x, y), vec4<f32>(0.0, 0.0, 0.0, decayed));
        }
      `;

      const agentsPipeline = device.createComputePipeline({ layout: "auto", compute: { module: device.createShaderModule({ code: agentsWGSL }), entryPoint: "main" } });
      const diffusePipeline = device.createComputePipeline({ layout: "auto", compute: { module: device.createShaderModule({ code: diffuseWGSL }), entryPoint: "main" } });

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
          // premultiplied alpha output using the site's foreground color
          return vec4<f32>(color.rgb * a, a);
        }
      `;
      const renderPipeline = device.createRenderPipeline({ layout: "auto", vertex: { module: device.createShaderModule({ code: renderWGSL }), entryPoint: "vs" }, fragment: { module: device.createShaderModule({ code: renderWGSL }), entryPoint: "fs", targets: [{ format: presentationFormat }] }, primitive: { topology: "triangle-list" } });

      const makeAgentsBG = (writeTex: GPUTexture, readTex: GPUTexture) => device.createBindGroup({
        layout: agentsPipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: agentsBuf } },
          { binding: 1, resource: writeTex.createView() },
          { binding: 2, resource: readTex.createView() },
          { binding: 3, resource: { buffer: ipBuf } },
          { binding: 4, resource: { buffer: fpBuf } },
        ],
      });
      const agentsBG = makeAgentsBG(trailB, trailA);

      const makeDiffuseBG = (writeTex: GPUTexture, readTex: GPUTexture) => device.createBindGroup({
        layout: diffusePipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: writeTex.createView() },
          { binding: 1, resource: readTex.createView() },
          { binding: 2, resource: { buffer: ipBuf } },
          { binding: 3, resource: { buffer: fpBuf } },
        ],
      });
      const diffuseBG = makeDiffuseBG(trailA, trailB);

      const renderBG = device.createBindGroup({
        layout: renderPipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: trailA.createView() },
          { binding: 1, resource: sampler },
          { binding: 2, resource: { buffer: colorBuf } },
        ],
      });

      (canvas as HTMLCanvasElement).width = gridW;
      (canvas as HTMLCanvasElement).height = gridH;
      // Styles handled via CSS class on canvas element

      let frame = 0;
      const stepsPerDispatch = Math.max(1, Math.floor(stepsPerFrame));
      const loop = () => {
        frame++;
        const encoder = device.createCommandEncoder();

        encoder.copyTextureToTexture({ texture: trailA }, { texture: trailB }, { width: gridW, height: gridH });

        const ip = new Uint32Array([gridW >>> 0, gridH >>> 0, agentCount >>> 0, frame >>> 0, stepsPerDispatch >>> 0, 0, 0, 0]);
        device.queue.writeBuffer(ipBuf, 0, ip);
        const sensorAngle = slimeSensorAngleMilliRad / 1000;
        const turnAngle = slimeTurnAngleMilliRad / 1000;
        const moveSpeed = slimeMoveSpeedMilliPx / 1000;
        const deposit = slimeDepositMilli / 1000;
        const decay = slimeDecayMilli / 1000;
        const fp = new Float32Array([slimeSensorDistance, sensorAngle, turnAngle, moveSpeed, deposit, decay, 0.25, 0.0]);
        device.queue.writeBuffer(fpBuf, 0, fp);

        {
          const pass = encoder.beginComputePass();
          pass.setPipeline(agentsPipeline);
          pass.setBindGroup(0, agentsBG);
          pass.dispatchWorkgroups(Math.ceil(agentCount / workgroupSize));
          pass.end();
        }

        {
          const pass = encoder.beginComputePass();
          pass.setPipeline(diffusePipeline);
          pass.setBindGroup(0, diffuseBG);
          pass.dispatchWorkgroups(Math.ceil(gridW / 8), Math.ceil(gridH / 8));
          pass.end();
        }

        const view = gpuCtx.getCurrentTexture().createView();
        const rpass = encoder.beginRenderPass({ colorAttachments: [{ view, loadOp: "clear", clearValue: { r: 0, g: 0, b: 0, a: 0 }, storeOp: "store" }] });
        rpass.setPipeline(renderPipeline);
        rpass.setBindGroup(0, renderBG);
        rpass.draw(6, 1, 0, 0);
        rpass.end();

        device.queue.submit([encoder.finish()]);
        rafRef.current = requestAnimationFrame(loop);
      };

      const maybeRecreateOnResize = () => {
        const ndpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), devicePixelRatioCap);
        const roundUp = (v: number, m: number) => Math.max(m, Math.ceil(v / m) * m);
        const nw = roundUp(window.innerWidth * ndpr, gridAlign);
        const nh = roundUp(window.innerHeight * ndpr, gridAlign);
        if (nw !== gridW || nh !== gridH) {
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          agentsBuf.destroy();
          ipBuf.destroy();
          fpBuf.destroy();
          trailA.destroy();
          trailB.destroy();
          start(canvas).catch((e) => { throw e; });
        }
      };
      window.addEventListener("resize", maybeRecreateOnResize);
      rafRef.current = requestAnimationFrame(loop);

      dispose = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        agentsBuf.destroy();
        ipBuf.destroy();
        fpBuf.destroy();
        trailA.destroy();
        trailB.destroy();
        colorBuf.destroy();
        window.removeEventListener("resize", maybeRecreateOnResize);
      };
    };

    const kickoff = () => {
      const canvas = canvasRef.current;
      if (!canvas) { rafRef.current = requestAnimationFrame(kickoff); return; }
      start(canvas).catch((e) => { throw e; });
    };
    rafRef.current = requestAnimationFrame(kickoff);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); if (dispose) dispose(); };
  }, [walkers, stepsPerFrame, devicePixelRatioCap, gridAlign, workgroupSize, slimeSensorAngleMilliRad, slimeSensorDistance, slimeTurnAngleMilliRad, slimeMoveSpeedMilliPx, slimeDepositMilli, slimeDecayMilli]);

  if (!mounted || !("gpu" in navigator)) {
    return <BackgroundMycelium2D />;
  }

  return (
    <div aria-hidden className="myco-bg fixed inset-0 z-0 pointer-events-none" data-opacity={opacity}>
      <canvas ref={canvasRef} className="myco-canvas" />
    </div>
  );
}


