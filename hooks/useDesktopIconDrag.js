"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clampIconPosition,
  readIconOffset,
  writeIconOffset,
} from "@/lib/desktopIconPositions";
import { playWindowDrop, playWindowPickup } from "@/lib/typingSound";

const DRAG_THRESHOLD = 6;
const STATUS_BAR_CLEARANCE = 108;

/**
 * Click-and-drag desktop icon positioning with persisted offsets.
 */
export function useDesktopIconDrag({
  iconId,
  baseLeft,
  baseTop,
  width = 76,
  height = 96,
  stageRef,
  onFocus,
  onOffsetChange,
}) {
  const [offset, setOffset] = useState(() => readIconOffset(iconId));
  const [isDragging, setIsDragging] = useState(false);

  const dragRef = useRef(null);
  const wasDraggedRef = useRef(false);
  const pickupPlayedRef = useRef(false);

  useEffect(() => {
    setOffset(readIconOffset(iconId));
  }, [iconId, baseLeft, baseTop]);

  const left = baseLeft + offset.dx;
  const top = baseTop + offset.dy;

  const commitOffset = useCallback(
    (next) => {
      setOffset(next);
      writeIconOffset(iconId, next);
      onOffsetChange?.(next);
    },
    [iconId, onOffsetChange]
  );

  const onPointerDown = useCallback(
    (event) => {
      if (event.button !== 0) return;
      onFocus?.();
      wasDraggedRef.current = false;
      pickupPlayedRef.current = false;
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originDx: offset.dx,
        originDy: offset.dy,
        dragging: false,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [offset.dx, offset.dy, onFocus]
  );

  const onPointerMove = useCallback(
    (event) => {
      const d = dragRef.current;
      if (!d || d.pointerId !== event.pointerId) return;

      const dx = event.clientX - d.startX;
      const dy = event.clientY - d.startY;

      if (!d.dragging) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        d.dragging = true;
        wasDraggedRef.current = true;
        setIsDragging(true);
        if (!pickupPlayedRef.current) {
          pickupPlayedRef.current = true;
          playWindowPickup();
        }
      }

      const stage = stageRef?.current?.getBoundingClientRect();
      const stageWidth = stage?.width ?? window.innerWidth;
      const stageHeight = stage?.height ?? window.innerHeight;

      const nextLeft = baseLeft + d.originDx + dx;
      const nextTop = baseTop + d.originDy + dy;
      const clamped = clampIconPosition({
        left: nextLeft,
        top: nextTop,
        width,
        height,
        stageWidth,
        stageHeight,
        statusBarClearance: STATUS_BAR_CLEARANCE,
      });

      commitOffset({
        dx: clamped.left - baseLeft,
        dy: clamped.top - baseTop,
      });
    },
    [baseLeft, baseTop, commitOffset, height, stageRef, width]
  );

  const endDrag = useCallback(
    (event) => {
      const d = dragRef.current;
      if (!d || d.pointerId !== event.pointerId) return;

      if (d.dragging) {
        playWindowDrop();
      }

      dragRef.current = null;
      setIsDragging(false);

      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        /* already released */
      }
    },
    []
  );

  const onPointerUp = useCallback(
    (event) => {
      endDrag(event);
    },
    [endDrag]
  );

  const onPointerCancel = useCallback(
    (event) => {
      endDrag(event);
    },
    [endDrag]
  );

  const consumeClickIfDragged = useCallback(() => {
    if (wasDraggedRef.current) {
      wasDraggedRef.current = false;
      return true;
    }
    return false;
  }, []);

  return {
    left,
    top,
    offset,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    consumeClickIfDragged,
  };
}
