import { Route } from "react-router-dom";
import AboutPage from "../pages/AboutPage";
import PermissionsPage from "../pages/PermissionsPage";
import AdditionalPages from "../pages/AdditionalPages";
import FeedbackPage from "../pages/FeedbackPage";

const pageComponents = {
  AboutPage: AboutPage,
  PermissionsPage: PermissionsPage,
  AdditionalPages: AdditionalPages,
  FeedbackPage: FeedbackPage
};

function route(site, key, path, title, PageComponent, childKey = null) {
  let elemKey = key;
  if (childKey) {
    elemKey += "." + childKey;
  }
  return (
    <Route
      key={elemKey}
      path={path}
      exact
      element={
        <PageComponent
          site={site}
          parentKey={key}
          childKey={childKey}
          title={title}
        />
      }
    />
  );
}

export function buildRoutes(site) {
  let routes = [];
  for (const [key, obj] of Object.entries(JSON.parse(site.sitePages))) {
    const pageComponent = pageComponents[obj.component];
    routes.push(route(site, key, obj.local_url, obj.text, pageComponent));
    if (obj.children) {
      for (const [childKey, childObj] of Object.entries(obj.children)) {
        const childPageComponent = pageComponents[childObj.component];
        routes.push(
          route(
            site,
            key,
            childObj.local_url,
            childObj.text,
            childPageComponent,
            childKey
          )
        );
      }
    }
  }
  return routes;
}
