#!/usr/bin/env python3
"""Strip em/en dashes from live site copy files."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

TARGETS = [
    ROOT / "data/projects.js",
    ROOT / "data/about.js",
    ROOT / "data/quotes.js",
    ROOT / "data/trashMessages.js",
    ROOT / "data/listenScripts.js",
    ROOT / "components/CaseStudyEndcap.jsx",
    ROOT / "components/LoadingOverlay.jsx",
    ROOT / "components/Desktop.jsx",
    ROOT / "components/StatusBar.jsx",
    ROOT / "components/SkillsPlanet.jsx",
    ROOT / "components/InteractiveAsciiGlobe.jsx",
    ROOT / "components/OtherStuffFolder.jsx",
    ROOT / "components/ProjectPageListen.jsx",
    ROOT / "components/WelcomeReadAloud.jsx",
    ROOT / "components/CaseStudyVideos.jsx",
    ROOT / "components/mobile/MobileOrbitCarousel.jsx",
    ROOT / "components/mobile/MobileVaultEasterEgg.jsx",
    ROOT / "components/IdleScreensaver.jsx",
    ROOT / "app/work/[slug]/page.js",
]


def split_dash(left: str, right: str) -> str:
    left = left.rstrip()
    right = right.lstrip()
    words = left.split()
    if len(words) <= 6 and not left.endswith((".", "!", "?", ":")):
        return f"{left}: {right}"
    if right[:1].isupper():
        return f"{left}. {right}"
    return f"{left}, {right}"


def fix_body(body: str) -> str:
    while " — " in body:
        left, right = body.split(" — ", 1)
        # Only transform the first join; recurse via loop
        # Find last "segment" on left for colon heuristic
        # Use whole left side for the heuristic
        body = split_dash(left, right)
    return body.replace("—", ", ")


def fix_quoted(m: re.Match) -> str:
    q = m.group(1)
    body = m.group(2)
    return f"{q}{fix_body(body)}{q}"


def replace_dashes(text: str) -> str:
    text = re.sub(r"(\d)\s*–\s*(\d)", r"\1 to \2", text)
    text = text.replace("–", "-")

    # Double-quoted and backtick string bodies (non-greedy across simple lines)
    text = re.sub(
        r'(["`])((?:(?!\1)[^\\]|\\.)*?—(?:(?!\1)[^\\]|\\.)*)\1',
        fix_quoted,
        text,
        flags=re.DOTALL,
    )

    # JSX / template leftovers
    text = text.replace(" — ", ", ")
    text = text.replace("—", ", ")
    return text


def main() -> None:
    for path in TARGETS:
        if not path.exists():
            print(f"skip missing {path.relative_to(ROOT)}")
            continue
        original = path.read_text(encoding="utf-8")
        updated = replace_dashes(original)
        before = original.count("—") + original.count("–")
        after = updated.count("—") + updated.count("–")
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            print(f"updated {path.relative_to(ROOT)} ({before} -> {after})")
        else:
            print(f"unchanged {path.relative_to(ROOT)} ({before})")


if __name__ == "__main__":
    main()
