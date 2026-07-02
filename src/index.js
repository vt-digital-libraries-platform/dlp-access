import React from "react";
import * as ReactDOMClient from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./css/index.scss";
import "./css/colors.scss";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

import { Amplify } from "aws-amplify";
import config from "./aws-exports";

import "bootstrap/dist/css/bootstrap.css";
import "semantic-ui-css/semantic.min.css";

console.clear();
Amplify.configure({
  ...config,
  API: {
    endpoints: [
      {
        name: "feedbackapi",
        endpoint: process.env.REACT_APP_FEEDBACK_API_ENDPOINT
      }
    ]
  }
});

const container = document.getElementById("root");
const root = ReactDOMClient.createRoot(container);

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
