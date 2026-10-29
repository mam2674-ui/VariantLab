# Scientific fact-check checklist

Run this before adding or changing any virus record. Automated checks (Vitest) cover the items marked [auto].

## Per record
- [ ] Taxonomy copied from the current ICTV VMR/MSL spreadsheet, not from memory or Wikipedia; `msl` field updated. [auto: MSL41 present]
- [ ] Note whether the profiled virus is the species exemplar or an additional isolate.
- [ ] Species name is the ICTV species name; the common virus name is stored separately.
- [ ] Every verified/simplified/variable fact cites at least one source in `sources.json`. [auto]
- [ ] Each fact's `scope` says the level it was reported at (family, genus, species, virus, isolate). A family range is never presented as a measurement of one virus.
- [ ] Genome length matches the cited NCBI record (check `slen`), with bp for double-stranded and nt for single-stranded.
- [ ] RNA sense is `not_applicable` for DNA genomes. [auto]
- [ ] Baltimore class is consistent with genome type. [auto]
- [ ] Segment count agrees with `segmented`. [auto]
- [ ] Dimensions: min ≤ central ≤ max; units correct; Å converted (÷10) to nm. [auto]
- [ ] Elongated particles store length and width separately, never one "diameter". [auto for T4]
- [ ] Mean ± SD is labelled as such, not as a range.
- [ ] Anything that cannot be confirmed is `not_verified` with a note, and appears on the sources page under "Known gaps".

## Per diagram
- [ ] Every component maps to a renderer part and vice versa. [auto]
- [ ] Envelope drawn if and only if the record says enveloped. [auto]
- [ ] No icosahedral capsid drawn for helical-nucleocapsid viruses. [auto for influenza, SARS-CoV-2]
- [ ] Caption says "schematic" and states what is illustrative.
- [ ] `cannotShow` lists at least one honest limitation. [auto]
- [ ] No third-party image copied; shapes drawn from cited descriptions.

## Per protein structure
- [ ] PDB entry exists; method, resolution and release read from the RCSB API, not memory. [auto: source registered]
- [ ] Chains in the coordinate file match the curated chain list; host and nucleic-acid chains labelled. [auto]
- [ ] Caveats state fragment / subunit / strain / bound ligands honestly.
- [ ] Role text cites an atlas source, not the PDB title alone.

## Per genome map
- [ ] Molecule lengths sum to the recorded reference length. [auto]
- [ ] Segment count matches. [auto]
- [ ] Every CDS lies inside its molecule. [auto]

## Known open items (2026-10-28)
- Influenza A: none in the record; the 7+1 RNP arrangement is deliberately not drawn because it was not verified.
- HPV16: replication compartment (nucleus) flagged `not_verified`.
- Phage T4: release by lysis flagged `not_verified`.
- HAdV-5: type-specific fibre length not verified (family range shown).
- HSV-1: envelope diameter is a family range.
- HBV and poliovirus entry steps, TMV assembly and phiX174 entry are flagged not_verified.
- No expert review yet.
