"use client";

import IdleScreensaver, { IDLE_MS } from "./IdleScreensaver";
import { useIdleTimer } from "@/lib/useIdleTimer";

/** Mounted only on desktop dashboard — keeps idle listeners off the boot path. */
export default function DesktopIdleLayer() {
  const screensaverActive = useIdleTimer(IDLE_MS, true);
  return <IdleScreensaver active={screensaverActive} />;
}
