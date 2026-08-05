const fs = require("fs");
const path = require("path");
const { parse } = require("dotenv");
const { defineConfig } = require("cypress");
const { cypressConfig } = require("@axe-core/watcher/cypress/config");

// Load .env without clobbering existing exports; skip blank values.
try {
  const parsed = parse(fs.readFileSync(path.resolve(__dirname, ".env")));
  for (const [key, value] of Object.entries(parsed)) {
    if (
      value &&
      String(value).trim() !== "" &&
      process.env[key] === undefined
    ) {
      process.env[key] = value;
    }
  }
} catch (_) {
  // .env is optional when vars are exported in the shell
}

const apiKey = process.env.ACCESSIBILITY_API_KEY;
const projectId = process.env.PROJECT_ID;

if (!apiKey || !projectId) {
  console.error(
    "Missing ACCESSIBILITY_API_KEY or PROJECT_ID. Add them to a gitignored .env (see README) or export them in your shell."
  );
  process.exit(1);
}

const apiTestOnly = process.env.CYPRESS_API_TEST_ONLY == "true";

module.exports = defineConfig(
  cypressConfig({
    axe: {
      apiKey,
      projectId,
      // Flush/analyze can exceed Watcher's 5s defaults on complex pages / Hub upload.
      timeout: {
        analyze: 30000,
        flush: 30000,
        start: 10000,
        stop: 10000
      }
    },
    chromeWebSecurity: false,
    // Cypress wraps flush in cy.then(); keep this >= axe.timeout.flush.
    defaultCommandTimeout: 30000,
    e2e: {
      baseUrl:
        process.env.CYPRESS_BASE_URL ||
        (apiTestOnly ? null : "http://localhost:3000")
    }
  })
);
