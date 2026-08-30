"use client";

import { motion, useReducedMotion } from "framer-motion";

export function CaseStudyReveal({ children, className = "" }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0 }}
      whileInView={reduceMotion ? undefined : { opacity: 1 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function CaseStudyScrollSection({
  id,
  index,
  title,
  eyebrow = "Case study",
  summary,
  sticky = true,
  children,
  className = "",
}) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id={id}
      className={`case-study-scroll-section ${className}`}
    >
      <aside
        className={`case-study-scroll-section__rail${
          sticky ? "" : " case-study-scroll-section__rail--static"
        }`}
      >
        <motion.div
          className="case-study-scroll-section__rail-content"
          initial={reduceMotion ? false : { opacity: 0, x: -30 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.28 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="case-study-scroll-section__eyebrow">
            {String(index).padStart(2, "0")} · {eyebrow}
          </p>
          <h2 className="case-study-scroll-section__title">{title}</h2>
          {summary ? (
            <p className="case-study-scroll-section__summary">{summary}</p>
          ) : null}
          <span className="case-study-scroll-section__rule" aria-hidden />
        </motion.div>
      </aside>

      <motion.div
        className="case-study-scroll-section__body"
        initial={reduceMotion ? false : { opacity: 0 }}
        whileInView={reduceMotion ? undefined : { opacity: 1 }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
      >
        {children}
      </motion.div>
    </section>
  );
}
