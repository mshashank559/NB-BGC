'use client';

import React, { useEffect, useState, useRef } from 'react';

interface CountUpProps {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number; // in seconds
  triggerKey?: any;
  decimals?: number;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  end,
  prefix = '',
  suffix = '',
  duration = 0.8,
  triggerKey,
  decimals = 0,
  className = '',
}) => {
  const [val, setVal] = useState<number>(end);
  const prevValRef = useRef<number>(end);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animId: number;
    const startVal = prevValRef.current;
    const durationMs = duration * 1000;

    // If values are identical, no animation needed
    if (startVal === end) {
      setVal(end);
      return;
    }

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      // High-grade easeOutQuart curve for organic acceleration/deceleration
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = startVal + (end - startVal) * ease;
      setVal(current);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setVal(end);
        prevValRef.current = end;
      }
    };

    animId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(animId);
      prevValRef.current = end;
    };
  }, [end, triggerKey, duration]);

  const formatted =
    decimals > 0
      ? val.toFixed(decimals)
      : Math.round(val).toLocaleString();

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
