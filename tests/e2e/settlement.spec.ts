import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("split-bill-state"));
  await page.reload({ waitUntil: "networkidle" });
});

test("two people sharing one item — paid by one — settles to a single transfer", async ({
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

  // Advanced mode unlocks multi-select on the Shared-by control.
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

  // The item card's Shared-by trigger (Add Item form has its own — take the last).
  await itemsSection.getByRole("button", { name: "Shared by" }).last().click();
  await page.getByRole("checkbox", { name: "Alice" }).check();
  await page.getByRole("checkbox", { name: "Bob" }).check();

  // Bob -> Alice $10.00 (each owes 10, Alice paid 20).
  await expect(resultsSection.getByText("1 transaction needed")).toBeVisible();
  await expect(resultsSection.getByText("$10.00 USD")).toBeVisible();
});

test("basic mode auto-pays the single assignee", async ({ page }) => {
  const itemsSection = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "Items" }) });

  await page.getByPlaceholder("Item name").fill("Coffee");
  await page.getByPlaceholder("Price").fill("5");
  await page.getByPlaceholder("Price").press("Enter");

  const itemCardPaidBy = itemsSection
    .getByRole("button", { name: "Shared by" })
    .last();
  await itemCardPaidBy.click();
  await page.getByRole("checkbox", { name: "You" }).check();

  // No "Amounts paid" detail (hidden when only 1 person is assigned).
  await expect(itemsSection.getByText("Amounts paid")).toBeHidden();

  // Pill stays open in expanded state after the first click.
  await expect(itemCardPaidBy).toHaveAttribute("aria-expanded", "true");
});
