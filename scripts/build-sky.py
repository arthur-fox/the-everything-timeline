#!/usr/bin/env python3
"""Rebuild public/sky assets for Phase 4c step 7.1. See docs/ATTRIBUTION-sky.md."""
from __future__ import annotations

import argparse
import json
import math
import struct
import sys
from pathlib import Path

try:
    import numpy as np
    from PIL import Image
except ImportError as e:
    sys.exit(f"Need pillow + numpy to rebuild sky assets ({e})")

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "sky"
deg = math.pi / 180

SPEC = {
    "O": (155, 176, 255),
    "B": (170, 191, 255),
    "A": (202, 215, 255),
    "F": (248, 247, 255),
    "G": (255, 244, 234),
    "K": (255, 210, 161),
    "M": (255, 168, 111),
}


def parse_hms(s: str) -> float:
    s = s.strip()
    sign = -1 if s.startswith("-") else 1
    s = s.lstrip("+-")
    parts = s.split(":")
    h = float(parts[0])
    m = float(parts[1])
    sec = float(parts[2]) if len(parts) > 2 else 0.0
    return sign * (h + m / 60 + sec / 3600)


def build_stars(bsc_path: Path) -> None:
    bsc = json.loads(bsc_path.read_text())
    records = []
    for star in bsc:
        try:
            mag = float(star["MAG"])
        except (TypeError, ValueError):
            continue
        if mag > 6.5:
            continue
        try:
            ra = parse_hms(star["RA"]) * 15 * deg
            dec = parse_hms(star["DEC"]) * deg
        except Exception:
            continue
        x = math.cos(dec) * math.sin(ra)
        y = math.sin(dec)
        z = math.cos(dec) * math.cos(ra)
        size = max(0.8, 6.5 - mag)
        title = (star.get("Title HD") or "G")[:1].upper()
        r, g, b = SPEC.get(title, SPEC["G"])
        bright = int(max(40, min(255, 255 * (10 ** (-0.4 * (mag - 0.5))) / 2.5 * 120)))
        records.append((x, y, z, size, r, g, b, bright))

    OUT.mkdir(parents=True, exist_ok=True)
    bin_path = OUT / "bsc-stars.bin"
    with bin_path.open("wb") as f:
        f.write(b"ETB1")
        f.write(struct.pack("<I", len(records)))
        for x, y, z, size, r, g, b, bright in records:
            f.write(struct.pack("<ffff", x, y, z, size))
            f.write(struct.pack("BBBB", r, g, b, bright))
    print(f"wrote {bin_path} ({len(records)} stars, {bin_path.stat().st_size} bytes)")


def sample_cube(faces, face_size, dx, dy, dz):
    ax, ay, az = abs(dx), abs(dy), abs(dz)
    if ax >= ay and ax >= az:
        if dx > 0:
            u, v, img = (-dz / ax + 1) * 0.5, (-dy / ax + 1) * 0.5, faces["posx"]
        else:
            u, v, img = (dz / ax + 1) * 0.5, (-dy / ax + 1) * 0.5, faces["negx"]
    elif ay >= ax and ay >= az:
        if dy > 0:
            u, v, img = (dx / ay + 1) * 0.5, (dz / ay + 1) * 0.5, faces["posy"]
        else:
            u, v, img = (dx / ay + 1) * 0.5, (-dz / ay + 1) * 0.5, faces["negy"]
    else:
        if dz > 0:
            u, v, img = (dx / az + 1) * 0.5, (-dy / az + 1) * 0.5, faces["posz"]
        else:
            u, v, img = (-dx / az + 1) * 0.5, (-dy / az + 1) * 0.5, faces["negz"]
    u = min(max(u, 0.0), 1.0 - 1e-6)
    v = min(max(v, 0.0), 1.0 - 1e-6)
    x = u * (face_size - 1)
    y = v * (face_size - 1)
    x0, y0 = int(x), int(y)
    x1, y1 = min(x0 + 1, face_size - 1), min(y0 + 1, face_size - 1)
    fx, fy = x - x0, y - y0
    c00 = img[y0, x0]
    c10 = img[y0, x1]
    c01 = img[y1, x0]
    c11 = img[y1, x1]
    return c00 * (1 - fx) * (1 - fy) + c10 * fx * (1 - fy) + c01 * (1 - fx) * fy + c11 * fx * fy


def build_milky_way(cubemap_dir: Path) -> None:
    faces = {
        name: np.asarray(Image.open(cubemap_dir / f"{name}.jpg").convert("RGB"), dtype=np.float32)
        for name in ("posx", "negx", "posy", "negy", "posz", "negz")
    }
    face_size = faces["posx"].shape[0]
    ra_ngp = 192.85948 * deg
    dec_ngp = 27.12825 * deg
    l_ncp = 122.93192 * deg
    sin_ra, cos_ra = math.sin(ra_ngp), math.cos(ra_ngp)
    sin_dec, cos_dec = math.sin(dec_ngp), math.cos(dec_ngp)
    sin_l, cos_l = math.sin(l_ncp), math.cos(l_ncp)
    R = np.array(
        [
            [-sin_ra * sin_l - cos_ra * sin_dec * cos_l, sin_ra * cos_l - cos_ra * sin_dec * sin_l, cos_ra * cos_dec],
            [cos_ra * sin_l - sin_ra * sin_dec * cos_l, -cos_ra * cos_l - sin_ra * sin_dec * sin_l, sin_ra * cos_dec],
            [cos_dec * cos_l, cos_dec * sin_l, sin_dec],
        ],
        dtype=np.float64,
    )
    W, H = 2048, 1024
    out = np.zeros((H, W, 3), dtype=np.float32)
    for j in range(H):
        dec = (0.5 - (j + 0.5) / H) * math.pi
        cos_d, sin_d = math.cos(dec), math.sin(dec)
        for i in range(W):
            ra = ((i + 0.5) / W) * 2 * math.pi
            ve = np.array([cos_d * math.cos(ra), cos_d * math.sin(ra), sin_d], dtype=np.float64)
            vg = R.T @ ve
            out[j, i] = sample_cube(faces, face_size, vg[0], vg[2], vg[1])
    out = np.clip(out * 0.85 * 0.55, 0, 255)
    out[:, :, 2] = np.clip(out[:, :, 2] * 1.05, 0, 255)
    out[:, :, 0] = np.clip(out[:, :, 0] * 0.95, 0, 255)
    img = Image.fromarray(out.astype(np.uint8), "RGB")
    OUT.mkdir(parents=True, exist_ok=True)
    webp = OUT / "milkyway-celestial.webp"
    img.save(webp, "WEBP", quality=72, method=6)
    print(f"wrote {webp} ({webp.stat().st_size} bytes)")


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--bsc", type=Path, help="Path to BSC.json (Yale Bright Star Catalogue JSON)")
    p.add_argument("--cubemap", type=Path, help="Directory with posx/negx/... jpg faces")
    p.add_argument("--stars-only", action="store_true")
    p.add_argument("--mw-only", action="store_true")
    args = p.parse_args()
    if not args.bsc and not args.cubemap:
        print(
            "Nothing to do. Pass --bsc and/or --cubemap.\n"
            "Example:\n"
            "  python3 scripts/build-sky.py --bsc /tmp/BSC.json --cubemap /tmp/cubemap_faces\n"
            "Shipped assets already live under public/sky/; see docs/ATTRIBUTION-sky.md.",
            file=sys.stderr,
        )
        sys.exit(0)
    if args.bsc and not args.mw_only:
        build_stars(args.bsc)
    if args.cubemap and not args.stars_only:
        build_milky_way(args.cubemap)


if __name__ == "__main__":
    main()
