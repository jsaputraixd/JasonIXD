"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hover/focus state for me.txt portrait → skills orbit.
 * Raises z-index on the me window while active; Escape dismisses.
 */
export default function useMeTxtSkillsFocus() {
  const [skillsFocused, setSkillsFocused] = useState(false);
  const skillsFocusedRef = useRef(false);
  skillsFocusedRef.current = skillsFocused;

  const openSkillsFocus = useCallback(() => {
    setSkillsFocused(true);
  }, []);

  const closeSkillsFocus = useCallback(() => {
    setSkillsFocused(false);
  }, []);

  useEffect(() => {
    if (!skillsFocused) return undefined;
    const onKey = (e) => {
      if (e.key !== "Escape" && e.code !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      closeSkillsFocus();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [skillsFocused, closeSkillsFocus]);

  return {
    skillsFocused,
    skillsFocusedRef,
    openSkillsFocus,
    closeSkillsFocus,
  };
}
