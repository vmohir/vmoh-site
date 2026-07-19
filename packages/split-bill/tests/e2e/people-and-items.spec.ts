import { test, expect, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("split-bill-state"));
  await page.reload({ waitUntil: "networkidle" });
});

const peopleSection = (page: Page) =>
  page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "People" }) });
const itemsSection = (page: Page) =>
  page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "Items" }) });

test("default state shows one person and no items", async ({ page }) => {
  await expect(
    page.getByRole("banner").getByRole("heading", { level: 1 }),
  ).toBeVisible();
  await expect(peopleSection(page).getByRole("textbox")).toHaveValue("You");
  await expect(page.getByText("No items added yet")).toBeVisible();
});

test("add and remove a person", async ({ page }) => {
  await page.getByRole("button", { name: "Add Person" }).click();

  // With 2 people, both rows show a Remove button.
  const peopleRemove = peopleSection(page).getByRole("button", {
    name: "Remove",
  });
  await expect(peopleRemove).toHaveCount(2);

  await peopleRemove.nth(1).click();

  // With only 1 person left, the Remove button is hidden to prevent emptying the list.
  await expect(peopleRemove).toHaveCount(0);
});

test("add an item without advanced mode", async ({ page }) => {
  await page.getByPlaceholder("Item name").fill("Pizza");
  await page.getByPlaceholder("Price").fill("24");
  await page.getByRole("button", { name: "Add", exact: true }).click();

  await expect(page.getByText("No items added yet")).toBeHidden();
  // Textboxes in the section: [Add name, Add price, Item name, Item price]. Both cleared on submit.
  const itemTextboxes = itemsSection(page).getByRole("textbox");
  await expect(itemTextboxes.nth(2)).toHaveValue("Pizza");
  await expect(itemTextboxes.nth(3)).toHaveValue("24");
});

test("multiple-currencies toggle shows the per-item currency selector", async ({
  page,
}) => {
  const items = itemsSection(page);

  await expect(items.getByRole("combobox")).toHaveCount(0);

  // The toggle lives in the header settings popover. Scope to the header to
  // avoid matching the Astro dev toolbar's Settings button.
  await page
    .getByRole("banner")
    .getByRole("button", { name: "Settings", exact: true })
    .click();
  await page.getByRole("switch", { name: "Multiple currencies" }).click();
  await expect(items.getByRole("combobox")).toHaveCount(1);

  await page.getByRole("switch", { name: "Multiple currencies" }).click();
  await expect(items.getByRole("combobox")).toHaveCount(0);
});

test("state survives a reload", async ({ page }) => {
  await page.getByPlaceholder("Item name").fill("Coffee");
  await page.getByPlaceholder("Price").fill("4.5");
  await page.getByRole("button", { name: "Add", exact: true }).click();

  await expect(itemsSection(page).getByRole("textbox").nth(2)).toHaveValue(
    "Coffee",
  );

  await page.reload({ waitUntil: "networkidle" });

  const itemTextboxes = itemsSection(page).getByRole("textbox");
  await expect(itemTextboxes.nth(2)).toHaveValue("Coffee");
  await expect(itemTextboxes.nth(3)).toHaveValue("4.5");
});
