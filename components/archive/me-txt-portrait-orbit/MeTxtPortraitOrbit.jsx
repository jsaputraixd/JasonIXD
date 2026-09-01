"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import SkillsPlanet, { portraitOrbitBox } from "@/components/SkillsPlanet";

const EASE = [0.16, 1, 0.3, 1];

/**
 * Skill chips orbiting the me.txt portrait on hover (desktop only).
 */
export default function MeTxtPortraitOrbit({ active, inner }) {
  const reduceMotion = useReducedMotion();
  const orbitBox = inner != null ? portraitOrbitBox(inner) : null;

  if (!orbitBox) return null;

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          key="me-skills-orbit"
          initial={
            reduceMotion
              ? { opacity: 1, scale: 1, x: "-50%", y: "-50%" }
              : { opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }
          }
          animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
          exit={
            reduceMotion
              ? { opacity: 0, scale: 1, x: "-50%", y: "-50%" }
              : { opacity: 0, scale: 0.96, x: "-50%", y: "-50%" }
          }
          transition={{
            duration: reduceMotion ? 0 : 0.5,
            ease: EASE,
          }}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: orbitBox.boxW,
            height: orbitBox.boxH,
            transformOrigin: "center center",
            zIndex: 3,
            pointerEvents: "none",
          }}
        >
          <SkillsPlanet
            variant="desktop"
            showGlobe={false}
            orbitActive
            anchorSize={inner}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
