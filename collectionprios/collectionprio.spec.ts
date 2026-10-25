import { test, expect } from '@playwright/test';

// I-reset ang Shopee account (REC-003) bago ang bawat test run
// para laging may "View Account Details" na button at hindi mag-timeout.
test.beforeEach(async ({ request }) => {
  await request.post('http://localhost:5007/ai/collection/recommendations/REC-003/review', {
    data: {
      decision: 'Accepted Recommendation',
      request_type: '',
      remarks: ''
    }
  }).catch(() => {});
});

test('Collection Priority Escalation and Approval Flow', async ({ page }) => {
  // 1. Login bilang Accountant (EMP-003)
  await page.goto('http://localhost:5173/login');
  await page.getByRole('textbox', { name: 'Employee ID' }).fill('EMP-003');
  await page.getByRole('textbox', { name: 'Password' }).fill('Password@123');
  await page.getByRole('button', { name: /Sign In to FOMS/i }).click();

  // 2. Pumunta sa Accounts Receivable
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.getByRole('link', { name: /Accounts Receivable/i }).click();
  await page.waitForURL('**/accounts-receivable', { timeout: 15000 });

  // 3. Buksan ang Account Details at i-escalate sa Finance Manager
  const viewDetailsBtn = page.getByRole('button', { name: /View Account Details/i });
  await expect(viewDetailsBtn).toBeVisible({ timeout: 15000 });
  await viewDetailsBtn.click();

  await page.getByRole('combobox').nth(1).selectOption('Escalate Overdue Account to Finance Manager');
  await page.getByRole('textbox', { name: /Describe the overdue/i }).fill('need payment');
  await page.getByRole('button', { name: /Escalate to Finance Manager/i }).click();

  // 4. Logout ang Accountant
  await page.locator('span').filter({ hasText: 'Accountant' }).click();
  await page.getByRole('button', { name: /Log Out/i }).click();
  await page.waitForURL(/.*\/login/, { timeout: 15000 });

  // 5. Login bilang Finance Manager (EMP-001)
  await page.getByRole('textbox', { name: 'Employee ID' }).fill('EMP-001');
  await page.getByRole('textbox', { name: 'Password' }).fill('Password@123');
  await page.getByRole('button', { name: /Sign In to FOMS/i }).click();

  // 6. Pumunta sa Accounts Receivable at i-log ang Manager Decision
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.getByRole('link', { name: /Accounts Receivable/i }).click();
  await page.waitForURL('**/accounts-receivable', { timeout: 15000 });

  await page.getByRole('button', { name: /Update Decision|Final Resolve/i }).first().click();
  await page.getByRole('combobox').nth(1).selectOption('Reject Priority Assignment');
  await page.getByRole('textbox', { name: /Approved and closed/i }).click();
  await page.getByRole('combobox').nth(1).selectOption('Accept & Close');
  await page.getByRole('button', { name: /Log Manager Decision/i }).click();

  // 7. Logout ang Finance Manager
  await page.locator('span').filter({ hasText: 'Financial Manager' }).click();
  await page.getByRole('button', { name: /Log Out/i }).click();
  await page.waitForURL(/.*\/login/, { timeout: 15000 });

  // 8. Re-login bilang Accountant (EMP-003) para i-verify ang desisyon
  await page.getByRole('textbox', { name: 'Employee ID' }).fill('EMP-003');
  await page.getByRole('textbox', { name: 'Password' }).fill('Password@123');
  await page.getByRole('button', { name: /Sign In to FOMS/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });

  // 9. Pumunta ulit sa Accounts Receivable at tingnan ang Directives
  await page.getByRole('link', { name: /Accounts Receivable/i }).click();
  await page.waitForURL('**/accounts-receivable', { timeout: 15000 });
  await page.getByRole('button', { name: /FM Decision Received: View/i }).first().click();

  await page.waitForTimeout(2000);
});