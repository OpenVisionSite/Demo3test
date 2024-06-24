import { Vector2 } from "three";
import vertex from "./Shader/hologram/vertex.glsl";
import fragment from "./Shader/hologram/fragment.glsl";

const HoloEffect = {
  uniforms: {
    tDiffuse: { value: null },
    uSize: { value: new Vector2(window.innerWidth, window.innerHeight) },
    uPixelRatio: { value: window.devicePixelRatio },
    uProgress: { value: 0 },
    center: { value: new Vector2(0.5, 0.5) },
    angle: { value: 1.57 },
    scale: { value: 1.0 },
    uTime: { value: 0.0 },
  },
  vertexShader: vertex,
  fragmentShader: fragment,
};

export { HoloEffect };
