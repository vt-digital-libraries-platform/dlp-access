#!/usr/bin/env node
/**
 * Run Cypress a11y specs with a browser that still supports --load-extension.
 * Branded Google Chrome 137+ silently ignores --load-extension, so Axe Watcher's
 * extension never injects and axeWatcherFlush() times out.
 *
 * After the run, merges per-spec mochawesome JSON into a single HTML report at
 * cypress/reports/a11y/mochawesome.html.
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const reportRoot = path.join(root, "cypress", "reports", "a11y");
const jsonDir = path.join(reportRoot, "json");
const mergedJson = path.join(reportRoot, "mochawesome.json");
const htmlReport = path.join(reportRoot, "mochawesome.html");

function firstExisting(candidates) {
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function walkFind(dir, predicate, results = []) {
  if (!fs.existsSync(dir)) {
    return results;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFind(full, predicate, results);
    } else if (predicate(full, entry.name)) {
      results.push(full);
    }
  }
  return results;
}

function findChromeForTesting() {
  const chromeRoot = path.join(root, "chrome");
  const macBins = walkFind(chromeRoot, (full, name) =>
    full.endsWith(
      path.join(
        "Google Chrome for Testing.app",
        "Contents",
        "MacOS",
        "Google Chrome for Testing"
      )
    )
  );
  if (macBins.length) {
    return macBins.sort().at(-1);
  }
  const linuxBins = walkFind(
    chromeRoot,
    (full, name) => name === "chrome" && full.includes("chrome-linux")
  );
  if (linuxBins.length) {
    return linuxBins.sort().at(-1);
  }
  return null;
}

function resolveBrowser() {
  if (process.env.AXE_CHROME_BINARY) {
    return process.env.AXE_CHROME_BINARY;
  }

  const cft = findChromeForTesting();
  if (cft) {
    return cft;
  }

  const chromium = firstExisting([
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/opt/homebrew/bin/chromium",
    "/usr/local/bin/chromium"
  ]);
  if (chromium) {
    return chromium;
  }

  console.error(`
Axe Watcher requires Chromium or Chrome for Testing (not branded Google Chrome 137+).

Install one of:
  brew install --cask chromium
  npx @puppeteer/browsers install chrome@stable

Or set AXE_CHROME_BINARY to the browser executable path.
`);
  process.exit(1);
}

function rmrf(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function writeMochawesomeHtmlReport() {
  if (!fs.existsSync(jsonDir)) {
    console.warn("No mochawesome JSON directory; skipping HTML report.");
    return false;
  }

  const jsonFiles = fs
    .readdirSync(jsonDir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => path.join(jsonDir, name));

  if (!jsonFiles.length) {
    console.warn("No mochawesome JSON files; skipping HTML report.");
    return false;
  }

  const merge = spawnSync("npx", ["mochawesome-merge", ...jsonFiles], {
    cwd: root,
    encoding: "utf8"
  });

  if (merge.status !== 0) {
    console.error(merge.stderr || merge.stdout || "mochawesome-merge failed");
    return false;
  }

  fs.mkdirSync(reportRoot, { recursive: true });
  fs.writeFileSync(mergedJson, merge.stdout);

  const marge = spawnSync(
    "npx",
    [
      "marge",
      mergedJson,
      "--reportDir",
      reportRoot,
      "--reportFilename",
      "mochawesome",
      "--inline",
      "true"
    ],
    {
      cwd: root,
      stdio: "inherit"
    }
  );

  if (marge.status !== 0) {
    console.error("mochawesome-report-generator (marge) failed");
    return false;
  }

  return fs.existsSync(htmlReport);
}

const browser = resolveBrowser();
console.log(`Using browser for Axe Watcher: ${browser}`);

const env = { ...process.env };
for (const key of [
  "ELECTRON_RUN_AS_NODE",
  "HTTP_PROXY",
  "HTTPS_PROXY",
  "http_proxy",
  "https_proxy",
  "ALL_PROXY",
  "all_proxy"
]) {
  delete env[key];
}
env.TS_NODE_PROJECT = env.TS_NODE_PROJECT || "cypress/tsconfig.json";
env.CYPRESS_BASE_URL = env.CYPRESS_BASE_URL || "http://localhost:3010";

rmrf(reportRoot);
fs.mkdirSync(jsonDir, { recursive: true });

const reporterOptions = [
  `reportDir=${path.relative(root, jsonDir)}`,
  "overwrite=false",
  "html=false",
  "json=true",
  "timestamp=isoDateTime"
].join(",");

const result = spawnSync(
  "npx",
  [
    "cypress",
    "run",
    "--browser",
    browser,
    "--headed",
    "--spec",
    "cypress/e2e/a11y/**/*.cy.js",
    "--reporter",
    "mochawesome",
    "--reporter-options",
    reporterOptions
  ],
  {
    cwd: root,
    stdio: "inherit",
    env
  }
);

const wroteReport = writeMochawesomeHtmlReport();
if (wroteReport) {
  console.log(`\nMochawesome HTML report: ${htmlReport}`);
  console.log(`Open with: open "${htmlReport}"\n`);
}

process.exit(result.status ?? 1);
