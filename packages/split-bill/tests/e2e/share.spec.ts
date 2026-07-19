import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("split-bill-state"));
  await page.reload({ waitUntil: "networkidle" });
});

test("share button writes a hydrating URL to the clipboard", async ({
  page,
}) => {
  // Stub navigator.share + clipboard so the click path resolves
  // deterministically and we can capture the produced URL.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      value: undefined,
      configurable: true,
    });
    (window as unknown as { __clip?: string }).__clip = undefined;
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (txt: string) => {
          (window as unknown as { __clip?: string }).__clip = txt;
        },
      },
      configurable: true,
    });
  });

  // Build a small bill: one extra person + one item.
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Add Person" }).click();
  const personInputs = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "People" }) })
    .getByRole("textbox");
  await personInputs.nth(1).fill("Bob");
  await personInputs.nth(1).press("Tab");
  await page.getByPlaceholder("Item name").fill("Pizza");
  await page.getByPlaceholder("Price").fill("20");
  await page.getByRole("button", { name: "Add", exact: true }).click();

  // Trigger the share button — clipboard fallback runs because we stubbed
  // navigator.share out.
  await page.getByRole("button", { name: "Share bill" }).click();

  // The handler is async: build URL → write to clipboard. Poll until the
  // stub captures it.
  const url = await page
    .waitForFunction(
      () => (window as unknown as { __clip?: string }).__clip ?? null,
    )
    .then((handle) => handle.jsonValue() as Promise<string>);
  expect(url).toContain("#data=");

  // Open the URL fresh (clear storage, full reload) and confirm it hydrates.
  await page.evaluate(() => localStorage.removeItem("split-bill-state"));
  await page.goto(url);
  await page.reload({ waitUntil: "networkidle" });

  // Hash is stripped after import.
  await expect
    .poll(async () => page.evaluate(() => window.location.hash))
    .toBe("");

  const values = await page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "People" }) })
    .getByRole("textbox")
    .evaluateAll((els) => els.map((el) => (el as HTMLInputElement).value));
  expect(values).toEqual(["You", "Bob"]);

  // Item survived too.
  const itemValues = await page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "Items" }) })
    .getByRole("textbox")
    .evaluateAll((els) => els.map((el) => (el as HTMLInputElement).value));
  // Items section has [Add name, Add price, Pizza, 20].
  expect(itemValues.slice(2)).toEqual(["Pizza", "20"]);
});
