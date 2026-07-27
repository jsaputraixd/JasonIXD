"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import PortfolioErrorBoundary from "@/components/PortfolioErrorBoundary";
import MobileDesktop from "@/components/mobile/MobileDesktop";

const MOBILE_BREAK = 900;

function PortfolioLoading() {
  return (
    <div
      className="relative crt-tilt flex items-center justify-center w-full"
      style={{ minHeight: "100dvh", background: "#0a0604" }}
      aria-busy="true"
      aria-label="Loading portfolio"
    >
      <p
        style={{
          fontFamily: "'VT323', monospace",
          color: "#FF7A29",
          letterSpacing: "0.2em",
          fontSize: 14,
        }}
      >
        LOADING JS-OS...
      </p>
    </div>
  );
}

const Desktop = dynamic(() => import("@/components/Desktop"), {
  ssr: false,
  loading: PortfolioLoading,
});

export default function Home() {
  const [isMobile, setIsMobile] = useState(null);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAK - 1}px)`);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (isMobile === null) {
    return (
      <main className="relative crt-tilt portfolio-main">
        <PortfolioLoading />
      </main>
    );
  }

  return (
    <main
      className="relative crt-tilt portfolio-main"
      style={
        isMobile
          ? { minHeight: "100dvh", overflow: "visible" }
          : { height: "100%", overflow: "hidden" }
      }
    >
      <PortfolioErrorBoundary>
        {isMobile ? <MobileDesktop /> : <Desktop />}
      </PortfolioErrorBoundary>
    </main>
  );
}
