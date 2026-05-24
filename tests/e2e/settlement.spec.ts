import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("split-bill-state"));
  await page.reload({ waitUntil: "networkidle" });
});

test("two people share an item, one pays — settles to a single transfer", async ({
  page,
}) => {
  const peopleSection = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "People" }) });
  const itemsSection = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "Items" }) });
  const resultsSection = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "Results" }) });

  // Advanced mode unlocks multi-select on the people pickers.
  await page.getByRole("switch", { name: "Advanced" }).click();

  // Add a second person and rename both deterministically.
  await page.getByRole("button", { name: "Add Person" }).click();
  const personInputs = peopleSection.getByRole("textbox");
  await expect(personInputs).toHaveCount(2);
  await personInputs.nth(0).fill("Alice");
  await personInputs.nth(0).blur();
  await personInputs.nth(1).fill("Bob");
  await personInputs.nth(1).blur();

  // Add a $20 item.
  await page.getByPlaceholder("Item name").fill("Dinner");
  await page.getByPlaceholder("Price").fill("20");
  await page.getByPlaceholder("Price").press("Enter");

  // Shared by Alice + Bob (item card's picker — Add form has its own).
  await itemsSection.getByRole("button", { name: "Split" }).last().click();
  await page.getByRole("checkbox", { name: "Alice" }).check();
  await page.getByRole("checkbox", { name: "Bob" }).check();
  // Close the dropdown by pressing Escape.
  await page.keyboard.press("Escape");

  // Paid by Alice.
  await itemsSection.getByRole("button", { name: "Payer" }).last().click();
  await page.getByRole("checkbox", { name: "Alice" }).check();

  // Bob -> Alice $10.00 (each owes 10, Alice paid 20).
  await expect(resultsSection.getByText("1 transaction needed")).toBeVisible();
  await expect(resultsSection.getByText("$10.00 USD")).toBeVisible();
});

test("single-person item: Shared-by + Paid-by hides the Amounts-paid detail", async ({
  page,
}) => {
  const itemsSection = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "Items" }) });

  await page.getByPlaceholder("Item name").fill("Coffee");
  await page.getByPlaceholder("Price").fill("5");
  await page.getByPlaceholder("Price").press("Enter");

  // Pick You as the sole sharer and payer.
  await itemsSection.getByRole("button", { name: "Split" }).last().click();
  await page.getByRole("checkbox", { name: "You" }).check();
  await page.keyboard.press("Escape");

  await itemsSection.getByRole("button", { name: "Payer" }).last().click();
  await page.getByRole("checkbox", { name: "You" }).check();

  // Single payer: no Amounts-paid breakdown.
  await expect(itemsSection.getByText("Amounts paid")).toBeHidden();
});
