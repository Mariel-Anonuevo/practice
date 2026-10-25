import { test, expect } from '@playwright/test';

// Awtomatikong nagse-seed ng fresh unbilled waybills bago ang bawat test run
// para laging may client (Zalora) at deliveries na lilitaw kahit ilang beses i-run.
test.beforeEach(async ({ request }) => {
  const timestamp = Date.now().toString().slice(-5);
  const wb1 = `WB-VAL-${timestamp}1`;
  const wb2 = `WB-VAL-${timestamp}2`;

  const seedWaybill = (waybillNumber: string) =>
    request.post('http://localhost:5007/api/integration/dms/waybill-created', {
      data: {
        waybillNumber,
        clientName: 'Zalora Philippines',
        clientId: 4,
        actualWeight: 4.5,
        deliveryArea: 'NCR',
        declaredValue: 3200,
        deliveryStatus: 'Delivered',
        podStatus: 'Validated'
      }
    }).catch(() => { });

  await seedWaybill(wb1);
  await seedWaybill(wb2);
});

test('Create Invoice and Finance Manager Validation Flow', async ({ page }) => {
  // ==========================================
  // BAHAGI 1: ACCOUNTANT (EMP-003) CREATE INVOICE
  // ==========================================

  // 1. Login bilang Accountant
  await page.goto('http://localhost:5173/login');
  await page.getByRole('textbox', { name: 'Employee ID' }).fill('EMP-003');
  await page.getByRole('textbox', { name: 'Password' }).fill('Password@123');
  await page.getByRole('button', { name: /Sign In to FOMS/i }).click();

  // 2. Pumunta sa Create Invoice
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.getByRole('link', { name: /Create Invoice/i }).click();
  await page.waitForURL('**/invoice-create', { timeout: 15000 });

  // 3. Piliin ang Client (Zalora)
  const selectClientBtn = page.getByRole('button', { name: /Select Client/i }).first();
  await expect(selectClientBtn).toBeVisible({ timeout: 15000 });
  await selectClientBtn.click();

  // 4. Piliin ang Validated Waybills
  const selectAllBtn = page.getByRole('button', { name: /Select All Validated/i });
  if (await selectAllBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await selectAllBtn.click();
  } else {
    const firstWb = page.getByText(/WB-VAL-/i).first();
    await expect(firstWb).toBeVisible({ timeout: 10000 });
    await firstWb.click();
  }

  // 5. Next to Confirm & Submit
  const nextBtn = page.getByRole('button', { name: /Next: Confirm & Submit/i });
  await expect(nextBtn).toBeEnabled({ timeout: 10000 });
  await nextBtn.click();

  // 6. Submit for Approval
  const submitBtn = page.getByRole('button', { name: /Submit for Approval/i });
  await expect(submitBtn).toBeVisible({ timeout: 10000 });
  await submitBtn.click();

  // 7. Logout ang Accountant
  await page.locator('span').filter({ hasText: 'Accountant' }).click();
  await page.getByRole('button', { name: /Log Out/i }).click();
  await page.waitForURL(/.*\/login/, { timeout: 15000 });

  // ==========================================
  // BAHAGI 2: FINANCE MANAGER (EMP-001) APPROVAL
  // ==========================================

  // 8. Login bilang Finance Manager
  await page.getByRole('textbox', { name: 'Employee ID' }).fill('EMP-001');
  await page.getByRole('textbox', { name: 'Password' }).fill('Password@123');
  await page.getByRole('button', { name: /Sign In to FOMS/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });

  // 9. Pumunta sa Invoice List
  await page.getByRole('link', { name: /Invoice List/i }).click();
  await page.waitForURL('**/invoicing-desk', { timeout: 15000 });

  // 10. Tingnan ang bagong gawang invoice (View Invoice modal)
  const viewInvoiceBtn = page.getByRole('button', { name: /View Invoice/i }).first();
  await expect(viewInvoiceBtn).toBeVisible({ timeout: 15000 });
  await viewInvoiceBtn.click();

  // 11. Isara ang modal preview
  const closeModalBtn = page.getByRole('button', { name: /Close modal|✕/i }).first();
  if (await closeModalBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await closeModalBtn.click();
  }

  // 12. I-validate at i-approve ng Finance Manager
  const approveBtn = page.getByRole('button', { name: /Approve/i }).first();
  if (await approveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await approveBtn.click();
  }

  await page.waitForTimeout(2000);
});
