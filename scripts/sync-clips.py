#!/usr/bin/env python3
"""Sync clips and posters from ../fist/%%CLIPS into docs/images/, cropping 35px shadow padding from posters."""

import shutil
import sys
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
source_dir = root.parent / "fist" / "%%CLIPS"
dest_dir = root / "docs" / "images"

if not source_dir.is_dir():
    print(f"Error: source directory not found: {source_dir}", file=sys.stderr)
    sys.exit(1)

dest_dir.mkdir(parents=True, exist_ok=True)

copied_mp4 = 0
copied_png = 0
cropped_png = 0

for src in sorted(source_dir.iterdir()):
    if not src.is_file():
        continue
    if src.suffix == ".mp4":
        shutil.copy2(src, dest_dir / src.name)
        copied_mp4 += 1
    elif src.suffix == ".png":
        dst = dest_dir / src.name
        im = Image.open(src)
        if im.size == (1570, 970):
            im.crop((35, 35, 1535, 935)).save(dst, format="PNG", optimize=True)
            cropped_png += 1
        else:
            shutil.copy2(src, dst)
        copied_png += 1

print(f"Synced {copied_mp4} clips and {copied_png} posters ({cropped_png} cropped to 1500x900) from {source_dir}")
