import { expect, test } from "@playwright/test";

test("opens a profile from the atlas", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Viruses");
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
  await page.getByRole("radio", { name: "Exterior" }).click();
  await expect(page.locator('[data-part="capsid"]')).toHaveCount(0);
  await page.getByRole("radio", { name: "Cutaway" }).click();
  await expect(page.locator('[data-part="capsid"]')).toHaveCount(1);
  await page.getByRole("checkbox", { name: "Show Tegument" }).uncheck();
  await expect(page.locator('[data-part="tegument"]')).toHaveCount(0);
  await page.getByRole("radio", { name: "Detailed labels" }).click();
  await expect(page.getByRole("button", { name: /T=16 icosahedral capsid/ }).first()).toBeVisible();
});

test("compares viruses and restores the selection from the URL", async ({ page }) => {
  await page.goto("/compare?v=influenza-a,sars-cov-2");
  await expect(page.getByRole("heading", { name: "Property by property" })).toBeVisible();
  await expect(page.getByText(/Different genome classes/)).toBeVisible();
  await page.locator("label.chip", { hasText: "Bacteriophage T4" }).click();
  await expect(page).toHaveURL(/v=influenza-a,sars-cov-2,phage-t4/);
  await page.reload();
  await expect(page.getByRole("checkbox", { name: "Bacteriophage T4" })).toBeChecked();
  await expect(page.getByRole("columnheader", { name: "Bacteriophage T4" })).toBeAttached();
});

test("uses filters, shows an empty state and resets", async ({ page }) => {
  await page.goto("/#atlas");
  await page.locator("label.chip", { hasText: /^Enveloped/ }).click();
  await expect(page.getByText(/3 of 6 viruses/)).toBeVisible();
  await expect(page).toHaveURL(/envelope=enveloped/);
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
  await page.getByText("Menu").click();
  await page.getByRole("navigation", { name: "Primary mobile" }).getByRole("link", { name: "Compare" }).click();
  await expect(page).toHaveURL(/\/compare/);
  for (const path of ["/", "/virus/phage-t4", "/compare?v=hsv-1,hpv-16", "/size", "/genomes", "/sources"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});
