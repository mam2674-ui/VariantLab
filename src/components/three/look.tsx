"use client";

import { EffectComposer, N8AO, SMAA, wrapEffect } from "@react-three/postprocessing";
import { BlendFunction, Effect, EffectAttribute } from "postprocessing";
import * as THREE from "three";

/**
 * Depth-edge silhouettes in the style of molecular viewers such as ChimeraX:
 * where depth jumps between neighbouring pixels, draw a dark edge.
 */
const fragment = /* glsl */ `
uniform float thickness;
uniform float threshold;
uniform vec3 edgeColor;
void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
  vec2 px = texelSize * thickness;
  float d = getViewZ(depth);
  float a = getViewZ(readDepth(uv + vec2(px.x, 0.0)));
  float b = getViewZ(readDepth(uv - vec2(px.x, 0.0)));
  float c = getViewZ(readDepth(uv + vec2(0.0, px.y)));
  float e = getViewZ(readDepth(uv - vec2(0.0, px.y)));
  float diff = max(max(abs(d - a), abs(d - b)), max(abs(d - c), abs(d - e)));
  float rel = diff / max(abs(d), 1e-3);
  float edge = smoothstep(threshold, threshold * 2.5, rel);
  outputColor = vec4(mix(inputColor.rgb, edgeColor, edge * 0.9), inputColor.a);
}
`;

class SilhouetteEffect extends Effect {
  constructor({ thickness = 1.2, threshold = 0.02, color = "#000000" }: { thickness?: number; threshold?: number; color?: string } = {}) {
    super("SilhouetteEffect", fragment, {
      attributes: EffectAttribute.DEPTH,
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, THREE.Uniform>([
        ["thickness", new THREE.Uniform(thickness)],
        ["threshold", new THREE.Uniform(threshold)],
        ["edgeColor", new THREE.Uniform(new THREE.Color(color))],
      ]),
    });
  }
}

export const Silhouettes = wrapEffect(SilhouetteEffect);

/**
 * Lights + post-processing shared by the virus and protein canvases:
 * soft key/fill lighting, screen-space ambient occlusion and silhouettes.
 */
export function ChimeraLook({ background, aoRadius = 0.25, quality = "medium" }: { background: string; aoRadius?: number; quality?: "low" | "medium" | "high" }) {
  return (
    <>
      <color attach="background" args={[background]} />
      <hemisphereLight args={["#ffffff", "#30343c", 0.9]} />
      <directionalLight position={[2, 3, 4]} intensity={1.3} />
      <directionalLight position={[-3, -1, 2]} intensity={0.35} />
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <N8AO aoRadius={aoRadius} distanceFalloff={1} intensity={3.2} quality={quality} halfRes={quality !== "high"} />
        <Silhouettes />
        <SMAA />
      </EffectComposer>
    </>
  );
}
