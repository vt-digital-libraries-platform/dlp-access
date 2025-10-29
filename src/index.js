import React from "react";
import * as ReactDOMClient from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./css/index.scss";
import "./css/colors.scss";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { AuthProvider } from "react-oidc-context";

import { Amplify } from "aws-amplify";
import config from "./aws-exports";

import "bootstrap/dist/css/bootstrap.css";
import "semantic-ui-css/semantic.min.css";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_wy1lPpMYt",
  client_id: "54bpum4j5m2l69cisr6k6grj66",
  redirect_uri: "https://oidc-client.dev.dlp.cloud.lib.vt.edu/sso-test/",
  response_type: "code",
  scope: "openid email"
};

Amplify.configure(config);

const container = document.getElementById("root");
const root = ReactDOMClient.createRoot(container);

root.render(
  <BrowserRouter>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </BrowserRouter>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
