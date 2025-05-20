import React, { Component } from "react";
import { Storage } from "aws-amplify";
import { Route, Routes } from "react-router-dom";
import {
  ThemeProvider,
  StyledEngineProvider,
  createTheme
} from "@mui/material/styles";
import ScrollToTop from "./lib/ScrollToTop";
import RouteListener from "./lib/RouteListener";
import AnalyticsConfig from "./components/AnalyticsConfig";
import Header from "./components/Header";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { GitDetails } from "./components/GitDetails";
import LoadingScreen from "./components/LoadingScreen";
import { buildRoutes } from "./lib/CustomPageRoutes";
import HomePage from "./pages/HomePage";
import SiteAdmin from "./pages/admin/SiteAdmin";
import SSO from "./pages/admin/SSO";
import PodcastDeposit from "./pages/admin/PodcastDeposit";

import { BrowseCollections } from "./pages/collections/BrowseCollections";
import { CollectionsShowPage } from "./pages/collections/CollectionsShowPage";

import SearchLoader from "./pages/search/SearchLoader";
import ArchivePage from "./pages/archives/ArchivePage";
import PreIngestCheck from "./pages/admin/ingestTools/PreIngestCheck";
import { getSite } from "./lib/fetchTools";
import { withRouter } from "./lib/WithRouter";
import { NotFound } from "./pages/NotFound";

import "./App.scss";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      site: null,
      siteChanged: false,
      paginationClick: null,
      path: "",
      isLoading: true
    };
  }

  setPathname(pathName, context) {
    context?.setState({ path: pathName });
    return pathName;
  }

  async loadSite() {
    const site = await getSite();
    this.setState({
      site: site,
      isLoading: false
    });
  }

  setStyles() {
    if (this.state.site.siteColor) {
      document.documentElement.style.setProperty(
        "--themeHighlightColor",
        this.state.site.siteColor
      );
    }
    const homepage = JSON.parse(this.state.site.homePage);
    if (homepage.sponsorsColor) {
      document.documentElement.style.setProperty(
        "--sponsorsColor",
        homepage.sponsorsColor.replace(/["]+/g, "")
      );
    }
  }

  setPaginationClick(event) {
    this.setState({ paginationClick: event });
  }

  siteChanged = (changed) => {
    this.setState({ siteChanged: changed });
  };

  configureStorage = () => {
    Storage.configure({
      customPrefix: {
        public: ""
      }
    });
  };

  getCustomKeyFromURL = () => {
    return this.props.location.pathname.split("/").pop();
  };

  componentDidUpdate() {
    if (this.state.siteChanged) {
      this.loadSite();
      this.setState({ siteChanged: false });
    }
  }

  componentDidMount() {
    this.configureStorage();
    this.loadSite();
  }

  render() {
    const theme = createTheme({
      palette: {
        primary: {
          main: "#c64600"
        },
        secondary: {
          main: "#861f41"
        }
      }
    });
    if (!this.state.isLoading && this.state.site && theme) {
      this.setStyles();
      const customRoutes = buildRoutes(this.state.site);
      return (
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <RouteListener setPathname={this.setPathname} context={this} />
            <AnalyticsConfig analyticsID={this.state.site.analyticsID} />
            <ScrollToTop paginationClick={this.state.paginationClick} />
            <div id="fullScreenWrapper">{""}</div>
            <Header
              site={this.state.site}
              location={window.location}
              path={this.state.path}
            />
            <main style={{ minHeight: "500px" }}>
              <div className="container p-0">
                <NavBar site={this.state.site} />
              </div>
              <div id="content-wrapper">
                <Routes>
                  {customRoutes}
                  <Route
                    path="/"
                    exact
                    element={<HomePage site={this.state.site} />}
                  />
                  <Route
                    path="/collections"
                    exact
                    element={
                      <BrowseCollections
                        scrollUp={this.setPaginationClick.bind(this)}
                        site={this.state.site}
                      />
                    }
                  />
                  <Route
                    path="/collection/:customKey"
                    element={
                      <CollectionsShowPage
                        site={this.state.site}
                        customKey={this.getCustomKeyFromURL()}
                      />
                    }
                  />
                  <Route
                    path="/search"
                    exact
                    element={
                      <SearchLoader
                        scrollUp={this.setPaginationClick.bind(this)}
                        site={this.state.site}
                      />
                    }
                  />
                  <Route
                    path="/archive/:customKey"
                    exact
                    element={
                      <ArchivePage
                        site={this.state.site}
                        customKey={this.getCustomKeyFromURL()}
                      />
                    }
                  />
                  <Route
                    path="/siteAdmin"
                    exact
                    element={
                      <SiteAdmin siteChanged={this.siteChanged.bind(this)} />
                    }
                  />
                  <Route
                    path="/sso-test"
                    exact
                    element={<SSO siteChanged={this.siteChanged.bind(this)} />}
                  />
                  <Route
                    path="/podcastDeposit"
                    exact
                    element={<PodcastDeposit />}
                  />
                  <Route
                    path="/siteAdmin/pre-ingest-check"
                    exact
                    element={<PreIngestCheck />}
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
            <GitDetails />
            <Footer />
          </ThemeProvider>
        </StyledEngineProvider>
      );
    } else {
      return (
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <LoadingScreen />
          </ThemeProvider>
        </StyledEngineProvider>
      );
    }
  }
}

export default withRouter(App);
