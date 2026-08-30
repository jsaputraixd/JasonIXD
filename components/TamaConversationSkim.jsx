"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

function useInViewOnce(amount = 0.35) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
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
      { threshold: amount, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [amount]);
  return [ref, on];
}

function CountUp({ value, active, decimals = 0, prefix = "", suffix = "" }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!active) return;
    if (reduce) {
      setN(value);
      return;
    }
    const start = performance.now();
    const dur = 900;
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - (1 - t) ** 3;
      setN(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, value, reduce]);

  const shown =
    decimals > 0 ? n.toFixed(decimals) : Math.round(n).toString();
  return (
    <span>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}

function Board({ children, label }) {
  return (
    <div className="tama-skim" aria-label={label}>
      {children}
    </div>
  );
}

function WaitSkim() {
  const reduce = useReducedMotion();
  const [ref, on] = useInViewOnce(0.28);
  const steps = [
    ["0s", "Thinking face", "I switch the visor immediately"],
    ["7s", "Filler", "I speak only if it crosses this"],
    ["8–10s", "First voice", "I give the real answer"],
  ];

  return (
    <Board label="I switch the thinking face at 0s, speak a filler only after 7s, then give the real answer.">
      <div ref={ref}>
        <p className="tama-skim__kicker">What I did with the wait</p>
        <p className="tama-skim__lede">
          I kept Tama present, then spoke only if the wait lasted longer than a
          glance.
        </p>
        <div className="tama-skim__steps">
          {steps.map(([time, title, copy], i) => (
            <motion.div
              key={time}
              className="tama-skim__step"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={on || reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              transition={{ duration: 0.5, ease, delay: reduce ? 0 : 0.12 + i * 0.16 }}
            >
              <p className="tama-skim__num">{time}</p>
              <p className="tama-skim__step-title">{title}</p>
              <p className="tama-skim__copy">{copy}</p>
            </motion.div>
          ))}
        </div>
        <motion.p
          className="tama-skim__filter"
          initial={reduce ? false : { opacity: 0 }}
          animate={on || reduce ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: reduce ? 0 : 0.7 }}
        >
          Concise · Personal · Expressive — I used BMO as the filter.
        </motion.p>
      </div>
    </Board>
  );
}

function LatencySkim() {
  const reduce = useReducedMotion();
  const [ref, on] = useInViewOnce(0.28);
  const stats = [
    { value: 9.97, decimals: 2, suffix: "s", label: "I started here" },
    { value: 4.05, decimals: 2, suffix: "s", label: "I cut it to this" },
    { value: 8.14, decimals: 2, suffix: "s", label: "Fastest first voice I got" },
    { value: 59, decimals: 0, prefix: "−", suffix: "%", label: "Result, same-day pair" },
  ];

  return (
    <Board label="I timed 9.97s default thinking, then cut the same image to 4.05s. Fastest first voice I measured was 8.14s.">
      <div ref={ref}>
        <p className="tama-skim__kicker">What I measured</p>
        <p className="tama-skim__lede">
          I timed the same image, then two voice turns, to see what my changes
          actually did.
        </p>
        <div className="tama-skim__stats">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="tama-skim__stat"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={on || reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.45, ease, delay: reduce ? 0 : i * 0.1 }}
            >
              <p className="tama-skim__num">
                <CountUp
                  value={s.value}
                  active={on}
                  decimals={s.decimals}
                  prefix={s.prefix}
                  suffix={s.suffix}
                />
              </p>
              <p className="tama-skim__copy">{s.label}</p>
            </motion.div>
          ))}
        </div>
        <div className="tama-skim__bars" aria-hidden>
          <div className="tama-skim__bar-row">
            <span>I started</span>
            <div className="tama-skim__track">
              <motion.span
                className="tama-skim__fill tama-skim__fill--before"
                initial={reduce ? { scaleX: 9.97 / 12 } : { scaleX: 0 }}
                animate={{ scaleX: on || reduce ? 9.97 / 12 : 0 }}
                transition={{ duration: 0.85, ease, delay: reduce ? 0 : 0.2 }}
              />
            </div>
            <span>9.97s</span>
          </div>
          <div className="tama-skim__bar-row">
            <span>I got here</span>
            <div className="tama-skim__track">
              <motion.span
                className="tama-skim__fill tama-skim__fill--after"
                initial={reduce ? { scaleX: 4.05 / 12 } : { scaleX: 0 }}
                animate={{ scaleX: on || reduce ? 4.05 / 12 : 0 }}
                transition={{ duration: 0.85, ease, delay: reduce ? 0 : 0.35 }}
              />
            </div>
            <span>4.05s</span>
          </div>
        </div>
      </div>
    </Board>
  );
}

function ApiSkim() {
  const reduce = useReducedMotion();
  const [ref, on] = useInViewOnce(0.28);
  const stats = [
    { value: 40, suffix: "", label: "Requests I made" },
    { value: 100, suffix: "%", label: "Succeeded" },
    { value: 0.09, decimals: 2, prefix: "$", suffix: "", label: "Charted cost" },
    { value: 9.83, decimals: 2, prefix: "$", suffix: "", label: "Credit left" },
  ];

  return (
    <Board label="I used 40 API requests over 28 days. Every one succeeded. Charted cost was 9 cents, with $9.83 of credit left.">
      <div ref={ref}>
        <p className="tama-skim__kicker">API footprint</p>
        <p className="tama-skim__lede">
          I kept the cloud cheap so Tama could stay a prototype. 28 days, Gemini
          Robotics ER 2.
        </p>
        <div className="tama-skim__stats">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="tama-skim__stat"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={on || reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.45, ease, delay: reduce ? 0 : i * 0.1 }}
            >
              <p className="tama-skim__num">
                <CountUp
                  value={s.value}
                  active={on}
                  decimals={s.decimals ?? 0}
                  prefix={s.prefix}
                  suffix={s.suffix}
                />
              </p>
              <p className="tama-skim__copy">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Board>
  );
}

export default function TamaConversationSkim({ kind }) {
  if (kind === "wait") return <WaitSkim />;
  if (kind === "latency") return <LatencySkim />;
  if (kind === "api") return <ApiSkim />;
  return null;
}
