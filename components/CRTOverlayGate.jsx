"use client";

import { usePathname } from "next/navigation";
import CRTOverlay from "@/components/CRTOverlay";

/** CRT bezel/scanlines — desktop home only; hidden on mobile via `.crt-overlay` CSS. */
export default function CRTOverlayGate() {
  const pathname = usePathname();
  if (pathname?.startsWith("/work/")) return null;
  return <CRTOverlay />;
}
