import { test, expect } from "@playwright/test";

test("filters documented traits and resets an absent combination", async ({page})=>{
  await page.goto("/explore");
  await expect(page.getByText("24 documented matches",{exact:true})).toBeVisible();
  await page.getByLabel("Genome type",{exact:true}).selectOption("dsDNA");
  await page.getByLabel("Host category",{exact:true}).selectOption("archaea");
  await expect(page.getByText("1 documented match",{exact:true})).toBeVisible();
  await expect(page.locator('article a[href="/virus/ssv1"]')).toBeVisible();
  await page.getByLabel("Envelope",{exact:true}).selectOption("yes");
  await expect(page.getByText("0 documented matches",{exact:true})).toBeVisible();
  await page.getByRole("button",{name:"Reset filters",exact:true}).click();
  await expect(page.getByText("24 documented matches",{exact:true})).toBeVisible();
});

test("edits and downloads an explicitly fictional illustration",async({page})=>{
  await page.goto("/explore");
  await page.getByLabel("Illustration name").fill("My imaginary particle");
  await page.getByLabel("Outline",{exact:true}).selectOption("twinned");
  await page.getByLabel("Surface pattern").selectOption("rays");
  await expect(page.getByRole("img",{name:/My imaginary particle: fictional twinned/})).toBeVisible();
  const promise=page.waitForEvent("download");
  await page.getByRole("button",{name:"Download drawing"}).click();
  const download=await promise;
  expect(download.suggestedFilename()).toBe("fictional-particle.svg");
  await page.getByRole("button",{name:"Reset drawing"}).click();
  await expect(page.getByLabel("Illustration name")).toHaveValue("Atlas imaginary particle");
});

for(const id of ["ssv1","mimivirus","tylcv","m13","hdv","scv-la"]) {
  test(`new profile ${id} renders clickable components`,async({page})=>{
    await page.goto(`/virus/${id}`);
    await expect(page.getByRole("heading",{level:1})).toBeVisible();
    await expect(page.locator("svg.diagram")).toBeVisible();
    await page.locator('svg.diagram [data-part="genome"]').focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("svg.diagram")).toHaveAttribute("data-has-selection","true");
  });
}

test("new 3D models mount without render errors",async({page})=>{
  const errors:string[]=[];
  page.on("pageerror",error=>errors.push(error.message));
  for(const id of ["ssv1","mimivirus","tylcv","m13","hdv","scv-la"]) {
    await page.goto(`/virus/${id}`);
    const toggle=page.getByRole("radio",{name:"3D",exact:true});
    await expect(toggle).toBeEnabled();
    await toggle.click();
    await expect(page.locator("canvas")).toBeVisible({timeout:20000});
    await page.getByRole("button",{name:"Pull apart"}).click();
  }
  expect(errors).toEqual([]);
});
