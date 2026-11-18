/**
 * Smoke Login. Designed & built by Aakash Mehra.
 *
 * A split sign-in page. The left half is a sheet of paper with live smoke drifting across it,
 * one WebGL fragment shader (domain-warped noise) with an acid green vein running through the
 * plumes. Moving the pointer over it stirs the smoke. Two loose sheets sit underneath so it
 * reads as a small stack of paper, and a grain layer gives it tooth.
 *
 * The right half is the form, on plain paper. Sentence case, set in Inter.
 * It opens in dark mode; the light / dark switch top right eases the smoke between smoke-in-the-dark
 * and ink-on-paper.
 *
 * The shader holds still under prefers-reduced-motion, and the entrance skips its blur.
 */
"use client";

import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, LoaderCircle, Moon, Sun, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type SmokeLoginProvider = "apple" | "google";
type Theme = "light" | "dark";

export type SmokeLoginProps = {
  brand?: string;
  title?: string;
  subtitle?: string;
  /** Called with the form values. Return a promise to keep the button in its loading state. */
  onSubmit?: (values: { email: string; password: string }) => void | Promise<void>;
  onProviderSignIn?: (provider: SmokeLoginProvider) => void | Promise<void>;
  forgotPasswordHref?: string;
  signUpHref?: string;
  defaultTheme?: Theme;
  className?: string;
  /** Small print under the form. */
  footer?: ReactNode;
  errorMessage?: string | null;
  availableUsers?: Array<{
    name: string;
    email: string;
    password?: string;
    role: string;
  }>;
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms)) as Promise<void>;

const THEMES: Record<Theme, Record<string, string>> = {
  light: {
    "--bg": "#ffffff",
    "--paper": "#ffffff",
    "--sheet": "#f8fafc",
    "--ink": "#0f172a",
    "--muted": "#64748b",
    "--line": "#e2e8f0",
    "--field": "#f8fafc",
    "--accent": "#2563eb",
    "--btn": "#2563eb",
    "--btn-ink": "#ffffff",
    "--grain-blend": "multiply",
  },
  dark: {
    "--bg": "#090d16",
    "--paper": "#0f172a",
    "--sheet": "#1e293b",
    "--ink": "#f8fafc",
    "--muted": "#94a3b8",
    "--line": "#1e293b",
    "--field": "#0f172a",
    "--accent": "#38bdf8",
    "--btn": "#2563eb",
    "--btn-ink": "#ffffff",
    "--grain-blend": "soft-light",
  },
};

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function SmokeLogin({
  brand = "NetBounce Placement LLC",
  title = "Welcome back",
  subtitle = "Sign in to access candidate compliance & payment engine.",
  onSubmit = () => wait(1400),
  onProviderSignIn = () => wait(1400),
  forgotPasswordHref = "#",
  signUpHref = "#",
  defaultTheme = "light",
  className,
  footer,
  errorMessage,
  availableUsers,
}: SmokeLoginProps) {
  const [theme, setTheme] = useState(defaultTheme);
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(null as null | "form" | SmokeLoginProvider);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const dark = theme === "dark";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setLocalError(null);

    const email = emailInput.trim();
    const password = passwordInput.trim();

    if (!email || !password) {
      setLocalError("Please enter your email and password.");
      return;
    }

    setBusy("form");
    try {
      await onSubmit({ email, password });
    } catch (err: any) {
      setLocalError(err?.message || "That email and password don't match.");
    } finally {
      setBusy(null);
    }
  };

  const provider = async (p: SmokeLoginProvider) => {
    if (busy) return;
    setBusy(p);
    try {
      await onProviderSignIn(p);
    } finally {
      setBusy(null);
    }
  };

  const handleQuickFill = (userEmail: string, userPass?: string) => {
    setEmailInput(userEmail);
    if (userPass) setPasswordInput(userPass);
    setLocalError(null);
  };

  // Each block drifts up out of a blur, one after another.
  const rise = (i: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(10px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.9, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] as const },
  });

  const activeError = errorMessage || localError;

  return (
    <div
      style={THEMES[theme] as CSSProperties}
      className={cn(
        "relative min-h-dvh w-full overflow-x-hidden flex flex-col items-center justify-center p-4 sm:p-6 font-sans text-slate-900",
        className,
      )}
    >
      {/* 1. Full-screen Smoke WebGL Background */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <SmokeCanvas dark={true} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] opacity-25"
          style={{ backgroundImage: GRAIN, mixBlendMode: "soft-light" }}
        />
      </div>

      {/* 2. Centered Content with Logo at Top-Mid */}
      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center my-auto">
        {/* Logo at Top Middle (Bigger & Crisp) */}
        <motion.div {...rise(0)} className="mb-6 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="NetBounce Placement LLC"
            className="h-20 sm:h-24 md:h-28 max-w-[340px] w-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]"
          />
        </motion.div>

        {/* Centered Transparent Glassmorphic Login Card */}
        <motion.div
          {...rise(1)}
          className="w-full rounded-[26px] bg-white/[0.08] backdrop-blur-2xl border border-white/20 p-7 sm:p-9 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.15)] relative overflow-hidden"
        >
          {/* Subtle specular glass highlight */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          <div className="text-center mb-6">
            <h1 className="text-[28px] sm:text-[32px] font-bold text-white leading-none tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
              {title}
            </h1>
            <p className="mt-2 text-xs sm:text-[13px] text-slate-300 font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
              Candidate Compliance & Payment Engine
            </p>
          </div>

          {/* Optional Quick Demo Accounts */}
          {availableUsers && availableUsers.length > 0 && (
            <motion.div {...rise(2)} className="mb-5 p-3 rounded-2xl border border-white/15 bg-white/[0.05] backdrop-blur-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 drop-shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
                  Quick Login Demo:
                </span>
                <span className="text-[10px] text-slate-300">1-Click Fill</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {availableUsers.map((u) => {
                  const isSelected = emailInput.toLowerCase() === u.email.toLowerCase();
                  const roleLabel =
                    u.role === "ADMIN" ? "👑 Admin" : u.role === "COMPLIANCE_MANAGER" ? "🛡️ Compliance" : "💳 Accounts";
                  return (
                    <button
                      key={u.email}
                      type="button"
                      onClick={() => handleQuickFill(u.email, u.password)}
                      className={cn(
                        "p-1.5 rounded-xl border text-left transition-all text-[11px] cursor-pointer",
                        isSelected
                          ? "border-[#38bdf8] bg-[#2563eb]/35 text-white font-bold shadow-xs"
                          : "border-white/15 hover:border-white/30 bg-white/[0.04] text-slate-300 hover:text-white"
                      )}
                    >
                      <span className="truncate block font-semibold">{roleLabel}</span>
                      <span className="text-[9px] block font-mono opacity-80 truncate text-slate-400">{u.password || "••••••"}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {activeError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl border border-rose-500/40 bg-rose-500/20 text-rose-200 text-xs font-semibold flex items-center gap-2 backdrop-blur-md"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{activeError}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div {...rise(3)}>
              <label htmlFor="email" className="text-[13px] font-semibold text-slate-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="you@netbounce.com"
                className="mt-2 h-12 w-full rounded-[14px] border border-white/20 bg-white/[0.08] px-4 text-[15px] text-white shadow-[0_2px_8px_rgba(0,0,0,0.2)_inset] outline-none transition-[border-color,box-shadow,background-color] duration-300 placeholder:text-white/40 focus:border-[#38bdf8] focus:bg-white/[0.14] focus:shadow-[0_0_0_4px_rgba(56,189,248,0.25)]"
              />
            </motion.div>

            <motion.div {...rise(4)}>
              <div className="flex items-baseline justify-between">
                <label htmlFor="password" className="text-[13px] font-semibold text-slate-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                  Password
                </label>
                <a href={forgotPasswordHref} className="text-[12px] text-slate-300 transition-colors hover:text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2 h-12 w-full rounded-[14px] border border-white/20 bg-white/[0.08] px-4 pr-12 text-[15px] text-white shadow-[0_2px_8px_rgba(0,0,0,0.2)_inset] outline-none transition-[border-color,box-shadow,background-color] duration-300 placeholder:text-white/40 focus:border-[#38bdf8] focus:bg-white/[0.14] focus:shadow-[0_0_0_4px_rgba(56,189,248,0.25)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-[10px] text-white/60 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-[#38bdf8] cursor-pointer"
                >
                  {showPw ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                </button>
              </div>
            </motion.div>

            <motion.div {...rise(5)} className="pt-2">
              <button
                type="submit"
                disabled={!!busy}
                className="group relative flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#2563eb] hover:bg-[#1d4ed8] text-[15px] font-semibold text-white shadow-[0_1px_0_rgb(255_255_255/0.25)_inset,0_4px_20px_rgba(37,99,235,0.45)] transition-[transform,background-color,box-shadow] duration-200 active:scale-[0.985] disabled:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8] cursor-pointer"
              >
                {busy === "form" ? (
                  <LoaderCircle className="size-[18px] animate-spin" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {footer && (
            <motion.div {...rise(6)} className="mt-6 text-center text-[12px] text-slate-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
              {footer}
            </motion.div>
          )}
        </motion.div>

        {/* Footer / Copyright */}
        <motion.p {...rise(7)} className="mt-5 text-center text-xs text-white/80 font-medium tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
          © 2026 NetBounce Placement LLC. All rights reserved.
        </motion.p>
      </div>
    </div>
  );
}

const fieldCls =
  "mt-2 h-12 w-full rounded-[14px] border border-[var(--line)] bg-[var(--field)] px-4 text-[15px] text-[var(--ink)] shadow-[0_1px_2px_rgb(0_0_0/0.04)_inset] outline-none transition-[border-color,box-shadow,background-color] duration-300 placeholder:text-[var(--muted)]/60 focus:border-[var(--accent)] focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_18%,transparent)]";

function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-[13px] font-medium text-[var(--ink)]">
      {children}
    </label>
  );
}

function ProviderButton({
  children,
  busy,
  ...props
}: { children: ReactNode; busy: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[var(--line)] bg-[var(--field)] text-[14px] font-medium shadow-[0_1px_2px_rgb(0_0_0/0.05)] transition-[transform,border-color,background-color] duration-300 hover:border-[var(--muted)]/50 active:scale-[0.98] disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] cursor-pointer"
    >
      {busy ? <LoaderCircle className="size-[17px] animate-spin" /> : children}
    </button>
  );
}

/* ---------------------------------------------------------------------------
 * Smoke WebGL
 * ------------------------------------------------------------------------- */

const RENDER_SCALE = 0.4;

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uDark;

float hash(vec2 p){ p = fract(p * vec2(234.34, 435.345)); p += dot(p, p + 34.23); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0., a = .5;
  mat2 r = mat2(.8, .6, -.6, .8);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = r * p * 2.02 + vec2(1.7, 9.2); a *= .5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float ar = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * ar, uv.y) * 1.25;
  float t = uTime * .07;

  vec2 d = p - vec2(uMouse.x * ar, uMouse.y) * 1.25;
  float k = exp(-dot(d, d) * 1.6);
  p += vec2(-d.y, d.x) * k * .55;

  vec2 q = vec2(fbm(p + vec2(0., t)), fbm(p + vec2(5.2, 1.3) - t * .8));
  vec2 r = vec2(fbm(p + 3. * q + vec2(1.7, 9.2) + t * 1.2), fbm(p + 3. * q + vec2(8.3, 2.8) - t));
  float f = fbm(p + 2.6 * r + vec2(t * .4, -t * .3));

  float smoke = smoothstep(.3, .85, f);
  smoke *= smoke;
  float wisp = smoothstep(.55, .75, f) * (1. - smoothstep(.75, .95, f));
  float vein = (1. - smoothstep(.0, .04, abs(f - .58))) * smoothstep(.42, .62, r.y);

  // Darker Rich Royal Blue Palette (matching the Sign In button #2563eb / #1d4ed8)
  vec3 signinBlue = vec3(0.145, 0.388, 0.922); // Exact Royal Blue of Sign In button
  vec3 deepCobalt = vec3(0.08, 0.22, 0.72);   // Deep cobalt / sapphire blue
  vec3 pureWhite = vec3(1.0, 1.0, 1.0);        // Bright luminous white

  // Deep midnight navy background
  vec3 night = mix(vec3(0.012, 0.024, 0.08), vec3(0.006, 0.014, 0.045), uv.y);

  // Brighter, more luminous white smoke clouds
  float brightSmoke = smoothstep(0.26, 0.80, f);
  brightSmoke = pow(brightSmoke, 1.5);
  vec3 col = night + pureWhite * brightSmoke * 0.98 + pureWhite * wisp * 0.38;

  // Blue veins & accents: darker rich blue matching the Sign In button
  vec3 veinCol = mix(deepCobalt, signinBlue, clamp(r.x * 0.7 + 0.3, 0.0, 1.0));
  col += veinCol * vein * 1.35;

  // Volumetric royal blue ambient glow
  col += signinBlue * smoke * (1.0 - smoke) * 0.85;

  col += (hash(gl_FragCoord.xy + fract(t)) - .5) / 255.;
  gl_FragColor = vec4(col, 1.);
}`;

function SmokeCanvas({ dark }: { dark: boolean }) {
  const ref = useRef(null as HTMLCanvasElement | null);
  const darkRef = useRef(dark ? 1 : 0);
  const redraw = useRef((() => {}) as () => void);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl", { antialias: false, alpha: false, depth: false });
    if (!canvas || !gl) return;

    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uDark = gl.getUniformLocation(program, "uDark");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const start = performance.now();
    const mouse = { x: 0.7, y: 0.4, tx: 0.7, ty: 0.4 };
    let shade = darkRef.current;
    let time = 40;
    let raf = 0;
    let last = 0;

    const draw = () => {
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, time);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uDark, shade);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 1000 / 30 - 2) return;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      time = 40 + (now - start) / 1000;
      mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 2.2);
      mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 2.2);
      shade += (darkRef.current - shade) * Math.min(1, dt * 3.5);
      draw();
    };
    const play = () => {
      cancelAnimationFrame(raf);
      if (reduce.matches) draw();
      else raf = requestAnimationFrame(loop);
    };
    redraw.current = () => {
      if (!reduce.matches) return;
      shade = darkRef.current;
      draw();
    };

    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    };

    const ro = new ResizeObserver(() => {
      const s = Math.min(window.devicePixelRatio || 1, 2) * RENDER_SCALE;
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * s));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * s));
      gl.viewport(0, 0, canvas.width, canvas.height);
      draw();
    });
    ro.observe(canvas);
    window.addEventListener("pointermove", onMove);
    reduce.addEventListener("change", play);
    play();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      reduce.removeEventListener("change", play);
    };
  }, []);

  useEffect(() => {
    darkRef.current = dark ? 1 : 0;
    redraw.current();
  }, [dark]);

  return <canvas ref={ref} aria-hidden className="absolute inset-0 size-full" />;
}

/* ---------------------------------------------------------------------------
 * Brand Icons
 * ------------------------------------------------------------------------- */

type IconProps = { className?: string };

function GoogleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function AppleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" className={className}>
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}
