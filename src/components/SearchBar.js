import React, { Component } from "react";
import { withRouter } from "../lib/WithRouter.js";
import qs from "query-string";
import { labelAttr } from "../lib/MetadataRenderer";

import "../css/searchBar.scss";

class SearchBar extends Component {
  state = {
    q: this.props.q || ""
  };

  submit = (e) => {
    e.preventDefault();

    const parsedObject = {
      field: "all",
      q: this.state.q,
      view: this.props.view,
      ...this.props.filters
    };

    try {
      this.props.navigate({
        pathname: "/search",
        search: `?${qs.stringify(parsedObject)}`,
        state: parsedObject
      });
      if (typeof this.props.setPage === "function") {
        this.props.setPage(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      this.setState({
        q: this.props.q,
        field: this.props.field
      });
    }
  }

  render() {
    return (
      <form className="searchbar-wrapper" role="search" onSubmit={this.submit}>
        <label htmlFor="searchbar-text-input" className="sr-only">
          items and collections
        </label>
        <input
          value={this.state.q || ""}
          type="search"
          id="searchbar-text-input"
          onChange={(e) => this.setState({ q: e.target.value })}
        />
        <button type="submit" onClick={this.submit}>
          <i className="fas fa-search" aria-hidden="true"></i>
          <span className="sr-only">submit</span>
        </button>
      </form>
    );
  }
}
export default withRouter(SearchBar);
