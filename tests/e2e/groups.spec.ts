import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("split-bill-state"));
  await page.reload({ waitUntil: "networkidle" });
});

test("grouping two members collapses their settlement into one transfer", async ({
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

  // Three people: You, Bob, Carol. You pays a $30 item shared by all three —
  // Bob and Carol each owe $10, You is owed $20. Two transfers normally.
  await page.getByRole("button", { name: "Add Person" }).click();
  await page.getByRole("button", { name: "Add Person" }).click();
  const personInputs = peopleSection.getByRole("textbox");
  await expect(personInputs).toHaveCount(3);
  await personInputs.nth(1).fill("Bob");
  await personInputs.nth(1).press("Tab");
  await personInputs.nth(2).fill("Carol");
  await personInputs.nth(2).press("Tab");

  await page.getByPlaceholder("Item name").fill("Dinner");
  await page.getByPlaceholder("Price").fill("30");
  await page.getByRole("button", { name: "Add", exact: true }).click();

  // Split among all three.
  await itemsSection.getByRole("button", { name: "Split" }).last().click();
  await page.getByRole("checkbox", { name: "Select all" }).check();
  await page.keyboard.press("Escape");

  // You pays.
  await itemsSection.getByRole("button", { name: "Payer" }).last().click();
  await page.getByRole("menuitemradio", { name: "You" }).click();

  // Two transactions without any groups.
  await expect(resultsSection.getByText("2 transactions needed")).toBeVisible();

  // Form a group of Bob + Carol via the People section "Group" button.
  await peopleSection.getByRole("button", { name: "Group people" }).click();
  await page.getByRole("checkbox", { name: "Bob" }).check();
  await page.getByRole("checkbox", { name: "Carol" }).check();
  await page.getByRole("button", { name: "Create" }).click();

  // Now settlement should collapse to a single transfer from "Bob & Carol".
  await expect(resultsSection.getByText("1 transaction needed")).toBeVisible();
  await expect(resultsSection.getByText("Bob & Carol → You")).toBeVisible();

  // Dissolving the group restores the two-transfer settlement.
  await peopleSection.getByRole("button", { name: "Dissolve group" }).click();
  await expect(resultsSection.getByText("2 transactions needed")).toBeVisible();
});
