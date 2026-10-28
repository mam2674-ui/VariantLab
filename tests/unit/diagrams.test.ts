import { describe, expect, it } from "vitest";
import { diagrams, viruses } from "@/lib/data";
import { renderers } from "@/components/diagrams/registry";
import { silhouette } from "@/lib/silhouette";

describe("diagram component mappings", () => {
  it("every virus has a diagram with a renderer", () => {
    for (const v of viruses) {
      const d = diagrams.find((x) => x.id === v.diagramId);
      expect(d, v.id).toBeDefined();
      expect(renderers[d!.renderer], v.id).toBeDefined();
    }
  });
  it("spec components and renderer parts match exactly", () => {
    for (const d of diagrams) {
      const r = renderers[d.renderer];
      expect([...r.parts].sort(), d.id).toEqual(d.components.map((c) => c.id).sort());
      for (const c of d.components) {
        expect(r.markers[c.id], `${d.id}/${c.id} marker`).toBeDefined();
        expect(r.interior.includes(c.id), `${d.id}/${c.id} layer`).toBe(c.layer === "interior");
      }
    }
  });
  it("never draws an envelope or a capsid a virus lacks", () => {
    for (const v of viruses) {
      const d = diagrams.find((x) => x.id === v.diagramId)!;
      expect(d.components.some((c) => c.type === "envelope"), v.id).toBe(v.envelope.value);
    }
    // influenza and SARS-CoV-2 have nucleocapsids, not icosahedral capsids
    for (const id of ["influenza-a", "sars-cov-2"]) {
      const d = diagrams.find((x) => x.virusId === id)!;
      expect(d.components.some((c) => c.type === "capsid")).toBe(false);
      expect(d.components.some((c) => c.type === "nucleocapsid")).toBe(true);
    }
  });
  it("every diagram says what it cannot show", () => {
    for (const d of diagrams) expect(d.cannotShow.length).toBeGreaterThan(0);
  });
});

describe("silhouettes", () => {
  it("use recorded dimensions without stretching", () => {
    const t4 = silhouette(viruses.find((v) => v.id === "phage-t4")!)!;
    const head = t4.shapes.find((s) => s.kind === "hexagon")!;
    if (head.kind !== "hexagon") throw new Error();
    expect(head.h / head.w).toBeCloseTo(120 / 86, 5);
    const flu = silhouette(viruses.find((v) => v.id === "influenza-a")!)!;
    const circles = flu.shapes.filter((s) => s.kind === "circle");
    expect(circles.map((c) => (c.kind === "circle" ? c.r * 2 : 0)).sort((a, b) => a - b)).toEqual([80, 120]);
  });
  it("prefers virus-specific over family-level values", () => {
    const sars = silhouette(viruses.find((v) => v.id === "sars-cov-2")!)!;
    expect(sars.width).toBe(102);
  });
});
