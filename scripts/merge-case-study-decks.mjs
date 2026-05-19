import { PDFDocument } from "pdf-lib";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

/** @param {string} filename */
function dreamDetectiveSortKey(filename) {
  const n = filename.replace("Dream Detective - ", "").replace(/\.pdf$/i, "");
  if (n === "01") return 0;
  const num = parseInt(n, 10);
  return Number.isFinite(num) ? num : 999;
}

/** @param {string} filename */
function elearaImageSortKey(filename) {
  const m = filename.match(/Eleara_pages-to-jpg-(\d+)\.(jpe?g|png|webp)$/i);
  return m ? parseInt(m[1], 10) : 999;
}

/**
 * @param {import('pdf-lib').PDFDocument} pdf
 * @param {Buffer} bytes
 * @param {string} filePath
 */
async function embedImagePage(pdf, bytes, filePath) {
  const lower = filePath.toLowerCase();
  const image = lower.endsWith(".png")
    ? await pdf.embedPng(bytes)
    : await pdf.embedJpg(bytes);
  const { width, height } = image.scale(1);
  const page = pdf.addPage([width, height]);
  page.drawImage(image, { x: 0, y: 0, width, height });
}

async function mergeDreamDetectiveFromPdfs() {
  const slidesDir = path.join(
    ROOT,
    "public/images/projects/dream-detective/PDF Slides"
  );
  const out = path.join(
    ROOT,
    "public/images/projects/dream-detective/Dream-Detective-full-deck.pdf"
  );

  let files;
  try {
    files = (await fs.readdir(slidesDir))
      .filter((f) => f.toLowerCase().endsWith(".pdf"))
      .sort((a, b) => dreamDetectiveSortKey(a) - dreamDetectiveSortKey(b));
  } catch {
    console.warn("Dream Detective: PDF Slides folder missing, skip");
    return;
  }

  if (files.length === 0) {
    console.warn("Dream Detective: no PDFs found, skip");
    return;
  }

  const merged = await PDFDocument.create();
  for (const file of files) {
    const bytes = await fs.readFile(path.join(slidesDir, file));
    const doc = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  const outBytes = await merged.save();
  await fs.writeFile(out, outBytes);
  console.log(
    `Dream Detective: merged ${files.length} PDFs → ${path.basename(out)} (${merged.getPageCount()} pages, ${(outBytes.length / 1024 / 1024).toFixed(1)} MB)`
  );
}

async function buildElearaDeckFromImages() {
  const dir = path.join(ROOT, "public/images/projects/eleara");
  const out = path.join(ROOT, "public/images/projects/eleara/Eleara-full-deck.pdf");

  let files;
  try {
    files = (await fs.readdir(dir))
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      .sort((a, b) => elearaImageSortKey(a) - elearaImageSortKey(b));
  } catch {
    console.warn("Eleara: project folder missing, skip");
    return;
  }

  if (files.length === 0) {
    console.warn("Eleara: no slide images found, skip");
    return;
  }

  const pdf = await PDFDocument.create();
  for (const file of files) {
    const filePath = path.join(dir, file);
    const bytes = await fs.readFile(filePath);
    try {
      await embedImagePage(pdf, bytes, filePath);
    } catch (err) {
      console.warn(`Eleara: skipped ${file} (${err.message})`);
    }
  }

  if (pdf.getPageCount() === 0) {
    console.warn("Eleara: no pages embedded, skip write");
    return;
  }

  const outBytes = await pdf.save();
  await fs.writeFile(out, outBytes);
  console.log(
    `Eleara: built ${files.length} images → ${path.basename(out)} (${pdf.getPageCount()} pages, ${(outBytes.length / 1024 / 1024).toFixed(1)} MB)`
  );
}

async function main() {
  await mergeDreamDetectiveFromPdfs();
  await buildElearaDeckFromImages();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
