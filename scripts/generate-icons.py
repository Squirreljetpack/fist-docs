#!/usr/bin/env python3
import os
import sys
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent

# Source must be icon.png only
source = root / "icon.png"

if not source.exists():
    print(f"Error: {source.name} not found in repository root ({root}).", file=sys.stderr)
    sys.exit(1)

print(f"Using source image: {source.name} ({source})")

im = Image.open(source)
if im.mode not in ("RGB", "RGBA"):
    im = im.convert("RGBA")

public_dir = root / "docs" / "public"
public_dir.mkdir(parents=True, exist_ok=True)

# Determine prefix for custom icon (e.g. im, mm, fs)
existing_pngs = set(p.name for p in public_dir.glob("*.png"))
standard_pngs = {"logo.png", "favicon.png"}

targets = [
    (public_dir / "logo.png", 256, False),
    (public_dir / "favicon.png", 64, True),
]

# Include any other existing PNGs in docs/public (e.g. im.png, mm.png, fs.png)
extra_pngs = existing_pngs - standard_pngs
if not extra_pngs:
    # Default to repo prefix if no extra PNG exists
    repo_name = root.name.removesuffix("-docs")
    extra_pngs = {f"{repo_name}.png"}

for name in sorted(extra_pngs):
    targets.append((public_dir / name, 512, False))

for dest, max_dim, square_pad in targets:
    cur = im.copy()
    cur.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)

    if square_pad:
        canvas = Image.new("RGBA", (max_dim, max_dim), (0, 0, 0, 0))
        offset = ((max_dim - cur.width) // 2, (max_dim - cur.height) // 2)
        canvas.paste(cur, offset, cur if cur.mode == "RGBA" else None)
        canvas.save(dest, format="PNG", optimize=True)
    else:
        cur.save(dest, format="PNG", optimize=True)

    rel_path = dest.relative_to(root)
    print(f"✓ Generated {rel_path} ({dest.stat().st_size} bytes)")

print("All icons successfully generated!")
