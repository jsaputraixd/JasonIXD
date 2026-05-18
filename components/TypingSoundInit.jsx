"use client";

import { useEffect } from "react";
import { initTypingSound } from "@/lib/typingSound";

export default function TypingSoundInit() {
  useEffect(() => {
    initTypingSound();
  }, []);
  return null;
}
