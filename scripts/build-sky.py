#!/usr/bin/env python3
"""Rebuild public/sky assets for Phase 4c steps 7.1–7.2. See docs/ATTRIBUTION-sky.md."""
from __future__ import annotations

import argparse
import json
import math
import struct
import sys
import urllib.request
from pathlib import Path

try:
    import numpy as np
    from PIL import Image
except ImportError:
    np = None  # type: ignore
    Image = None  # type: ignore

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "sky"
deg = math.pi / 180

D3_CELESTIAL_LINES = (
    "https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/constellations.lines.json"
)
D3_CELESTIAL_NAMES = (
    "https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/constellations.json"
)

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


def ra_dec_to_xyz(lon_deg: float, lat_deg: float) -> tuple[float, float, float]:
    """Same globe.gl celestial frame as Day 61 stars (RA degrees → lon, Dec → lat)."""
    ra = lon_deg * deg
    dec = lat_deg * deg
    x = math.cos(dec) * math.sin(ra)
    y = math.sin(dec)
    z = math.cos(dec) * math.cos(ra)
    return x, y, z


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
    if np is None or Image is None:
        sys.exit("Need pillow + numpy to rebuild the Milky Way texture")
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


def _load_json(path_or_url: str | Path) -> dict:
    p = Path(path_or_url) if not str(path_or_url).startswith("http") else None
    if p and p.is_file():
        return json.loads(p.read_text())
    url = str(path_or_url)
    with urllib.request.urlopen(url, timeout=60) as r:  # noqa: S310 — build-time fetch of known URLs
        return json.loads(r.read().decode("utf-8"))


def build_constellations(
    lines_src: str | Path | None = None,
    names_src: str | Path | None = None,
) -> None:
    """
    Compact binary of IAU constellation stick figures + names (Day 62 / step 7.2).

    Source: d3-celestial GeoJSON (BSD-3-Clause, © Olaf Frohn). Coordinates are celestial
    [RA_deg, Dec_deg] mapped into the same unit-sphere frame as bsc-stars.bin — we do not
    invent asterism geometry.

    Format (ETC1):
      magic "ETC1"
      uint32 nLineVerts (LE; even; consecutive pairs = LineSegments)
      float32 x,y,z * nLineVerts  (unit sphere)
      uint32 nNames
      per name: float32 x,y,z; uint8 rank; uint8 desigLen; desig utf-8;
                uint8 nameLen; classical name utf-8
    """
    lines = _load_json(lines_src or D3_CELESTIAL_LINES)
    names = _load_json(names_src or D3_CELESTIAL_NAMES)

    verts: list[float] = []
    for feat in lines["features"]:
        for seg in feat["geometry"]["coordinates"]:
            for i in range(len(seg) - 1):
                for lon, lat in (seg[i], seg[i + 1]):
                    x, y, z = ra_dec_to_xyz(float(lon), float(lat))
                    verts.extend((x, y, z))

    name_by_id: dict[str, tuple] = {}
    for feat in names["features"]:
        cid = feat["id"]
        if cid in name_by_id:
            continue  # Serpens Caput/Cauda share id; keep first label position
        lon, lat = feat["geometry"]["coordinates"]
        x, y, z = ra_dec_to_xyz(float(lon), float(lat))
        props = feat["properties"]
        label = (props.get("name") or props.get("desig") or cid).replace("\u2005", " ").strip()
        desig = (props.get("desig") or cid).strip()
        rank = int(props.get("rank") or 3)
        name_by_id[cid] = (x, y, z, rank, desig, label)

    OUT.mkdir(parents=True, exist_ok=True)
    bin_path = OUT / "constellations.bin"
    with bin_path.open("wb") as f:
        f.write(b"ETC1")
        n_line_verts = len(verts) // 3
        f.write(struct.pack("<I", n_line_verts))
        for v in verts:
            f.write(struct.pack("<f", v))
        name_list = list(name_by_id.values())
        f.write(struct.pack("<I", len(name_list)))
        for x, y, z, rank, desig, label in name_list:
            f.write(struct.pack("<fff", x, y, z))
            f.write(struct.pack("B", max(1, min(255, rank))))
            db = desig.encode("utf-8")
            nb = label.encode("utf-8")
            f.write(struct.pack("B", len(db)))
            f.write(db)
            f.write(struct.pack("B", len(nb)))
            f.write(nb)
    print(
        f"wrote {bin_path} ({bin_path.stat().st_size} bytes; "
        f"{n_line_verts // 2} segments, {len(name_list)} names)"
    )


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--bsc", type=Path, help="Path to BSC.json (Yale Bright Star Catalogue JSON)")
    p.add_argument("--cubemap", type=Path, help="Directory with posx/negx/... jpg faces")
    p.add_argument("--stars-only", action="store_true")
    p.add_argument("--mw-only", action="store_true")
    p.add_argument(
        "--constellations",
        action="store_true",
        help="Rebuild constellations.bin from d3-celestial (fetch or --lines/--names)",
    )
    p.add_argument("--lines", type=Path, help="Local constellations.lines.json")
    p.add_argument("--names", type=Path, help="Local constellations.json")
    p.add_argument("--constellations-only", action="store_true")
    args = p.parse_args()

    did = False
    if args.constellations or args.constellations_only or args.lines or args.names:
        build_constellations(args.lines, args.names)
        did = True
        if args.constellations_only:
            return

    if not args.bsc and not args.cubemap and not did:
        print(
            "Nothing to do. Pass --bsc, --cubemap, and/or --constellations.\n"
            "Examples:\n"
            "  python3 scripts/build-sky.py --constellations\n"
            "  python3 scripts/build-sky.py --bsc /tmp/BSC.json --cubemap /tmp/cubemap_faces\n"
            "  python3 scripts/build-sky.py --lines /tmp/constellations.lines.json "
            "--names /tmp/constellations.json\n"
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
