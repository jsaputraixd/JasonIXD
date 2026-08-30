"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];
const PHASES = [
  { id: "observe", ms: 1700 },
  { id: "listen", ms: 1500 },
  { id: "transcribe", ms: 1100 },
  { id: "think1", ms: 1000 },
  { id: "think2", ms: 1100 },
  { id: "think3", ms: 1000 },
  { id: "speak", ms: 1600 },
];

function useFlowPlayback(reduce) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.22, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!on || reduce) return;
    let i = 0;
    let id = setTimeout(function tick() {
      i = (i + 1) % PHASES.length;
      setPhase(i);
      id = setTimeout(tick, PHASES[i].ms);
    }, PHASES[0].ms + 700);
    return () => clearTimeout(id);
  }, [on, reduce]);

  return [ref, on, reduce ? -1 : on ? phase : -1];
}

function State({ children, className = "", on = false }) {
  return (
    <div
      className={`tama-flow__state ${on ? "is-on" : ""} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

function Event({ children }) {
  return <p className="tama-flow__event">{children}</p>;
}

function Join({ on = false }) {
  return (
    <div className={`tama-flow__join ${on ? "is-on" : ""}`.trim()} aria-hidden>
      <span />
    </div>
  );
}

function Visor({ kind }) {
  if (kind === "observing") {
    return (
      <svg className="tama-flow__visor tama-flow__visor--observe" viewBox="0 0 280 130" aria-hidden>
        <path className="tama-flow__brow" d="M44 32 Q70 8 94 28" />
        <path className="tama-flow__brow" d="M186 28 Q210 8 236 32" />
        <rect className="tama-flow__eye" x="34" y="40" width="50" height="80" rx="25" />
        <rect className="tama-flow__eye" x="196" y="40" width="50" height="80" rx="25" />
        <path className="tama-flow__mouth" d="M112 82 Q124 100 136 82 Q148 100 160 82" />
      </svg>
    );
  }
  if (kind === "listening") {
    return (
      <svg className="tama-flow__visor tama-flow__visor--listen" viewBox="0 0 280 130" aria-hidden>
        <line className="tama-flow__brow" x1="30" y1="40" x2="86" y2="16" />
        <line className="tama-flow__brow" x1="194" y1="16" x2="250" y2="40" />
        <rect className="tama-flow__eye" x="40" y="36" width="48" height="82" rx="24" />
        <rect className="tama-flow__eye" x="192" y="36" width="48" height="82" rx="24" />
        <path className="tama-flow__mouth" d="M112 80 Q124 98 136 80 Q148 98 160 80" />
      </svg>
    );
  }
  if (kind === "thinking") {
    return (
      <svg className="tama-flow__visor tama-flow__visor--think" viewBox="0 0 280 130" aria-hidden>
        <line className="tama-flow__brow" x1="28" y1="18" x2="92" y2="44" />
        <line className="tama-flow__brow" x1="188" y1="44" x2="252" y2="18" />
        <circle className="tama-flow__eye tama-flow__eye--round" cx="64" cy="96" r="20" />
        <circle className="tama-flow__eye tama-flow__eye--round" cx="216" cy="96" r="20" />
        <rect className="tama-flow__bar" x="116" y="78" width="48" height="12" rx="6" />
      </svg>
    );
  }
  return (
    <svg className="tama-flow__visor tama-flow__visor--speak" viewBox="0 0 280 130" aria-hidden>
      <path className="tama-flow__brow" d="M44 28 Q70 6 94 24" />
      <path className="tama-flow__brow" d="M186 24 Q210 6 236 28" />
      <rect className="tama-flow__eye" x="34" y="36" width="50" height="80" rx="25" />
      <rect className="tama-flow__eye" x="196" y="36" width="50" height="80" rx="25" />
      <circle className="tama-flow__dot" cx="140" cy="78" r="16" />
    </svg>
  );
}

function Face({ kind, label, note, on = false }) {
  return (
    <figure className={`tama-flow__face ${on ? "is-on" : ""}`.trim()}>
      <Visor kind={kind} />
      <figcaption>
        {label}
        {note ? <span>{note}</span> : null}
      </figcaption>
    </figure>
  );
}

function Stage({ index, on, face, faceLabel, faceNote, faceOn, children }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="tama-flow__stage"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={on || reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.5, ease: EASE, delay: reduce ? 0 : 0.06 + index * 0.1 }}
    >
      <div className="tama-flow__col">{children}</div>
      <Face kind={face} label={faceLabel} note={faceNote} on={faceOn} />
    </motion.div>
  );
}

export default function TamaBehaviorFlow() {
  const reduce = useReducedMotion();
  const [ref, seen, phase] = useFlowPlayback(reduce);
  const playing = phase >= 0;
  const id = playing ? PHASES[phase].id : null;
  const at = (...names) => !playing || names.includes(id);

  return (
    <motion.div
      ref={ref}
      className={`tama-flow ${playing ? "is-playing" : "is-rest"}`}
      aria-label="Tama behavior logic: observing, listening, transcribing, Gemini, Edge TTS, speaking, and the fallbacks back to observing."
    >
      <p className="tama-flow__kicker">Behavior logic</p>
      <p className="tama-flow__lede">
        I mapped every wait to a face. Observing and listening have their own.
        Transcribing through Gemini and Edge TTS share the thinking face.
        Speaking only starts once the clip is ready.
      </p>

      <div className="tama-flow__path">
        <Stage
          index={0}
          on={seen}
          face="observing"
          faceLabel="Observing face"
          faceOn={at("observe")}
        >
          <State className="tama-flow__state--hub" on={at("observe")}>
            Observing
          </State>
          <Event>idle · then one of two listens</Event>
          <Join on={id === "listen"} />
        </Stage>

        <Stage
          index={1}
          on={seen}
          face="listening"
          faceLabel="Listening face"
          faceOn={at("listen")}
        >
          <div className="tama-flow__split">
            <div className="tama-flow__branch">
              <Event>hear Tama</Event>
              <State on={at("listen")}>Listening · Tama</State>
              <Event>silence after speech</Event>
            </div>
            <div className="tama-flow__branch">
              <Event>hold space</Event>
              <State on={at("listen")}>Listening · PTT</State>
              <Event>space up</Event>
            </div>
          </div>
          <Join on={id === "transcribe"} />
        </Stage>

        <Stage
          index={2}
          on={seen}
          face="thinking"
          faceLabel="Thinking face"
          faceNote="transcribe · Gemini · Edge TTS"
          faceOn={at("transcribe", "think1", "think2", "think3")}
        >
          <State on={at("transcribe")}>Transcribing</State>
          <Event>local speech-to-text</Event>
          <Join on={id === "think1"} />
          <State on={at("think1", "think2", "think3")}>Thinking</State>
          <ol className="tama-flow__pipe">
            <li className={at("think1") ? "is-on" : undefined}>
              <span>01</span>
              Send the transcript, plus a screenshot or desk frame, to Gemini.
            </li>
            <li className={at("think2") ? "is-on" : undefined}>
              <span>02</span>
              Gemini writes the reply using the persona and speak style I set
              beforehand — short, out loud, thinking set to minimal.
            </li>
            <li className={at("think3") ? "is-on" : undefined}>
              <span>03</span>
              Send that text to Edge TTS to make the voice clip.
            </li>
          </ol>
          <Event>clip ready</Event>
          <Join on={id === "speak"} />
        </Stage>

        <Stage
          index={3}
          on={seen}
          face="speaking"
          faceLabel="Speaking face"
          faceOn={at("speak")}
        >
          <State on={at("speak")}>Speaking</State>
          <Event>done → back to observing</Event>
        </Stage>
      </div>

      <motion.div
        className="tama-flow__backs"
        initial={reduce ? false : { opacity: 0 }}
        animate={seen || reduce ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.45, delay: reduce ? 0 : 0.55 }}
      >
        <p>
          Timeout, no speech
          <span>back to observing</span>
        </p>
        <p>
          Empty or failed reply
          <span>back to observing</span>
        </p>
        <p>
          Press Q
          <span>quit</span>
        </p>
      </motion.div>
    </motion.div>
  );
}
