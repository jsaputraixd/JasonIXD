"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Returns true after `delayMs` without user activity.
 * Resets on pointer, keyboard, scroll, or touch.
 */
export function useIdleTimer(delayMs, enabled = true) {
  const [idle, setIdle] = useState(false);
  const timerRef = useRef(null);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIdle(false);
    if (!enabled) return;
    timerRef.current = setTimeout(() => setIdle(true), delayMs);
  }, [delayMs, enabled]);

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIdle(false);
      return;
    }

    const events = [
      "pointerdown",
      "pointermove",
      "keydown",
      "wheel",
      "touchstart",
    ];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [enabled, reset]);

  return idle;
}
