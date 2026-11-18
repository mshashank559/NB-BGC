'use client';

import React from 'react';
import { GradientOrb } from '@/components/ui/gradient-orb';

interface ParallaxContainerProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark';
}

export const ParallaxContainer: React.FC<ParallaxContainerProps> = ({ children, theme = 'light' }) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`h-screen w-full transition-colors duration-500 overflow-hidden relative ${
        isDark ? 'dark bg-[#0B1120] text-slate-100' : 'bg-[#F4F7FF] text-slate-900'
      }`}
    >
      {/* 3D Dark Blue & White Gradient Orb Shader Background */}
      <div
        className={`fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-700 ${
          isDark ? 'opacity-85' : 'opacity-75'
        }`}
      >
        <GradientOrb
          config={
            isDark
              ? {
                  transparent: true,
                  background: 'transparent',
                  color0: '#2563eb', // Royal Blue
                  color1: '#070f26', // Deep Midnight Navy
                  color2: '#ffffff', // Bright Pure White
                  color3: '#020617', // Shadow Black
                  noiseScale: 0.65,
                  rotationSpeed: 0.22,
                  innerRadius: 0.12,
                }
              : {
                  transparent: true,
                  background: 'transparent',
                  color0: '#1d4ed8', // Dark Royal Blue
                  color1: '#1e3a8a', // Deep Navy Blue
                  color2: '#ffffff', // Pure White Glow
                  color3: '#bfdbfe', // Soft Ice Blue Blend
                  noiseScale: 0.65,
                  rotationSpeed: 0.22,
                  innerRadius: 0.12,
                }
          }
        />
      </div>

      {/* Subtle Ambient Radial Lighting for Additional Depth */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        {/* Soft Radial Blue Glow Top Left */}
        <div
          className={`absolute -top-[12%] left-[18%] w-[600px] h-[600px] rounded-full blur-[140px] transition-all duration-700 ${
            isDark
              ? 'bg-gradient-to-br from-blue-600/18 via-indigo-600/12 to-transparent'
              : 'bg-gradient-to-br from-blue-400/9 via-indigo-400/7 to-transparent'
          }`}
        />
        {/* Soft Radial Violet Glow Top Right */}
        <div
          className={`absolute top-[20%] -right-[6%] w-[520px] h-[520px] rounded-full blur-[130px] transition-all duration-700 ${
            isDark
              ? 'bg-gradient-to-bl from-indigo-500/15 via-violet-600/12 to-transparent'
              : 'bg-gradient-to-bl from-indigo-300/8 via-violet-400/6 to-transparent'
          }`}
        />
      </div>

      <div className="relative z-10 w-full flex flex-col h-screen overflow-hidden">
        {children}
      </div>
    </div>
  );
};
