# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.js >> Authentication - UI and validation >> renders the login form
- Location: e2e\auth.spec.js:8:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:5174/login", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Authentication - UI and validation", () => {
  4  |   test.beforeEach(async ({ page }) => {
> 5  |     await page.goto("/login");
     |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  6  |   });
  7  | 
  8  |   test("renders the login form", async ({ page }) => {
  9  |     await expect(page.getByLabel("Email Address")).toBeVisible();
  10 |     await expect(page.getByLabel("Password")).toBeVisible();
  11 |     await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  12 |   });
  13 | 
  14 |   test("rejects an invalid email address", async ({ page }) => {
  15 |     await page.getByLabel("Email Address").fill("invalid-email");
  16 |     await page.getByLabel("Password").fill("TestPassword123!");
  17 |     await page.getByRole("button", { name: /sign in/i }).click();
  18 | 
  19 |     await expect(page.getByText("Invalid email address")).toBeVisible();
  20 |   });
  21 | 
  22 |   test("requires a password", async ({ page }) => {
  23 |     await page.getByLabel("Email Address").fill("test@example.com");
  24 |     await page.getByRole("button", { name: /sign in/i }).click();
  25 | 
  26 |     await expect(page.getByText("Password is required")).toBeVisible();
  27 |   });
  28 | 
  29 |   test("redirects unauthenticated users from protected routes", async ({
  30 |     page,
  31 |   }) => {
  32 |     await page.goto("/private/expenses");
  33 | 
  34 |     await expect(page).toHaveURL(/\/login$/);
  35 |   });
  36 | 
  37 |   test("navigates to signup from the login page", async ({ page }) => {
  38 |     await page
  39 |       .getByRole("link", {
  40 |         name: /create your free account/i,
  41 |       })
  42 |       .click();
  43 | 
  44 |     await expect(page).toHaveURL(/\/signup$/);
  45 |   });
  46 | });
  47 | 
```