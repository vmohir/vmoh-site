import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("split-bill-state"));
  await page.reload({ waitUntil: "networkidle" });
});

test("share button opens a modal with a hydrating link, copyable to the clipboard", async ({
  page,
}) => {
  // Stub the clipboard so the Copy button's write resolves deterministically
  // and we can capture what it wrote.
  await page.addInitScript(() => {
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

  // Trigger the share button — opens the share modal with the link. No
  // Netlify Function in dev, so the remote attempt fails and this is the
  // offline, fully-encoded-in-the-URL link.
  await page.getByRole("button", { name: "Share bill" }).click();
  const dialog = page.getByRole("dialog", { name: "Share bill" });
  const linkInput = dialog.getByRole("textbox");
  await expect(linkInput).toHaveValue(/#data=/);
  const url = await linkInput.inputValue();

  // The Copy button writes the same link to the clipboard.
  await dialog.getByRole("button", { name: "Copy link" }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { __clip?: string }).__clip ?? null,
      ),
    )
    .toBe(url);

  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(dialog).toBeHidden();

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
