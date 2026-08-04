/**
 * @fileoverview Amplify Storage stub for local mock mode.
 *
 * Returns HTTPS URLs or a placeholder image for `Storage.get`, serves a few
 * canned HTML blobs for site pages, and no-ops writes.
 */

/** Stable external image used when a key is not already an http(s) URL. */
const PLACEHOLDER_IMAGE =
  "https://hokiesports.com/images/2018/10/11/271f4e06b61983fba5c37bad7586f2e8.jpg";

/**
 * Canned HTML keyed by the mock `data_url` values written into site pages.
 *
 * @type {Object.<string, string>}
 */
const MOCK_HTML = {
  "https://example.com/mock/about.html":
    "<h1>About</h1><p>This is local mock content for the About page.</p>",
  "https://example.com/mock/terms.html":
    "<h1>Permissions</h1><p>This is local mock permissions content.</p>"
};

/**
 * @param {*} value
 * @returns {boolean}
 */
function isHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

/**
 * @typedef {Object} StorageGetOptions
 * @property {boolean} [download] - When true, return `{ Body: Blob }` instead of a URL string.
 */

/**
 * @typedef {Object} MockStorage
 * @property {{AWSS3: {bucket: string, region: string}}} _config
 * @property {function(Object=): MockStorage} configure
 * @property {function(string, StorageGetOptions=): Promise<string|{Body: Blob}>} get
 * @property {function(): Promise<{key: string}>} put
 * @property {function(): Promise<boolean>} remove
 * @property {function(): Promise<{results: Array}>} list
 */

/**
 * Create a Storage-compatible object for Amplify patching in mock mode.
 *
 * Sets `Storage._config.AWSS3.bucket` so file getters that check the bucket
 * name do not throw. Uploads are no-ops.
 *
 * @returns {MockStorage}
 */
export function createStorageMock() {
  const bucket = "dlp-access-local-mock";
  const region = "us-east-1";

  return {
    _config: {
      AWSS3: {
        bucket,
        region
      }
    },
    /**
     * @param {{customPrefix?: Object}} [options]
     * @returns {MockStorage}
     */
    configure(options = {}) {
      if (options.customPrefix) {
        this._customPrefix = options.customPrefix;
      }
      return this;
    },
    /**
     * @param {string} key - S3 key or full http(s) URL.
     * @param {StorageGetOptions} [options]
     * @returns {Promise<string|{Body: Blob}>}
     */
    async get(key, options = {}) {
      const resolved = isHttpUrl(key) ? key : PLACEHOLDER_IMAGE;

      if (options.download) {
        if (MOCK_HTML[key] || MOCK_HTML[resolved]) {
          const text = MOCK_HTML[key] || MOCK_HTML[resolved];
          return { Body: new Blob([text], { type: "text/html" }) };
        }
        // Return empty blob for unknown downloads
        return { Body: new Blob([""], { type: "application/octet-stream" }) };
      }

      return resolved;
    },
    /**
     * @returns {Promise<{key: string}>}
     */
    async put() {
      console.warn("Mock mode: Storage.put is a no-op");
      return { key: "mock-upload" };
    },
    /**
     * @returns {Promise<boolean>}
     */
    async remove() {
      console.warn("Mock mode: Storage.remove is a no-op");
      return true;
    },
    /**
     * @returns {Promise<{results: Array}>}
     */
    async list() {
      return { results: [] };
    }
  };
}
