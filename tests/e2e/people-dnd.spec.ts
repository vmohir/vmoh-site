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

// Read the current order of person names in the People section. We look
// only at name inputs inside [data-person-row] containers so the group
// card's editable name input doesn't sneak in.
async function nameOrder(page: Page): Promise<string[]> {
  return peopleSection(page)
    .locator("[data-person-row] input")
    .evaluateAll((els) => els.map((el) => (el as HTMLInputElement).value));
}

// Look up a row's DOM position by the current value of its name input. The
// input's `value` attribute doesn't update on input — only the DOM property
// does — so do the match in-page rather than via a Playwright selector.
async function rowIndexByName(page: Page, name: string): Promise<number> {
  return peopleSection(page)
    .locator(`[data-person-row]`)
    .evaluateAll(
      (rows, target) =>
        rows.findIndex(
          (r) =>
            (r.querySelector("input") as HTMLInputElement | null)?.value ===
            target,
        ),
      name,
    );
}

// Drag the grip of the row whose name is `from` onto the row whose name is
// `to`. Uses pointer events because the app's DnD is pointer-based, not
// HTML5 DnD. We drop just past the vertical mid of the target row so the
// "after" insertion path is taken (i.e. dragged person lands below target).
async function dragPersonOnto(
  page: Page,
  from: string,
  to: string,
  { position = "after" }: { position?: "before" | "after" } = {},
): Promise<void> {
  const fromIdx = await rowIndexByName(page, from);
  const toIdx = await rowIndexByName(page, to);
  if (fromIdx < 0 || toIdx < 0) throw new Error(`Could not find ${from}/${to}`);
  const rows = peopleSection(page).locator(`[data-person-row]`);
  const fromGrip = rows
    .nth(fromIdx)
    .getByRole("button", { name: "Drag to reorder" });
  const fromBox = await fromGrip.boundingBox();
  const toBox = await rows.nth(toIdx).boundingBox();
  if (!fromBox || !toBox) throw new Error("Could not find drag handles");

  const startX = fromBox.x + fromBox.width / 2;
  const startY = fromBox.y + fromBox.height / 2;
  const endX = toBox.x + toBox.width / 2;
  const endY =
    position === "before"
      ? toBox.y + toBox.height * 0.25
      : toBox.y + toBox.height * 0.75;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  // Several intermediate moves so the activation threshold + pointermove
  // listener fire predictably.
  await page.mouse.move(startX + 5, startY + 5, { steps: 5 });
  await page.mouse.move(endX, endY, { steps: 10 });
  await page.mouse.up();
}

test("dragging a row reorders the people list", async ({ page }) => {
  // Three people: You, Bob, Carol (added via Add Person — random names
  // get overwritten below for determinism).
  await page.getByRole("button", { name: "Add Person" }).click();
  await page.getByRole("button", { name: "Add Person" }).click();
  const inputs = peopleSection(page).getByRole("textbox");
  await expect(inputs).toHaveCount(3);
  await inputs.nth(1).fill("Bob");
  await inputs.nth(1).press("Tab");
  await inputs.nth(2).fill("Carol");
  await inputs.nth(2).press("Tab");

  expect(await nameOrder(page)).toEqual(["You", "Bob", "Carol"]);

  // Drag Bob below Carol — should yield You, Carol, Bob.
  await dragPersonOnto(page, "Bob", "Carol", { position: "after" });
  expect(await nameOrder(page)).toEqual(["You", "Carol", "Bob"]);
});

test("dragging a person onto a group adds them to that group", async ({
  page,
}) => {
  // Build three people, then group Bob + Carol so You is ungrouped.
  await page.getByRole("button", { name: "Add Person" }).click();
  await page.getByRole("button", { name: "Add Person" }).click();
  const inputs = peopleSection(page).getByRole("textbox");
  await expect(inputs).toHaveCount(3);
  await inputs.nth(1).fill("Bob");
  await inputs.nth(1).press("Tab");
  await inputs.nth(2).fill("Carol");
  await inputs.nth(2).press("Tab");

  await peopleSection(page)
    .getByRole("button", { name: "Group people" })
    .click();
  await page.getByRole("checkbox", { name: "Bob" }).check();
  await page.getByRole("checkbox", { name: "Carol" }).check();
  await page.getByRole("button", { name: "Create" }).click();

  // Drag You into the group (drop on a member's row in the group).
  await dragPersonOnto(page, "You", "Bob", { position: "before" });

  // You should now be the first member of the group — order: You, Bob, Carol.
  expect(await nameOrder(page)).toEqual(["You", "Bob", "Carol"]);
  // And the group card should now report all three as its members. We check
  // by counting Remove buttons inside the group container.
  const groupCard = peopleSection(page).locator("[data-group-id]");
  await expect(groupCard.getByRole("button", { name: "Remove" })).toHaveCount(3);
});
