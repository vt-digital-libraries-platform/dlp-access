# VTDLP Access Website
A Multi-Tenant Serverless Website built with GraphQL, React, AWS Amplify, AWS AppSync, DynamoDB, Amazon Cognito and OpenSearch. This project is part of the [Virginia Tech Digital Library Platform](https://about.digital.lib.vt.edu/project/) (VTDLP). We used this software to host several Virginia Tech University Libraries digital collections, see showcase below.

We also have a [Live Demo](https://vtdlp-demo.cloud.lib.vt.edu/) site.

## Project Showcase
* [HOKIES@HOME](https://hokiesathome-dev.cloud.lib.vt.edu/)
* [International Archive of Women in Architecture (IAWA)](https://iawa.lib.vt.edu/)
* [Southwest Virginia Digital Archive](https://swva.lib.vt.edu/)

## Features
* Full-text search and configurable faceted search
* Supports multiple viewers 
  * HTML5 audio, video, and image player
  * [Kaltura](https://corp.kaltura.com/) video player
  * [Mirador](https://projectmirador.org/) viewer
  * PDF viewer
  * [x3dom](https://www.x3dom.org/) viewer
* Submission Information Packet, SIP -The submission information package is provided to the Virginia Tech Digital Library Platform and will be used for the AIP,   
  Archival Information Package (AIP). The format, requirements, metadata, etc. of the SIP is listed in the link below.   The content provided to the VT-DLP must 
  meet the requirements as established by the Virginia Tech Digital Library and detailed in the Virginia Tech Digital Library Preservation Plan.
* Metadata management
  * Collection creation and editing
  * Item creation and editing
* Configurable Home page and menus
  * Cover image
  * Featured items
  * Welcome statement
  * Sponsors section
  * Collection highlights
  * Contact information
  * Media Section
  * Google Analytics

## Screens
<img src="https://img.cloud.lib.vt.edu/images/show.gif" width="80%"/>

## Software Stack 
* AppSync: We use AppSync to handle the communication with backend DynamoDB and OpenSearch. Please see the initial [examples](docs/appsync.md). This [file](src/graphql/queries.js) elaborates all the operations currently in use.
* [AWS Amplify](https://aws.amazon.com/amplify/): We use Amplify to handle the authentication and authorization and connect to the backend AWS services. 
* DynamoDB: We use DynamoDB tables to store all the metadata.
* AWS OpenSearch: We use OpenSearch to enable full-text and faceted search.
* AWS Cognito: We use AWS Cognito to handle the authentication, authorization, and group permission.
* IIIF Images: We use [aws-batch-iiif-generator](https://github.com/vt-digital-libraries-platform/aws-batch-iiif-generator) to generate IIIF tiles and manifest in AWS.

## Launching the app
[![amplifybutton](https://oneclick.amplifyapp.com/button.svg)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/VTUL/dlp-access)

### Deploy the app using AWS CLI
* Create a branch with a backend environment
```
aws amplify create-branch --app-id=AmplifyAppId --branch-name=GitHubBranchName --backend-environment-arn=BackendEnvARN
```
* Deploy the app
```
aws amplify start-job --app-id=AmplifyAppId --branch-name=GitHubBranchName --job-type=RELEASE
```
* Get Backend Environment Arn
```
aws amplify list-backend-environments --app-id=AmplifyAppId
```

### Run locally with the Amplify CLI
0. Prerequisites
  ```sh
  npm install -g @aws-amplify/cli
  brew install yarn
  ```

1. Clone the repo

  ```sh
  git clone git@github.com:VTUL/dlp-access.git
  ```

2. Change into the directory & install dependencies

  ```sh
  cd dlp-access
  npm install
  ```

3. Initialize the Amplify backend

  ```sh
  amplify init
  ```

4. Push the application into your account

  ```sh
  amplify push
  ```

* Default group: `public`

### Local mock (no AWS)

If you do not have AWS credentials, you can run the browse UI against an in-memory Amplify mock layer:

```sh
npm install
npm run start:mock
```

This starts the app at `http://localhost:3010` with `REACT_APP_USE_MOCKS=true` and `REACT_APP_REP_TYPE=Default` (port 3010 avoids Cursor and other tools that often bind 3000/3001). Seed data lives under `src/mock/data/` (regenerate from `examples/jsons/` with `npm run generate:mock-data`).

**Works:** home page, browse collections, collection/archive detail, search (read-only GraphQL + stubbed S3 URLs).

**Does not work:** admin/Cognito auth, mutations, uploads, feedback API, mint service, or the existing AWS-backed Cypress suites (`integration/`, `site_admin/`). For accessibility demos against mocks, see [Accessibility (Axe Watcher) against local mocks](#accessibility-axe-watcher-against-local-mocks).

## Amplify Environment variables
We assign each site with a unique ```REACT_APP_REP_TYPE```.

As an example, the site of [IAWA](https://iawa.lib.vt.edu/) takes these settings below:
```
REACT_APP_REP_TYPE=IAWA
```

The site of [Demo](https://vtdlp-demo.cloud.lib.vt.edu/) takes these settings below:
```
REACT_APP_REP_TYPE=Default
```

<img src="https://img.cloud.lib.vt.edu/images/amplify_env.png" width="80%"/>

### More Environment variables

| Variable | Description |
| --- | --- |
| REACT_APP_MINT_LINK | [Mint service](https://github.com/vt-digital-libraries-platform/mint) API URL |
| REACT_APP_MINT_API_KEY | Mint service API key |
| USER_DISABLE_TESTS | Enable/disable Amplify tests |

If deploying an instance of the Podcast Repository he site must be able to authenticate itself with the NOID minting servicein order to support creating Podcast episode records through the site admin interface. So two additional environment variables are required. The values to be assigned to these variables can be found in the AWS API Gateway console.

```
REACT_APP_REP_TYPE=podcasts
REACT_APP_MINT_LINK=https://<api id here>.execute-api.us-east-1.amazonaws.com/Prod/mint
REACT_APP_MINT_API_KEY=<your api key here>
```

## Amplify Build settings
* Use [amplify.yml](examples/amplify.yml) for version after v1.3.2



## Site custom images and HTML files
We put custom static images (e.g., site cover image) and HTML files (e.g, about page) in a S3 bucket with Cloudfront setup.

See instruction and various site content examples below:
* [Instruction](https://github.com/VTUL/dlp-access/wiki/Customization)
* [html](examples/html/) exampes
* [images](examples/images/) exampes
* [Demo site](https://vtdlp-demo.cloud.lib.vt.edu/) configuration: [examples/default.json](examples/default.json).

## Running the tests
* An end-to-end testing framework using [Cypress.io](https://www.cypress.io/) has been setup for this project.
<img src="https://img.cloud.lib.vt.edu/images/e2e.png" width="80%"/>

* To test locally

  0. Put your configuration json files to a S3 bucket and enable CORS and make the config file public. 
  1. Start local server using ```REACT_APP_REP_TYPE=Default npm start```
  2. Launch the Cypress app ```CYPRESS_password=<secret> CYPRESS_userPoolId=<your user pool Id> CYPRESS_clientId=<your user pool client Id> yarn run cypress open``` Note: Environment varibles in the above command beginning with `CYPRESS_` must be updated with your actual account values

  * The username for authentication is: `devtest`. You can create this `devtest` account through account creation page.
  * You can create your own testing account and password, and update the username. E.g., [an example here](https://github.com/VTUL/dlp-access/blob/dev/cypress/integration/admin_page_sitepages_config.spec.js#L1)

### Accessibility (Axe Watcher) against local mocks

You can run a small Cypress smoke suite with [Axe Watcher](https://docs.deque.com/devtools-for-web/4/en/wa-home) against `npm run start:mock` (no AWS) and upload results to [Axe Developer Hub](https://docs.deque.com/developer-hub/2/en/dh-welcome).

1. Create an Axe Developer Hub project (product: **Axe Watcher**, language: **JavaScript**, framework: **Cypress**) and copy the project ID.
2. Create an Axe Developer Hub API key in your [Axe Account](https://axe.deque.com/settings).
3. Put credentials in a gitignored `.env` at the repo root (or export them in your shell):

```sh
ACCESSIBILITY_API_KEY=your-api-key
PROJECT_ID=your-project-uuid
```

4. Install and run:

```sh
npm install
npm run test:a11y:mock
```

This starts the mock app on port 3010, runs `cypress/e2e/a11y/**/*.cy.js` in **headed Chromium / Chrome for Testing**, and flushes results to Developer Hub.

**Important:** Branded Google Chrome 137+ no longer loads extensions via `--load-extension`, so Axe Watcher will time out on flush if you use normal Chrome. The `cypress:a11y` script auto-selects Chromium or a local Chrome for Testing install (`npx @puppeteer/browsers install chrome@stable`, or `brew install --cask chromium`). Override with `AXE_CHROME_BINARY=/path/to/browser` if needed.

Watcher only supports `cypress run` (not interactive `cypress open` as the primary path). If flush still times out, confirm network access to `axe.deque.com` and that `ACCESSIBILITY_API_KEY` / `PROJECT_ID` are set.

Or run the pieces separately:

```sh
npm run start:mock   # terminal 1 — http://localhost:3010
npm run cypress:a11y # terminal 2
```

Then open your project at [axe.deque.com](https://axe.deque.com) to review Branches / Test Runs.

A starter GitHub Actions workflow is in [`.github/workflows/a11y-watcher.yml`](.github/workflows/a11y-watcher.yml) (`workflow_dispatch`). Configure repository secret `ACCESSIBILITY_API_KEY` and variable `PROJECT_ID` before using it. Existing AWS-backed Cypress suites (`integration/`, `site_admin/`) are unchanged and still need real Amplify/Cognito.


## Cleanup
If you'd like to tear down the project & delete all of the resources created by this project, you can run the following:
```sh
amplify delete
```

## Documentation
* See [Wiki](https://github.com/VTUL/dlp-access/wiki) for more information. We are keeping update!

## Communication
* GitHub issues: bug reports, feature requests, install issues, thoughts, etc.
* Email: digital-libraries@vt.edu

## Releases and Contributing
We have a 30 day release cycle (We do Sprints!). Please let us know if you encounter a bug by filing an issue. We appreciate all contributions.

If you are planning to contribute back bug-fixes, please do so without any further discussion. 

If you plan to contribute new features, utility functions or extensions to the core, please first open an issue and discuss the feature with us.

To learn more about making a contribution, please see our [Contribution page](CONTRIBUTING.md).

## The Team
DLP Access Website is currently maintained by [Lee Hunter](https://github.com/whunter), Yangkai Lin, and Astha Dhakal.
