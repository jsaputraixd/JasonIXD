"use client";

import { useEffect, useRef } from "react";

function youtubeVideoId(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const trimmed = url.trim();
    const u = trimmed.startsWith("http")
      ? new URL(trimmed)
      : new URL(trimmed, "https://www.youtube.com");
    if (u.hostname.replace("www.", "") === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id || null;
    }
    const v = u.searchParams.get("v");
    if (v) return v;
    const m = u.pathname.match(/\/embed\/([^/?]+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/**
 * File videos: viewport-capped so a clip fits one screen; side-by-side from sm+.
 * YouTube embeds capped and centered below file section.
 */
export default function CaseStudyVideos({
  videos,
  frameStyle,
  title = "Interaction demos",
  intro,
}) {
  const fileItems = (videos ?? []).filter((v) => v.kind === "file" && v.src);
  const youtubeItems = (videos ?? []).filter((v) => {
    if (v.kind !== "youtube" || !v.url) return false;
    return Boolean(youtubeVideoId(v.url));
  });

  const scrollPlayRef = useRef(null);

  useEffect(() => {
    const root = scrollPlayRef.current;
    if (!root) return;
    const els = [...root.querySelectorAll("video")];
    if (!els.length) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        const on = entry.isIntersecting && entry.intersectionRatio >= 0.12;
        els.forEach((v) => {
          if (on) {
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        });
      },
      { threshold: [0, 0.12, 0.25], rootMargin: "0px 0px -8% 0px" }
    );

    io.observe(root);
    return () => io.disconnect();
  }, [fileItems.length]);

  if (!fileItems.length && !youtubeItems.length) return null;

  const labelStyle = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: "#888",
    margin: "0 0 10px",
  };

  const cellFrame = {
    ...frameStyle,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };

  const isMulti = fileItems.length >= 2;
  /** Portrait app demos stay narrow; landscape clips (layout: "wide") fill the column. */
  const fileMaxWidth = (item) => {
    if (isMulti) return "min(100%, 380px)";
    if (item.layout === "wide") return "min(100%, 1100px)";
    return "min(100%, 400px)";
  };
  const fileMaxHeight = (item) => {
    if (isMulti) return "min(48vh, 500px)";
    if (item.layout === "wide") return "min(78vh, 820px)";
    return "min(calc(100dvh - 240px), 640px)";
  };

  return (
    <div className="mt-16">
      <h2
        className="m-0"
        style={{
        fontFamily: "'VT323', monospace",
        fontSize: 26,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "#FF7A29",
        textShadow: "0 0 10px rgba(255,122,41,0.4)",
        marginBottom: 16,
        lineHeight: 1.15,
        }}
      >
        {title}
      </h2>

      {intro ? (
        <p
          className="m-0 mb-4 case-study-prose"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 18,
            color: "#bbb",
            lineHeight: 1.8,
          }}
        >
          {intro}
        </p>
      ) : null}

      {fileItems.length > 0 ? (
        <>
          {!intro ? (
            <p
              className="m-0 mb-3"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: "#666",
                lineHeight: 1.5,
              }}
            >
              Autoplays muted when visible. Unmute or scrub with the controls.
            </p>
          ) : null}
          <div
            ref={scrollPlayRef}
            className={
              fileItems.length >= 2
                ? "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full"
                : "w-full flex justify-center"
            }
          >
            {fileItems.map((item, i) => {
              const maxWidth = fileMaxWidth(item);
              const maxHeight = fileMaxHeight(item);
              const wide = item.layout === "wide";
              return (
              <div
                key={`${item.src}-${i}`}
                style={{
                  ...cellFrame,
                  width: "100%",
                  maxWidth,
                  margin: isMulti || wide ? "0 auto" : undefined,
                }}
              >
                <p style={{ ...labelStyle, padding: "10px 12px 0" }}>
                  {item.label || `Clip ${i + 1}`}
                </p>
                <div
                  className="case-study-video-stage flex items-center justify-center"
                  style={{
                    background: "#0a0a0a",
                    maxHeight,
                    minHeight: isMulti
                      ? "min(36vh, 320px)"
                      : wide
                        ? undefined
                        : "min(52vh, 420px)",
                  }}
                >
                  <video
                    controls
                    muted
                    playsInline
                    preload="metadata"
                    className="case-study-video"
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight,
                      objectFit: "contain",
                      display: "block",
                    }}
                  >
                    <source src={encodeURI(item.src)} />
                  </video>
                </div>
              </div>
              );
            })}
          </div>
        </>
      ) : null}

      {youtubeItems.length > 0 ? (
        <div
          className={`flex flex-col gap-10 ${fileItems.length > 0 ? "mt-10" : ""}`}
        >
          {youtubeItems.map((item, i) => {
            const id = youtubeVideoId(item.url);
            const label = item.label || `Video ${i + 1}`;
            return (
              <div key={`${item.url}-${i}`} className="w-full flex justify-center">
                <div style={{ width: "100%", maxWidth: "min(100%, 840px)" }}>
                  <p style={labelStyle}>{label}</p>
                  <div
                    style={{
                      ...frameStyle,
                      aspectRatio: "16 / 9",
                      position: "relative",
                      width: "100%",
                    }}
                  >
                    <iframe
                      title={label}
                      src={`https://www.youtube.com/embed/${id}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        border: "none",
                        display: "block",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
