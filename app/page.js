"use client";

import Desktop from "@/components/Desktop";

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
