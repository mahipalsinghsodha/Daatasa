const { test, expect } = require('@playwright/test');

// Note: Ensure your local server and frontend are running, and Playwright is configured to point to your local frontend URL.
// Default Vite URL is http://localhost:5173

test.describe('E2E Checkout Flow', () => {
  const timestamp = Date.now();
  const testEmail = `testuser_${timestamp}@example.com`;
  const testPassword = 'Password123!';

  test('should register, add to cart, and complete COD checkout', async ({ page }) => {
    // 1. Navigate to home
    await page.goto('http://localhost:3000/');
    
    // Wait for the app to load
    await expect(page.locator('text=DhaniFresh').first()).toBeVisible({ timeout: 10000 });

    // 2. Registration
    await page.goto('http://localhost:3000/register');
    
    // Fill out registration form
    await page.fill('#reg-name', 'Test User');
    await page.fill('#reg-email', testEmail);
    await page.fill('#reg-password', testPassword);
    await page.fill('#reg-confirm', testPassword);
    
    await page.click('button[type="submit"]');
    
    // Wait for redirect to home after login
    await expect(page).toHaveURL('http://localhost:3000/');

    // 3. Add item to cart
    await page.goto('http://localhost:3000/products');
    
    // Assuming there is at least one product with an "Add to Cart" button
    const addToCartBtn = page.locator('button:has-text("Add to Cart")').first();
    await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
    await addToCartBtn.click();

    // 4. Go to Cart
    await page.goto('http://localhost:3000/cart');
    
    // Verify item is in cart (check for "Checkout" button)
    const checkoutBtn = page.locator('button:has-text("Proceed to Checkout")');
    await expect(checkoutBtn).toBeVisible({ timeout: 10000 });
    await checkoutBtn.click();

    // 5. Checkout Process
    await expect(page).toHaveURL(/.*\/checkout/);
    
    // Fill shipping address
    await page.fill('input[placeholder="Recipient name"]', 'Test Address Name');
    await page.fill('input[placeholder="10-digit mobile"]', '9876543210');
    await page.fill('input[placeholder="House no., Street, Area"]', '123 Test Street');
    await page.fill('input[placeholder="City"]', 'Test City');
    await page.selectOption('select', 'Delhi');
    await page.fill('input[placeholder="6-digit PIN"]', '110001'); // Using a valid/common pincode

    // Select COD
    await page.locator('text=Cash on Delivery').click();
    
    // Click Place Order
    await page.locator('button:has-text("Place Order")').click();

    // 6. Verify Success
    await expect(page).toHaveURL(/.*\/orders.*/, { timeout: 15000 });
    
    // Check for success message (toast usually appears or Orders page title)
    await expect(page.locator('text=Order placed successfully!').or(page.locator('text=My Orders')).first()).toBeVisible();
  });
});
