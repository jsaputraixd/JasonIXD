"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const MODEL_VIEWER_SCRIPT =
  "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";

/** Tama's framing; other models pass their own `view` (same attribute names, camelCase). */
const TAMA_VIEW = {
  cameraOrbit: "25deg 72deg 0.42m",
  minCameraOrbit: "auto 30deg 0.22m",
  maxCameraOrbit: "auto 110deg 1.2m",
  exposure: "1.05",
  shadowIntensity: "0.55",
};

export default function TamaModelViewer({ variants, view = TAMA_VIEW }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const viewerRef = useRef(null);
  const savedCameraRef = useRef(null);
  const active = variants[activeIndex];

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return undefined;

    const restoreCamera = () => {
      const saved = savedCameraRef.current;
      if (saved) {
        viewer.setAttribute("camera-orbit", saved.orbit);
        viewer.setAttribute("camera-target", saved.target);
        viewer.setAttribute("field-of-view", saved.fieldOfView);
        requestAnimationFrame(() => viewer.jumpCameraToGoal?.());
      }
    };

    viewer.addEventListener("load", restoreCamera);
    if (viewer.loaded) restoreCamera();
    return () => viewer.removeEventListener("load", restoreCamera);
  }, []);

  const selectVariant = (index) => {
    if (index === activeIndex) return;

    const viewer = viewerRef.current;
    const orbit = viewer?.getCameraOrbit?.();
    const target = viewer?.getCameraTarget?.();
    const fieldOfView = viewer?.getFieldOfView?.();

    if (orbit && target && Number.isFinite(fieldOfView)) {
      savedCameraRef.current = {
        orbit: `${orbit.theta}rad ${orbit.phi}rad ${orbit.radius}m`,
        target: `${target.x}m ${target.y}m ${target.z}m`,
        fieldOfView: `${fieldOfView}deg`,
      };
    }

    setActiveIndex(index);
  };

  return (
    <div className="tama-model">
      <Script
        id="google-model-viewer"
        type="module"
        src={MODEL_VIEWER_SCRIPT}
        strategy="afterInteractive"
      />

      {variants.length > 1 ? (
      <div className="tama-model__controls" aria-label="Model variant">
        {variants.map((variant, index) => (
          <button
            key={variant.src}
            type="button"
            className={`tama-model__variant${
              index === activeIndex ? " tama-model__variant--active" : ""
            }`}
            aria-pressed={index === activeIndex}
            onClick={() => selectVariant(index)}
          >
            {variant.label}
          </button>
        ))}
      </div>
      ) : null}

      <model-viewer
        ref={viewerRef}
        class="tama-model__viewer"
        src={active.src}
        alt={active.alt}
        camera-controls
        data-lenis-prevent
        touch-action="pan-y"
        interaction-prompt="auto"
        environment-image="neutral"
        shadow-softness="0.8"
        shadow-intensity={view.shadowIntensity}
        exposure={view.exposure}
        camera-orbit={view.cameraOrbit}
        camera-target={view.cameraTarget}
        field-of-view={view.fieldOfView}
        min-camera-orbit={view.minCameraOrbit}
        max-camera-orbit={view.maxCameraOrbit}
      />

      <p className="tama-model__hint">
        Drag to rotate · Scroll or pinch to zoom
      </p>
    </div>
  );
}
