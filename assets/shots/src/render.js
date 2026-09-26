// Renders each mock screen in this folder to a PNG one level up (assets/shots).
// These are illustrations of the apps, not screenshots: edit the HTML, re-render.
// One-off setup:  npm install playwright-core   (drives Google Chrome on the Mac, Edge on Windows)
// Run:            node render.js
const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const SRC = __dirname;
const OUT = path.join(__dirname, '..');

const screens = [
  { file: 'dashboard.html',   out: 'oversight-dashboard.png', w: 1440, h: 900,  dpr: 1 },
  { file: 'phone-cases.html', out: 'field-cases-phone.png',   w: 390,  h: 844,  dpr: 2 },
  { file: 'phone-case.html',  out: 'field-case-phone.png',    w: 390,  h: 844,  dpr: 2 },
  { file: 'tablet.html',      out: 'field-tablet.png',        w: 1600, h: 1000, dpr: 1 },
  { file: 'fpn.html',         out: 'fpn-issue.png',           w: 1600, h: 1000, dpr: 1 },
  { file: 'kpi.html',         out: 'kpi-return.png',          w: 1600, h: 1000, dpr: 1 },
  { file: 'capital.html',     out: 'capital-projects.png',    w: 1600, h: 1000, dpr: 1 },
  { file: 'housing.html',     out: 'housing-work-order.png',  w: 1600, h: 1000, dpr: 1 },
];

(async () => {
  const browser = await chromium.launch({ channel: process.platform === 'win32' ? 'msedge' : 'chrome', headless: true });
  for (const s of screens) {
    const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: s.dpr });
    const page = await ctx.newPage();
    await page.goto(require('url').pathToFileURL(path.join(SRC, s.file)).href, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, s.out), type: 'png' });
    const size = fs.statSync(path.join(OUT, s.out)).size;
    console.log(`${s.out.padEnd(28)} ${s.w}x${s.h}@${s.dpr}  ${(size / 1024).toFixed(0)} KB`);
    await ctx.close();
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
