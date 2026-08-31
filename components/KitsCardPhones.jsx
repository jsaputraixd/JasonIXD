"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const SCREEN_ASPECT = "1440 / 3080";

const SCREENS = [
  "/images/projects/kits/card/welcome-phone.png",
  "/images/projects/kits/card/login-phone.png",
  "/images/projects/kits/card/home-phone.png",
];

export default function KitsCardPhones({ active = false }) {
  const reduceMotion = useReducedMotion();
  const [fanned, setFanned] = useState(false);

  useEffect(() => {
    if (!active) {
      setFanned(false);
      return undefined;
    }
    if (reduceMotion) {
      setFanned(true);
      return undefined;
    }
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setFanned(true));
    });
    return () => window.cancelAnimationFrame(id);
  }, [active, reduceMotion]);

  return (
    <div
      className={[
        "kits-card-phones",
        active ? "is-on" : "",
        fanned ? "is-fanned" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden={!active}
    >
      {SCREENS.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          className="kits-card-phones__screen"
          src={src}
          alt=""
          style={{ aspectRatio: SCREEN_ASPECT, "--i": i }}
        />
      ))}
    </div>
  );
}
