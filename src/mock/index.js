/**
 * @fileoverview Local Amplify mock bootstrap.
 *
 * When `REACT_APP_USE_MOCKS=true`, call {@link installMocks} before
 * `Amplify.configure` so GraphQL, Storage, and Auth hit in-memory stubs
 * instead of AWS. Browse-only: mutations and Cognito auth are rejected.
 */

import { API, Auth, Storage } from "aws-amplify";
import { handleGraphql } from "./handlers/graphql";
import { createStorageMock } from "./handlers/storage";

/**
 * Patch Amplify `API`, `Storage`, and `Auth` for local browse-only mock mode.
 *
 * Must run before `Amplify.configure` when `REACT_APP_USE_MOCKS=true`.
 * Replaces `API.graphql` with the in-memory GraphQL router, stubs REST
 * helpers, wires a fake S3 Storage client, and makes Auth methods reject
 * (admin/Cognito flows are out of scope).
 *
 * @returns {void}
 */
export function installMocks() {
  console.info(
    "[dlp-access mock] Local Amplify mock layer enabled (browse-only, no AWS)"
  );

  /**
   * @param {string|{query?: string, variables?: Object}} input
   * @returns {Promise<Object>}
   */
  API.graphql = async (input) => {
    // Amplify accepts either graphqlOperation() result or { query, variables }
    return handleGraphql(input);
  };

  // REST endpoints (e.g. feedback) — soft-fail so pages don't crash
  API.post = async () => {
    console.warn("Mock mode: API.post is a no-op");
    return { success: true, mock: true };
  };
  API.get = async () => {
    console.warn("Mock mode: API.get is a no-op");
    return {};
  };

  const storageMock = createStorageMock();
  Storage.configure = storageMock.configure.bind(storageMock);
  Storage.get = storageMock.get.bind(storageMock);
  Storage.put = storageMock.put.bind(storageMock);
  Storage.remove = storageMock.remove.bind(storageMock);
  Storage.list = storageMock.list.bind(storageMock);
  Storage._config = storageMock._config;

  Auth.currentAuthenticatedUser = async () => {
    throw new Error("Mock mode: not authenticated");
  };
  Auth.currentUserPoolUser = async () => {
    throw new Error("Mock mode: not authenticated");
  };
  Auth.currentSession = async () => {
    throw new Error("Mock mode: not authenticated");
  };
  Auth.signIn = async () => {
    throw new Error("Mock mode: Cognito sign-in is not available");
  };
  Auth.signOut = async () => true;
  Auth.configure = () => {};
}
