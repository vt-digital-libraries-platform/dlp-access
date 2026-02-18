import React, { Component } from "react";
import { FeaturedStaticImage } from "./home/FeaturedStaticImage";
import SearchBar from "../components/SearchBar";
import { HomeStatement } from "./home/HomeStatement";
import { SiteTitle } from "../components/SiteTitle";
import { FeaturedItems } from "./home/FeaturedItems";
import { MultimediaSection } from "./home/MultimediaSection";
import { SiteSponsors } from "./home/SiteSponsors";
import { CollectionHighlights } from "./home/CollectionHighlights";

import "../css/Typography.scss";
import "../css/HomePage.scss";

class HomePage extends Component {
  render() {
    let featuredItems = null;
    let homeStatement = null;
    let staticImage = null;
    let mediaSection = null;
    let sponsors = null;
    let sponsorsStyle = null;
    let collectionHighlights = null;
    try {
      const homePageInfo = JSON.parse(this.props.site.homePage);
      featuredItems = homePageInfo["featuredItems"];
      homeStatement = homePageInfo["homeStatement"];
      staticImage = homePageInfo["staticImage"];
      mediaSection = homePageInfo["mediaSection"];
      sponsors = homePageInfo["sponsors"];
      sponsorsStyle = homePageInfo["sponsorsStyle"];
      collectionHighlights = homePageInfo["collectionHighlights"];
    } catch (error) {
      console.error("Error setting config property");
    }
    return (
      <>
        <SiteTitle
          data={{ title: "Home" }}
          site={this.props.site}
          template="{{title}}"
        />
        <div className="home-wrapper typography-wrapper">
          <FeaturedStaticImage
            staticImage={staticImage}
            site={this.props.site}
          />
          <div className="container">
            <h1>
              <span className="sr-only">Virginia Tech </span>
              {(this.props.site.siteName === "Virginia Tech Digital Libraries"
                ? "Digital Libraries Platform"
                : this.props.site.siteName
              )
                .replace("Virginia Tech", "")
                .replace("Home", "")
                .trim()}
              <span className="sr-only"> Home</span>
            </h1>
            <HomeStatement homeStatement={homeStatement} />
            <h2>Search</h2>
            <div className="home-search-wrapper">
              <SearchBar filters={{}} view="Gallery" field="all" q="" />
            </div>
            <h2 className="sr-only">Browse Links</h2>
            <div className="home-nav-links">
              <a href="/search?&category=archive">Browse All Items</a>
              <a href="/search?&category=collection">Browse All Collections</a>
            </div>
            {featuredItems && featuredItems.length > 0 && (
              <>
                <h2>Featured Items</h2>
                <FeaturedItems
                  featuredItems={featuredItems}
                  site={this.props.site}
                />
              </>
            )}
            {mediaSection && (
              <>
                <h2>Multimedia</h2>
                <MultimediaSection mediaSection={mediaSection} />
              </>
            )}
            {sponsors && sponsors.length > 0 && (
              <>
                <h2>Sponsors</h2>
                <SiteSponsors
                  sponsors={sponsors}
                  sponsorsStyle={sponsorsStyle}
                  site={this.props.site}
                />
              </>
            )}
            {collectionHighlights && collectionHighlights.length > 0 && (
              <>
                <h2>Highlights</h2>
                <CollectionHighlights
                  collectionHighlights={collectionHighlights}
                  site={this.props.site}
                />
              </>
            )}
          </div>
        </div>
      </>
    );
  }
}

export default HomePage;
