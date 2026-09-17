import { defineConfig } from "cypress";
import * as fs from "fs";
import * as path from "path";

const apiTestOnly = process.env.CYPRESS_API_TEST_ONLY == "true";

const capturesDir = path.join(__dirname, "cypress", "fixtures", "graphql", "captures");

export default defineConfig({
  chromeWebSecurity: false,
  e2e: {
    baseUrl: apiTestOnly ? null : "http://localhost:3000",
    setupNodeEvents(on) {
      on("task", {
        // Appends captured live GraphQL request/response pairs to per-operation
        // fixture files, deduped by request variables, so a capture run against
        // the live API can be replayed offline later.
        captureGraphQL(captures: Array<{ operationName: string; variables: unknown; response: unknown }>) {
          fs.mkdirSync(capturesDir, { recursive: true });
          const byOperation = new Map<string, Array<{ variables: unknown; response: unknown }>>();
          for (const { operationName, variables, response } of captures) {
            const file = path.join(capturesDir, `${operationName}.json`);
            if (!byOperation.has(operationName)) {
              byOperation.set(
                operationName,
                fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : []
              );
            }
            const entries = byOperation.get(operationName)!;
            const variablesKey = JSON.stringify(variables ?? {});
            const existing = entries.find(
              (entry) => JSON.stringify(entry.variables ?? {}) === variablesKey
            );
            if (existing) {
              existing.response = response;
            } else {
              entries.push({ variables, response });
            }
          }
          for (const [operationName, entries] of byOperation) {
            const file = path.join(capturesDir, `${operationName}.json`);
            fs.writeFileSync(file, JSON.stringify(entries, null, 2) + "\n");
          }
          return null;
        },
        // Loads all captured GraphQL fixtures into a single
        // { [operationName]: [{ variables, response }] } map for cy.mockGraphQL()
        // to replay against, so specs stay decoupled from the live API.
        loadGraphQLCaptures() {
          if (!fs.existsSync(capturesDir)) return {};
          const captures: Record<string, unknown> = {};
          for (const file of fs.readdirSync(capturesDir)) {
            if (!file.endsWith(".json")) continue;
            const operationName = file.replace(/\.json$/, "");
            captures[operationName] = JSON.parse(
              fs.readFileSync(path.join(capturesDir, file), "utf8")
            );
          }
          return captures;
        }
      });
    }
  }
});
