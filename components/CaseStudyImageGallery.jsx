"use client";

import { useCallback, useState } from "react";
import { CaseStudyZoomOverlay } from "@/components/CaseStudyZoomImage";

function normalize(entry) {
  if (typeof entry === "string") {
    return { src: entry, alt: "", caption: "" };
  }
  return {
    src: entry.src,
    alt: entry.alt ?? "",
    caption: entry.caption ?? "",
  };
}

export default function CaseStudyImageGallery({ images }) {
  const items = (images ?? []).map(normalize).filter((item) => item.src);
  const [openIndex, setOpenIndex] = useState(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (dir) => {
      setOpenIndex((i) => {
        if (i == null) return i;
        return (i + dir + items.length) % items.length;
      });
    },
    [items.length]
  );

  if (!items.length) return null;

  const active = openIndex == null ? null : items[openIndex];

  return (
    <>
      <div className="case-study-gallery">
        {items.map((item, i) => (
          <button
            key={item.src}
            type="button"
            className="case-study-gallery__tile"
            data-cursor="view"
            onClick={() => setOpenIndex(i)}
          >
            <span className="case-study-gallery__frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={encodeURI(item.src)} alt="" />
            </span>
            <span className="case-study-gallery__caption">
              {item.caption || `Image ${i + 1}`}
            </span>
          </button>
        ))}
      </div>
      <CaseStudyZoomOverlay
        open={openIndex != null}
        src={active?.src}
        alt={active?.alt}
        caption={active?.caption}
        onClose={close}
        onPrev={items.length > 1 ? () => step(-1) : undefined}
        onNext={items.length > 1 ? () => step(1) : undefined}
      />
    </>
  );
}
