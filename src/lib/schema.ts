import { z } from "zod";

/**
 * Evidence status is attached to every fact so the UI can distinguish what is
 * verified from what is simplified, variable, unverified or inapplicable.
 */
export const EvidenceStatus = z.enum([
  "verified", // stated by a cited source for this scope
  "simplified", // a teaching simplification of cited material
  "variable", // real biological range / variability; value is a range
  "not_verified", // we could not confirm it from our sources
  "not_applicable", // the property does not exist for this virus
]);
export type EvidenceStatus = z.infer<typeof EvidenceStatus>;

/**
 * The taxonomic level a fact was reported at. Mixing family-level and
 * isolate-level values without saying so is a common error in teaching material.
 */
export const FactScope = z.enum([
  "family",
  "genus",
  "species",
  "virus", // the named virus / type (e.g. HPV16, SARS-CoV-2)
  "isolate", // a specific reference isolate or strain (e.g. A/PR/8/34)
]);
export type FactScope = z.infer<typeof FactScope>;

const sourceIds = z.array(z.string().min(1));

/** A fact whose value may be null only when it is not applicable / not verified. */
export function fact<T extends z.ZodType>(value: T) {
  return z
    .object({
      value: value.nullable(),
      status: EvidenceStatus,
      scope: FactScope,
      sourceIds,
      note: z.string().optional(),
    })
    .superRefine((raw, ctx) => {
      const f = raw as unknown as { value: unknown; status: EvidenceStatus; sourceIds: string[]; note?: string };
      const needsSource = f.status === "verified" || f.status === "variable" || f.status === "simplified";
      if (needsSource && f.sourceIds.length === 0) {
        ctx.addIssue({ code: "custom", message: `status "${f.status}" requires at least one sourceId` });
      }
      if (needsSource && f.value === null) {
        ctx.addIssue({ code: "custom", message: `status "${f.status}" requires a value` });
      }
      if (f.status === "not_applicable" && f.value !== null) {
        ctx.addIssue({ code: "custom", message: "not_applicable facts must have value null" });
      }
      if ((f.status === "not_verified" || f.status === "not_applicable") && !f.note) {
        ctx.addIssue({ code: "custom", message: `status "${f.status}" requires an explanatory note` });
      }
    });
}

export const Range = z
  .object({ min: z.number().nonnegative(), max: z.number().nonnegative() })
  .refine((r) => r.min <= r.max, { message: "range min must be <= max" });

export const Unit = z.enum(["nm", "um"]);
export type Unit = z.infer<typeof Unit>;

export const Dimension = z
  .object({
    id: z.string(),
    part: z.enum(["virion", "capsid", "head", "tail", "tail-fibre", "fibre", "filament", "rod"]),
    measure: z.enum(["diameter", "length", "width"]),
    label: z.string(),
    min: z.number().positive(),
    max: z.number().positive(),
    unit: Unit,
    central: z.object({ value: z.number().positive(), sd: z.number().nonnegative().optional(), n: z.number().int().optional() }).optional(),
    approximate: z.boolean().default(false),
    status: EvidenceStatus,
    scope: FactScope,
    sourceIds: sourceIds.min(1),
    note: z.string().optional(),
  })
  .refine((d) => d.min <= d.max, { message: "dimension min must be <= max" })
  .refine((d) => !d.central || (d.central.value >= d.min && d.central.value <= d.max), {
    message: "central value must lie inside [min, max]",
  });
export type Dimension = z.infer<typeof Dimension>;

export const Morphology = z.enum([
  "pleomorphic-enveloped", // roughly spherical but variable, enveloped
  "enveloped-icosahedral-core", // envelope around an icosahedral capsid
  "icosahedral-nonenveloped",
  "head-tail", // tailed phage
  "enveloped-conical-core", // envelope around a cone-shaped core (lentiviruses)
  "helical-rod", // rigid helical rod, no envelope
  "filamentous-enveloped", // long enveloped filaments (filoviruses)
  "bullet-enveloped", // bullet-shaped, enveloped (rhabdoviruses)
  "brick-complex", // large brick-shaped particle with a core and lateral bodies (poxviruses)
  "spherical-enveloped", // small smooth spherical enveloped particle (flaviviruses)
]);
export type Morphology = z.infer<typeof Morphology>;

export const HostCategory = z.enum(["vertebrates", "bacteria", "plants", "vertebrates-invertebrates"]);
export type HostCategory = z.infer<typeof HostCategory>;

export const Baltimore = z.enum(["I", "II", "III", "IV", "V", "VI", "VII"]);
export type Baltimore = z.infer<typeof Baltimore>;

/** Where in the host cell a step happens; omitted when our sources don't say. */
export const CellLocation = z.enum(["outside", "membrane", "endosome", "cytoplasm", "er-golgi", "nucleus"]);
export type CellLocation = z.infer<typeof CellLocation>;

export const ReplicationStep = z.object({
  id: z.string(),
  location: CellLocation.optional(),
  title: z.string(),
  text: z.string(),
  status: EvidenceStatus,
  sourceIds,
});

export const Virus = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  commonName: z.string(),
  abbreviation: z.string(),
  representative: z.string().describe("What exactly this profile represents, e.g. a reference isolate"),
  summary: z.string(),
  taxonomy: z.object({
    msl: z.string(),
    realm: z.string(),
    kingdom: z.string(),
    phylum: z.string(),
    class: z.string(),
    order: z.string(),
    family: z.string(),
    subfamily: z.string().nullable(),
    genus: z.string(),
    subgenus: z.string().nullable(),
    species: z.string(),
    ictvId: z.string(),
    vmrId: z.string(),
    exemplar: z.boolean(),
    sourceIds: sourceIds.min(1),
    note: z.string().optional(),
  }),
  referenceSequence: fact(z.string()),
  hostCategory: fact(HostCategory),
  hostDetail: fact(z.string()),
  genome: z.object({
    nucleicAcid: fact(z.enum(["DNA", "RNA"])),
    /** The ICTV VMR "Genome" label, e.g. ssRNA(-), dsDNA-RT. */
    ictvLabel: fact(z.string()),
    strandedness: fact(z.enum(["single", "double", "partially double"])),
    sense: fact(z.enum(["positive", "negative", "ambisense"])),
    segmented: fact(z.boolean()),
    segmentCount: fact(z.number().int().positive()),
    topology: fact(z.enum(["linear", "circular"])),
    lengthKb: fact(Range),
    referenceLengthNt: fact(z.number().int().positive()),
  }),
  baltimore: fact(Baltimore),
  envelope: fact(z.boolean()),
  capsid: fact(z.string()),
  morphology: fact(Morphology),
  dimensions: z.array(Dimension).min(1),
  replication: z.object({
    site: fact(z.string()),
    mRNARoute: fact(z.string()),
    steps: z.array(ReplicationStep).min(3),
  }),
  diagramId: z.string(),
});
export type Virus = z.infer<typeof Virus>;
export type Fact<T> = { value: T | null; status: EvidenceStatus; scope: FactScope; sourceIds: string[]; note?: string };

export const Source = z.object({
  id: z.string(),
  kind: z.enum(["taxonomy", "database", "primary", "review"]),
  title: z.string(),
  authors: z.string(),
  year: z.number().int().optional(),
  container: z.string(),
  doi: z.string().optional(),
  url: z.string().url(),
  license: z.string().optional(),
  accessed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().optional(),
});
export type Source = z.infer<typeof Source>;

export const SourceRegistry = z.object({
  registryVersion: z.string(),
  accessed: z.string(),
  sources: z.array(Source).min(1),
});

/** Structural component vocabulary shared by every diagram. */
export const ComponentType = z.enum([
  "envelope",
  "surface-protein",
  "matrix",
  "tegument",
  "capsid",
  "nucleocapsid",
  "genome",
  "portal",
  "tail",
  "fibre",
]);
export type ComponentType = z.infer<typeof ComponentType>;

export const DiagramComponent = z.object({
  id: z.string(),
  type: ComponentType,
  layer: z.enum(["exterior", "interior"]),
  labelSimple: z.string(),
  labelDetailed: z.string(),
  description: z.string(),
  status: EvidenceStatus,
  sourceIds: sourceIds.min(1),
});
export type DiagramComponent = z.infer<typeof DiagramComponent>;

export const DiagramSpec = z.object({
  id: z.string(),
  virusId: z.string(),
  renderer: z.enum([
    "influenza",
    "coronavirus",
    "adenovirus",
    "herpesvirus",
    "papillomavirus",
    "phage-t4",
    "retrovirus",
    "hepadnavirus",
    "rotavirus",
    "picornavirus",
    "tobamovirus",
    "microvirus",
    "filovirus",
    "rhabdovirus",
    "poxvirus",
    "flavivirus",
    "calicivirus",
    "levivirus",
  ]),
  caption: z.string(),
  cannotShow: z.array(z.string()).min(1),
  components: z.array(DiagramComponent).min(2),
});
export type DiagramSpec = z.infer<typeof DiagramSpec>;
