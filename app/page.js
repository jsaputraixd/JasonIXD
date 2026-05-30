"use client";

import dynamic from "next/dynamic";

const Desktop = dynamic(() => import("@/components/Desktop"), {
  ssr: false,
  loading: () => (
    <div
      className="relative crt-tilt flex items-center justify-center w-full h-full"
      style={{ background: "#0a0604" }}
      aria-busy="true"
      aria-label="Loading portfolio desktop"
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
  ),
});

export default function Home() {
  return (
    <main
      className="relative crt-tilt"
      style={{ height: "100%", overflow: "hidden" }}
    >
      <Desktop />
    </main>
  );
}
