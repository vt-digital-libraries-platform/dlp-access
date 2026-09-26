import { getUrl } from "aws-amplify/storage";
import { getStorageBucket } from "./storageTools";

export default class FileGetter {
  getURLType = (url) => {
    let type = {};
    if (!url?.length) {
      type["undefined"] = true;
    } else {
      type["undefined"] = false;
    }
    type["hasWhitespace"] = /\s/g.test(url);

    if (
      (url?.indexOf("http") === 0 || url?.indexOf("www") === 0) &&
      url?.indexOf(".") !== -1
    ) {
      type["fullURL"] = true;
    } else {
      type["fullURL"] = false;
    }
    if (url?.indexOf(getStorageBucket()) !== -1) {
      type["correctBucket"] = true;
    } else {
      type["correctBucket"] = false;
    }
    if (type["fullURL"] && !type["correctBucket"]) {
      if (
        url?.indexOf(/(collectionmap\d{6}-)/) === -1 &&
        url?.indexOf("s3") === -1
      ) {
        type["externalURL"] = true;
      } else {
        type["externalURL"] = false;
      }
    }
    if (
      type["fullURL"] === false &&
      url?.indexOf("/") === -1 &&
      url?.indexOf(".") !== -1
    ) {
      type["filenameOnly"] = true;
    } else {
      type["filenameOnly"] = false;
    }
    if (
      !type["fullURL"] &&
      (url?.match(/\//g) || []).length > 0 &&
      url?.indexOf(".") !== -1
    ) {
      type["filenameWithPrefix"] = true;
    } else {
      type["filenameWithPrefix"] = false;
    }
    return type;
  };

  getFile = async (
    copyURL,
    type,
    component,
    attr,
    siteId = "",
    pathPrefix = ""
  ) => {
    const stateObj = {};
    const stateAttr = attr || "copy";
    let prefix;
    let filename;
    let urlType = this.getURLType(copyURL);
    let signedURL;
    if (!urlType.undefined && urlType.fullURL && urlType.externalURL) {
      // just return external urls
      signedURL = copyURL;
    } else if (urlType.fullURL && urlType.correctBucket) {
      [filename, prefix] = this.handleCorrectBucket(copyURL);
    } else if (
      !urlType.undefined &&
      urlType.fullURL &&
      !urlType.externalURL &&
      !urlType.correctBucket
    ) {
      [filename, prefix] = this.removeIncorrectBucket(copyURL);
    } else if (
      !urlType.undefined &&
      !urlType.fullURL &&
      urlType.filenameWithPrefix
    ) {
      [filename, prefix] = this.getS3PrefixFilename(
        copyURL,
        pathPrefix,
        type,
        siteId
      );
    } else if (!urlType.undefined && !urlType.fullURL && urlType.filenameOnly) {
      [filename, prefix] = this.getS3Filename(
        copyURL,
        pathPrefix,
        type,
        siteId
      );
    }
    if (!urlType.undefined && !urlType.externalURL) {
      try {
        const { url } = await getUrl({ path: `${prefix}/${filename}` });
        signedURL = url.toString();
        // if (type === "audio") {
        //   signedURL = signedURL.replace(/%20/g, "+");
        // }
      } catch (e) {
        console.error(e);
      }
    }
    stateObj[stateAttr] = signedURL;
    if (typeof (component?.setState === "function")) {
      component.setState(stateObj);
    }
    return signedURL;
  };

  removeIncorrectBucket = (copyURL) => {
    const domain = "amazonaws.com/";
    const start = copyURL.indexOf(domain);
    const length = start + domain.length;
    copyURL = copyURL.replace(copyURL.substr(0, length), "");
    const filename = copyURL.split("/").pop();
    let prefix = copyURL.replace(filename, "");
    if (prefix.charAt(0) === "/") {
      prefix = prefix.substring(1);
    }
    if (prefix.charAt(prefix.length - 1) === "/") {
      prefix = prefix.substring(0, prefix.length - 1);
    }
    return [filename, prefix];
  };

  handleCorrectBucket = (copyURL) => {
    const domain = `https://${getStorageBucket()}.s3.us-east-1.amazonaws.com/`;
    copyURL = copyURL.replace(domain, "");
    const filename = copyURL.split("/").pop();
    let prefix = copyURL.replace(filename, "");
    if (prefix.charAt(0) === "/") {
      prefix = prefix.substring(1);
    }
    if (prefix.charAt(prefix.length - 1) === "/") {
      prefix = prefix.substring(0, prefix.length - 1);
    }
    return [filename, prefix];
  };

  getS3PrefixFilename = (copyURL, pathPrefix, type, siteId) => {
    const filename = copyURL.split("/").pop();
    let prefix = copyURL.replace(filename, "");
    if (prefix.charAt(0) === "/") {
      prefix = prefix.substring(1);
    }
    if (prefix.charAt(prefix.length - 1) === "/") {
      prefix = prefix.substring(0, prefix.length - 1);
    }
    if (
      !!siteId?.length &&
      prefix.indexOf("public/sitecontent") === -1 &&
      prefix.indexOf(type) === -1 &&
      prefix.indexOf(siteId) === -1
    ) {
      prefix = `${pathPrefix}/${type}/${siteId}/${prefix}`;
    }
    return [filename, prefix];
  };

  getS3Filename = (copyURL, pathPrefix, type, siteId) => {
    const filename = copyURL;
    let prefix = "";
    if (!!siteId?.length) {
      prefix = `${pathPrefix}/${type}/${siteId}`;
    }
    if (prefix.charAt(prefix.length - 1) === "/") {
      prefix = prefix.substring(0, prefix.length - 1);
    }
    return [filename, prefix];
  };
}
