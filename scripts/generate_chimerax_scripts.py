"""Generate a ChimeraX command script per protein that colors the real
structure by mean observed DMS score and saves a 3D angled view plus a
rotated flat view. These can't run headlessly in this sandboxed session (no
GUI/WindowServer access) -- run them yourself:

    /Applications/ChimeraX-1.12.app/Contents/MacOS/ChimeraX scripts/render_chimerax_<slug>.cxc

Run from the project root: python3 scripts/generate_chimerax_scripts.py
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import pandas as pd

from variantlab.proteins import PROTEINS, domain_position_to_structure_resnum
from variantlab.structure_viz import _score_to_color, per_position_summary

PROJECT_ROOT = Path(__file__).resolve().parents[1]


def build_script(protein_slug: str) -> str:
    protein = PROTEINS[protein_slug]
    df = pd.read_csv(protein.predictions_csv_path)
    summary = per_position_summary(df)
    vmin, vmax = summary["mean_score"].min(), summary["mean_score"].max()

    structure_rel = protein.structure_path.relative_to(PROJECT_ROOT)

    lines = [
        f"open {structure_rel}",
        "hide atoms",
        "cartoon",
        "cartoon style width 1.6 thickness 0.6",
        "color white",
        "lighting soft",
        "set bgColor white",
        "graphics silhouettes true",
    ]

    seen_resnums = set()
    for pos, row in summary.iterrows():
        resnum = domain_position_to_structure_resnum(protein, pos)
        if resnum is None or resnum in seen_resnums:
            continue
        seen_resnums.add(resnum)
        hexcolor = _score_to_color(row["mean_score"], vmin, vmax)
        lines.append(f"color /A:{resnum} {hexcolor}")

    out_dir = "data/processed/structure_renders"
    lines += [
        "view",
        f"save {out_dir}/{protein_slug}_3d_view.png width 1200 height 1200 supersample 3 transparentBackground false",
        "turn y 90",
        "view",
        f"save {out_dir}/{protein_slug}_2d_flat_view.png width 1200 height 1200 supersample 3 transparentBackground false",
        "exit",
    ]
    return "\n".join(lines) + "\n"


def main():
    for slug in PROTEINS:
        script = build_script(slug)
        out_path = PROJECT_ROOT / "scripts" / f"render_chimerax_{slug}.cxc"
        out_path.write_text(script)
        n_colored = script.count("color /A:")
        print(f"{slug}: wrote {out_path.name} ({n_colored} residues colored)")


if __name__ == "__main__":
    main()
