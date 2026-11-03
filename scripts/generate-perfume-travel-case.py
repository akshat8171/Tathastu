#!/usr/bin/env python3
"""Generate printable STLs for a 3-bottle PLA perfume travel case.

Cute Mermaid-style clamshell sized for mini rectangular spray atomizers.
Material path: PLA (rigid) — snap lip + 2x5x2 mm neodymium magnets + filament pin hinge.

Bottle envelope (from cm-ruler photo, with print clearance):
  ~52 x 15 x 12 mm glass+pump atomizer
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import trimesh
from PIL import Image, ImageDraw
from shapely.geometry import box
from trimesh.boolean import difference, union
from trimesh.creation import cylinder, extrude_polygon

# --- Bottle (measured) + clearance ---
BOTTLE_L = 52.0  # length incl. spray pump (Y)
BOTTLE_W = 15.0  # flat face width (X)
BOTTLE_H = 12.0  # thickness (Z)
CLEAR = 0.55  # per-side clearance for PLA friction fit

WELL_L = BOTTLE_L + 2.0 * CLEAR
WELL_W = BOTTLE_W + 2.0 * CLEAR
WELL_D = 9.5  # recess depth in bottom (bottle sits proud ~2.5 mm)

COUNT = 3
DIVIDER = 1.8
WALL = 2.2
FLOOR = 2.0
CORNER_R = 6.0
WELL_R = 1.6

# Outer envelope
INNER_X = COUNT * WELL_W + (COUNT - 1) * DIVIDER
INNER_Y = WELL_L
OUTER_X = INNER_X + 2.0 * WALL
OUTER_Y = INNER_Y + 2.0 * WALL
BOTTOM_Z = FLOOR + WELL_D
LID_CAVITY = 4.0
LID_TOP = 2.2
LID_Z = LID_CAVITY + LID_TOP
LIP_H = 1.5
LIP_T = 1.1
LIP_CLEAR = 0.30

# Magnets: 2×5×2 mm bar (oriented as 5 mm along X, 2 mm along Y, 2 mm deep)
MAG_X = 5.0
MAG_Y = 2.0
MAG_Z = 2.0
MAG_FIT = 0.10  # undersize XY for PLA press-fit
MAG_POCKET_X = MAG_X - MAG_FIT
MAG_POCKET_Y = MAG_Y - MAG_FIT
MAG_POCKET_Z = MAG_Z + 0.15  # slight extra depth so face sits flush

# Hinge (1.75 mm filament pin or M2 screw)
PIN_D = 1.75
KNUCKLE_OUTER = 5.0
KNUCKLE_LEN = 6.0

ENGINE = "manifold"
OUT_DIR = Path(__file__).resolve().parents[1] / "models" / "perfume-travel-case"


def op(fn, meshes):
    prepared = []
    for mesh in meshes:
        item = mesh.copy()
        item.process()
        prepared.append(item)
    result = fn(prepared, engine=ENGINE)
    if isinstance(result, list):
        result = result[0]
    result.remove_unreferenced_vertices()
    return result


def rounded_rect_poly(sx: float, sy: float, radius: float):
    r = min(radius, sx / 2.0 - 0.2, sy / 2.0 - 0.2)
    return box(-sx / 2.0 + r, -sy / 2.0 + r, sx / 2.0 - r, sy / 2.0 - r).buffer(
        r, resolution=10
    )


def extrude_z(poly, z0: float, z1: float) -> trimesh.Trimesh:
    mesh = extrude_polygon(poly, z1 - z0)
    mesh.apply_translation([0.0, 0.0, z0])
    return mesh


def shell_body(z0: float, z1: float, radius: float = CORNER_R) -> trimesh.Trimesh:
    return extrude_z(rounded_rect_poly(OUTER_X, OUTER_Y, radius), z0, z1)


def well_cutters() -> trimesh.Trimesh:
    """Three rectangular wells centred in XY, cut from Z=FLOOR upward."""
    pitch = WELL_W + DIVIDER
    x0 = -((COUNT - 1) * pitch) / 2.0
    wells = []
    for i in range(COUNT):
        poly = rounded_rect_poly(WELL_W, WELL_L, WELL_R)
        well = extrude_z(poly, FLOOR - 0.05, BOTTOM_Z + 0.2)
        well.apply_translation([x0 + i * pitch, 0.0, 0.0])
        wells.append(well)
    return op(union, wells)


def lid_cavity() -> trimesh.Trimesh:
    """Shallow cavity over the three wells + spray actuator pads clearance."""
    poly = rounded_rect_poly(INNER_X + 0.6, INNER_Y + 0.6, WELL_R + 0.5)
    return extrude_z(poly, -0.05, LID_CAVITY)


def spray_pads() -> trimesh.Trimesh:
    """Pads that rest on spray actuators so pumps cannot fire in a bag."""
    pitch = WELL_W + DIVIDER
    x0 = -((COUNT - 1) * pitch) / 2.0
    # Pump sits at +Y end of bottle
    pad_y = WELL_L / 2.0 - 6.0
    pads = []
    for i in range(COUNT):
        poly = rounded_rect_poly(8.0, 7.0, 1.5)
        pad = extrude_z(poly, LID_CAVITY - 1.8, LID_CAVITY)
        pad.apply_translation([x0 + i * pitch, pad_y, 0.0])
        pads.append(pad)
    return op(union, pads)


def alignment_lip_solid() -> trimesh.Trimesh:
    """Raised lip on bottom rim that locates into the lid."""
    outer = rounded_rect_poly(OUTER_X - 1.2, OUTER_Y - 1.2, CORNER_R - 0.6)
    inner = rounded_rect_poly(
        OUTER_X - 1.2 - 2.0 * LIP_T, OUTER_Y - 1.2 - 2.0 * LIP_T, CORNER_R - 0.6 - LIP_T
    )
    ring = outer.difference(inner)
    return extrude_z(ring, BOTTOM_Z, BOTTOM_Z + LIP_H)


def alignment_lip_pocket() -> trimesh.Trimesh:
    """Matching recess in lid (slightly oversized)."""
    outer = rounded_rect_poly(
        OUTER_X - 1.2 + LIP_CLEAR, OUTER_Y - 1.2 + LIP_CLEAR, CORNER_R - 0.6 + LIP_CLEAR / 2
    )
    inner = rounded_rect_poly(
        OUTER_X - 1.2 - 2.0 * LIP_T - LIP_CLEAR,
        OUTER_Y - 1.2 - 2.0 * LIP_T - LIP_CLEAR,
        max(1.0, CORNER_R - 0.6 - LIP_T - LIP_CLEAR / 2),
    )
    ring = outer.difference(inner)
    return extrude_z(ring, -0.05, LIP_H + LIP_CLEAR)


def magnet_pocket_mesh() -> trimesh.Trimesh:
    """Single 2x5x2 pocket cutter (opens toward mating face)."""
    return trimesh.creation.box(
        (MAG_POCKET_X, MAG_POCKET_Y, MAG_POCKET_Z + 0.2)
    )


def magnet_pockets_bottom() -> trimesh.Trimesh:
    """Two pockets in bottom front rim, opening upward toward lid."""
    y = -OUTER_Y / 2.0 + WALL / 2.0 + 0.15
    z = BOTTOM_Z - MAG_POCKET_Z / 2.0 + 0.05
    xs = (-INNER_X / 2.0 + 4.0, INNER_X / 2.0 - 4.0)
    parts = []
    for x in xs:
        p = magnet_pocket_mesh()
        p.apply_translation([x, y, z])
        parts.append(p)
    return op(union, parts)


def magnet_pockets_lid() -> trimesh.Trimesh:
    """Matching pockets in lid front rim, opening downward toward bottom."""
    y = -OUTER_Y / 2.0 + WALL / 2.0 + 0.15
    z = MAG_POCKET_Z / 2.0 - 0.05
    xs = (-INNER_X / 2.0 + 4.0, INNER_X / 2.0 - 4.0)
    parts = []
    for x in xs:
        p = magnet_pocket_mesh()
        p.apply_translation([x, y, z])
        parts.append(p)
    return op(union, parts)


def hinge_knuckles(is_bottom: bool) -> tuple[trimesh.Trimesh, trimesh.Trimesh]:
    """
    Alternating knuckles on the +Y (back) edge.
    Bottom owns outer two; lid owns centre. Returns (solids, pin_hole).
    """
    y = OUTER_Y / 2.0 + KNUCKLE_OUTER / 2.0 - 0.8
    z = BOTTOM_Z if is_bottom else 0.0
    # Shared hinge axis at mid split plane height once assembled:
    # bottom top = BOTTOM_Z, lid bottom = 0 → assemble lid atop bottom.
    axis_z_bottom = BOTTOM_Z
    axis_z_lid = 0.0  # after lid is placed, hinge sits at joint

    span = INNER_X * 0.55
    # Three knuckle slots along X: L (bottom), C (lid), R (bottom)
    positions = (-span / 2.0, 0.0, span / 2.0)
    owned = (True, False, True) if is_bottom else (False, True, False)

    solids = []
    for x, mine in zip(positions, owned):
        if not mine:
            continue
        outer = cylinder(radius=KNUCKLE_OUTER / 2.0, height=KNUCKLE_LEN, sections=28)
        # Cylinder default along Z; rotate to X axis
        rot = trimesh.transformations.rotation_matrix(np.pi / 2.0, [0.0, 1.0, 0.0])
        outer.apply_transform(rot)
        # Blend tab into shell
        tab = trimesh.creation.box((KNUCKLE_LEN - 0.4, KNUCKLE_OUTER * 0.7, KNUCKLE_OUTER * 0.55))
        tab.apply_translation([0.0, -KNUCKLE_OUTER * 0.25, 0.0])
        knuckle = op(union, [outer, tab])
        if is_bottom:
            knuckle.apply_translation([x, y, axis_z_bottom])
        else:
            knuckle.apply_translation([x, y, axis_z_lid])
        solids.append(knuckle)

    body = op(union, solids) if solids else trimesh.Trimesh()

    hole = cylinder(radius=PIN_D / 2.0 + 0.12, height=span + KNUCKLE_LEN + 8.0, sections=24)
    rot = trimesh.transformations.rotation_matrix(np.pi / 2.0, [0.0, 1.0, 0.0])
    hole.apply_transform(rot)
    if is_bottom:
        hole.apply_translation([0.0, y, axis_z_bottom])
    else:
        hole.apply_translation([0.0, y, axis_z_lid])
    return body, hole


def keychain_loop() -> tuple[trimesh.Trimesh, trimesh.Trimesh]:
    """Small loop on -X side for a keyring."""
    outer = cylinder(radius=4.0, height=3.0, sections=24)
    tab = trimesh.creation.box((5.0, 7.0, 3.0))
    tab.apply_translation([2.0, 0.0, 0.0])
    solid = op(union, [outer, tab])
    solid.apply_translation([-OUTER_X / 2.0 - 1.5, 0.0, BOTTOM_Z / 2.0])
    hole = cylinder(radius=2.2, height=8.0, sections=24)
    hole.apply_translation([-OUTER_X / 2.0 - 1.5, 0.0, BOTTOM_Z / 2.0])
    return solid, hole


def brand_emboss_cutter() -> trimesh.Trimesh:
    """Shallow recessed panel on lid top for optional logo sticker / emboss."""
    poly = rounded_rect_poly(22.0, 8.0, 2.0)
    return extrude_z(poly, LID_Z - 0.45, LID_Z + 0.1)


def build_bottom() -> trimesh.Trimesh:
    body = shell_body(0.0, BOTTOM_Z)
    body = op(difference, [body, well_cutters()])
    lip = alignment_lip_solid()
    body = op(union, [body, lip])
    knuckles, pin = hinge_knuckles(is_bottom=True)
    body = op(union, [body, knuckles])
    body = op(difference, [body, pin])
    body = op(difference, [body, magnet_pockets_bottom()])
    loop, loop_hole = keychain_loop()
    body = op(union, [body, loop])
    body = op(difference, [body, loop_hole])
    return body


def build_lid() -> trimesh.Trimesh:
    body = shell_body(0.0, LID_Z, radius=CORNER_R)
    body = op(difference, [body, lid_cavity()])
    # Spray pads added as solid inside cavity
    pads = spray_pads()
    body = op(union, [body, pads])
    body = op(difference, [body, alignment_lip_pocket()])
    knuckles, pin = hinge_knuckles(is_bottom=False)
    body = op(union, [body, knuckles])
    body = op(difference, [body, pin])
    body = op(difference, [body, magnet_pockets_lid()])
    body = op(difference, [body, brand_emboss_cutter()])
    return body


def write_stl(mesh: trimesh.Trimesh, path: Path) -> None:
    mesh.merge_vertices()
    mesh.remove_unreferenced_vertices()
    mesh.export(path)


def render_preview(bottom: trimesh.Trimesh, lid: trimesh.Trimesh, path: Path) -> None:
    gap = 10.0
    verts_b = bottom.vertices
    verts_l = lid.vertices.copy()
    verts_l[:, 1] += OUTER_Y + gap
    all_v = [verts_b, verts_l]
    min_x = min(v[:, 0].min() for v in all_v)
    max_x = max(v[:, 0].max() for v in all_v)
    min_y = min(v[:, 1].min() for v in all_v)
    max_y = max(v[:, 1].max() for v in all_v)
    px = 9.0
    pad = 14.0
    image = Image.new(
        "RGB",
        (int((max_x - min_x + pad * 2) * px), int((max_y - min_y + pad * 2) * px)),
        (252, 244, 246),
    )
    draw = ImageDraw.Draw(image)

    def project(mesh, dy, color):
        faces = []
        for tri in mesh.triangles:
            pts = tri.copy()
            pts[:, 1] += dy
            normal = np.cross(pts[1] - pts[0], pts[2] - pts[0])
            if normal[2] <= 0:
                continue
            faces.append((pts[:, 2].mean(), pts))
        faces.sort(key=lambda item: item[0])
        for _, tri in faces:
            poly = [
                ((p[0] - min_x + pad) * px, (max_y + pad - p[1]) * px) for p in tri
            ]
            draw.polygon(poly, fill=color, outline=(140, 70, 90))

    project(bottom, 0.0, (236, 164, 180))
    project(lid, OUTER_Y + gap, (245, 190, 200))
    image.save(path)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    bottom = build_bottom()
    lid = build_lid()

    write_stl(bottom, OUT_DIR / "perfume-case-bottom.stl")
    write_stl(lid, OUT_DIR / "perfume-case-lid.stl")

    plate_lid = lid.copy()
    plate_lid.apply_translation([OUTER_X + 14.0, 0.0, 0.0])
    plate = trimesh.util.concatenate([bottom, plate_lid])
    write_stl(plate, OUT_DIR / "perfume-case-print-plate.stl")
    render_preview(bottom, lid, OUT_DIR / "preview.png")

    for name, mesh in (("bottom", bottom), ("lid", lid)):
        size = mesh.bounds[1] - mesh.bounds[0]
        print(
            f"{name:6s} {size[0]:5.1f} x {size[1]:5.1f} x {size[2]:5.1f} mm  "
            f"watertight={mesh.is_watertight} faces={len(mesh.faces)} vol={mesh.volume:.0f}"
        )
    print(
        f"Outer ~{OUTER_X:.1f} x {OUTER_Y:.1f} mm  "
        f"wells {COUNT}×({WELL_W:.1f}x{WELL_L:.1f}x{WELL_D:.1f})  "
        f"magnets 2 pairs of {MAG_X:.0f}x{MAG_Y:.0f}x{MAG_Z:.0f} mm"
    )
    print("Wrote", OUT_DIR)


if __name__ == "__main__":
    main()
