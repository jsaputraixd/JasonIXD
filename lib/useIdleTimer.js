"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Returns true after `delayMs` without user activity.
 * Resets on pointer, keyboard, scroll, or touch.
 */
export function useIdleTimer(delayMs, enabled = true) {
  const [idle, setIdle] = useState(false);
  const timerRef = useRef(null);
  const idleRef = useRef(false);

  const arm = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (idleRef.current) {
      idleRef.current = false;
      setIdle(false);
    }
    if (!enabled) return;
    timerRef.current = setTimeout(() => {
      idleRef.current = true;
      setIdle(true);
    }, delayMs);
  }, [delayMs, enabled]);

  useEffect(() => {
    idleRef.current = idle;
  }, [idle]);

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) clearTimeout(timerRef.current);
      idleRef.current = false;
      setIdle(false);
      return;
    }

    const activityEvents = ["pointerdown", "keydown", "wheel", "touchstart"];
    activityEvents.forEach((e) =>
      window.addEventListener(e, arm, { passive: true })
    );

    const onPointerMove = () => {
      if (idleRef.current) arm();
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    arm();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      activityEvents.forEach((e) =>
        window.removeEventListener(e, arm)
      );
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [enabled, arm]);

  return idle;
}
