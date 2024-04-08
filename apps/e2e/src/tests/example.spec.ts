import { expect, test } from '../fixtures/setup';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Nilefy/);

  await expect(
    page.getByText(
      'looks like you do not have any apps try creating one, happy hacking!',
    ),
  ).toBeVisible();
});
