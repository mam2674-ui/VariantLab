import type { EvidenceStatus } from "@/lib/schema";

/**
 * Curated explanations used by search and the tutor. These are simplified
 * teaching text written for the atlas, each tied to the sources it summarises.
 */
export interface GlossaryEntry {
  id: string;
  term: string;
  aliases: string[];
  text: string;
  status: EvidenceStatus;
  sourceIds: string[];
}

export const glossary: GlossaryEntry[] = [
  {
    id: "g-negative-sense",
    term: "Negative-sense RNA",
    aliases: ["negative sense", "minus strand", "-ssRNA", "antisense", "negative-strand"],
    text: "A negative-sense RNA genome is complementary to mRNA, so ribosomes cannot read it directly. The virus must carry its own RNA-dependent RNA polymerase into the cell to copy the genome into readable, positive-sense mRNA. Influenza A virus is the atlas example (Baltimore class V).",
    status: "simplified",
    sourceIds: ["viralzone-baltimore", "baltimore1971", "viralzone-alphainfluenzavirus"],
  },
  {
    id: "g-positive-sense",
    term: "Positive-sense RNA",
    aliases: ["positive sense", "plus strand", "+ssRNA", "sense strand"],
    text: "A positive-sense RNA genome has the same sense as mRNA, so it can be translated as soon as it enters the cytoplasm. Negative-sense copies are made later as templates for new genomes and, in coronaviruses, subgenomic mRNAs. SARS-CoV-2 is the atlas example (Baltimore class IV).",
    status: "simplified",
    sourceIds: ["viralzone-baltimore", "ictv-coronaviridae-2023"],
  },
  {
    id: "g-envelope-capsid",
    term: "Envelope versus capsid",
    aliases: ["envelope", "capsid", "enveloped", "non-enveloped", "membrane", "protein shell"],
    text: "A capsid is a shell built from viral proteins. An envelope is a lipid membrane taken from a host-cell membrane, studded with viral proteins. They are different materials made in different ways: HSV-1 has both (an icosahedral capsid inside an envelope), adenovirus and HPV16 have a capsid but no envelope, and influenza A and SARS-CoV-2 have an envelope around helical nucleocapsids but no icosahedral capsid.",
    status: "simplified",
    sourceIds: ["ictv-herpesviridae-2021", "ictv-adenoviridae-report", "ictv-papillomaviridae-2018", "ictv-orthomyxo-report", "ictv-coronaviridae-report"],
  },
  {
    id: "g-nucleocapsid",
    term: "Nucleocapsid",
    aliases: ["ribonucleoprotein", "RNP", "nucleoprotein", "N protein"],
    text: "A nucleocapsid is the genome bound together with protein. In influenza A each genome segment is wrapped by nucleoprotein as a helical ribonucleoprotein; in coronaviruses the N protein packs the single genome into loosely arranged helical units. Neither forms an icosahedral shell.",
    status: "simplified",
    sourceIds: ["ictv-orthomyxo-report", "ictv-coronaviridae-report"],
  },
  {
    id: "g-baltimore-ictv",
    term: "Baltimore classification versus ICTV taxonomy",
    aliases: ["baltimore", "ictv", "taxonomy", "classification", "phylogeny", "related", "ancestry", "family tree"],
    text: "The Baltimore scheme groups viruses by how they produce mRNA from their genome (seven classes). ICTV taxonomy groups viruses by evolutionary relationship into ranks from realm to species. They answer different questions: HSV-1, adenovirus 5, HPV16 and phage T4 are all Baltimore class I, yet ICTV places them in three different realms.",
    status: "simplified",
    sourceIds: ["viralzone-baltimore", "baltimore1971", "ictv-vmr-msl41"],
  },
  {
    id: "g-segmented",
    term: "Segmented genome",
    aliases: ["segments", "segmented", "unsegmented", "monopartite"],
    text: "A segmented genome is split into several separate nucleic-acid molecules packaged in one particle. Influenza A virus has eight RNA segments and rotavirus A has eleven; the other ten viruses in this atlas each carry a single genome molecule (HIV-1 packages two copies of one).",
    status: "simplified",
    sourceIds: ["viralzone-alphainfluenzavirus", "ncbi-pr8-segments"],
  },
  {
    id: "g-schematic",
    term: "What a schematic diagram can and cannot tell you",
    aliases: ["diagram", "schematic", "drawing", "to scale", "accurate", "what can't this diagram tell me"],
    text: "Every structure in the atlas is a code-drawn schematic. It shows which components a virus has and roughly how they are layered, with each component cited. It does not show atomic structure, exact protein counts or positions, the true three-dimensional arrangement, or particle-to-particle variation. Internal proportions are not to scale; the size explorer's linear view is the place for true proportions.",
    status: "simplified",
    sourceIds: ["ictv-vmr-msl41"],
  },
  {
    id: "g-tegument",
    term: "Tegument",
    aliases: ["tegument"],
    text: "The tegument is a protein layer between the capsid and the envelope of herpesviruses such as HSV-1, with inner and outer layers. Unlike the capsid, it is not icosahedrally symmetrical.",
    status: "simplified",
    sourceIds: ["ictv-herpesviridae-2021"],
  },
  {
    id: "g-icosahedral",
    term: "Icosahedral symmetry and T number",
    aliases: ["icosahedral", "icosahedron", "t number", "triangulation", "capsomer", "hexon", "penton"],
    text: "Many capsids are built with icosahedral symmetry: 20 triangular faces and 12 vertices. The triangulation (T) number describes how many protein units make up each face. In the atlas, HPV capsids are T=7 (72 capsomers), HSV-1 capsids T=16 (162 capsomers), adenovirus capsids pseudo T=25 (240 hexons and 12 pentons), and the T4 head is a prolate (elongated) icosahedron.",
    status: "simplified",
    sourceIds: ["ictv-papillomaviridae-report", "ictv-herpesviridae-2021", "ictv-adenoviridae-report", "fokine2004-t4-head"],
  },
  {
    id: "g-phage",
    term: "Bacteriophage",
    aliases: ["phage", "bacteriophage", "bacteria", "tail"],
    text: "A bacteriophage is a virus that infects bacteria. Phage T4 attaches with tail fibres, contracts its tail sheath and delivers its DNA through the tail tube into the bacterial cytoplasm; bacteria have no nucleus, so all replication happens there.",
    status: "simplified",
    sourceIds: ["leiman2010-t4-tail", "ictv-vmr-msl41"],
  },
];
