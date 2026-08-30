"use client";

import { useEffect, useRef, useState } from "react";

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

function playUnmuted(video, reducedMotion) {
  if (!video || reducedMotion) return;
  video.muted = false;
  video.volume = 1;
  const start = () => {
    video.muted = false;
    video.volume = 1;
    video.play().catch(() => {
      const unlock = () => {
        video.muted = false;
        video.volume = 1;
        video.play().catch(() => {});
      };
      window.addEventListener("pointerdown", unlock, { once: true });
      window.addEventListener("keydown", unlock, { once: true });
    });
  };
  if (video.readyState >= 2) start();
  else video.addEventListener("canplay", start, { once: true });
}

function VideoDeck({ items, frameStyle }) {
  const [index, setIndex] = useState(0);
  const rootRef = useRef(null);
  const videoRefs = useRef([]);
  const indexRef = useRef(0);
  const reduce = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  indexRef.current = index;

  const goTo = (next, { play = true } = {}) => {
    const clamped = Math.max(0, Math.min(items.length - 1, next));
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i !== clamped) {
        video.pause();
        video.currentTime = 0;
      }
    });
    setIndex(clamped);
    if (play) {
      const video = videoRefs.current[clamped];
      if (video) {
        video.currentTime = 0;
        playUnmuted(video, reduce);
      }
    }
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let inView = false;

    const onEnded = (event) => {
      const current = videoRefs.current.indexOf(event.currentTarget);
      if (current < 0 || current >= items.length - 1) return;
      goTo(current + 1);
    };

    videoRefs.current.forEach((video) => {
      if (video) video.addEventListener("ended", onEnded);
    });

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (inView) return;
          inView = true;
          goTo(indexRef.current, { play: !reduce });
        } else {
          inView = false;
          videoRefs.current.forEach((video) => video?.pause());
        }
      },
      { threshold: 0.22, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(root);

    return () => {
      io.disconnect();
      videoRefs.current.forEach((video) => {
        if (video) video.removeEventListener("ended", onEnded);
      });
    };
  }, [items.length]);

  const trackShift =
    index === 0 ? "0px" : "calc(-90% - 12px + 10%)";

  return (
    <div
      ref={rootRef}
      className="case-study-deck"
      aria-roledescription="carousel"
      aria-label="Tama interaction demos"
    >
      <p className="case-study-deck__label">{items[index]?.label}</p>
      <div className="case-study-deck__viewport">
        <div
          className="case-study-deck__track"
          style={{ transform: `translateX(${trackShift})` }}
        >
          {items.map((item, i) => (
            <div
              key={`${item.src}-${i}`}
              className={`case-study-deck__slide${i === index ? " is-on" : ""}`}
              style={frameStyle}
            >
              <video
                ref={(node) => {
                  videoRefs.current[i] = node;
                }}
                src={encodeURI(item.src)}
                controls={i === index}
                muted={false}
                playsInline
                preload="auto"
                poster={item.poster ? encodeURI(item.poster) : undefined}
                data-autoplay-sound="true"
                aria-label={item.label}
              />
              {i !== index ? (
                <button
                  type="button"
                  className="case-study-deck__peek"
                  onClick={() => goTo(i)}
                  aria-label={`Show ${item.label}`}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
      <div className="case-study-deck__nav" role="tablist" aria-label="Demo clips">
        {items.map((item, i) => (
          <button
            key={`dot-${item.src}`}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={item.label}
            className={`case-study-deck__dot${i === index ? " is-on" : ""}`}
            onClick={() => goTo(i)}
          />
        ))}
        <span className="case-study-deck__count">
          {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
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
  hideHeader = false,
}) {
  const fileItems = (videos ?? []).filter((v) => v.kind === "file" && v.src);
  const youtubeItems = (videos ?? []).filter((v) => {
    if (v.kind !== "youtube" || !v.url) return false;
    return Boolean(youtubeVideoId(v.url));
  });

  const scrollPlayRef = useRef(null);
  const soundQueue = fileItems.some((item) => item.autoplaySound);
  const isDeck =
    fileItems.length >= 2 &&
    fileItems.every((item) => item.autoplaySound && item.layout === "wide");

  useEffect(() => {
    if (isDeck) return;
    const root = scrollPlayRef.current;
    if (!root) return;
    const els = [...root.querySelectorAll("video")];
    if (!els.length) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const soundEls = els.filter((video) => video.dataset.autoplaySound === "true");
    const quietEls = els.filter((video) => video.dataset.autoplaySound !== "true");

    const unlockers = [];

    const playWhenReady = (video, { sound = false } = {}) => {
      if (reducedMotion) return;
      const start = () => {
        if (sound) {
          video.muted = false;
          video.volume = 1;
        }
        const attempt = video.play();
        if (attempt && sound) {
          attempt.catch(() => {
            const unlock = () => {
              video.muted = false;
              video.volume = 1;
              video.play().catch(() => {});
              window.removeEventListener("pointerdown", unlock);
              window.removeEventListener("keydown", unlock);
            };
            unlockers.push(unlock);
            window.addEventListener("pointerdown", unlock, { once: true });
            window.addEventListener("keydown", unlock, { once: true });
          });
        }
      };
      if (video.readyState >= 2) start();
      else video.addEventListener("canplay", start, { once: true });
    };

    const startSoundQueue = () => {
      soundEls.forEach((video, i) => {
        video.pause();
        if (i > 0) video.currentTime = 0;
      });
      const first = soundEls[0];
      if (!first) return;
      first.currentTime = 0;
      playWhenReady(first, { sound: true });
    };

    const onEnded = (event) => {
      const index = soundEls.indexOf(event.currentTarget);
      const next = soundEls[index + 1];
      if (!next) return;
      next.currentTime = 0;
      next.scrollIntoView({ behavior: "smooth", block: "center" });
      playWhenReady(next, { sound: true });
    };

    soundEls.forEach((video) => video.addEventListener("ended", onEnded));

    if (reducedMotion) {
      els.forEach((video) => video.pause());
      return () => {
        soundEls.forEach((video) => video.removeEventListener("ended", onEnded));
      };
    }

    let inView = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (inView) return;
          inView = true;
          quietEls.forEach((video) => playWhenReady(video));
          if (soundEls.length) startSoundQueue();
        } else {
          inView = false;
          els.forEach((video) => video.pause());
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    io.observe(root);

    return () => {
      io.disconnect();
      soundEls.forEach((video) => video.removeEventListener("ended", onEnded));
      unlockers.forEach((unlock) => {
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("keydown", unlock);
      });
    };
  }, [fileItems.length, isDeck]);

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

  const allWide =
    fileItems.length > 0 && fileItems.every((item) => item.layout === "wide");
  const isTileGrid =
    fileItems.length >= 3 && fileItems.every((item) => item.layout === "tile");
  const isMulti = fileItems.length >= 2 && !allWide && !isTileGrid;
  /** Portrait app demos stay narrow; landscape clips (layout: "wide") fill the column. */
  const fileMaxWidth = (item) => {
    if (item.layout === "tile") return "100%";
    if (item.layout === "wide") return "min(100%, 1100px)";
    if (isMulti) return "min(100%, 380px)";
    return "min(100%, 400px)";
  };
  const fileMaxHeight = (item) => {
    if (item.layout === "tile") return "min(34vh, 300px)";
    if (isMulti) return "min(48vh, 500px)";
    if (item.layout === "wide") return "min(78vh, 820px)";
    return "min(calc(100dvh - 240px), 640px)";
  };

  return (
    <div className={hideHeader ? "" : "mt-16"}>
      {!hideHeader ? (
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
      ) : null}

      {intro && !hideHeader ? (
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
              {soundQueue
                ? "Plays with sound when you reach it."
                : "Autoplays muted when visible. Unmute or scrub with the controls."}
            </p>
          ) : null}
          {isDeck ? (
            <VideoDeck items={fileItems} frameStyle={frameStyle} />
          ) : (
          <div
            ref={scrollPlayRef}
            className={
              isTileGrid
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full"
                : fileItems.length >= 2
                  ? "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full"
                  : "w-full flex justify-center"
            }
          >
            {fileItems.map((item, i) => {
              const maxWidth = fileMaxWidth(item);
              const maxHeight = fileMaxHeight(item);
              const wide = item.layout === "wide";
              const tile = item.layout === "tile";
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
                  className="case-study-video-stage"
                  style={{
                    background: "#0a0a0a",
                    width: "100%",
                  }}
                >
                  <video
                    src={encodeURI(item.src)}
                    controls
                    muted={!item.autoplaySound}
                    playsInline
                    loop={Boolean(item.loop)}
                    preload="auto"
                    poster={item.poster ? encodeURI(item.poster) : undefined}
                    data-autoplay-sound={item.autoplaySound ? "true" : undefined}
                    aria-label={item.label || `Clip ${i + 1}`}
                    className="case-study-video"
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight,
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </div>
              </div>
              );
            })}
          </div>
          )}
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
