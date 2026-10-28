import { describe, expect, it } from "vitest";
import { viruses } from "@/lib/data";
import { emptyFilters, filterViruses, genomeClass, isFiltered, sizeBand } from "@/lib/filter";
import { compareInsights, compareRows } from "@/lib/compare";
import { compareHref, parseCompareIds, parseFilters, serializeFilters } from "@/lib/urlState";

const byId = (id: string) => viruses.find((v) => v.id === id)!;
const allowed = { host: ["vertebrates", "bacteria"], morphology: ["pleomorphic-enveloped", "enveloped-icosahedral-core", "icosahedral-nonenveloped", "head-tail"] };

describe("filtering", () => {
  it("derives genome classes", () => {
    expect(genomeClass(byId("influenza-a"))).toBe("-ssRNA");
    expect(genomeClass(byId("sars-cov-2"))).toBe("+ssRNA");
    expect(genomeClass(byId("hpv-16"))).toBe("dsDNA");
  });
  it("no filters returns everything", () => {
    expect(filterViruses(viruses, emptyFilters)).toHaveLength(6);
    expect(isFiltered(emptyFilters)).toBe(false);
  });
  it("combines groups with AND and options with OR", () => {
    const env = filterViruses(viruses, { ...emptyFilters, envelope: ["enveloped"] }).map((v) => v.id).sort();
    expect(env).toEqual(["hsv-1", "influenza-a", "sars-cov-2"]);
    const dnaEnv = filterViruses(viruses, { ...emptyFilters, envelope: ["enveloped"], genome: ["dsDNA"] }).map((v) => v.id);
    expect(dnaEnv).toEqual(["hsv-1"]);
    const rna = filterViruses(viruses, { ...emptyFilters, genome: ["+ssRNA", "-ssRNA"] });
    expect(rna).toHaveLength(2);
  });
  it("supports search across names and taxonomy", () => {
    expect(filterViruses(viruses, { ...emptyFilters, q: "straboviridae" }).map((v) => v.id)).toEqual(["phage-t4"]);
    expect(filterViruses(viruses, { ...emptyFilters, q: "herpes" }).map((v) => v.id)).toEqual(["hsv-1"]);
  });
  it("returns empty for impossible combinations", () => {
    expect(filterViruses(viruses, { ...emptyFilters, genome: ["dsRNA"] })).toHaveLength(0);
    expect(filterViruses(viruses, { ...emptyFilters, host: ["bacteria"], envelope: ["enveloped"] })).toHaveLength(0);
  });
  it("sizes by body, not appendages", () => {
    expect(sizeBand(byId("hpv-16"))).toBe("small");
    expect(sizeBand(byId("human-adenovirus-5"))).toBe("medium"); // fibres excluded
    expect(sizeBand(byId("hsv-1"))).toBe("medium"); // virus-specific capsid preferred over family range
  });
});

describe("comparison logic", () => {
  it("builds aligned rows and flags identical values", () => {
    const rows = compareRows([byId("influenza-a"), byId("sars-cov-2")]);
    expect(rows.every((r) => r.cells.length === 2)).toBe(true);
    expect(rows.find((r) => r.id === "envelope")!.same).toBe(true);
    expect(rows.find((r) => r.id === "sense")!.same).toBe(false);
  });
  it("shows not applicable rather than blank", () => {
    const rows = compareRows([byId("hsv-1"), byId("sars-cov-2")]);
    expect(rows.find((r) => r.id === "sense")!.cells[0].text).toBe("Not applicable");
  });
  it("separates shared mechanism from shared ancestry", () => {
    const ins = compareInsights([byId("hsv-1"), byId("human-adenovirus-5"), byId("phage-t4")]);
    const c = ins.find((i) => i.kind === "classification")!;
    expect(c.text).toMatch(/different ICTV realms/);
    expect(c.text).toMatch(/not evidence of close common ancestry/);
  });
  it("cites every non-uncertainty insight", () => {
    const ins = compareInsights([byId("influenza-a"), byId("phage-t4")]);
    for (const i of ins.filter((x) => x.kind !== "uncertainty")) expect(i.sourceIds.length).toBeGreaterThan(0);
    expect(ins.some((i) => i.kind === "uncertainty")).toBe(true);
  });
  it("needs at least two viruses", () => {
    expect(compareInsights([byId("hsv-1")])).toEqual([]);
  });
});

describe("URL state", () => {
  const ids = viruses.map((v) => v.id);
  it("restores a comparison, dropping unknown and duplicate ids and capping at 3", () => {
    expect(parseCompareIds(new URLSearchParams("v=sars-cov-2,influenza-a"), ids)).toEqual(["sars-cov-2", "influenza-a"]);
    expect(parseCompareIds(new URLSearchParams("v=hsv-1,bogus,hsv-1"), ids)).toEqual(["hsv-1"]);
    expect(parseCompareIds(new URLSearchParams("v=hsv-1,hpv-16,phage-t4,sars-cov-2"), ids)).toHaveLength(3);
    expect(parseCompareIds({ v: "hpv-16" }, ids)).toEqual(["hpv-16"]);
  });
  it("round-trips compare links", () => {
    const href = compareHref(["influenza-a", "phage-t4"]);
    expect(parseCompareIds(new URLSearchParams(href.split("?")[1]), ids)).toEqual(["influenza-a", "phage-t4"]);
  });
  it("round-trips atlas filters including + and − genome classes", () => {
    const f = { ...emptyFilters, q: "flu", genome: ["+ssRNA", "-ssRNA"] as ("+ssRNA" | "-ssRNA")[], envelope: ["enveloped" as const], size: ["medium" as const] };
    const back = parseFilters(new URLSearchParams(serializeFilters(f)), allowed);
    expect(back).toEqual({ ...f, host: [], morphology: [] });
  });
  it("ignores tokens it does not recognise", () => {
    const back = parseFilters(new URLSearchParams("genome=dsDNA,evil&host=martians"), allowed);
    expect(back.genome).toEqual(["dsDNA"]);
    expect(back.host).toEqual([]);
  });
});
