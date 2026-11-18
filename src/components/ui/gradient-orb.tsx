"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Configuration options for the gradient orb.
 * All fields are optional and fall back to sensible defaults.
 */
export type GradientOrbConfig = {
  /** CSS color string for the canvas background. Defaults to transparent or given color */
  background?: string;
  /** Whether canvas has transparent background. @default true */
  transparent?: boolean;
  /** Hue rotation in degrees applied to all gradient colors. @default 0 */
  hue?: number;
  /** Constant rotation speed of the orb (radians/sec). @default 0.3 */
  rotationSpeed?: number;
  /** Scale of the noise pattern inside the orb. @default 0.65 */
  noiseScale?: number;
  /** Inner radius of the orb glow (0–1). @default 0.1 */
  innerRadius?: number;
  /** Primary blue color (hex or rgb). @default "#1d4ed8" */
  color0?: string;
  /** Secondary dark blue / navy color. @default "#0f172a" */
  color1?: string;
  /** Highlight color (pure white). @default "#ffffff" */
  color2?: string;
  /** Base shadow color. @default "#020617" */
  color3?: string;
};

const defaults: Required<GradientOrbConfig> = {
  background: "transparent",
  transparent: true,
  hue: 0,
  rotationSpeed: 0.25,
  noiseScale: 0.65,
  innerRadius: 0.1,
  color0: "#1d4ed8", // royal blue
  color1: "#0f172a", // deep navy
  color2: "#ffffff", // bright white
  color3: "#020617", // dark blue shadow
};

/**
 * GLSL vertex shader — pass-through that outputs clip-space positions
 * directly from a fullscreen triangle in NDC.
 */
const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/**
 * GLSL fragment shader — renders a glowing orb with dark blue and white colors,
 * hue rotation, breathing pulse, and constant rotation.
 */
const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float iTime;
  uniform vec3 iResolution;
  uniform float hue;
  uniform float rot;
  uniform float noiseScale;
  uniform float innerRadius;
  uniform vec3 color0;
  uniform vec3 color1;
  uniform vec3 color2;
  uniform vec3 color3;

  varying vec2 vUv;

  // --- YIQ color space hue rotation ---

  vec3 rgb2yiq(vec3 c) {
    return vec3(
      dot(c, vec3(0.299, 0.587, 0.114)),
      dot(c, vec3(0.596, -0.274, -0.322)),
      dot(c, vec3(0.211, -0.523, 0.312))
    );
  }

  vec3 yiq2rgb(vec3 c) {
    return vec3(
      c.x + 0.956 * c.y + 0.621 * c.z,
      c.x - 0.272 * c.y - 0.647 * c.z,
      c.x - 1.106 * c.y + 1.703 * c.z
    );
  }

  vec3 adjustHue(vec3 color, float hueDeg) {
    float hueRad = radians(hueDeg);
    vec3 yiq = rgb2yiq(color);
    float cosA = cos(hueRad);
    float sinA = sin(hueRad);
    yiq.yz = vec2(yiq.y * cosA - yiq.z * sinA, yiq.y * sinA + yiq.z * cosA);
    return yiq2rgb(yiq);
  }

  // --- 3D simplex noise (hash-based) ---

  vec3 hash33(vec3 p3) {
    p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
    p3 += dot(p3, p3.yxz + 19.19);
    return -1.0 + 2.0 * fract(vec3(p3.x + p3.y, p3.x + p3.z, p3.y + p3.z) * p3.zyx);
  }

  float snoise3(vec3 p) {
    const float K1 = 0.333333333;
    const float K2 = 0.166666667;
    vec3 i = floor(p + (p.x + p.y + p.z) * K1);
    vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
    vec3 e = step(vec3(0.0), d0 - d0.yzx);
    vec3 i1 = e * (1.0 - e.zxy);
    vec3 i2 = 1.0 - e.zxy * (1.0 - e);
    vec3 d1 = d0 - (i1 - K2);
    vec3 d2 = d0 - (i2 - K1);
    vec3 d3 = d0 - 0.5;
    vec4 h = max(0.6 - vec4(dot(d0, d0), dot(d1, d1), dot(d2, d2), dot(d3, d3)), 0.0);
    vec4 n = h * h * h * h * vec4(
      dot(d0, hash33(i)),
      dot(d1, hash33(i + i1)),
      dot(d2, hash33(i + i2)),
      dot(d3, hash33(i + 1.0))
    );
    return dot(vec4(31.316), n);
  }

  // --- Orb rendering ---

  vec4 extractAlpha(vec3 colorIn) {
    float a = max(max(colorIn.r, colorIn.g), colorIn.b);
    return vec4(colorIn.rgb / (a + 1e-5), a);
  }

  float light1(float intensity, float attenuation, float dist) {
    return intensity / (1.0 + dist * attenuation);
  }

  float light2(float intensity, float attenuation, float dist) {
    return intensity / (1.0 + dist * dist * attenuation);
  }

  vec4 draw(vec2 uv) {
    vec3 c0 = adjustHue(color0, hue);
    vec3 c1 = adjustHue(color1, hue);
    vec3 c2 = adjustHue(color2, hue);
    vec3 c3 = adjustHue(color3, hue);

    float len = length(uv);
    float invLen = len > 0.0 ? 1.0 / len : 0.0;

    float pulse = sin(iTime * 1.5) * 0.02;

    float n0 = snoise3(vec3(uv * noiseScale, iTime * 0.5)) * 0.5 + 0.5;

    float r0 = mix(mix(innerRadius + pulse, 1.0, 0.4), mix(innerRadius + pulse, 1.0, 0.6), n0);

    float d0 = distance(uv, (r0 * invLen) * uv);
    float v0 = light1(1.0, 10.0, d0);
    v0 *= smoothstep(r0 * 1.05, r0, len);
    float cl = cos(atan(uv.y, uv.x) + iTime * 2.0) * 0.5 + 0.5;

    float a = iTime * -1.0;
    vec2 pos = vec2(cos(a), sin(a)) * r0;
    float d = distance(uv, pos);
    float v1 = light2(1.5, 5.0, d);
    v1 *= light1(1.0, 50.0, d0);

    float v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
    float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);

    vec3 col = mix(c1, c2, cl);
    col = mix(col, c0, n0);
    col = mix(c3, col, v0);
    col = (col + v1) * v2 * v3;
    col = clamp(col, 0.0, 1.0);

    return extractAlpha(col);
  }

  void main() {
    vec2 center = iResolution.xy * 0.5;
    float size = min(iResolution.x, iResolution.y);
    vec2 uv = (vUv * iResolution.xy - center) / size * 2.0;

    float s = sin(rot);
    float c = cos(rot);
    uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);

    vec4 col = draw(uv);
    gl_FragColor = vec4(col.rgb * col.a, col.a);
  }
`;

/** Helper to parse css color to THREE.Color */
function toColorVec3(hexOrRgb: string): THREE.Vector3 {
  const c = new THREE.Color(hexOrRgb);
  return new THREE.Vector3(c.r, c.g, c.b);
}

/** Internal scene component for the gradient fullscreen shader. */
function GradientScene({ config }: { config: Required<GradientOrbConfig> }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size, viewport } = useThree();
  const rotRef = useRef(0);
  const lastTimeRef = useRef(0);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3),
    );
    geo.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
    return geo;
  }, []);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  const uniforms = useMemo(
    () => ({
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3(size.width, size.height, 1) },
      hue: { value: config.hue },
      rot: { value: 0 },
      noiseScale: { value: config.noiseScale },
      innerRadius: { value: config.innerRadius },
      color0: { value: toColorVec3(config.color0) },
      color1: { value: toColorVec3(config.color1) },
      color2: { value: toColorVec3(config.color2) },
      color3: { value: toColorVec3(config.color3) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config],
  );

  useFrame((state) => {
    if (!materialRef.current) return;

    const t = state.clock.elapsedTime;
    const dt = t - lastTimeRef.current;
    lastTimeRef.current = t;

    rotRef.current += dt * config.rotationSpeed;

    const u = materialRef.current.uniforms;
    if (!u.iTime || !u.hue || !u.rot || !u.iResolution) return;
    u.iTime.value = t;
    u.hue.value = config.hue;
    u.rot.value = rotRef.current;
    u.iResolution.value.set(
      size.width * viewport.dpr,
      size.height * viewport.dpr,
      size.width / size.height,
    );
  });

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

/**
 * Glowing shader orb with noise-based dark blue and white color mixing, YIQ hue rotation,
 * breathing pulse, and constant rotation — rendered on GPU as a fullscreen triangle.
 *
 * @example
 * ```tsx
 * <GradientOrb />
 * <GradientOrb config={{ hue: 0, rotationSpeed: 0.3 }} />
 * ```
 */
export function GradientOrb({
  config: configOverrides,
  className = "",
}: {
  config?: GradientOrbConfig;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const configKey = JSON.stringify(configOverrides);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const config = useMemo(() => ({ ...defaults, ...configOverrides }), [configKey]);

  if (!mounted) {
    return <div className={`w-full h-full pointer-events-none select-none ${className}`} />;
  }

  return (
    <div className={`w-full h-full pointer-events-none select-none ${className}`}>
      <Canvas gl={{ antialias: true, alpha: true }}>
        {config.background !== "transparent" && (
          <color attach="background" args={[config.background]} />
        )}
        <GradientScene config={config} />
      </Canvas>
    </div>
  );
}

export default GradientOrb;
