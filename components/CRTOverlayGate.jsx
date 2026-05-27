"use client";

import { usePathname } from "next/navigation";
import CRTOverlay from "@/components/CRTOverlay";

/** CRT bezel/scanlines — desktop home only; case studies stay clean for reading. */
export default function CRTOverlayGate() {
  const pathname = usePathname();
  if (pathname?.startsWith("/work/")) return null;
  return <CRTOverlay />;
}
