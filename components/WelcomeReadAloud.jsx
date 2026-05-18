"use client";

import { useCallback } from "react";
import { about } from "@/data/about";
import {
  SpeakerGlyph,
  ReadAloudPortal,
  useReadAloud,
  READ_ALOUD_ACCENT,
} from "./ReadAloudShared";

function buildWelcomeScript() {
  return [
    "Hello.",
    about.name,
    about.title,
    about.bio.replace(/\s+/g, " ").trim(),
    "Dream, think, build.",
  ]
    .filter(Boolean)
    .join(". ");
}

/**
 * Speaker control + floating stop panel for welcome copy (desktop window title bar or mobile card header).
 */
export default function WelcomeReadAloud({ compact = false }) {
  const { busy, supported, mounted, speak, stop } = useReadAloud();

  const play = useCallback(() => {
    if (busy) return;
    speak(buildWelcomeScript());
  }, [busy, speak]);

  if (!supported) return null;

  const btnW = compact ? 30 : 40;
  const btnH = compact ? 26 : 36;
  const glyph = compact ? 16 : 20;

  return (
    <>
      <button
        type="button"
        data-cursor="hover"
        aria-label={
          busy
            ? "Reading aloud — use the stop window"
            : "Read welcome message aloud"
        }
        aria-busy={busy}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={play}
        disabled={busy}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: btnW,
          height: btnH,
          padding: 0,
          background: "rgba(12, 8, 5, 0.88)",
          border: `1px solid ${READ_ALOUD_ACCENT}80`,
          borderRadius: 2,
          cursor: busy ? "default" : "pointer",
          opacity: busy ? 0.55 : 1,
          boxShadow: "0 0 10px rgba(255, 122, 41, 0.12)",
          flexShrink: 0,
        }}
      >
        <SpeakerGlyph size={glyph} active={busy} />
      </button>
      <ReadAloudPortal
        mounted={mounted}
        busy={busy}
        stop={stop}
        panelTitle="welcome.exe"
        floatKey="welcome-read-aloud-float"
      />
    </>
  );
}
