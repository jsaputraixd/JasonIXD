/**
 * Capture short LinkedIn clips of desktop OS interactions.
 * Run: node scripts/capture-linkedin-clips.mjs
 */
import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "exports", "linkedin");
const BASE = "http://127.0.0.1:3000";

fs.mkdirSync(OUT, { recursive: true });

async function skipIntro(page) {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("portfolio-intro-seen", "1");
    } catch {}
  });
}

async function waitForDesktop(page) {
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  // Force boot complete if overlay still present
  await page.evaluate(() => {
    window.dispatchEvent(new Event("boot:done"));
  });
  await page.waitForTimeout(800);
  // Skip remaining intro phases by marking seen and reloading once if needed
  const hasFeatured = await page.locator(".os-window--featured").count();
  if (hasFeatured === 0) {
    await page.evaluate(() => {
      try {
        sessionStorage.setItem("portfolio-intro-seen", "1");
      } catch {}
    });
    await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
    await page.evaluate(() => window.dispatchEvent(new Event("boot:done")));
    await page.waitForTimeout(2500);
  }
  await page.waitForSelector(".os-window--featured", { timeout: 45000 });
  await page.waitForTimeout(600);
}

async function recordClip(name, run) {
  const videoDir = path.join(OUT, `_raw-${name}`);
  fs.rmSync(videoDir, { recursive: true, force: true });
  fs.mkdirSync(videoDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  await skipIntro(page);

  try {
    await waitForDesktop(page);
    await run(page);
  } finally {
    await context.close();
    await browser.close();
  }

  const files = fs.readdirSync(videoDir).filter((f) => f.endsWith(".webm"));
  if (!files.length) throw new Error(`No video for ${name}`);
  const src = path.join(videoDir, files[0]);
  const dest = path.join(OUT, `clip-site-${name}.webm`);
  fs.renameSync(src, dest);
  fs.rmSync(videoDir, { recursive: true, force: true });
  console.log("saved", dest);
  return dest;
}

async function main() {
  await recordClip("featured-hover", async (page) => {
    const cards = page.locator(".os-window--featured");
    const n = await cards.count();
    for (let i = 0; i < Math.min(n, 3); i++) {
      await cards.nth(i).hover({ force: true });
      await page.waitForTimeout(1400);
      await page.mouse.move(40, 40);
      await page.waitForTimeout(500);
    }
    await page.waitForTimeout(400);
  });

  await recordClip("dock-scroll", async (page) => {
    const dock = page.locator(".project-dock");
    await dock.waitFor({ timeout: 15000 });
    const box = await dock.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(2500);
      await page.mouse.move(box.x + 80, box.y + box.height / 2);
      await page.waitForTimeout(1200);
    } else {
      await page.waitForTimeout(3000);
    }
  });

  await recordClip("desktop-overview", async (page) => {
    await page.mouse.move(200, 200);
    await page.waitForTimeout(600);
    await page.mouse.move(900, 320);
    await page.waitForTimeout(800);
    await page.mouse.move(700, 500);
    await page.waitForTimeout(800);
    await page.mouse.move(400, 400);
    await page.waitForTimeout(1000);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
