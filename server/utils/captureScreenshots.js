import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotsDir = path.join(__dirname, '../../screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function capture() {
  console.log('Obtaining Admin authentication token from API...');
  const adminRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@workzen.io', password: 'Admin@123' }),
  });
  const adminData = await adminRes.json();
  const adminToken = adminData.token;
  const adminUser = adminData.user;

  console.log('Launching browser to capture production screenshots...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 950, deviceScaleFactor: 1.5 },
  });

  const page = await browser.newPage();

  try {
    // 1. Clean Production Login Page
    console.log('Capturing: 01_login_page.png');
    await page.goto('http://localhost:5000/login', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(screenshotsDir, '01_login_page.png') });

    // Set Admin Session in localStorage
    await page.evaluate((tok, usr) => {
      localStorage.setItem('workzen_token', tok);
      localStorage.setItem('workzen_user', JSON.stringify(usr));
    }, adminToken, adminUser);

    // 2. Production Admin Dashboard
    console.log('Capturing: 02_admin_dashboard.png');
    await page.goto('http://localhost:5000/dashboard', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(screenshotsDir, '02_admin_dashboard.png') });

    // 3. Projects Management (Clean State)
    console.log('Capturing: 03_projects_management.png');
    await page.goto('http://localhost:5000/projects', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(screenshotsDir, '03_projects_management.png') });

    // 4. Timesheets Logging (Clean State)
    console.log('Capturing: 04_timesheets_logging.png');
    await page.goto('http://localhost:5000/timesheets', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(screenshotsDir, '04_timesheets_logging.png') });

    // 5. Approvals Center (Clean State)
    console.log('Capturing: 05_approvals_center.png');
    await page.goto('http://localhost:5000/approvals', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(screenshotsDir, '05_approvals_center.png') });

    // 6. Reporting & Analytics (Clean State)
    console.log('Capturing: 06_reporting_analytics.png');
    await page.goto('http://localhost:5000/reports', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(screenshotsDir, '06_reporting_analytics.png') });

    // 7. Team Directory (Showing Single Default Admin)
    console.log('Capturing: 07_team_directory.png');
    await page.goto('http://localhost:5000/team', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(screenshotsDir, '07_team_directory.png') });

    console.log('🎉 Successfully captured production screenshots!');
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
  }
}

capture();
