"""Per-protein configuration. VariantLab supports more than one protein by
keeping every protein-specific fact (sequence, numbering offset, structure,
assay description) in one place per protein, rather than hardcoding GB1
throughout the pipeline.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

DATA_RAW = Path(__file__).resolve().parents[2] / "data" / "raw"
DATA_PROCESSED = Path(__file__).resolve().parents[2] / "data" / "processed"


@dataclass(frozen=True)
class SecondaryStructureElement:
    kind: str  # "helix" or "strand"
    name: str
    domain_range: tuple[int, int]
    source: str  # how this was determined, for honest provenance


@dataclass(frozen=True)
class ProteinConfig:
    slug: str
    display_name: str
    organism: str
    reference_sequence: str
    raw_dataset_path: Path
    processed_csv_path: Path
    predictions_csv_path: Path
    eval_results_path: Path
    precursor_offset: int  # domain_position = precursor_position - precursor_offset
    unmapped_domain_positions: frozenset[int]
    dms_id: str
    first_author: str
    year: int
    journal_citation: str
    assay_description: str
    assay_caveat: str
    structure_path: Path
    structure_source: str  # e.g. "PDB 1PGB, X-ray 1.92A" or "AlphaFold AF-P04147-F1 (predicted)"
    structure_is_predicted: bool
    structure_resnum_offset: int  # pdb_resnum = domain_position + structure_resnum_offset
    structure_unmapped_domain_positions: frozenset[int]
    secondary_structure: tuple[SecondaryStructureElement, ...]
    large_effect_cutoff: float
    large_effect_cutoff_source: str
    # Some structures (e.g. Ambler-numbered beta-lactamases, or a chromophore
    # that merges several residues into one PDB group) can't be expressed as
    # a single linear offset. When set, this explicit per-position map is used
    # instead of structure_resnum_offset, built and verified position-by-
    # position against the real structure file (see docs/structure_provenance.md).
    structure_resnum_map: dict[int, str] | None = None


GB1 = ProteinConfig(
    slug="gb1",
    display_name="GB1 (Streptococcal protein G, B1 domain)",
    organism="Streptococcus sp. group G",
    reference_sequence="QYKLILNGKTLKGETTTEAVDAATAEKVFKQYANDNGVDGEWTYDDATKTFTVTE",
    raw_dataset_path=DATA_RAW / "SPG1_STRSG_Olson_2014_full.parquet",
    processed_csv_path=DATA_PROCESSED / "gb1_single_mutants.csv",
    predictions_csv_path=DATA_PROCESSED / "predictions.csv",
    eval_results_path=DATA_PROCESSED / "eval_results.json",
    precursor_offset=227,
    unmapped_domain_positions=frozenset({1}),
    dms_id="SPG1_STRSG_Olson_2014",
    first_author="Olson",
    year=2014,
    journal_citation="Current Biology 24(22):2643-2651",
    assay_description=(
        "mRNA display selected for binding to the Fc region of human IgG"
    ),
    assay_caveat=(
        "Conflates folding stability with binding affinity — a low score could "
        "mean either, or both. Does not imply instability alone."
    ),
    structure_path=DATA_RAW / "structure" / "1PGB.pdb",
    structure_source="PDB 1PGB (Gallagher, Alexander, Bryan & Gilliland, 1994), X-ray, 1.92 Å",
    structure_is_predicted=False,
    structure_resnum_offset=1,
    structure_unmapped_domain_positions=frozenset({1}),
    secondary_structure=(
        SecondaryStructureElement("strand", "beta1", (1, 8), "1PGB SHEET record"),
        SecondaryStructureElement("strand", "beta2", (11, 19), "1PGB SHEET record"),
        SecondaryStructureElement("helix", "alpha1", (22, 35), "1PGB HELIX record"),
        SecondaryStructureElement("strand", "beta3", (41, 45), "1PGB SHEET record"),
        SecondaryStructureElement("strand", "beta4", (49, 55), "1PGB SHEET record"),
    ),
    large_effect_cutoff=-4.0,
    large_effect_cutoff_source="ProteinGym's documented manual binarization cutoff for this assay",
)

PAB1 = ProteinConfig(
    slug="pab1",
    display_name="Pab1 (poly(A)-binding protein, RRM2 domain)",
    organism="Saccharomyces cerevisiae",
    reference_sequence="GNIFIKNLHPDIDNKALYDTFSVFGDILSSKIATDENGKSKGFGFVHFEEEGAAKEAIDALNGMLLNGQEIYVAP",
    raw_dataset_path=DATA_RAW / "pab1" / "PABP_YEAST_Melamed_2013_full.parquet",
    processed_csv_path=DATA_PROCESSED / "pab1_single_mutants.csv",
    predictions_csv_path=DATA_PROCESSED / "pab1_predictions.csv",
    eval_results_path=DATA_PROCESSED / "pab1_eval_results.json",
    precursor_offset=125,
    unmapped_domain_positions=frozenset(),
    dms_id="PABP_YEAST_Melamed_2013",
    first_author="Melamed",
    year=2013,
    journal_citation="RNA 19(11):1537-1551",
    assay_description=(
        "Yeast growth complementation — a pab1-null strain's growth rate with "
        "each variant as the only copy of Pab1 (an essential gene)"
    ),
    assay_caveat=(
        "A whole-organism growth readout, not a direct biophysical measurement. "
        "Conflates folding, expression level, RNA-binding activity, and general "
        "proteostasis burden — a far more indirect assay than GB1's binding "
        "selection. Treat any single-mechanism interpretation with more caution "
        "here than for GB1."
    ),
    structure_path=DATA_RAW / "pab1" / "structure" / "AF-P04147-F1.pdb",
    structure_source="AlphaFold model AF-P04147-F1 (v6) — PREDICTED, not experimental",
    structure_is_predicted=True,
    structure_resnum_offset=125,
    structure_unmapped_domain_positions=frozenset(),
    secondary_structure=(
        SecondaryStructureElement("strand", "beta1", (2, 8), "phi/psi geometry (this project's own classifier, not DSSP)"),
        SecondaryStructureElement("helix", "alpha1", (14, 24), "phi/psi geometry (this project's own classifier, not DSSP)"),
        SecondaryStructureElement("strand", "beta2", (29, 35), "phi/psi geometry (this project's own classifier, not DSSP)"),
        SecondaryStructureElement("strand", "beta3", (43, 48), "phi/psi geometry (this project's own classifier, not DSSP)"),
        SecondaryStructureElement("helix", "alpha2", (51, 60), "phi/psi geometry (this project's own classifier, not DSSP)"),
        SecondaryStructureElement("strand", "beta4", (62, 75), "phi/psi geometry (this project's own classifier, not DSSP)"),
    ),
    large_effect_cutoff=0.3,
    large_effect_cutoff_source="ProteinGym's documented manual binarization cutoff for this assay",
)

def domain_position_to_structure_resnum(config: ProteinConfig, domain_position: int) -> str | int | None:
    if domain_position in config.structure_unmapped_domain_positions:
        return None
    if config.structure_resnum_map is not None:
        return config.structure_resnum_map.get(domain_position)
    return domain_position + config.structure_resnum_offset


def secondary_structure_at(config: ProteinConfig, domain_position: int) -> str:
    for el in config.secondary_structure:
        lo, hi = el.domain_range
        if lo <= domain_position <= hi:
            return el.kind
    return "loop"

# Explicit structure residue-number maps, built and verified position-by-
# position against the real structure files (see docs/structure_provenance.md).
# TEM-1 uses classical Ambler numbering (insertion codes, two skipped
# numbers) -- not expressible as a linear offset.
TEM1_STRUCTURE_RESNUM_MAP = {
    1: "26", 2: "27", 3: "28", 4: "29", 5: "30", 6: "31", 7: "32", 8: "33",
    9: "34", 10: "35", 11: "36", 12: "37", 13: "38", 14: "39", 15: "40", 16: "41",
    17: "42", 18: "43", 19: "44", 20: "45", 21: "46", 22: "47", 23: "48", 24: "49",
    25: "50", 26: "51", 27: "51A", 28: "52", 29: "53", 30: "54", 31: "55", 32: "56",
    33: "58", 34: "59", 35: "60", 36: "61", 37: "62", 38: "63", 39: "64", 40: "65",
    41: "66", 42: "67", 43: "68", 44: "69", 45: "70", 46: "71", 47: "72", 48: "73",
    49: "74", 50: "75", 51: "76", 52: "77", 53: "78", 54: "79", 55: "80", 56: "81",
    57: "82", 58: "83", 59: "84", 60: "85", 61: "86", 62: "87", 63: "88", 64: "89",
    65: "90", 66: "91", 67: "92", 68: "93", 69: "94", 70: "95", 71: "96", 72: "97",
    73: "98", 74: "99", 75: "100", 76: "101", 77: "102", 78: "103", 79: "104", 80: "105",
    81: "106", 82: "107", 83: "108", 84: "109", 85: "110", 86: "111", 87: "112", 88: "113",
    89: "114", 90: "115", 91: "116", 92: "117", 93: "118", 94: "119", 95: "120", 96: "121",
    97: "122", 98: "123", 99: "124", 100: "125", 101: "126", 102: "127", 103: "128", 104: "129",
    105: "130", 106: "131", 107: "132", 108: "133", 109: "134", 110: "135", 111: "136", 112: "137",
    113: "138", 114: "139", 115: "140", 116: "141", 117: "142", 118: "143", 119: "144", 120: "145",
    121: "146", 122: "147", 123: "148", 124: "149", 125: "150", 126: "151", 127: "152", 128: "153",
    129: "154", 130: "155", 131: "156", 132: "157", 133: "158", 134: "159", 135: "160", 136: "161",
    137: "162", 138: "163", 139: "164", 140: "165", 141: "166", 142: "167", 143: "168", 144: "169",
    145: "170", 146: "171", 147: "172", 148: "173", 149: "174", 150: "175", 151: "176", 152: "177",
    153: "178", 154: "179", 155: "180", 156: "181", 157: "182", 158: "183", 159: "184", 160: "185",
    161: "186", 162: "187", 163: "188", 164: "189", 165: "190", 166: "191", 167: "192", 168: "193",
    169: "194", 170: "195", 171: "196", 172: "197", 173: "198", 174: "199", 175: "200", 176: "201",
    177: "202", 178: "203", 179: "204", 180: "205", 181: "206", 182: "207", 183: "208", 184: "209",
    185: "210", 186: "211", 187: "212", 188: "213", 189: "214", 190: "215", 191: "216", 192: "217",
    193: "218", 194: "219", 195: "220", 196: "221", 197: "222", 198: "223", 199: "224", 200: "225",
    201: "226", 202: "227", 203: "228", 204: "229", 205: "230", 206: "231", 207: "232", 208: "233",
    209: "234", 210: "235", 211: "236", 212: "237", 213: "238", 214: "240", 215: "241", 216: "242",
    217: "243", 218: "244", 219: "245", 220: "246", 221: "247", 222: "248", 223: "249", 224: "250",
    225: "251", 226: "252", 227: "254", 228: "255", 229: "256", 230: "257", 231: "258", 232: "259",
    233: "260", 234: "261", 235: "262", 236: "263", 237: "264", 238: "265", 239: "266", 240: "267",
    241: "268", 242: "269", 243: "270", 244: "271", 245: "272", 246: "273", 247: "274", 248: "275",
    249: "276", 250: "277", 251: "278", 252: "279", 253: "280", 254: "281", 255: "282", 256: "283",
    257: "284", 258: "285", 259: "286", 260: "287", 261: "288", 262: "289", 263: "290",
}

# GFP: domain positions 63-65 (the Ser65-Tyr66-Gly67 chromophore) all
# point to the single merged "CRO 66" group the crystal structure
# represents the mature, autocatalytically-cyclized fluorophore as.
# Domain positions 62 and 78 are intentionally excluded: 1EMA is a
# crystallization variant carrying F64L and Q80R relative to the wild-
# type sequence this project's DMS dataset assays (well-documented GFP
# engineering mutations, not an error in this mapping).
GFP_STRUCTURE_RESNUM_MAP = {
    1: "3", 2: "4", 3: "5", 4: "6", 5: "7", 6: "8", 7: "9", 8: "10",
    9: "11", 10: "12", 11: "13", 12: "14", 13: "15", 14: "16", 15: "17", 16: "18",
    17: "19", 18: "20", 19: "21", 20: "22", 21: "23", 22: "24", 23: "25", 24: "26",
    25: "27", 26: "28", 27: "29", 28: "30", 29: "31", 30: "32", 31: "33", 32: "34",
    33: "35", 34: "36", 35: "37", 36: "38", 37: "39", 38: "40", 39: "41", 40: "42",
    41: "43", 42: "44", 43: "45", 44: "46", 45: "47", 46: "48", 47: "49", 48: "50",
    49: "51", 50: "52", 51: "53", 52: "54", 53: "55", 54: "56", 55: "57", 56: "58",
    57: "59", 58: "60", 59: "61", 60: "62", 61: "63", 63: "66", 64: "66", 65: "66",
    66: "68", 67: "69", 68: "70", 69: "71", 70: "72", 71: "73", 72: "74", 73: "75",
    74: "76", 75: "77", 77: "79", 79: "81", 80: "82", 81: "83", 82: "84", 83: "85",
    84: "86", 85: "87", 87: "89", 88: "90", 89: "91", 90: "92", 91: "93", 92: "94",
    93: "95", 94: "96", 95: "97", 96: "98", 97: "99", 98: "100", 99: "101", 100: "102",
    101: "103", 102: "104", 103: "105", 104: "106", 105: "107", 106: "108", 107: "109", 108: "110",
    109: "111", 110: "112", 111: "113", 112: "114", 113: "115", 114: "116", 115: "117", 116: "118",
    117: "119", 118: "120", 119: "121", 120: "122", 121: "123", 122: "124", 123: "125", 124: "126",
    125: "127", 126: "128", 127: "129", 128: "130", 129: "131", 130: "132", 131: "133", 132: "134",
    133: "135", 134: "136", 135: "137", 136: "138", 137: "139", 138: "140", 139: "141", 140: "142",
    141: "143", 142: "144", 143: "145", 144: "146", 145: "147", 146: "148", 147: "149", 148: "150",
    149: "151", 150: "152", 152: "154", 153: "155", 154: "156", 155: "157", 156: "158", 157: "159",
    158: "160", 159: "161", 160: "162", 161: "163", 162: "164", 163: "165", 164: "166", 165: "167",
    166: "168", 167: "169", 168: "170", 169: "171", 170: "172", 171: "173", 172: "174", 173: "175",
    174: "176", 175: "177", 176: "178", 177: "179", 178: "180", 179: "181", 180: "182", 181: "183",
    182: "184", 183: "185", 184: "186", 185: "187", 186: "188", 187: "189", 188: "190", 189: "191",
    190: "192", 191: "193", 192: "194", 193: "195", 194: "196", 195: "197", 196: "198", 197: "199",
    198: "200", 199: "201", 200: "202", 201: "203", 202: "204", 203: "205", 204: "206", 205: "207",
    206: "208", 207: "209", 208: "210", 209: "211", 210: "212", 211: "213", 212: "214", 213: "215",
    214: "216", 215: "217", 217: "219", 218: "220", 219: "221", 220: "222", 221: "223", 222: "224",
    223: "225", 224: "226", 225: "227", 226: "228", 227: "229",
}


TEM1 = ProteinConfig(
    slug="tem1",
    display_name="TEM-1 (β-lactamase)",
    organism="Escherichia coli",
    reference_sequence=(
        "HPETLVKVKDAEDQLGARVGYIELDLNSGKILESFRPEERFPMMSTFKVLLCGAVLSRVDAGQEQLGRRIHYSQNDLVEYSPVTEKHLTDGMTVREL"
        "CSAAITMSDNTAANLLLTTIGGPKELTAFLHNMGDHVTRLDRWEPELNEAIPNDERDTTMPAAMATTLRKLLTGELLTLASRQQLIDWMEADKVAGPL"
        "LRSALPAGWFIADKSGAGERGSRGIIAALGPDGKPSRIVVIYTTGSQATMDERNRQIAEIGASLIKHW"
    ),
    raw_dataset_path=DATA_RAW / "tem1" / "BLAT_ECOLX_Firnberg_2014_full.parquet",
    processed_csv_path=DATA_PROCESSED / "tem1_single_mutants.csv",
    predictions_csv_path=DATA_PROCESSED / "tem1_predictions.csv",
    eval_results_path=DATA_PROCESSED / "tem1_eval_results.json",
    precursor_offset=23,
    unmapped_domain_positions=frozenset(),
    dms_id="BLAT_ECOLX_Firnberg_2014",
    first_author="Firnberg",
    year=2014,
    journal_citation="Molecular Biology and Evolution 31(6):1581-1592",
    assay_description=(
        "bacterial growth under a gradient of ampicillin concentrations (0.25-1024 "
        "µg/mL) -- an antibiotic-resistance selection, not a direct biophysical measurement"
    ),
    assay_caveat=(
        "A whole-cell selection confounded by expression level, periplasmic "
        "localization efficiency, and intrinsic catalytic activity, on top of "
        "folding stability -- an even more indirect readout than Pab1's growth "
        "assay. High scores here specifically mean 'confers antibiotic "
        "resistance,' not 'the protein folds well' in isolation."
    ),
    structure_path=DATA_RAW / "tem1" / "structure" / "1XPB.pdb",
    structure_source="PDB 1XPB (apo TEM-1 β-lactamase), X-ray, 1.90 Å",
    structure_is_predicted=False,
    structure_resnum_offset=0,
    structure_unmapped_domain_positions=frozenset(),
    structure_resnum_map=TEM1_STRUCTURE_RESNUM_MAP,
    secondary_structure=(
        SecondaryStructureElement("helix", "helix1", (4, 17), "1XPB HELIX record"),
        SecondaryStructureElement("strand", "strand_A4", (20, 27), "1XPB SHEET record"),
        SecondaryStructureElement("strand", "strand_A5", (32, 37), "1XPB SHEET record"),
        SecondaryStructureElement("strand", "strand_B1", (42, 44), "1XPB SHEET record"),
        SecondaryStructureElement("helix", "helix2", (46, 62), "1XPB HELIX record"),
        SecondaryStructureElement("helix", "helix3", (76, 78), "1XPB HELIX record"),
        SecondaryStructureElement("helix", "helix4", (86, 89), "1XPB HELIX record"),
        SecondaryStructureElement("helix", "helix5", (96, 105), "1XPB HELIX record"),
        SecondaryStructureElement("helix", "helix6", (109, 119), "1XPB HELIX record"),
        SecondaryStructureElement("helix", "helix7", (122, 131), "1XPB HELIX record"),
        SecondaryStructureElement("helix", "helix8", (145, 147), "1XPB HELIX record"),
        SecondaryStructureElement("strand", "strand_B2", (157, 159), "1XPB SHEET record"),
        SecondaryStructureElement("helix", "helix9", (160, 172), "1XPB HELIX record"),
        SecondaryStructureElement("helix", "helix10", (178, 189), "1XPB HELIX record"),
        SecondaryStructureElement("helix", "helix11", (198, 201), "1XPB HELIX record"),
        SecondaryStructureElement("strand", "strand_A1", (207, 214), "1XPB SHEET record"),
        SecondaryStructureElement("strand", "strand_A2", (221, 228), "1XPB SHEET record"),
        SecondaryStructureElement("strand", "strand_A3", (236, 243), "1XPB SHEET record"),
        SecondaryStructureElement("helix", "helix12", (249, 265), "1XPB HELIX record"),
    ),
    large_effect_cutoff=0.4257,
    large_effect_cutoff_source="ProteinGym's documented manual binarization cutoff for this assay",
)

GFP = ProteinConfig(
    slug="gfp",
    display_name="GFP (green fluorescent protein)",
    organism="Aequorea victoria",
    reference_sequence=(
        "KGEELFTGVVPILVELDGDVNGHKFSVSGEGEGDATYGKLTLKFICTTGKLPVPWPTLVTTLSYGVQCFSRYPDHMKQHDFFKSAMPEGYVQERTIFF"
        "KDDGNYKTRAEVKFEGDTLVNRIELKGIDFKEDGNILGHKLEYNYNSHNVYIMADKQKNGIKVNFKIRHNIEDGSVQLADHYQQNTPIGDGPVLLPDN"
        "HYLSTQSALSKDPNEKRDHMVLLEFVTAAGITHGMDELYK"
    ),
    raw_dataset_path=DATA_RAW / "gfp" / "GFP_AEQVI_Sarkisyan_2016_full.parquet",
    processed_csv_path=DATA_PROCESSED / "gfp_single_mutants.csv",
    predictions_csv_path=DATA_PROCESSED / "gfp_predictions.csv",
    eval_results_path=DATA_PROCESSED / "gfp_eval_results.json",
    precursor_offset=2,
    unmapped_domain_positions=frozenset(),
    dms_id="GFP_AEQVI_Sarkisyan_2016",
    first_author="Sarkisyan",
    year=2016,
    journal_citation="Nature 533:397-401",
    assay_description=(
        "flow cytometry (FACS) sorting by green fluorescence brightness in a "
        "pooled yeast library -- a direct optical readout of folded, functional "
        "chromophore formation"
    ),
    assay_caveat=(
        "Measures whether the protein folds AND correctly completes the "
        "autocatalytic chromophore-maturation chemistry -- a score near zero "
        "could mean misfolding, failed chromophore cyclization, or both; this "
        "project does not separate them."
    ),
    structure_path=DATA_RAW / "gfp" / "structure" / "1EMA.pdb",
    structure_source="PDB 1EMA (Ormo, Cubitt, Kallio, Gross, Tsien & Remington, 1996), X-ray, 1.90 Å",
    structure_is_predicted=False,
    structure_resnum_offset=0,
    structure_unmapped_domain_positions=frozenset({62, 76, 78, 86, 151, 216, 228, 229, 230, 231, 232, 233, 234, 235}),
    structure_resnum_map=GFP_STRUCTURE_RESNUM_MAP,
    secondary_structure=(
        SecondaryStructureElement("helix", "helix1", (2, 6), "1EMA HELIX record"),
        SecondaryStructureElement("strand", "beta1", (10, 20), "1EMA SHEET record"),
        SecondaryStructureElement("strand", "beta2", (23, 34), "1EMA SHEET record"),
        SecondaryStructureElement("strand", "beta3", (39, 46), "1EMA SHEET record"),
        SecondaryStructureElement("helix", "helix2", (55, 58), "1EMA HELIX record"),
        SecondaryStructureElement("helix", "helix3", (67, 69), "1EMA HELIX record"),
        SecondaryStructureElement("helix", "helix4", (81, 84), "1EMA HELIX record"),
        SecondaryStructureElement("strand", "beta4", (90, 98), "1EMA SHEET record"),
        SecondaryStructureElement("strand", "beta5", (103, 113), "1EMA SHEET record"),
        SecondaryStructureElement("strand", "beta6", (116, 126), "1EMA SHEET record"),
        SecondaryStructureElement("strand", "beta7", (146, 150), "1EMA SHEET record"),
        SecondaryStructureElement("strand", "beta8", (158, 168), "1EMA SHEET record"),
        SecondaryStructureElement("strand", "beta9", (174, 185), "1EMA SHEET record"),
        SecondaryStructureElement("strand", "beta10", (197, 205), "1EMA SHEET record"),
        SecondaryStructureElement("strand", "beta11", (218, 225), "1EMA SHEET record"),
    ),
    large_effect_cutoff=2.5,
    large_effect_cutoff_source="ProteinGym's documented manual binarization cutoff for this assay",
)

PROTEINS: dict[str, ProteinConfig] = {
    GB1.slug: GB1, PAB1.slug: PAB1, TEM1.slug: TEM1, GFP.slug: GFP,
}
