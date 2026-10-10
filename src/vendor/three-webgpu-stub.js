// Day 49: three-globe / three-render-objects import `three/webgpu` (a second, ~1 MB copy of
// three) only for the optional WebGPU renderer and GPU heatmaps, which this app never uses.
// vite.config.js aliases `three/webgpu` and `three/tsl` here so the globe chunk stays lean.
function unsupported() {
  throw new Error('WebGPU is not bundled in The Everything Timeline (WebGL only).');
}
export class WebGPURenderer {
  constructor() {
    unsupported();
  }
}
export class StorageInstancedBufferAttribute {
  constructor() {
    unsupported();
  }
}
export default {};
