import { FC, useEffect, useState } from "react";
import Handlebars from "handlebars";
import Helmet from "react-helmet";

type Props = {
  data: {};
  template: string | { item?: string; collection?: string };
  site?: {
    siteTitle?: string;
  };
};

export const SiteTitle: FC<Props> = ({ data, template, site }) => {
  const [siteTitle, setSiteTitle] = useState("VT Digital Library Platform");
  const [pageTitle, setPageTitle] = useState(siteTitle);

  /**
   * Constructs the page title for a given record based on the provided template and site information.
   *
   * @param data Object - The data with which the page title is being constructed.
   * @param template String | Object -The template that defines how the page title should be structured.
   * @param site Object - The site information that may be used in constructing the page title.
   * @returns String - The page title to be inserted into the document's <head> element.
   **/
  const buildPageTitle = (
    data: { [key: string]: string },
    template: string | { [key: string]: string },
    site?: { siteTitle?: string }
  ) => {
    setSiteTitle(site?.siteTitle || "VT Digital Library Platform");
    const mainTemplateString = `{{#if content}}{{content}} | {{/if}}${siteTitle}`;
    const mainTemplate = Handlebars.compile(mainTemplateString);
    let titleTemplate: HandlebarsTemplateDelegate<any> | string | null = null;
    let content = "";

    // Template is object for item and collection show pages.
    // Template is string for all other pages
    if (typeof template === "string") {
      titleTemplate = Handlebars.compile(template);
      content = titleTemplate(data);
    } else if (typeof template === "object") {
      for (const key in template) {
        if (template[key] && data[key]) {
          if (typeof template[key] === "string") {
            titleTemplate = Handlebars.compile(template[key]);
          } else if (Array.isArray(template[key])) {
            titleTemplate = Handlebars.compile(template[key][0]);
          } else {
            continue;
          }
          let dataValue: { [key: string]: string } = {};
          if (titleTemplate != null) {
            // item and/or collection data w/ those keys
            if (typeof data[key] === "object") {
              // given an item or collection object, convert values to strings
              // if value is an array, use first element
              // use a clone so we don't step on the og data.
              dataValue = structuredClone(data[key]);
              for (const dataKey in dataValue) {
                if (typeof dataValue[dataKey] === "string") {
                  continue;
                } else if (Array.isArray(dataValue[dataKey])) {
                  dataValue[dataKey] = dataValue[dataKey][0];
                } else {
                  delete dataValue[dataKey];
                }
              }
            }
            // regular key value pair where value is string
            // e.g. Home page object: { title: "Home" }
            else if (typeof data[key] === "string") {
              dataValue = structuredClone(data);
              // If it's a regular key value pair but value is an array, use first element.
              // Not sure if this happens currrently??? Probably shouldn't.
            } else if (Array.isArray(data[key])) {
              console.warn(
                "array for title data value, using first element: ",
                data[key]
              );
              dataValue[key] = String(data[key][0]);
            } else {
              continue;
            }
            content += `${titleTemplate(dataValue || {})}`;
          }
        }
      }
    }

    return mainTemplate({ content: content });
  };

  useEffect(() => {
    setPageTitle(buildPageTitle(data, template, site));
  }, [data, template, site]);

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta property="og:title" content={pageTitle} />
      <meta property="og:site_name" content={siteTitle} />
    </Helmet>
  );
};

/**
 * @param item - (optional) Item/archive record for which the title template is being generated
 * @param collection - (optional) The parent collection of the item
 * @return json - The title templates to be used for the given Archive | Collection
 **/
export const getTitleTemplateForType = (
  item: Archive | null,
  collection: Collection | null
) => {
  const template = { item: "", collection: "" };
  if (item) {
    template["item"] = item.title_template || "{{title}}";
  }
  if (collection) {
    const delimiter = template["item"].length ? " | " : "";
    template["collection"] = `${delimiter}${
      collection.title_template || "{{title}}"
    }`;
  }
  return template;
};
