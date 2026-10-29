import { expect, test } from "@playwright/test";

test("opens a profile from the atlas", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Virus Atlas");
  await page.getByRole("link", { name: "Bacteriophage T4" }).click();
  await expect(page).toHaveURL(/\/virus\/phage-t4$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bacteriophage T4");
  await expect(page.getByText("Tequatrovirus T4").first()).toBeVisible();
});

test("selects a structural component by click and keyboard", async ({ page }) => {
  await page.goto("/virus/influenza-a");
  const list = page.getByRole("list", { name: "Structural components" });
  await list.getByRole("button", { name: /HA spike/ }).click();
  await expect(page.getByRole("heading", { name: "Haemagglutinin (HA) trimer" })).toBeVisible();
  await expect(page.locator("svg.diagram")).toHaveAttribute("data-has-selection", "true");

  const rnp = page.locator('[data-part="rnp"]');
  await rnp.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: /Ribonucleoproteins/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("svg.diagram")).toHaveAttribute("data-has-selection", "false");
});

test("exterior view hides interior layers; layers toggle", async ({ page }) => {
  await page.goto("/virus/hsv-1");
  await page.getByRole("button", { name: "Show inside" }).click(); // starts in cutaway: turn it off
  await expect(page.locator('[data-part="capsid"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Show inside" }).click();
  await expect(page.locator('[data-part="capsid"]')).toHaveCount(1);
  await page.getByRole("checkbox", { name: "Show Tegument" }).uncheck();
  await expect(page.locator('[data-part="tegument"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Full names" }).click();
  await expect(page.getByRole("button", { name: /T=16 icosahedral capsid/ }).first()).toBeVisible();
});

test("compares viruses and restores the selection from the URL", async ({ page }) => {
  await page.goto("/compare?v=influenza-a,sars-cov-2");
  await expect(page.getByRole("heading", { name: "Property by property" })).toBeAttached();
  await expect(page.getByText(/Different genome classes/)).toBeVisible();
  await page.locator("label.chip", { hasText: "Bacteriophage T4" }).click();
  await expect(page).toHaveURL(/v=influenza-a,sars-cov-2,phage-t4/);
  await page.reload();
  await expect(page.getByRole("checkbox", { name: "Bacteriophage T4" })).toBeChecked();
  await expect(page.getByRole("columnheader", { name: "Bacteriophage T4" })).toBeAttached();
});

test("uses filters, shows an empty state and resets", async ({ page }) => {
  await page.goto("/#atlas");
  await page.getByRole("group", { name: "Envelope" }).locator("label.chip", { hasText: /^Enveloped/ }).click();
  await expect(page.getByText(/10 of 24 viruses/)).toBeVisible();
  await expect(page).toHaveURL(/envelope=enveloped/);
  await page.getByText("More filters").click();
  await page.locator("label.chip", { hasText: "Bacteria" }).click();
  await expect(page.getByRole("heading", { name: /No virus matches/ })).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).first().click();
  await expect(page.getByRole("link", { name: "Bacteriophage T4" })).toBeVisible();
});

test("views sources behind a profile", async ({ page }) => {
  await page.goto("/virus/sars-cov-2");
  await page.getByRole("link", { name: "Sources behind this profile" }).click();
  await expect(page).toHaveURL(/sources\?virus=sars-cov-2/);
  await expect(page.getByText("Structures and distributions of SARS-CoV-2 spike proteins on intact virions")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Known gaps" })).toBeVisible();
});

test("tutor works without AI credentials", async ({ page }) => {
  await page.goto("/tutor");
  await page.getByRole("button", { name: "What does negative-sense RNA mean?" }).click();
  await expect(page.getByText(/No AI key is configured/)).toBeVisible();
  await expect(page.getByText("Negative-sense RNA", { exact: true })).toBeVisible();
});

test("size explorer separates linear and log views", async ({ page }) => {
  await page.goto("/size");
  await expect(page.getByText(/One uniform scale/)).toBeVisible();
  await page.getByRole("tab", { name: "Logarithmic axis" }).click();
  await expect(page.getByText(/Positions are logarithmic/)).toBeVisible();
});

test("navigates on mobile without horizontal page scroll", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("/");
  await page.getByRole("button", { name: /Index/ }).click();
  await page.getByRole("navigation", { name: "Pages" }).getByRole("link", { name: /Compare/ }).click();
  await expect(page).toHaveURL(/\/compare/);
  for (const path of ["/", "/virus/phage-t4", "/virus/rotavirus-a", "/virus/ebola", "/virus/vaccinia", "/compare?v=hsv-1,hpv-16", "/size", "/genomes", "/sources", "/proteins", "/proteins/6VSB"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});

test("opens a protein structure from a diagram component and switches views", async ({ page }) => {
  await page.goto("/virus/sars-cov-2");
  await page.getByRole("list", { name: "Structural components" }).getByRole("button", { name: /Spike/ }).click();
  await page.getByRole("link", { name: /PDB 6VSB/ }).click();
  await expect(page).toHaveURL(/\/proteins\/6VSB/);
  await expect(page.getByText(/Chain A: Spike protomer/)).toBeVisible();
  await page.getByRole("button", { name: /Chain B/ }).click();
  await expect(page.getByRole("img", { name: /chain B highlighted/ })).toBeVisible();
});

test("genome map: selecting a gene shows its coordinates", async ({ page }) => {
  await page.goto("/virus/hpv-16");
  await page.getByRole("list", { name: "All annotated genes" }).getByRole("button").first().click();
  await expect(page.getByText("Coding length")).toBeVisible();
  await expect(page.getByText(/amino acids/)).toBeVisible();
});

test("cell map follows replication stages; phages have no nucleus", async ({ page }) => {
  await page.goto("/genomes?v=influenza-a");
  await page.getByRole("button", { name: "Nuclear import" }).click();
  await expect(page.getByRole("img", { name: /Current stage location: Nucleus/ })).toBeVisible();
  await page.goto("/genomes?v=phage-t4");
  await expect(page.getByRole("img", { name: /Bacterial host cell/ })).toBeVisible();
});

test("3D model loads or falls back without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/virus/human-adenovirus-5");
  await page.getByRole("radio", { name: "3D", exact: true }).click();
  await expect(page.locator("canvas, svg.diagram").first()).toBeVisible({ timeout: 20000 });
  await page.getByRole("button", { name: "Pull apart" }).click();
  expect(errors).toEqual([]);
});

test("new viruses: Ebola profile, structure and genome map", async ({ page }) => {
  await page.goto("/virus/ebola");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ebola virus");
  await page.getByRole("list", { name: "Structural components" }).getByRole("button", { name: /GP spikes/ }).click();
  await expect(page.getByRole("link", { name: /PDB 5JQ3/ })).toBeVisible();
  await expect(page.getByText(/18,959 nt, 9 coding sequences/)).toBeVisible();
});
