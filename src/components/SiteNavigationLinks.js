import React, { Component } from "react";
import { NavLink } from "react-router-dom";

class SiteNavigationLinks extends Component {
  onNavClick() {
    window.navToggle();
  }
  onFoldAction(event) {
    window.foldAction(event.currentTarget);
  }

  buildListItems() {
    let listItems = [];
    let sitePageItems = JSON.parse(this.props.site.sitePages);

    const sitePages = {};
    Object.keys(sitePageItems)
      .sort()
      .forEach(function (key) {
        sitePages[key] = sitePageItems[key];
      });

    for (const [key, page] of Object.entries(sitePages)) {
      listItems.push(this.topLevelItem(key, page));
    }
    return listItems;
  }

  topLevelItem(key, page) {
    const hasChildClass = page.children ? "nav-item has-submenu" : "nav-item";

    const listItem = (
      <li key={page.text} className={hasChildClass}>
        <div className="link-wrapper">
          <NavLink onClick={this.onNavClick} to={page.local_url} tabIndex="-1">
            {page.text.toUpperCase()}
          </NavLink>
          {this.childButton(page)}
        </div>
        {this.childList(page)}
      </li>
    );
    return listItem;
  }

  childList(page) {
    let childList = <></>;
    if (page.children) {
      const ulID = `${page.text.toLowerCase()}_submenu`;
      const ariaLabel = `${page.text} Submenu`;
      childList = (
        <ul className="submenu" id={ulID} aria-label={ariaLabel}>
          {this.childItems(page)}
        </ul>
      );
    }
    return childList;
  }

  childItems(parentPage) {
    const parentKey = parentPage.text;
    let childItems = [];
    for (const [childKey, page] of Object.entries(parentPage.children)) {
      const liKey = `${parentKey}.${childKey}`;
      const item = (
        <li className="nav-item" key={liKey}>
          <NavLink onClick={this.onNavClick} to={page.local_url} tabIndex="-1">
            {page.text}
          </NavLink>
        </li>
      );
      childItems.push(item);
    }
    return childItems;
  }

  childButton(page) {
    let childButton = <></>;
    if (page.children) {
      const accessibilityText = `${page.text} Submenu Toggle`;
      const ariaControls = `${page.text.toLowerCase()}_submenu`;
      childButton = (
        <button
          tabIndex="-1"
          className="fold-icon"
          onClick={this.onFoldAction}
          aria-expanded="false"
          aria-label={accessibilityText}
          aria-controls={ariaControls}
          aria-haspopup="true"
        >
          <span className="far fa-times" focusable="false"></span>
          <span className="sr-only">{accessibilityText}</span>
        </button>
      );
    }
    return childButton;
  }

  render() {
    const additionalListItems = this.buildListItems();

    return (
      <ul id="vt_main_nav" aria-label="Pages in Site">
        <li className="nav-item">
          <div className="link-wrapper">
            <NavLink onClick={this.onNavClick} to="/" tabIndex="-1">
              Home
            </NavLink>
          </div>
        </li>
        <li className="nav-item">
          <div className="link-wrapper">
            <NavLink onClick={this.onNavClick} to="/collections" tabIndex="-1">
              BROWSE COLLECTIONS
            </NavLink>
          </div>
        </li>
        <li className="nav-item">
          <div className="link-wrapper">
            <NavLink onClick={this.onNavClick} to="/search" tabIndex="-1">
              SEARCH
            </NavLink>
          </div>
        </li>
        <li className="nav-item">
          <div className="link-wrapper">
            <NavLink onClick={this.onNavClick} to="/metadata" tabIndex="-1">
              METADATA GUIDE
            </NavLink>
          </div>
        </li>
        {additionalListItems}
      </ul>
    );
  }
}

export default SiteNavigationLinks;
