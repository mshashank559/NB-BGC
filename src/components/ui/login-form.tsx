"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { User as UserIcon, Lock, ArrowRight, ArrowLeft, Eye, EyeOff, LoaderCircle, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

// Vertex shader source code
const vertexSmokeySource = `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`;

// Fragment shader: Steady, ambient organic dark royal blue smokey waves on pitch black (does NOT move with cursor)
const fragmentSmokeySource = `
precision mediump float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec3 u_color;

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 centeredUV = (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);

    float time = iTime * 0.45;

    vec2 distortion = centeredUV;
    // Ambient natural distortion without mouse tracking
    for (float i = 1.0; i < 8.0; i++) {
        distortion.x += 0.5 / i * cos(i * 2.0 * distortion.y + time);
        distortion.y += 0.5 / i * cos(i * 2.0 * distortion.x + time);
    }

    // Glowing wave pattern
    float wave = abs(sin(distortion.x + distortion.y + time));
    float glow = smoothstep(0.9, 0.2, wave);

    // Deep Dark Royal Blue with high-contrast pitch-black falloff
    fragColor = vec4(u_color * glow, 1.0);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

/**
 * Valid blur sizes supported by Tailwind CSS.
 */
type BlurSize = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

/**
 * Props for the SmokeyBackground component.
 */
export interface SmokeyBackgroundProps {
  backdropBlurAmount?: string;
  color?: string;
  className?: string;
}

/**
 * A mapping from blur size names to Tailwind CSS classes.
 */
const blurClassMap: Record<BlurSize, string> = {
  none: "backdrop-blur-none",
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
  "2xl": "backdrop-blur-2xl",
  "3xl": "backdrop-blur-3xl",
};

/**
 * A React component that renders a steady, ambient WebGL shader background
 * without moving or shaking when the mouse is moved.
 */
export function SmokeyBackground({
  backdropBlurAmount = "none",
  color = "#1D4ED8", // Rich Deep Dark Royal Blue
  className = "",
}: SmokeyBackgroundProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Helper to convert hex color to RGB (0-1 range)
  const hexToRgb = (hex: string): [number, number, number] => {
    const clean = hex.startsWith("#") ? hex.substring(1) : hex;
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    return [r, g, b];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: false, depth: false, alpha: false });
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const compileShader = (type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSmokeySource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSmokeySource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program linking error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const iResolutionLocation = gl.getUniformLocation(program, "iResolution");
    const iTimeLocation = gl.getUniformLocation(program, "iTime");
    const uColorLocation = gl.getUniformLocation(program, "u_color");

    const startTime = Date.now();
    const [r, g, b] = hexToRgb(color);
    gl.uniform3f(uColorLocation, r, g, b);

    let rafId: number;

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width > 0 && height > 0 && (canvas.width !== width || canvas.height !== height)) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      const currentTime = (Date.now() - startTime) / 1000;

      gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(iTimeLocation, currentTime);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(rafId);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [color]);

  const finalBlurClass = blurClassMap[backdropBlurAmount as BlurSize] || blurClassMap["sm"];

  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className={`absolute inset-0 ${finalBlurClass} pointer-events-none`}></div>
    </div>
  );
}

export interface LoginFormProps {
  onSubmit?: (values: { email: string; password: string }) => void | Promise<void>;
  onGoogleSignIn?: () => void | Promise<void>;
  availableUsers?: Array<{
    name: string;
    email: string;
    password?: string;
    role: string;
  }>;
  errorMessage?: string | null;
  className?: string;
}

/**
 * A glassmorphism-style login form component with clean, beautiful inputs,
 * quick 1-click accounts, and zero browser autofill clipping.
 */
export function LoginForm({
  onSubmit,
  availableUsers,
  errorMessage,
  className = "",
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const activeError = errorMessage || localError;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setLocalError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);

    try {
      if (onSubmit) {
        await onSubmit({ email: email.trim(), password });
      }
    } catch (err: any) {
      setLocalError(err?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (uEmail: string, uPassword?: string) => {
    setEmail(uEmail);
    if (uPassword) setPassword(uPassword);
    setLocalError(null);
  };

  return (
    <div
      className={cn(
        "w-full max-w-md p-8 sm:p-9 space-y-6 bg-white/[0.08] backdrop-blur-2xl rounded-3xl border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.12)] text-white relative",
        className
      )}
    >
      {/* Specular highlight border at top */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

      {/* Header with Title and Subtitle */}
      <div className="text-center space-y-1.5">
        <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
          Welcome Back
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 font-medium drop-shadow-sm">
          Sign in to candidate compliance & payment engine
        </p>
      </div>

      {/* Error Message Alert */}
      {activeError && (
        <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/20 text-rose-200 text-xs font-semibold flex items-center gap-2 backdrop-blur-md">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{activeError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4 pt-1">
        {/* Email Input Field */}
        <div className="space-y-1.5">
          <label htmlFor="email_input" className="block text-xs font-semibold text-slate-200">
            Email Address
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-slate-400 pointer-events-none">
              <UserIcon size={16} />
            </span>
            <input
              type="email"
              id="email_input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 hover:bg-slate-900/80 focus:bg-slate-900/90 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 rounded-xl text-white placeholder-slate-400 text-sm transition-all outline-none"
              placeholder="Enter your corporate email"
              required
              autoComplete="off"
            />
          </div>
        </div>

        {/* Password Input Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password_input" className="block text-xs font-semibold text-slate-200">
              Password
            </label>
            <a href="#" className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
              Forgot?
            </a>
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-slate-400 pointer-events-none">
              <Lock size={16} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              id="password_input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-900/60 hover:bg-slate-900/80 focus:bg-slate-900/90 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 rounded-xl text-white placeholder-slate-400 text-sm transition-all outline-none"
              placeholder="Enter your password"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="group w-full flex items-center justify-center py-3 px-4 mt-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.985] rounded-xl text-white font-semibold shadow-[0_4px_20px_rgba(37,99,235,0.45)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-all duration-300 disabled:opacity-80 cursor-pointer"
        >
          {isSubmitting ? (
            <LoaderCircle className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

/**
 * Full-page login screen with centered NetBounce Logo & Transparent Glass Arrow,
 * transitioning smoothly to the centered Glassmorphic Login Form.
 */
export function LoginScreen({
  onSubmit,
  onGoogleSignIn,
  availableUsers,
  errorMessage,
}: LoginFormProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <main className="relative w-screen h-screen min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center p-4">
      {/* 3D Smokey Wave Background: Razor-sharp Deep Dark Blue & Pitch Black (Steady ambient wave, no cursor tracking) */}
      <SmokeyBackground color="#1D4ED8" backdropBlurAmount="none" className="absolute inset-0 z-0" />

      {/* Smooth Animated Content Switcher */}
      <AnimatePresence mode="wait">
        {!isFormOpen ? (
          /* Step 1: Centered Logo with Translucent Arrow Button right beside it */
          <motion.div
            key="hero-center"
            initial={{ opacity: 0, scale: 0.92, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.82, filter: "blur(14px)" }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 my-auto select-none"
          >
            {/* NetBounce Placement LLC Logo in the Middle */}
            <img
              src="/logo.png"
              alt="NetBounce Placement LLC"
              className="h-20 sm:h-28 md:h-32 w-auto object-contain drop-shadow-[0_16px_40px_rgba(0,0,0,0.95)]"
            />

            {/* Translucent Glass Arrow Button right beside the logo */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => setIsFormOpen(true)}
              aria-label="Open Login Portal"
              title="Click to Sign In"
              className="group relative flex items-center justify-center size-14 sm:size-16 rounded-2xl bg-white/[0.08] hover:bg-white/[0.16] active:bg-white/[0.2] backdrop-blur-2xl border border-white/20 hover:border-blue-400/80 shadow-[0_10px_35px_rgba(0,0,0,0.7),0_0_24px_rgba(37,99,235,0.3)] transition-all duration-300 cursor-pointer"
            >
              <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300 drop-shadow-md" />
            </motion.button>
          </motion.div>
        ) : (
          /* Step 2: Centered Transparent Glass Login Form Card (Logo vanishes, Card in Mid) */
          <motion.div
            key="login-form-center"
            initial={{ opacity: 0, scale: 0.9, y: 18, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, y: -18, filter: "blur(12px)" }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col items-center justify-center w-full max-w-md my-auto"
          >
            {/* Subtle Back Button to toggle back to Logo view */}
            <div className="w-full flex justify-between items-center mb-3 px-1">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer drop-shadow-sm group"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                <span>Back</span>
              </button>
            </div>

            {/* Glassmorphic Login Form */}
            <LoginForm
              onSubmit={onSubmit}
              onGoogleSignIn={onGoogleSignIn}
              availableUsers={availableUsers}
              errorMessage={errorMessage}
            />

            {/* Footer */}
            <p className="mt-5 text-center text-xs text-white/80 font-medium tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
              © 2026 NetBounce Placement LLC. All rights reserved.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default LoginScreen;
