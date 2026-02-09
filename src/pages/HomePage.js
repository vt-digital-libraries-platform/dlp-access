import React, { Component } from "react";
import { FeaturedStaticImage } from "./home/FeaturedStaticImage";
import SearchBar from "../components/SearchBar";
import { HomeStatement } from "./home/HomeStatement";
import SiteTitle from "../components/SiteTitle";
import { FeaturedItems } from "./home/FeaturedItems";
import { MultimediaSection } from "./home/MultimediaSection";
import { SiteSponsors } from "./home/SiteSponsors";
import { CollectionHighlights } from "./home/CollectionHighlights";

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
        <SiteTitle siteTitle={this.props.site.siteTitle} pageTitle="Home" />
        <div className="home-wrapper">
          <FeaturedStaticImage
            staticImage={staticImage}
            site={this.props.site}
          />
          <h1>
            <span className="sr-only">Virginia Tech </span>
            Digital Libraries Platform
            <span className="sr-only"> Home</span>
          </h1>
          <HomeStatement homeStatement={homeStatement} />
          <h2>Search</h2>
          <div className="home-search-wrapper">
            <SearchBar filters={{}} view="Gallery" field="all" q="" />
          </div>
          <div className="home-nav-links">
            <a href="/search">View All Items</a>
            <a href="/collections">View All Collections</a>
          </div>

          <div>
            <FeaturedItems
              featuredItems={featuredItems}
              site={this.props.site}
            />
          </div>
          <MultimediaSection mediaSection={mediaSection} />
          <div>
            <SiteSponsors
              sponsors={sponsors}
              sponsorsStyle={sponsorsStyle}
              site={this.props.site}
            />
            <CollectionHighlights
              collectionHighlights={collectionHighlights}
              site={this.props.site}
            />
          </div>
        </div>
      </>
    );
  }
}

export default HomePage;
