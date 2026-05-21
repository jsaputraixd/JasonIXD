"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playClick } from "@/lib/typingSound";

const ACCENT = "#FF7A29";
const COLS = 18;
const ROWS = 16;
const CELL = 16;
const TICK_MS = 118;
const HI_KEY = "coffee-snake-hi";

const KEY_TO_DIR = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

function randCell() {
  return {
    x: Math.floor(Math.random() * COLS),
    y: Math.floor(Math.random() * ROWS),
  };
}

function spawnFood(snake) {
  let food = randCell();
  let guard = 0;
  while (snake.some((s) => s.x === food.x && s.y === food.y) && guard++ < 200) {
    food = randCell();
  }
  return food;
}

function readHi() {
  if (typeof window === "undefined") return 0;
  const n = parseInt(localStorage.getItem(HI_KEY) ?? "0", 10);
  return Number.isFinite(n) ? n : 0;
}

function writeHi(n) {
  if (typeof window === "undefined") return;
  localStorage.setItem(HI_KEY, String(n));
}

export default function CoffeeSnakeGame({ onQuit }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [score, setScore] = useState(0);
  const [hi, setHi] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState("READY");

  const gameRef = useRef({
    snake: [{ x: 9, y: 8 }],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: { x: 4, y: 4 },
    score: 0,
    over: false,
  });

  const resetBoard = useCallback(() => {
    const snake = [{ x: 9, y: 8 }];
    gameRef.current = {
      snake,
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      food: spawnFood(snake),
      score: 0,
      over: false,
    };
    setScore(0);
    setGameOver(false);
  }, []);

  const resetToReady = useCallback(() => {
    resetBoard();
    setStarted(false);
    setStatus("READY");
  }, [resetBoard]);

  const startGame = useCallback(() => {
    playClick();
    setStarted(true);
    setStatus("RUN");
  }, []);

  const restartAfterGameOver = useCallback(() => {
    resetBoard();
    setStarted(true);
    setStatus("RUN");
  }, [resetBoard]);

  useEffect(() => {
    setHi(readHi());
    resetToReady();
  }, [resetToReady]);

  useEffect(() => {
    wrapRef.current?.focus();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { snake, food, over } = gameRef.current;
    const w = COLS * CELL;
    const h = ROWS * CELL;

    ctx.fillStyle = "#0a0604";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(255, 122, 41, 0.07)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL + 0.5, 0);
      ctx.lineTo(x * CELL + 0.5, h);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL + 0.5);
      ctx.lineTo(w, y * CELL + 0.5);
      ctx.stroke();
    }

    snake.forEach((seg, i) => {
      const t = i / Math.max(1, snake.length - 1);
      ctx.fillStyle =
        i === 0
          ? "#ffb570"
          : `rgba(255, 122, 41, ${0.45 + (1 - t) * 0.5})`;
      ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
    });

    ctx.font = `${CELL - 2}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "☕",
      food.x * CELL + CELL / 2,
      food.y * CELL + CELL / 2 + 1
    );

    if (over) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = ACCENT;
      ctx.font = "16px 'VT323', monospace";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", w / 2, h / 2 - 8);
      ctx.fillStyle = "rgba(255, 200, 160, 0.85)";
      ctx.font = "13px 'VT323', monospace";
      ctx.fillText("SPACE · RETRY", w / 2, h / 2 + 14);
    }
  }, []);

  const step = useCallback(() => {
    const g = gameRef.current;
    if (g.over) return;

    const dir = g.nextDir;
    if (dir.x !== -g.dir.x || dir.y !== -g.dir.y) {
      g.dir = dir;
    }

    const head = g.snake[0];
    const next = { x: head.x + g.dir.x, y: head.y + g.dir.y };

    if (
      next.x < 0 ||
      next.x >= COLS ||
      next.y < 0 ||
      next.y >= ROWS ||
      g.snake.some((s) => s.x === next.x && s.y === next.y)
    ) {
      g.over = true;
      setGameOver(true);
      setStatus("OVER");
      return;
    }

    g.snake.unshift(next);

    if (next.x === g.food.x && next.y === g.food.y) {
      g.score += 1;
      setScore(g.score);
      playClick();
      g.food = spawnFood(g.snake);
      const storedHi = readHi();
      if (g.score > storedHi) {
        writeHi(g.score);
        setHi(g.score);
      }
    } else {
      g.snake.pop();
    }
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (started && !gameRef.current.over) step();
      draw();
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [step, draw, started]);

  useEffect(() => {
    draw();
  }, [draw, gameOver, started]);

  const queueDir = useCallback((dir) => {
    const g = gameRef.current;
    if (!started || g.over) return;
    if (dir.x === -g.dir.x && dir.y === -g.dir.y) return;
    g.nextDir = dir;
  }, [started]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onQuit?.();
        return;
      }
      if (!started && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        startGame();
        return;
      }
      if (gameRef.current.over && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        restartAfterGameOver();
        return;
      }
      const dir = KEY_TO_DIR[e.key];
      if (!dir) return;
      e.preventDefault();
      queueDir(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onQuit, queueDir, restartAfterGameOver, startGame, started]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;

    const onTouchStart = (e) => {
      const t = e.changedTouches[0];
      startX = t.clientX;
      startY = t.clientY;
    };

    const onTouchEnd = (e) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        queueDir({ x: dx > 0 ? 1 : -1, y: 0 });
      } else {
        queueDir({ x: 0, y: dy > 0 ? 1 : -1 });
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [queueDir]);

  return (
    <div ref={wrapRef} className="coffee-snake-game" tabIndex={0}>
      <div className="coffee-snake-game__hud">
        <span>
          SCORE · {String(score).padStart(4, "0")}
        </span>
        <span className="coffee-snake-game__status">{status}</span>
        <span>
          HI · {String(hi).padStart(4, "0")}
        </span>
      </div>
      <div className="coffee-snake-game__board">
        <canvas
          ref={canvasRef}
          width={COLS * CELL}
          height={ROWS * CELL}
          className="coffee-snake-game__canvas"
          aria-label="Coffee snake game board"
        />
        {!started && !gameOver ? (
          <div className="coffee-snake-game__start">
            <button
              type="button"
              className="coffee-snake-game__start-btn"
              data-cursor="hover"
              onClick={startGame}
            >
              SPACE · START
            </button>
          </div>
        ) : null}
      </div>
      <p className="coffee-snake-game__hint">
        {started
          ? "ARROWS · WASD · SWIPE · ESC TO QUIT"
          : "PRESS SPACE OR CLICK START · ESC TO QUIT"}
      </p>
    </div>
  );
}
