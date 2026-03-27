import { test, expect } from '@playwright/test';

test.describe('Daily E2E Health Check', () => {

  test('Homepage loads correctly', async ({ page }) => {
    // Go to the production site
    await page.goto('/');

    // Check if the title is correct (adjust if needed)
    await expect(page).toHaveTitle(/PeludosClick/i);
  });

  test('Login page is accessible', async ({ page }) => {
    await page.goto('/login'); // Assuming /login is the path, update if different
    
    // Check if login form elements are present
    const emailInput = page.locator('input[type="email"], input[name="email"], input[formcontrolname="email"]').first();
    await expect(emailInput).toBeVisible();

    const passwordInput = page.locator('input[type="password"], input[name="password"], input[formcontrolname="password"]').first();
    await expect(passwordInput).toBeVisible();
  });

  test('User login and dashboard access', async ({ page }) => {
    // 1. Go to login page
    await page.goto('/login');

    // 2. Fill credentials explicitly and check them
    const loginForm = page.locator('form.login-form');
    
    // Wait for the form to settle
    await page.waitForTimeout(500);

    const emailInput = loginForm.locator('input[formcontrolname="email"]');
    await emailInput.waitFor({ state: 'visible' });
    await emailInput.click();
    await emailInput.fill('');
    await emailInput.pressSequentially('mendoariel@gmail.com', { delay: 50 });

    const passwordInput = loginForm.locator('input[formcontrolname="password"]');
    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.click();
    await passwordInput.fill('');
    await passwordInput.pressSequentially('Casadesara1', { delay: 50 });
    
    // Blur to trigger final validation if needed
    await passwordInput.blur();
    
    // Quick wait for reactive forms to catch up
    await page.waitForTimeout(1000);

    // 3. Submit
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // 4. Verify successful login by checking that the route changes away from /login
    // We give it up to 15 seconds to negotiate the auth token and redirect
    await page.waitForURL(url => !url.href.includes('/login'), { timeout: 15000 });
  });

});
