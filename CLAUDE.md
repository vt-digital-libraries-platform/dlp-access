# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

DLP Access is a multi-tenant, serverless digital-collections website (React + AWS Amplify/AppSync/DynamoDB/OpenSearch/Cognito) built for the Virginia Tech Digital Library Platform. A single codebase serves many independently branded sites (IAWA, SWVA, HOKIES@HOME, podcast repositories, etc.), each configured through the `REACT_APP_REP_TYPE` environment variable and per-site records in DynamoDB rather than through separate deployments.

## Commands

```sh
npm start                    # run locally (default site config)
npm run start-dlp            # run locally as REACT_APP_REP_TYPE=federated
npm run start-iawa           # run locally as REACT_APP_REP_TYPE=iawa
npm run build                # production build (react-scripts, increased heap size)
npm test                     # run Jest/RTL unit tests (react-scripts test, watch mode)
npm test -- --watchAll=false --testPathPattern=<path>   # run a single test file non-interactively
npm run sync:appsync-key     # pull the current AppSync API key from SSM into src/amplifyconfiguration.json (used in CI/build, not local dev)
```

Cypress e2e tests (require a deployed backend and S3-hosted site config; see `docs/deploy.md`):
```sh
CYPRESS_password=<secret> CYPRESS_userPoolId=<id> CYPRESS_clientId=<id> yarn run cypress open
```

There is no lint script; formatting is enforced via `lint-staged` + `prettier` on the pre-commit hook (`husky`), applied to `src/**/*.{js,jsx,ts,tsx,json,css,scss,md}`.

### infra/appsync-key-rotation (separate CDK app, own package.json)

```sh
cd infra/appsync-key-rotation
npm run build   # tsc
npm run synth   # cdk synth
npm run deploy  # cdk deploy -c apiId=<appsync-api-id> -c env=<dev|pprd> [-c alarmEmail=<email>]
npm run diff
```

This stack schedules a Lambda that rotates the AppSync API key and writes it to SSM Parameter Store (`/vtdlp/<env>/appsync/api-key` by default); `scripts/sync-appsync-api-key.sh` reads that parameter at build time and overwrites `aws_appsync_apiKey` in `src/amplifyconfiguration.json` so builds ship the most recently rotated key instead of whatever `amplify push` baked in. Gated by the `APPSYNC_API_KEY_SSM_PARAM` env var — a no-op if unset.

## Architecture

**Backend access pattern**: The app talks to AppSync (GraphQL) via `aws-amplify`'s `API`/`graphqlOperation`, not REST. Query/mutation/subscription documents live in `src/graphql/` (`queries.js`, `mutations.js`, `subscriptions.js`, generated `schema.json`); `.graphqlconfig.yml` points Amplify codegen at that directory. Almost all data fetching funnels through `src/lib/fetchTools.js`, a large grab-bag module (`getSite`, `getFileContent`, collection/archive/search fetch helpers) — check there before adding a new direct `API.graphql` call elsewhere.

**Multi-tenancy / site configuration**: There is one codebase but many deployed "sites." Which site behavior/branding applies is selected via the `REACT_APP_REP_TYPE` build-time env var (checked in `SiteForm.js`, `SiteAdmin.js`, `ContentUpload.js`, `ArchivePage.js`, and other admin/site-specific components) combined with a `Site` record loaded at runtime from DynamoDB (`getSite()` in `fetchTools.js`, consumed in `App.js`'s `loadSite()`). Site-level config drives home page sections, menus, colors, sponsors, and custom static content (images/HTML) hosted in S3+CloudFront (see `examples/` for sample JSON payloads and HTML).

**Routing / pages**: `App.js` is a class component that loads the `Site` config on mount, sets CSS custom properties from it (`setStyles`), and wires up `react-router-dom` routes. Built-in routes point at `src/pages/*` (Home, Search, Collections, Archives, Metadata, Admin, Accessibility, Feedback). Additional custom/static pages per site are generated dynamically by `src/lib/CustomPageRoutes.js` (`buildRoutes`) rather than being hardcoded.

**Admin area** (`src/pages/admin/`): forms for editing site configuration (home page, search page, sponsors, media sections, collection highlights, site pages), collection/archive metadata (`ArchiveCollectionEdit/`), bulk metadata CSV import/export (`MetadataUpload.tsx`, `CSVExport.js`), and content upload/ingest tooling (`ContentUpload.js`, `ingestTools/PreIngestCheck`). These write back to the same DynamoDB tables (`Site`, `Collection`, `Collectionmap`, etc.) documented in `docs/deploy.md`.

**Metadata rendering**: `src/lib/MetadataRenderer.js` and `src/lib/available_attributes.js` centralize how arbitrary/configurable metadata fields are displayed; `src/data/metadataFieldInfo.json` (generated from `src/data/metadata_field_reference.csv` via `src/data/csv_to_metadataFieldInfo.py`) is the source of truth for known metadata field definitions used across ingest, display, and CSV export.

**File/media access**: Files are served from S3 via Amplify `Storage`. `src/lib/fetchTools.js`'s `getFileContent`/`downloadFile` and `src/lib/FileGetter.js` / `FunctionalFileGetter.js` (class vs. hook-friendly variants) resolve S3 paths vs. external URLs and handle signed links (`src/hooks/useSignedLink.ts`, `useGetFileContent.ts`). Viewer components under `src/components/` (Babylon, KalturaPlayer, MinervaPlayer, MediaElement, LeafletThumb, ThreeD2DiiifHandler, Thumbnail) each handle a specific media/viewer type (3D models via Babylon.js/x3dom, Kaltura video, Mirador-style IIIF viewing, audio/video, maps, thumbnails).

**Amplify backend** (`amplify/`): Amplify-CLI-managed backend definition (API/AppSync schema, Cognito auth, an S3-trigger Lambda function, storage). `amplify/#current-cloud-backend` mirrors the last-deployed state and generally should not be hand-edited; changes go through the Amplify CLI (`amplify push`) against `amplify/backend`.

**Deployment**: Deployed via AWS Amplify Console/CLI per branch-per-environment (see `docs/deploy.md` for the full DynamoDB-seeding walkthrough and `examples/amplify.yml` for build settings). GitHub Actions (`.github/workflows/pr.yml`, `merge.yml`) manage ephemeral per-PR Amplify preview environments, gated on a `Ready for review` PR label.
