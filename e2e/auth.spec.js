import { test, expect } from "@playwright/test";

test.describe("Authentication - UI and validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("renders the login form", async ({ page }) => {
    await expect(page.getByLabel("Email Address")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("rejects an invalid email address", async ({ page }) => {
    await page.getByLabel("Email Address").fill("invalid-email");
    await page.getByLabel("Password").fill("TestPassword123!");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByText("Invalid email address")).toBeVisible();
  });

  test("requires a password", async ({ page }) => {
    await page.getByLabel("Email Address").fill("test@example.com");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("redirects unauthenticated users from protected routes", async ({
    page,
  }) => {
    await page.goto("/private/expenses");

    await expect(page).toHaveURL(/\/login$/);
  });

  test("navigates to signup from the login page", async ({ page }) => {
    await page
      .getByRole("link", {
        name: /create your free account/i,
      })
      .click();

    await expect(page).toHaveURL(/\/signup$/);
  });
});
