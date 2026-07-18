"use client";

import { useCallback } from "react";
import { getListenCatalogEntry } from "@/data/listenScripts";
import { listenAudioSrc } from "@/lib/listenAudio";
import {
  SpeakerGlyph,
  ReadAloudPortal,
  useReadAloud,
  READ_ALOUD_ACCENT,
  READ_ALOUD_ACCENT_DIM,
} from "./ReadAloudShared";

export default function ProjectPageListen({ project }) {
  const { busy, supported, mounted, speak, stop, voiceLabel } = useReadAloud();
  const entry = getListenCatalogEntry(project.slug);

  const speakPage = useCallback(() => {
    if (busy || !entry?.text) return;
    speak({
      text: entry.text,
      audioSrc: listenAudioSrc(project.slug),
    });
  }, [busy, speak, entry, project.slug]);

  const tagStyle = {
    border: "1px solid rgba(255,122,41,0.5)",
    color: "#FF7A29",
    fontFamily: "'VT323', monospace",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: "0.2em",
    borderRadius: 2,
    padding: "2px 10px",
    textShadow: "0 0 6px rgba(255,122,41,0.35)",
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "10px 14px",
          marginTop: 16,
        }}
      >
        <ul
          className="list-none p-0 m-0 flex flex-wrap gap-2"
          style={{ margin: 0, padding: 0, listStyle: "none" }}
        >
          {project.tags.map((t) => (
            <li key={t} style={tagStyle}>
              {t}
            </li>
          ))}
        </ul>

        {supported && (
          <>
            <span
              aria-hidden
              style={{
                color: READ_ALOUD_ACCENT_DIM,
                opacity: 0.5,
                fontFamily: "'VT323', monospace",
                fontSize: 18,
                lineHeight: 1,
                userSelect: "none",
              }}
            >
              ·
            </span>
            <button
              type="button"
              data-cursor="hover"
              aria-label={
                busy
                  ? "Reading aloud — open stop window at corner"
                  : "Read this page aloud"
              }
              aria-busy={busy}
              onClick={speakPage}
              disabled={busy}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 36,
                padding: 0,
                background: "rgba(12, 8, 5, 0.88)",
                border: `1px solid ${READ_ALOUD_ACCENT}80`,
                borderRadius: 2,
                cursor: busy ? "default" : "pointer",
                opacity: busy ? 0.55 : 1,
                boxShadow: "0 0 12px rgba(255, 122, 41, 0.12)",
              }}
            >
              <SpeakerGlyph size={20} active={busy} />
            </button>
          </>
        )}
      </div>

      <ReadAloudPortal
        mounted={mounted}
        busy={busy}
        stop={stop}
        panelTitle="listen.exe"
        subtitle={voiceLabel}
      />
    </>
  );
}
