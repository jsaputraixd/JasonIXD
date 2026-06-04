"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readIconOffset, writeIconOffset, clampIconPosition } from "@/lib/desktopIconPositions";
import {
  getBinEjectVelocity,
  getBinSpawnPosition,
  runThrowablePhysics,
  velocityFromPointerSamples,
} from "@/lib/desktopThrowablePhysics";
import { playWindowDrop, playWindowPickup } from "@/lib/typingSound";

const DRAG_THRESHOLD = 8;
const MAX_VELOCITY_SAMPLES = 12;
const STATUS_BAR_CLEARANCE = 108;

/**
 * Coffee cup with pick-up, flick-to-throw, and bouncy desktop physics.
 */
export function useThrowableCoffeeIcon({
  iconId,
  baseLeft,
  baseTop,
  width = 76,
  height = 96,
  stageRef,
  onFocus,
  onOffsetChange,
}) {
  const [frame, setFrame] = useState(() => {
    const off = readIconOffset(iconId);
    return {
      left: baseLeft + off.dx,
      top: baseTop + off.dy,
      rotation: 0,
    };
  });
  const [phase, setPhase] = useState("idle"); // idle | held | flying

  const dragRef = useRef(null);
  const wasThrownRef = useRef(false);
  const cancelPhysicsRef = useRef(null);
  const samplesRef = useRef([]);
  const frameRef = useRef(frame);
  frameRef.current = frame;

  const launchRef = useRef(null);
  const commitRef = useRef(null);

  useEffect(() => {
    const off = readIconOffset(iconId);
    setFrame({
      left: baseLeft + off.dx,
      top: baseTop + off.dy,
      rotation: 0,
    });
  }, [iconId, baseLeft, baseTop]);

  const getBounds = useCallback(() => {
    const stage = stageRef?.current?.getBoundingClientRect();
    return {
      width,
      height,
      stageWidth: stage?.width ?? window.innerWidth,
      stageHeight: stage?.height ?? window.innerHeight,
    };
  }, [height, stageRef, width]);

  const commitPosition = useCallback(
    (left, top, rotation = frameRef.current.rotation) => {
      const offset = {
        dx: Math.round(left - baseLeft),
        dy: Math.round(top - baseTop),
      };
      writeIconOffset(iconId, offset);
      onOffsetChange?.(offset);
      setFrame({ left, top, rotation });
    },
    [baseLeft, baseTop, iconId, onOffsetChange]
  );
  commitRef.current = commitPosition;

  const stopPhysics = useCallback(() => {
    cancelPhysicsRef.current?.();
    cancelPhysicsRef.current = null;
  }, []);

  const launch = useCallback(
    ({ left, top, vx, vy, rotation = 0, angularVelocity = 0 }) => {
      stopPhysics();
      setPhase("flying");
      setFrame({ left, top, rotation });

      cancelPhysicsRef.current = runThrowablePhysics({
        left,
        top,
        vx,
        vy,
        rotation,
        angularVelocity,
        bounds: getBounds(),
        onFrame: (next) => setFrame(next),
        onSettle: (final) => {
          setPhase("idle");
          commitRef.current?.(final.left, final.top, final.rotation);
          cancelPhysicsRef.current = null;
        },
      });
    },
    [getBounds, stopPhysics]
  );
  launchRef.current = launch;

  const launchFromBin = useCallback(
    ({ binLeft, binTop, binWidth }) => {
      const spawn = getBinSpawnPosition({
        binLeft,
        binTop,
        binWidth,
        cupWidth: width,
        cupHeight: height,
      });
      const { vx, vy, angularVelocity } = getBinEjectVelocity();
      launch({ ...spawn, vx, vy, rotation: 0, angularVelocity });
    },
    [height, launch, width]
  );

  const detachWindowListeners = useCallback(() => {
    const d = dragRef.current;
    if (!d?.windowMove || !d?.windowUp) return;
    window.removeEventListener("pointermove", d.windowMove);
    window.removeEventListener("pointerup", d.windowUp);
    window.removeEventListener("pointercancel", d.windowUp);
    d.windowMove = null;
    d.windowUp = null;
  }, []);

  const snapTo = useCallback(
    (left, top, rotation = 0) => {
      stopPhysics();
      detachWindowListeners();
      dragRef.current = null;
      setPhase("idle");
      commitPosition(left, top, rotation);
    },
    [commitPosition, detachWindowListeners, stopPhysics]
  );

  const onPointerDown = useCallback(
    (event) => {
      if (event.button !== 0 || phase === "flying") return;

      stopPhysics();
      onFocus?.();
      wasThrownRef.current = false;

      const stage = stageRef?.current?.getBoundingClientRect();
      if (!stage) return;

      const { left, top } = frameRef.current;

      const windowMove = (moveEvent) => {
        const drag = dragRef.current;
        if (!drag || moveEvent.pointerId !== drag.pointerId) return;

        const stageRect = stageRef?.current?.getBoundingClientRect();
        if (!stageRect) return;

        const nextLeft = moveEvent.clientX - stageRect.left - drag.grabOffsetX;
        const nextTop = moveEvent.clientY - stageRect.top - drag.grabOffsetY;
        const clamped = clampIconPosition({
          left: nextLeft,
          top: nextTop,
          width,
          height,
          stageWidth: stageRect.width,
          stageHeight: stageRect.height,
          statusBarClearance: STATUS_BAR_CLEARANCE,
        });

        const dx = moveEvent.clientX - drag.startClientX;
        const dy = moveEvent.clientY - drag.startClientY;
        if (!drag.moved && Math.hypot(dx, dy) >= DRAG_THRESHOLD) {
          drag.moved = true;
          wasThrownRef.current = true;
        }

        const now = performance.now();
        samplesRef.current.push({
          x: moveEvent.clientX,
          y: moveEvent.clientY,
          t: now,
        });
        if (samplesRef.current.length > MAX_VELOCITY_SAMPLES) {
          samplesRef.current.shift();
        }

        const tilt = drag.moved ? Math.max(-18, Math.min(18, dx * 0.06)) : 0;
        setFrame({ left: clamped.left, top: clamped.top, rotation: tilt });
      };

      const windowUp = (upEvent) => {
        const drag = dragRef.current;
        if (!drag || upEvent.pointerId !== drag.pointerId) return;

        detachWindowListeners();
        dragRef.current = null;
        setPhase("idle");

        if (drag.moved) {
          playWindowDrop();
          const { vx, vy } = velocityFromPointerSamples(samplesRef.current);
          const speed = Math.hypot(vx, vy);
          const current = frameRef.current;

          if (speed > 120) {
            launchRef.current?.({
              left: current.left,
              top: current.top,
              vx,
              vy,
              rotation: current.rotation,
              angularVelocity: vx * 0.008,
            });
          } else {
            commitRef.current?.(current.left, current.top, current.rotation);
          }
        }

        samplesRef.current = [];
      };

      dragRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        grabOffsetX: event.clientX - stage.left - left,
        grabOffsetY: event.clientY - stage.top - top,
        moved: false,
        windowMove,
        windowUp,
      };

      samplesRef.current = [
        { x: event.clientX, y: event.clientY, t: performance.now() },
      ];

      setPhase("held");
      playWindowPickup();

      window.addEventListener("pointermove", windowMove);
      window.addEventListener("pointerup", windowUp);
      window.addEventListener("pointercancel", windowUp);

      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [detachWindowListeners, height, onFocus, phase, stageRef, stopPhysics, width]
  );

  const consumeClickIfThrown = useCallback(() => {
    if (wasThrownRef.current) {
      wasThrownRef.current = false;
      return true;
    }
    return false;
  }, []);

  useEffect(
    () => () => {
      stopPhysics();
      detachWindowListeners();
    },
    [detachWindowListeners, stopPhysics]
  );

  return {
    left: frame.left,
    top: frame.top,
    rotation: frame.rotation,
    phase,
    isDragging: phase === "held",
    isFlying: phase === "flying",
    launchFromBin,
    snapTo,
    stopPhysics,
    onPointerDown,
    consumeClickIfThrown,
  };
}
