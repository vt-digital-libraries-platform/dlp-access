export function findCollectionType(siteId) {
  if (siteId === "podcasts") {
    return "PodcastSeries";
  } else {
    return "Unknown";
  }
}

export function buildCollectionSchema(item) {
  let info = {};
  const asset_urls = JSON.parse(item.asset_urls);
  info["creator"] = item.creator;
  info["description"] = item.description;
  info["thumbnail_url"] = asset_urls["thumbnail_url"];
  info["title"] = item.title;
  info["url"] = window.location.href;
  if (item.collectionOptions) {
    const collectionOptions = JSON.parse(item.collectionOptions);
    info["webFeed"] = collectionOptions.webFeed;
  }

  return info;
}

export function buildHeaderSchema(parenttype, type, id, title) {
  const scriptContent = `{
      "@context": "https://schema.org",
      "@type": "${parenttype}",
      "mainEntityOfPage": {
        "@type": "${type}",
        "@id": "${id}"
      },
      "headline": "${title}"
    }`;
  return scriptContent;
}

function buildPodcastEpisodeSchema(info) {
  const scriptContent = `{
    "@context": "https://schema.org/",
    "@type": "PodcastEpisode",
    "url": "${info["url"]}",
    "name": "${info["title"]}",
    "datePublished": "${info["datePublished"]}",
    "duration": "${info["duration"]}",
    "description": "${info["description"]}",
    "associatedMedia": {
      "@type": "MediaObject",
      "contentUrl": "${info["audio"]}"
    },
    "partOfSeries": {
      "@type": "PodcastSeries",
      "name": "${info["collectionTitle"]}",
      "url": "${info["collectionURL"]}"
    }
  }`;

  return scriptContent;
}

function buildPodcastSeriesSchema(info) {
  const scriptContent = `{
      "@context": "https://schema.org/",
      "@type": "PodcastSeries",
      "image": "${info["thumbnail_url"]}",
      "url": "${info["url"]}",
      "name": "${info["title"]}",
      "description": "${info["description"]}",
      "webFeed": "${info["webFeed"]}",
      "author": {
        "@type": "Person",
        "name": "${info["creator"]}"
      }
  }`;

  return scriptContent;
}

export function buildRichSchema(type, info) {
  if (type === "PodcastEpisode") {
    return buildPodcastEpisodeSchema(info);
  } else if (type === "PodcastSeries") {
    return buildPodcastSeriesSchema(info);
  }
  return "";
}
