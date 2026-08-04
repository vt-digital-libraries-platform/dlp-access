#!/usr/bin/env node
/**
 * Run Cypress a11y specs with a browser that still supports --load-extension.
 * Branded Google Chrome 137+ silently ignores --load-extension, so Axe Watcher's
 * extension never injects and axeWatcherFlush() times out.
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

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

const result = spawnSync(
  "npx",
  [
    "cypress",
    "run",
    "--browser",
    browser,
    "--headed",
    "--spec",
    "cypress/e2e/a11y/**/*.cy.js"
  ],
  {
    cwd: root,
    stdio: "inherit",
    env
  }
);

process.exit(result.status ?? 1);
