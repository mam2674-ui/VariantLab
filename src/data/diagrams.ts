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
  {
    id: "hiv-1",
    virusId: "hiv-1",
    renderer: "retrovirus",
    caption: "Schematic of a mature HIV-1 particle: envelope, glycoprotein spikes and a cone-shaped core holding two copies of the RNA genome. Spike number and positions are illustrative.",
    cannotShow: [
      "The immature particle, in which the core has not yet formed.",
      "The real number of Env spikes, which ICTV describes only as irregularly spaced.",
      "Proteins between the envelope and the core, and the enzymes packed inside the core.",
    ],
    components: [
      { id: "envelope", type: "envelope", layer: "exterior", labelSimple: "Envelope", labelDetailed: "Lipid envelope (from host membrane)", description: "A lipid envelope that displays the viral glycoproteins; budding takes place mainly at the plasma membrane.", status: "verified", sourceIds: ["ictv-retroviridae-report"] },
      { id: "env", type: "surface-protein", layer: "exterior", labelSimple: "Env spikes", labelDetailed: "Env glycoprotein projections (SU/TM, ~8 nm)", description: "Glycoprotein projections about 8 nm long, irregularly spaced. The SU part binds specific receptors at entry.", status: "verified", sourceIds: ["ictv-retroviridae-report"] },
      { id: "core", type: "capsid", layer: "interior", labelSimple: "Core", labelDetailed: "Cone-shaped capsid core", description: "In lentiviruses the capsid core is rod or truncated-cone shaped. It contains the genome and the replicative enzymes.", status: "verified", sourceIds: ["ictv-retroviridae-report", "ictv-retroviridae-2021"] },
      { id: "genome", type: "genome", layer: "interior", labelSimple: "RNA ×2", labelDetailed: "Two copies of +ssRNA (9,181 nt each)", description: "A homodimer: two copies of the linear, positive-sense RNA genome.", status: "verified", sourceIds: ["ictv-retroviridae-report", "ncbi-af033819"] },
    ],
  },
  {
    id: "hepatitis-b",
    virusId: "hepatitis-b",
    renderer: "hepadnavirus",
    caption: "Schematic of a hepatitis B virion: envelope with surface proteins around an icosahedral nucleocapsid holding a partially double-stranded circular DNA.",
    cannotShow: [
      "The empty subviral particles that are made alongside virions.",
      "The polymerase attached to the genome.",
      "Which nucleocapsids are T=3 versus T=4.",
    ],
    components: [
      { id: "envelope", type: "envelope", layer: "exterior", labelSimple: "Envelope", labelDetailed: "Lipid envelope (42–50 nm particle)", description: "An envelope 42–50 nm across surrounding the nucleocapsid.", status: "verified", sourceIds: ["ictv-hepadnaviridae-report"] },
      { id: "surface", type: "surface-protein", layer: "exterior", labelSimple: "Surface proteins", labelDetailed: "Surface proteins S, M and L (HBs)", description: "The envelope contains two or three surface proteins; orthohepadnaviruses have small, middle and large forms.", status: "verified", sourceIds: ["ictv-hepadnaviridae-report"] },
      { id: "capsid", type: "capsid", layer: "interior", labelSimple: "Nucleocapsid", labelDetailed: "Icosahedral nucleocapsid (mostly T=4, ~36 nm)", description: "Most cores are about 36 nm with 240 core-protein subunits (T=4); a minority are about 32 nm with 180 (T=3). Reverse transcription happens inside it.", status: "verified", sourceIds: ["ictv-hepadnaviridae-report"] },
      { id: "genome", type: "genome", layer: "interior", labelSimple: "DNA", labelDetailed: "Relaxed-circular, partially dsDNA (3,182 bp)", description: "A partially double-stranded DNA held in a circular conformation; the gap in one strand is drawn schematically.", status: "simplified", sourceIds: ["ictv-hepadnaviridae-report", "ncbi-v01460"] },
    ],
  },
  {
    id: "rotavirus-a",
    virusId: "rotavirus-a",
    renderer: "rotavirus",
    caption: "Schematic of a rotavirus triple-layered particle, cut open to show the three protein layers and the segmented dsRNA genome. Spike positions are illustrative.",
    cannotShow: [
      "The true icosahedral arrangement of 260 VP6 and 260 VP7 trimers.",
      "The enzymes inside the core that make mRNA.",
      "How the eleven segments are packed.",
    ],
    components: [
      { id: "vp4", type: "surface-protein", layer: "exterior", labelSimple: "VP4 spikes", labelDetailed: "VP4 spikes (60 trimers)", description: "Sixty trimeric spikes of VP4 project from the outer VP7 layer.", status: "verified", sourceIds: ["ictv-rotavirus-report"] },
      { id: "vp7", type: "capsid", layer: "exterior", labelSimple: "Outer layer", labelDetailed: "Outer layer: VP7 (260 trimers)", description: "The glycoprotein VP7 makes up the surface of the outermost shell.", status: "verified", sourceIds: ["ictv-rotavirus-report"] },
      { id: "vp6", type: "capsid", layer: "interior", labelSimple: "Middle layer", labelDetailed: "Intermediate layer: VP6 (260 trimers)", description: "The intermediate protein layer, made of 260 VP6 trimers.", status: "verified", sourceIds: ["ictv-rotavirus-report"] },
      { id: "vp2", type: "capsid", layer: "interior", labelSimple: "Inner layer", labelDetailed: "Inner layer: VP2 (T=1, 60 dimers)", description: "The innermost VP2 layer surrounds the genomic dsRNAs.", status: "verified", sourceIds: ["ictv-rotavirus-report"] },
      { id: "genome", type: "genome", layer: "interior", labelSimple: "11 dsRNA segments", labelDetailed: "11 dsRNA segments (18,562 bp in SA11)", description: "Eleven linear double-stranded RNA segments, 667 to 3,302 bp each in the reference strain.", status: "verified", sourceIds: ["ictv-rotavirus-report", "ncbi-rva-sa11"] },
    ],
  },
  {
    id: "poliovirus-1",
    virusId: "poliovirus-1",
    renderer: "picornavirus",
    caption: "Schematic of a poliovirus particle: a small icosahedral protein shell around one positive-sense RNA genome. Protein positions are illustrative.",
    cannotShow: [
      "Where each of VP1–VP4 sits within the shell.",
      "Surface features of the shell.",
      "How the RNA is folded inside the shell.",
    ],
    components: [
      { id: "capsid", type: "capsid", layer: "exterior", labelSimple: "Capsid", labelDetailed: "Capsid: 60 protomers (VP1–VP4), pseudo T=3", description: "Sixty identical protomers, each made of VP1–VP4, pack with T=1, pseudo T=3 icosahedral symmetry into a 30–32 nm shell.", status: "verified", sourceIds: ["ictv-picornaviridae-2017"] },
      { id: "genome", type: "genome", layer: "interior", labelSimple: "RNA", labelDetailed: "+ssRNA with 5′ VPg and 3′ poly(A) (7,440 nt)", description: "A single positive-sense RNA with the small protein VPg linked to its 5′ end and a poly(A) tail.", status: "verified", sourceIds: ["ictv-picornaviridae-2017", "ncbi-v01149"] },
    ],
  },
  {
    id: "tmv",
    virusId: "tmv",
    renderer: "tobamovirus",
    caption: "Schematic of a short stretch of a tobacco mosaic virus rod (the full rod is about 17 times longer than it is wide). Subunit count per turn is illustrative.",
    cannotShow: [
      "The full 300 nm length at this magnification.",
      "The exact number of coat-protein subunits per helical turn.",
      "How the RNA binds between subunits.",
    ],
    components: [
      { id: "coat", type: "capsid", layer: "exterior", labelSimple: "Coat protein", labelDetailed: "Coat protein helix (pitch 2.3–2.5 nm)", description: "Coat protein subunits wind into a rigid helical rod, 18 nm wide, with a hollow axial canal.", status: "verified", sourceIds: ["ictv-virgaviridae-2017", "ictv-tobamovirus-report"] },
      { id: "genome", type: "genome", layer: "interior", labelSimple: "RNA", labelDetailed: "+ssRNA following the helix (6,395 nt)", description: "One positive-sense RNA, drawn following the coat-protein helix inside the rod.", status: "simplified", sourceIds: ["ictv-virgaviridae-2017", "ncbi-v01408"] },
    ],
  },
  {
    id: "phix174",
    virusId: "phix174",
    renderer: "microvirus",
    caption: "Schematic of phiX174: a tiny T=1 icosahedral capsid with a spike at each vertex and a circular ssDNA genome inside. It has no tail.",
    cannotShow: [
      "The internal scaffolding and DNA-binding proteins.",
      "How the genome enters the host without a tail.",
      "The 3D arrangement of all 12 spikes (6 appear on the outline).",
    ],
    components: [
      { id: "capsid", type: "capsid", layer: "exterior", labelSimple: "Capsid", labelDetailed: "T=1 icosahedral capsid (25 nm)", description: "A small icosahedral shell with T=1 symmetry, 250 Å across.", status: "verified", sourceIds: ["ictv-microviridae-report"] },
      { id: "spikes", type: "surface-protein", layer: "exterior", labelSimple: "Spikes", labelDetailed: "Spike-protein pentamers at the fivefold vertices", description: "Pentamers of the major spike protein decorate the fivefold vertices, rising about 3 nm from the surface.", status: "verified", sourceIds: ["ictv-microviridae-report"] },
      { id: "genome", type: "genome", layer: "interior", labelSimple: "Circular ssDNA", labelDetailed: "Circular +ssDNA (5,386 nt)", description: "A single circular, positive-sense single-stranded DNA.", status: "verified", sourceIds: ["ictv-microviridae-report", "ncbi-j02482"] },
    ],
  },
];
