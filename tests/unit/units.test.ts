import { describe, expect, it } from "vitest";
import { angstromToNm, convert, formatDimension, formatKb, linearScale, logPosition, toNm } from "@/lib/units";
import { loadDataset } from "@/lib/data";
import { Dimension } from "@/lib/schema";

describe("unit conversions", () => {
  it("converts nm and µm both ways", () => {
    expect(convert(1, "um", "nm")).toBe(1000);
    expect(convert(250, "nm", "um")).toBe(0.25);
    expect(toNm(2.5, "um")).toBe(2500);
    expect(convert(convert(91, "nm", "um"), "um", "nm")).toBeCloseTo(91);
  });
  it("converts ångström from structural papers", () => {
    expect(angstromToNm(1195)).toBeCloseTo(119.5);
    expect(angstromToNm(600)).toBe(60);
  });
  it("formats ranges, approximations and mean ± SD", () => {
    expect(formatDimension({ min: 80, max: 120, unit: "nm", approximate: false })).toBe("80–120 nm");
    expect(formatDimension({ min: 140, max: 140, unit: "nm", approximate: true })).toBe("~140 nm");
    expect(formatDimension({ min: 80, max: 102, unit: "nm", approximate: false, central: { value: 91, sd: 11 } })).toBe("91 ± 11 nm");
    expect(formatKb({ min: 13.5, max: 13.6 })).toBe("13.5–13.6 kb");
  });
  it("linear scale is proportional; log scale is monotonic and rejects zero", () => {
    const s = linearScale(200, 400);
    expect(s(100)).toBe(200);
    expect(s(50) * 2).toBe(s(100));
    expect(logPosition(100, 10, 1000, 100)).toBeCloseTo(50);
    expect(logPosition(10, 10, 1000, 100)).toBe(0);
    expect(() => logPosition(0, 10, 1000, 100)).toThrow();
  });
});

describe("size-range ordering", () => {
  it("every recorded dimension has min ≤ central ≤ max", () => {
    for (const v of loadDataset().viruses)
      for (const d of v.dimensions) {
        expect(d.min, `${v.id}/${d.id}`).toBeLessThanOrEqual(d.max);
        if (d.central) {
          expect(d.central.value).toBeGreaterThanOrEqual(d.min);
          expect(d.central.value).toBeLessThanOrEqual(d.max);
        }
      }
  });
  it("schema rejects inverted ranges and out-of-range means", () => {
    const base = { id: "x", part: "virion", measure: "diameter", label: "x", unit: "nm", status: "verified", scope: "virus", sourceIds: ["s"] };
    expect(Dimension.safeParse({ ...base, min: 120, max: 80 }).success).toBe(false);
    expect(Dimension.safeParse({ ...base, min: 80, max: 100, central: { value: 130 } }).success).toBe(false);
    expect(Dimension.safeParse({ ...base, min: 80, max: 100 }).success).toBe(true);
  });
  it("elongated particles keep separate length and width", () => {
    const t4 = loadDataset().viruses.find((v) => v.id === "phage-t4")!;
    const head = t4.dimensions.filter((d) => d.part === "head");
    expect(head.map((d) => d.measure).sort()).toEqual(["length", "width"]);
    expect(head.find((d) => d.measure === "length")!.max).toBeGreaterThan(head.find((d) => d.measure === "width")!.max);
  });
});
