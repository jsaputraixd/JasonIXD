#!/usr/bin/env python3
"""Write ~480px JPEG thumbs for Other Stuff originals (grid browse, not lightbox)."""

from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError as exc:
    raise SystemExit("Pillow is required: pip3 install pillow") from exc

ROOT = Path(__file__).resolve().parents[1] / "public" / "images" / "other-stuff"
MAX_EDGE = 480
QUALITY = 52
SKIP_DIRS = {"thumbs"}
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def make_thumb(src: Path, dest: Path) -> None:
    im = Image.open(src)
    im = ImageOps.exif_transpose(im)
    im.thumbnail((MAX_EDGE, MAX_EDGE))
    if im.mode != "RGB":
        im = im.convert("RGB")
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "JPEG", quality=QUALITY, optimize=True)


def main() -> None:
    if not ROOT.is_dir():
        raise SystemExit(f"missing {ROOT}")
    written = 0
    for category in sorted(p for p in ROOT.iterdir() if p.is_dir()):
        for src in sorted(category.iterdir()):
            if src.name.startswith(".") or src.is_dir():
                continue
            if src.suffix.lower() not in IMAGE_EXT:
                continue
            dest = category / "thumbs" / f"{src.stem}.jpg"
            try:
                make_thumb(src, dest)
            except Exception as exc:
                print(f"skip {src.relative_to(ROOT)} ({exc})")
                continue
            print(f"{src.relative_to(ROOT)} -> thumbs/{dest.name} ({dest.stat().st_size} bytes)")
            written += 1
    print(f"wrote {written} thumbs")


if __name__ == "__main__":
    main()
