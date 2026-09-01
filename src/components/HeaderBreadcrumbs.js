import React from "react";
import { API, graphqlOperation } from "aws-amplify";
import * as queries from "../graphql/queries";

import Breadcrumbs from "./Breadcrumbs";

class HeaderBreadcrumbs extends Breadcrumbs {
  constructor(props) {
    super(props);
    this.state = {
      links: [],
      title: null
    };
  }

  async getTitle(pathname, path_array) {
    const type = path_array[1];
    const customKey = path_array[2];
    const options = {
      order: "ASC",
      limit: 1,
      filter: {
        custom_key: {
          matchPhrase: customKey
        }
      }
    };
    let title = null;
    let query = null;
    let dataRecord = null;
    if (type === "collection") {
      query = queries.searchCollections;
      dataRecord = "searchCollections";
    } else if (type === "archive") {
      query = queries.searchArchives;
      dataRecord = "searchArchives";
    }
    if (query) {
      const item = await API.graphql(graphqlOperation(query, options));
      try {
        title = item.data[dataRecord].items[0].title;
      } catch (error) {
        console.error(`error getting title for ${type}: ${customKey}`);
      }
    }
    if (title) {
      this.setState({ title: title }, function () {
        this.buildList(pathname, path_array);
      });
    } else {
      this.buildList(pathname, path_array);
    }
  }

  getCurrentPage(pathname, path_array) {
    let pageObj = null;
    let page = "";
    if (path_array[1] !== "") {
      page = path_array[1];
      if (page === "collection" || page === "archive") {
        pageObj = {
          title: this.state.title,
          url: pathname,
          custom_key: null
        };
      } else {
        pageObj = {
          title: page.charAt(0).toUpperCase() + page.slice(1),
          url: pathname,
          custom_key: null
        };
      }
    }
    return pageObj;
  }

  buildList(pathname, path_array) {
    let baseList = [];
    const here = this.getCurrentPage(pathname, path_array);
    baseList.push({
      title: "University Libraries",
      url: "https://lib.vt.edu",
      custom_key: null
    });
    baseList.push({
      title: this.props.site.siteTitle,
      url: "/",
      custom_key: null
    });
    if (here) {
      baseList.push(here);
    }
    this.setState({ links: baseList });
  }

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      const pathname = this.props.location.pathname;
      const path_array = pathname.split("/");
      if (path_array.length >= 2) {
        this.getTitle(pathname, path_array);
      }
    }
  }

  componentDidMount() {
    const pathname = this.props.location.pathname;
    const path_array = pathname.split("/");
    if (path_array.length >= 2) {
      this.getTitle(pathname, path_array);
    }
  }

  render() {
    return (
      <ol id="vt_navtrail" className="long_title vt-breadcrumbs">
        {this.state.links.map((link, index) => (
          <li key={index} className="vt-breadcrumbs-item">
            <a className="vt-breadcrumbs-link" href={link.url}>
              {link.title}
            </a>
            <span className="breadcrumb-slash" aria-hidden="true">
              {" "}
              /{" "}
            </span>
          </li>
        ))}
      </ol>
    );
  }
}

export default HeaderBreadcrumbs;
