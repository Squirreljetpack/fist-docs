#!/usr/bin/env python3
import shutil
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
public_dir = root / "docs" / "public"

# The vector logo is the single source; every raster icon is rendered from it.
source = public_dir / "logo.svg"
targets = [(public_dir / "favicon.png", 64)]

if not source.exists():
    print(f"Error: {source.relative_to(root)} not found.", file=sys.stderr)
    sys.exit(1)

if shutil.which("resvg") is None:
    print("Error: resvg not found on PATH (cargo install resvg).", file=sys.stderr)
    sys.exit(1)

print(f"Using source vector: {source.relative_to(root)}")

for dest, size in targets:
    result = subprocess.run(
        ["resvg", str(source), str(dest), "--width", str(size)],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(result.stderr.strip() or f"resvg failed rendering {dest.name}", file=sys.stderr)
        sys.exit(result.returncode)

    print(f"✓ Generated {dest.relative_to(root)} ({size}px, {dest.stat().st_size} bytes)")

print("All icons successfully generated!")
