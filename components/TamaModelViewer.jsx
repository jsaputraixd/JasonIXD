"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const MODEL_VIEWER_SCRIPT =
  "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";

export default function TamaModelViewer({ variants }) {
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

      <div className="tama-model__controls" aria-label="Tama model variant">
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

      <model-viewer
        ref={viewerRef}
        class="tama-model__viewer"
        src={active.src}
        alt={active.alt}
        camera-controls
        touch-action="pan-y"
        interaction-prompt="auto"
        environment-image="neutral"
        shadow-intensity="0.55"
        shadow-softness="0.8"
        exposure="1.05"
        camera-orbit="25deg 72deg 0.42m"
        min-camera-orbit="auto 30deg 0.22m"
        max-camera-orbit="auto 110deg 1.2m"
      />

      <p className="tama-model__hint">
        Drag to rotate · Scroll or pinch to zoom
      </p>
    </div>
  );
}
