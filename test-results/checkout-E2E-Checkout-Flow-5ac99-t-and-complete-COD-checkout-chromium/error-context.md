# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: checkout.spec.js >> E2E Checkout Flow >> should register, add to cart, and complete COD checkout
- Location: tests\e2e\checkout.spec.js:11:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button:has-text("Add to Cart")').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('button:has-text("Add to Cart")').first()

```

```yaml
- region "Notifications Alt+T"
- banner:
  - link "🫙 DhaniFresh":
    - /url: /
  - navigation:
    - link "Home":
      - /url: /
    - link "Products":
      - /url: /products
    - link "About Us":
      - /url: /about
    - link "Help":
      - /url: /support
    - link "Contact":
      - /url: /contact
  - button "Search"
  - button "Switch to dark mode"
  - link "Cart":
    - /url: /cart
  - button "Notifications"
  - button "T Test"
- button "Back"
- navigation:
  - link "Home":
    - /url: /
  - text: Products
- main:
  - text: Pure Ghee Collection
  - heading "Our Ghee Products" [level=1]
  - paragraph: Handcrafted using traditional methods for absolute purity and rich aroma.
  - img
  - button "All Products"
  - button "A1"
  - button "A2"
  - img
  - textbox "Search products..."
  - img
  - combobox:
    - option "Default" [selected]
    - 'option "Price: Low → High"'
    - 'option "Price: High → Low"'
    - option "Top Rated"
    - option "Newest"
  - paragraph: Showing 1–3 of 3 products
  - img
  - heading "Could Not Load Products" [level=2]
  - paragraph: Could not load products. Please check your connection and try again.
  - button "Try Again"
- contentinfo:
  - img
  - link "🫙 DhaniFresh":
    - /url: /
  - heading "Contact" [level=4]
  - list:
    - listitem:
      - img
      - text: 99 Brooklyn New Street, Mumbai, India
    - listitem:
      - img
      - link "support@dhanifresh.com":
        - /url: mailto:support@dhanifresh.com
    - listitem:
      - img
      - link "+91 (100) 234-5678":
        - /url: tel:+911002345678
  - link "Facebook":
    - /url: "#"
    - img
  - link "Twitter":
    - /url: "#"
    - img
  - link "Instagram":
    - /url: "#"
    - img
  - link "LinkedIn":
    - /url: "#"
    - img
  - heading "Explore Us" [level=4]
  - list:
    - listitem:
      - link "About Us":
        - /url: /about
        - img
        - text: About Us
    - listitem:
      - link "All Products":
        - /url: /products
        - img
        - text: All Products
    - listitem:
      - link "How It Works":
        - /url: /support
        - img
        - text: How It Works
    - listitem:
      - link "News & Articles":
        - /url: /support
        - img
        - text: News & Articles
    - listitem:
      - link "Contact Us":
        - /url: /contact
        - img
        - text: Contact Us
  - heading "Quick Links" [level=4]
  - list:
    - listitem:
      - link "Privacy Policy":
        - /url: /privacy-policy
        - img
        - text: Privacy Policy
    - listitem:
      - link "Terms & Conditions":
        - /url: /terms
        - img
        - text: Terms & Conditions
    - listitem:
      - link "Disclaimer":
        - /url: /refund-policy
        - img
        - text: Disclaimer
    - listitem:
      - link "Support":
        - /url: /support
        - img
        - text: Support
    - listitem:
      - link "FAQ":
        - /url: /faq
        - img
        - text: FAQ
  - heading "Newsletter" [level=4]
  - paragraph: Get the latest updates via email. Don't miss it. Unsubscribe anytime.
  - textbox "Your Email"
  - button "Subscribe Now":
    - img
    - text: Subscribe Now
  - paragraph: DhaniFresh Ghee — © Copyright 2026 by DhaniFresh Pvt. Ltd. All rights reserved.
- link "Chat with us on WhatsApp":
  - /url: https://wa.me/7665306403?text=Hi%20DhaniFresh%2C%20I%20need%20some%20help!
- button "Open support chat": 💬
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | // Note: Ensure your local server and frontend are running, and Playwright is configured to point to your local frontend URL.
  4  | // Default Vite URL is http://localhost:5173
  5  | 
  6  | test.describe('E2E Checkout Flow', () => {
  7  |   const timestamp = Date.now();
  8  |   const testEmail = `testuser_${timestamp}@example.com`;
  9  |   const testPassword = 'Password123!';
  10 | 
  11 |   test('should register, add to cart, and complete COD checkout', async ({ page }) => {
  12 |     // 1. Navigate to home
  13 |     await page.goto('http://localhost:3000/');
  14 |     
  15 |     // Wait for the app to load
  16 |     await expect(page.locator('text=DhaniFresh').first()).toBeVisible({ timeout: 10000 });
  17 | 
  18 |     // 2. Registration
  19 |     await page.goto('http://localhost:3000/register');
  20 |     
  21 |     // Fill out registration form
  22 |     await page.fill('#reg-name', 'Test User');
  23 |     await page.fill('#reg-email', testEmail);
  24 |     await page.fill('#reg-password', testPassword);
  25 |     await page.fill('#reg-confirm', testPassword);
  26 |     
  27 |     await page.click('button[type="submit"]');
  28 |     
  29 |     // Wait for redirect to home after login
  30 |     await expect(page).toHaveURL('http://localhost:3000/');
  31 | 
  32 |     // 3. Add item to cart
  33 |     await page.goto('http://localhost:3000/products');
  34 |     
  35 |     // Assuming there is at least one product with an "Add to Cart" button
  36 |     const addToCartBtn = page.locator('button:has-text("Add to Cart")').first();
> 37 |     await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
     |                                ^ Error: expect(locator).toBeVisible() failed
  38 |     await addToCartBtn.click();
  39 | 
  40 |     // 4. Go to Cart
  41 |     await page.goto('http://localhost:3000/cart');
  42 |     
  43 |     // Verify item is in cart (check for "Checkout" button)
  44 |     const checkoutBtn = page.locator('button:has-text("Proceed to Checkout")');
  45 |     await expect(checkoutBtn).toBeVisible({ timeout: 10000 });
  46 |     await checkoutBtn.click();
  47 | 
  48 |     // 5. Checkout Process
  49 |     await expect(page).toHaveURL(/.*\/checkout/);
  50 |     
  51 |     // Fill shipping address
  52 |     await page.fill('input[placeholder="Recipient name"]', 'Test Address Name');
  53 |     await page.fill('input[placeholder="10-digit mobile"]', '9876543210');
  54 |     await page.fill('input[placeholder="House no., Street, Area"]', '123 Test Street');
  55 |     await page.fill('input[placeholder="City"]', 'Test City');
  56 |     await page.selectOption('select', 'Delhi');
  57 |     await page.fill('input[placeholder="6-digit PIN"]', '110001'); // Using a valid/common pincode
  58 | 
  59 |     // Select COD
  60 |     await page.locator('text=Cash on Delivery').click();
  61 |     
  62 |     // Click Place Order
  63 |     await page.locator('button:has-text("Place Order")').click();
  64 | 
  65 |     // 6. Verify Success
  66 |     await expect(page).toHaveURL(/.*\/orders.*/, { timeout: 15000 });
  67 |     
  68 |     // Check for success message (toast usually appears or Orders page title)
  69 |     await expect(page.locator('text=Order placed successfully!').or(page.locator('text=My Orders')).first()).toBeVisible();
  70 |   });
  71 | });
  72 | 
```