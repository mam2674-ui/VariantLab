import type { DiagramSpec } from "@/lib/schema";

/**
 * Diagram specifications: which structural components a schematic shows, how
 * they are labelled at two levels of detail, and the sources behind each.
 * Geometry lives in the renderer components; this file holds the science.
 */
export const diagramSpecs: DiagramSpec[] = [
  {
    id: "influenza-a",
    virusId: "influenza-a",
    renderer: "influenza",
    caption: "Schematic of a spherical influenza A particle. Not to scale internally; protein counts and positions are illustrative.",
    cannotShow: [
      "Filamentous particles, which can be several micrometres long.",
      "The real number or spacing of HA and NA molecules.",
      "How the eight RNPs are arranged relative to each other.",
    ],
    components: [
      { id: "envelope", type: "envelope", layer: "exterior", labelSimple: "Envelope", labelDetailed: "Lipid envelope (from host cell membrane)", description: "A lipid membrane taken from the host cell membrane during budding. It carries the viral glycoproteins.", status: "verified", sourceIds: ["ictv-orthomyxo-report"] },
      { id: "ha", type: "surface-protein", layer: "exterior", labelSimple: "HA spike", labelDetailed: "Haemagglutinin (HA) trimer", description: "The predominant surface glycoprotein, a trimer. It binds sialic-acid receptors to start infection. Projections are 10–14 nm long.", status: "verified", sourceIds: ["ictv-orthomyxo-report", "viralzone-alphainfluenzavirus"] },
      { id: "na", type: "surface-protein", layer: "exterior", labelSimple: "NA", labelDetailed: "Neuraminidase (NA) tetramer", description: "A tetrameric envelope glycoprotein with neuraminidase enzyme activity. Less abundant than HA.", status: "verified", sourceIds: ["ictv-orthomyxo-report", "viralzone-alphainfluenzavirus"] },
      { id: "m2", type: "surface-protein", layer: "exterior", labelSimple: "M2 channel", labelDetailed: "M2 proton channel", description: "A small number of M2 ion-channel proteins sit in the envelope.", status: "verified", sourceIds: ["ictv-orthomyxo-report", "viralzone-alphainfluenzavirus"] },
      { id: "matrix", type: "matrix", layer: "interior", labelSimple: "Matrix", labelDetailed: "M1 matrix protein layer", description: "M1 is an internal protein beneath the envelope. Drawn here as a continuous layer: a simplification.", status: "simplified", sourceIds: ["ictv-orthomyxo-report"] },
      { id: "rnp", type: "nucleocapsid", layer: "interior", labelSimple: "8 RNA segments", labelDetailed: "Ribonucleoproteins (vRNA + NP + polymerase), ×8", description: "Each of the eight negative-sense RNA segments is coated with nucleoprotein (NP) and carries the viral polymerase. RNPs have helical symmetry and are 50–150 nm long.", status: "verified", sourceIds: ["ictv-orthomyxo-report", "viralzone-alphainfluenzavirus"] },
    ],
  },
  {
    id: "sars-cov-2",
    virusId: "sars-cov-2",
    renderer: "coronavirus",
    caption: "Schematic of a SARS-CoV-2 particle. Spike count is drawn near the measured average of ~24 per virion; the real number varies widely.",
    cannotShow: [
      "Variation in particle shape and spike number (24 ± 9 trimers per virion).",
      "Spike flexibility: real spikes tilt on hinges.",
      "The packing of individual nucleocapsid units.",
    ],
    components: [
      { id: "envelope", type: "envelope", layer: "exterior", labelSimple: "Envelope", labelDetailed: "Lipid envelope (from ER–Golgi membranes)", description: "Coronaviruses acquire their envelope by budding into membranes of the endoplasmic reticulum / intermediate compartment / Golgi, not at the cell surface.", status: "verified", sourceIds: ["ictv-coronaviridae-report", "viralzone-betacoronavirus"] },
      { id: "spike", type: "surface-protein", layer: "exterior", labelSimple: "Spike (S)", labelDetailed: "Spike (S) glycoprotein trimer", description: "A large homotrimeric type I membrane glycoprotein that binds host receptors. Cryo-ET found 24 ± 9 S trimers per virion.", status: "verified", sourceIds: ["ictv-coronaviridae-report", "ke2020-sarscov2-spikes"] },
      { id: "m-protein", type: "surface-protein", layer: "exterior", labelSimple: "M protein", labelDetailed: "Membrane (M) glycoprotein", description: "An integral type III membrane protein embedded in the envelope.", status: "verified", sourceIds: ["ictv-coronaviridae-report"] },
      { id: "e-protein", type: "surface-protein", layer: "exterior", labelSimple: "E protein", labelDetailed: "Envelope (E) protein pentamer", description: "A small pentameric integral membrane protein.", status: "verified", sourceIds: ["ictv-coronaviridae-report"] },
      { id: "nucleocapsid", type: "nucleocapsid", layer: "interior", labelSimple: "Nucleocapsid", labelDetailed: "N protein + genomic RNA (helical units)", description: "The single genomic RNA bound by nucleocapsid (N) protein, organised in short helical units arranged loosely inside the virion. There is no icosahedral capsid.", status: "verified", sourceIds: ["ictv-coronaviridae-report"] },
    ],
  },
  {
    id: "phage-t4",
    virusId: "phage-t4",
    renderer: "phage-t4",
    caption: "Schematic of bacteriophage T4 with an extended tail. Head and tail proportions follow published dimensions; fibre angles are drawn in one illustrative pose.",
    cannotShow: [
      "The contracted-tail state that follows host attachment.",
      "The real packing density and arrangement of DNA in the head.",
      "Head decoration proteins (Hoc, Soc).",
    ],
    components: [
      { id: "head", type: "capsid", layer: "exterior", labelSimple: "Head (capsid)", labelDetailed: "Prolate icosahedral head (gp23*, T_end = 13, T_mid = 20)", description: "An elongated icosahedral protein shell, 120 nm long and 86 nm wide. 930 copies of the major capsid protein gp23* form its hexamer lattice.", status: "verified", sourceIds: ["fokine2004-t4-head", "rao2023-t4-head"] },
      { id: "dna", type: "genome", layer: "interior", labelSimple: "DNA", labelDetailed: "Linear dsDNA (~171 kb packaged)", description: "About 171 kb of linear double-stranded DNA, slightly more than one genome length, packed into the head.", status: "verified", sourceIds: ["rao2023-t4-head"] },
      { id: "portal", type: "portal", layer: "exterior", labelSimple: "Neck", labelDetailed: "Portal vertex and neck connector", description: "A dodecameric portal–neck connector at one vertex joins the head to the tail; DNA enters and leaves through it.", status: "verified", sourceIds: ["rao2023-t4-head"] },
      { id: "sheath", type: "tail", layer: "exterior", labelSimple: "Tail sheath", labelDetailed: "Contractile tail sheath (~140 nm tail)", description: "The sheath surrounds the inner tube and contracts during infection, pushing the tube through the cell envelope.", status: "verified", sourceIds: ["leiman2010-t4-tail", "rao2023-t4-head"] },
      { id: "tube", type: "tail", layer: "interior", labelSimple: "Tail tube", labelDetailed: "Internal tail tube (DNA channel)", description: "A rigid tube inside the sheath that serves as the channel for DNA delivery into the host cytoplasm.", status: "verified", sourceIds: ["leiman2010-t4-tail"] },
      { id: "baseplate", type: "tail", layer: "exterior", labelSimple: "Baseplate", labelDetailed: "Hexagonal baseplate", description: "A multiprotein hexagonal baseplate at the tail tip. Its conformational change triggers contraction.", status: "verified", sourceIds: ["rao2023-t4-head", "leiman2010-t4-tail"] },
      { id: "fibres", type: "fibre", layer: "exterior", labelSimple: "Tail fibres", labelDetailed: "Long tail fibres (×6, ~160 nm, kinked)", description: "Six long, kinked fibres attached to the baseplate recognise the host. Short tail fibres (not drawn separately) also bind the cell.", status: "verified", sourceIds: ["rao2023-t4-head", "leiman2010-t4-tail"] },
    ],
  },
  {
    id: "human-adenovirus-5",
    virusId: "human-adenovirus-5",
    renderer: "adenovirus",
    caption: "Schematic of an adenovirus capsid viewed down a threefold-like axis, so the icosahedron's outline is a hexagon. Fibre length is illustrative.",
    cannotShow: [
      "The true three-dimensional icosahedron: only 6 of the 12 vertices appear on the outline.",
      "The real HAdV-5 fibre length (the family range is 9–77.5 nm; this type's value was not verified here).",
      "Core proteins packaged with the DNA, and minor capsid proteins.",
    ],
    components: [
      { id: "hexon", type: "capsid", layer: "exterior", labelSimple: "Hexons", labelDetailed: "Hexon capsomers (240 per capsid)", description: "Trimeric capsomers, 8–10 nm across, that tile the 20 triangular faces. The capsid has pseudo T=25 symmetry.", status: "verified", sourceIds: ["ictv-adenoviridae-report", "viralzone-mastadenovirus"] },
      { id: "penton", type: "capsid", layer: "exterior", labelSimple: "Pentons", labelDetailed: "Penton bases (12, at the vertices)", description: "One penton base sits at each of the 12 vertices. It binds integrins during entry.", status: "verified", sourceIds: ["ictv-adenoviridae-report", "viralzone-mastadenovirus"] },
      { id: "fibre", type: "fibre", layer: "exterior", labelSimple: "Fibres", labelDetailed: "Fibres with terminal knob", description: "A fibre projects from each vertex penton and attaches to the CAR receptor. Fibre lengths across adenoviruses range from 9 to 77.5 nm.", status: "verified", sourceIds: ["ictv-adenoviridae-report", "viralzone-mastadenovirus"] },
      { id: "genome", type: "genome", layer: "interior", labelSimple: "DNA", labelDetailed: "Linear dsDNA (35,938 bp in HAdV-5)", description: "One linear double-stranded DNA molecule inside the capsid. There is no envelope around the capsid.", status: "verified", sourceIds: ["ncbi-ac000008", "ictv-adenoviridae-2022"] },
    ],
  },
  {
    id: "hsv-1",
    virusId: "hsv-1",
    renderer: "herpesvirus",
    caption: "Schematic of an HSV-1 particle: envelope, tegument, capsid and DNA core. The tegument's irregular outline signals that it lacks icosahedral symmetry; its exact shape here is illustrative.",
    cannotShow: [
      "The real number and types of envelope glycoproteins (HSV-1 has several distinct ones).",
      "The organisation of tegument proteins, which are not drawn individually.",
      "The size of an individual HSV-1 particle: the envelope range shown is family-level.",
    ],
    components: [
      { id: "envelope", type: "envelope", layer: "exterior", labelSimple: "Envelope", labelDetailed: "Lipid envelope", description: "A lipid envelope containing integral viral glycoproteins.", status: "verified", sourceIds: ["ictv-herpesviridae-2021"] },
      { id: "glycoproteins", type: "surface-protein", layer: "exterior", labelSimple: "Glycoproteins", labelDetailed: "Envelope glycoprotein spikes", description: "Integral viral glycoproteins form a network of spikes; they mediate attachment and membrane fusion.", status: "verified", sourceIds: ["ictv-herpesviridae-2021"] },
      { id: "tegument", type: "tegument", layer: "interior", labelSimple: "Tegument", labelDetailed: "Tegument (inner and outer layers)", description: "A protein layer between capsid and envelope, with inner and outer layers. It is one of the virion's non-symmetrical components.", status: "verified", sourceIds: ["ictv-herpesviridae-2021"] },
      { id: "capsid", type: "capsid", layer: "interior", labelSimple: "Capsid", labelDetailed: "T=16 icosahedral capsid (~125 nm)", description: "162 capsomers: 150 hexons, 11 pentons and one portal through which DNA is packaged.", status: "verified", sourceIds: ["ictv-herpesviridae-2021", "chen2001-hsv1-capsid"] },
      { id: "genome", type: "genome", layer: "interior", labelSimple: "DNA", labelDetailed: "Linear dsDNA (152,222 bp, strain 17)", description: "The core: a linear double-stranded DNA genome packaged into the capsid.", status: "verified", sourceIds: ["ictv-herpesviridae-2021", "ncbi-jn555585"] },
    ],
  },
  {
    id: "hpv-16",
    virusId: "hpv-16",
    renderer: "papillomavirus",
    caption: "Schematic of a papillomavirus capsid: pentameric L1 capsomers on an icosahedral outline, with a circular DNA genome inside. Capsomer positions are illustrative, not a true T=7 lattice.",
    cannotShow: [
      "The exact T=7 positions of all 72 capsomers in three dimensions.",
      "Where the L2 protein sits and how many copies are present.",
      "Proteins associated with the packaged DNA.",
    ],
    components: [
      { id: "l1", type: "capsid", layer: "exterior", labelSimple: "L1 capsomers", labelDetailed: "L1 pentamers (72, T=7)", description: "The major capsid protein L1 forms 72 pentameric capsomers (360 L1 copies) in a T=7 arrangement.", status: "verified", sourceIds: ["ictv-papillomaviridae-report", "ictv-papillomaviridae-2018"] },
      { id: "l2", type: "capsid", layer: "interior", labelSimple: "L2", labelDetailed: "Minor capsid protein L2", description: "The minor capsid protein takes part in assembly and infection. Drawn as a few marks under the shell: its position here is a simplification.", status: "simplified", sourceIds: ["ictv-papillomaviridae-report", "ictv-papillomaviridae-2018"] },
      { id: "genome", type: "genome", layer: "interior", labelSimple: "Circular DNA", labelDetailed: "Circular dsDNA (7,904 bp in HPV16)", description: "A single circular double-stranded DNA genome. No envelope surrounds the capsid.", status: "verified", sourceIds: ["ictv-papillomaviridae-2018", "ncbi-k02718"] },
    ],
  },
];
