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
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_RiqhEO7td",
  client_id: "28dlg69m97oi8hprus3pd8hqi4",
  redirect_uri: "http://localhost:3000/sso-test",
  response_type: "code",
  scope: "email"
};

Amplify.configure(config);

const container = document.getElementById("root");
const root = ReactDOMClient.createRoot(container);
console.log(cognitoAuthConfig);
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
