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

  // Add a second person and rename both deterministically.
  await page.getByRole("button", { name: "+ Add Person" }).click();
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

  // Assign both people to the item.
  await itemsSection.getByRole("checkbox", { name: "Alice" }).check();
  await itemsSection.getByRole("checkbox", { name: "Bob" }).check();

  // Alice pays the full $20. The payer input is the sibling of <label>Alice:</label>.
  const alicePayerRow = itemsSection
    .locator("div")
    .filter({ has: page.getByText("Alice:", { exact: true }) })
    .last();
  await alicePayerRow.getByRole("spinbutton").fill("20");
  await alicePayerRow.getByRole("spinbutton").blur();

  // Single transfer of $10.00 USD (Bob -> Alice).
  await expect(resultsSection.getByText("1 transaction needed")).toBeVisible();
  await expect(resultsSection.getByText("$10.00 USD")).toBeVisible();
});
