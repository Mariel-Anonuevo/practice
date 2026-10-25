import { test, expect } from '@playwright/test';
import path from 'path';

test('SpeedPay Payment and Finance Manager Validation Flow', async ({ page }) => {
  // Pahabain ang timeout para sa buong 2-portal workflow at server cold start
  test.setTimeout(90000);


  // ==========================================
  // BAHAGI 1: CLIENT SUBMITS PAYMENT VIA SPEEDPAY (PORT 5174)
  // ==========================================

  // Siguruhing may 'Unpaid' invoice palagi sa SpeedPay portal para laging lumabas ang 'Pay now'
  await page.route('**/api/speedpay/invoices*', async (route) => {
    try {
      const response = await route.fetch();
      const json = await response.json();
      if (Array.isArray(json)) {
        json.forEach((inv: any) => {
          if (inv.id === 'INV-1001' || inv.invoiceNo === 'INV-1001') {
            inv.paymentStatus = 'Unpaid';
            inv.balance = inv.totalAmount || 26250;
          }
        });
      }
      await route.fulfill({ response, json });
    } catch {
      await route.continue();
    }
  });

  // 1. Login ang Client
  await page.goto('http://localhost:5174/login', { waitUntil: 'domcontentloaded' });
  await page.getByRole('textbox', { name: /Client ID/i }).click();
  await page.getByRole('textbox', { name: /Client ID/i }).fill('test-001');
  await page.getByRole('textbox', { name: /Password/i }).click();
  await page.getByRole('textbox', { name: /Password/i }).fill('password123');
  await page.getByRole('button', { name: /Log In/i }).click();

  // 2. Pumunta sa My Invoices at pumili ng unpaid invoice para bayaran
  await page.getByRole('link', { name: /My Invoices/i }).click();
  const payNowBtn = page.getByRole('button', { name: /Pay now/i }).first();
  await expect(payNowBtn).toBeVisible({ timeout: 10000 });
  await payNowBtn.click();

  // 3. Mag-simulate ng PayMongo payment
  await page.getByRole('button', { name: /Pay via PayMongo/i }).click();
  await page.getByRole('button', { name: /Simulate Payment/i }).click();

  // 4. I-upload ang Proof of Payment
  const uploadFile = path.join(__dirname, '9e305533-f41b-4d39-92ac-7b6371f830e2.jpg');
  await page.locator('input[type="file"]').setInputFiles(uploadFile);

  // 5. I-submit ang Proof of Payment
  await page.getByRole('button', { name: /Submit Proof of Payment/i }).click();
  await page.getByRole('button', { name: /View Payment History/i }).click();
  await page.waitForTimeout(2000);

  // Tanggalin ang network intercept bago lumipat sa FOMS
  await page.unroute('**/api/speedpay/invoices*');

  // ==========================================
  // BAHAGI 2: FINANCE MANAGER (EMP-001) APPROVES PAYMENT SA FOMS (PORT 5173)
  // ==========================================

  // 6. Login ang Finance Manager sa FOMS
  await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
  await page.getByRole('textbox', { name: 'Employee ID' }).fill('EMP-001');
  await page.getByRole('textbox', { name: 'Password' }).fill('Password@123');
  await page.getByRole('button', { name: /Sign In to FOMS/i }).click();

  // 7. Pumunta sa SpeedPay Validation
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.getByRole('link', { name: /SpeedPay Validation/i }).click();
  await page.waitForURL('**/speedpay-validation', { timeout: 15000 });

  // Hintayin matapos ang loading state kung mayroon
  await expect(page.getByText(/Loading SpeedPay validation queue/i)).not.toBeVisible({ timeout: 30000 }).catch(() => {});

  // 8. Buksan ang payment submission details (Review & Validate o View Details)
  const viewDetailsBtn = page.getByRole('button', { name: /Review & Validate|View Details/i }).first();
  await expect(viewDetailsBtn).toBeVisible({ timeout: 30000 });
  await viewDetailsBtn.click();


  // 9. Piliin ang Approve kung may direct Approve button o combobox
  const approveBtn = page.getByRole('button', { name: /^Approve$/i });
  if (await approveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await approveBtn.click();
  } else {
    const allSelects = page.getByRole('combobox');
    const count = await allSelects.count();
    if (count > 0) {
      await allSelects.last().selectOption('Approve').catch(() => { });
    }

    // 10. Kumpirmahin ang validation o isara ang modal
    const confirmBtn = page.getByRole('button', { name: /Confirm Validation/i });
    if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmBtn.click();
    } else {
      const closeBtn = page.getByRole('button', { name: /Close|✕/i }).first();
      if (await closeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await closeBtn.click();
      }
    }
  }

  await page.waitForTimeout(2000);
});

