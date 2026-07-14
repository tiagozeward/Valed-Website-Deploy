/*
 * Regenerate assets/valed-deck.pdf from deck.html as true 16:9 slides.
 *
 * Run whenever you edit the deck:
 *     node scripts/build-deck-pdf.js
 *     (or: npm run build:pdf)
 *
 * Serves the site on a temp port, prints deck.html to a 1280x720
 * (16:9) PDF — one slide per page — using the deck's @page/print CSS.
 * Requires Playwright's Chromium; the script locates it automatically.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "assets", "valed-deck.pdf");
const PORT = 4199;

// Find a Playwright install (this repo has none; siblings do).
function loadChromium() {
  const candidates = [
    path.join(ROOT, "node_modules", "playwright"),
    path.join(ROOT, "..", "MVP_V10", "valed", "node_modules", "playwright"),
    path.join(ROOT, "..", "MVP_V10", "valed", "valed-frontend", "node_modules", "playwright"),
    "playwright",
    "playwright-core",
  ];
  for (const c of candidates) {
    try { return require(c).chromium; } catch (_) { /* keep looking */ }
  }
  throw new Error(
    "Playwright not found. Install it here (npm i -D playwright && npx playwright install chromium) " +
    "or run this from a machine where a sibling project already has it."
  );
}

const types = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2",
};

function serve() {
  return http.createServer((req, res) => {
    const rel = decodeURIComponent((req.url || "/").split("?")[0]);
    const file = path.join(ROOT, rel === "/" ? "index.html" : rel);
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end("Not found"); return; }
      res.writeHead(200, { "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream" });
      res.end(data);
    });
  });
}

(async () => {
  const chromium = loadChromium();
  const server = serve();
  await new Promise((r) => server.listen(PORT, "127.0.0.1", r));

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${PORT}/deck.html`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.pdf({
    path: OUT,
    width: "1280px",
    height: "720px",
    printBackground: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
    preferCSSPageSize: true,
  });
  await browser.close();
  server.close();

  const kb = Math.round(fs.statSync(OUT).size / 1024);
  console.log(`✓ Wrote ${path.relative(ROOT, OUT)} (${kb} KB, 16:9 slides)`);
})().catch((e) => { console.error(e.message || e); process.exit(1); });
