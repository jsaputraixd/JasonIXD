"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

export default function ProjectHeroTeaser({
  src,
  active = false,
  objectPosition = "center",
}) {
  const videoRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduceMotion) return undefined;

    if (active) {
      video.currentTime = 0;
      const play = video.play();
      if (play?.catch) play.catch(() => {});
      return undefined;
    }

    video.pause();
    return undefined;
  }, [active, reduceMotion]);

  if (!src || reduceMotion) return null;

  return (
    <div
      className={`project-hero-teaser${active ? " is-on" : ""}`}
      aria-hidden
    >
      <video
        ref={videoRef}
        className="project-hero-teaser__video"
        src={src}
        muted
        playsInline
        loop
        preload="metadata"
        tabIndex={-1}
        style={{ objectPosition }}
      />
    </div>
  );
}
