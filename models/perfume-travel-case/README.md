# Perfume Travel Case (3 bottles) — PLA

Cute Mermaid-style clamshell that holds **3 mini rectangular spray atomizers**.

Designed for **PLA** (rigid): snap alignment lip + neodymium magnets + filament-pin hinge.

## Files

| File | Purpose |
|------|---------|
| `perfume-case-bottom.stl` | Base with 3 wells, hinge knuckles, magnet pockets, keyring loop |
| `perfume-case-lid.stl` | Lid with spray-lock pads, magnet pockets, hinge knuckle |
| `perfume-case-print-plate.stl` | Both parts laid flat for one plate |
| `preview.png` | Quick orthographic preview |

Generator: `scripts/generate-perfume-travel-case.py`

```bash
.venv-cad/bin/python scripts/generate-perfume-travel-case.py
```

## Bottle envelope

From the cm-ruler photo (glass body + black spray):

| Dim | mm |
|-----|----|
| Length (incl. pump) | 52 |
| Width (flat face) | 15 |
| Thickness | 12 |
| Well clearance (per side) | 0.55 |

If your bottle is the larger yellow-tape reading (~100 mm), change `BOTTLE_L` / `BOTTLE_W` / `BOTTLE_H` in the generator and re-run.

## Hardware BOM (required)

| Qty | Part | Notes |
|-----|------|-------|
| **4** | Neodymium magnet **2 × 5 × 2 mm** | Bar magnets. Press-fit into front rim pockets (2 in bottom, 2 in lid). **Flip polarity** so each pair attracts. |
| **1** | Hinge pin | **1.75 mm filament** stub (~45 mm long) **or** M2 × 20–25 mm screw + nylock nut |

No screws are needed for the bottles — they friction-fit in the wells. The lid pads sit on the spray actuators so pumps cannot fire in a bag.

### Magnet install (PLA)

1. Dry-fit magnets in the pockets (pockets are ~0.1 mm undersize on XY for press-fit).
2. Mark N/S so lid↔base pairs attract (use another magnet as a tester).
3. Press in firmly. Optional: a drop of CA glue if the fit is loose on your printer.
4. Do **not** leave unsecured magnets near the print bed while printing the mating part — they will yank the nozzle.

### Hinge assemble

1. Print bottom + lid flat (no supports needed for the main shell; knuckles are printable as-oriented).
2. Align knuckles (bottom owns outer two, lid owns centre).
3. Push 1.75 mm filament through, trim flush, melt ends lightly **or** use an M2 screw.

## Print settings (PLA)

| Setting | Value |
|---------|-------|
| Layer height | 0.16–0.20 mm |
| Walls | 3–4 |
| Infill | 25–35% gyroid |
| Top/bottom | 5 layers |
| Supports | None (print both flat on build plate) |
| Orientation | Split faces down |

Soft-touch look: print in pastel pink / blush PLA. For a more silicone-like feel later, the same STLs can be tried in TPU, but magnet pockets and hinge clearances were tuned for PLA.

## Outer size (approx.)

- Closed footprint ~**56 × 58 mm** (+ keyring loop)
- Closed height ~**20 mm** (bottom 11.5 + lid 6.2 + lip)

## Design notes

- **Why magnets on PLA?** Rigid snap alone fatigues; 2×5×2 magnets give a positive close without screws every open.
- **Why not a living hinge?** Living hinges want TPU/PP. PLA will crack.
- **Spray lock:** three pads on the lid cover the white actuators.
- **Keyring loop:** left side of the base for a bag clip.
