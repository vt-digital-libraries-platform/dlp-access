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
| USER_DISABLE_TESTS | Enable/disable Amplify tests |

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
  2. Launch the Cypress app ```npx cypress open```

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
