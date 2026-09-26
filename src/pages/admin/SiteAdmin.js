import React, { Component } from "react";
import { generateClient } from "aws-amplify/api";
import { getCurrentUserInfo } from "../../lib/authTools";
import * as mutations from "../../graphql/mutations";
import { Authenticator, withAuthenticator } from "@aws-amplify/ui-react";
import { Link } from "react-router-dom";
import { getSite } from "../../lib/fetchTools";
import SiteForm from "./SiteForm";
import SitePagesForm from "./SitePagesForm";
import ContentUpload from "./ContentUpload";
import HomepageForm from "./HomepageForm";
import SearchPageForm from "./SearchPageForm";
import BrowseCollectionsForm from "./BrowseCollectionsForm";
import DisplayedAttributesForm from "./DisplayedAttributesForm";
import MediaSectionForm from "./MediaSectionForm";
import IdentifierForm from "./ArchiveCollectionEdit/IdentifierForm";
import SiteContext from "./SiteContext";
import CSVExport from "./CSVExport";
import { MetadataUpload } from "./MetadataUpload";

import "@aws-amplify/ui-react/styles.css";
import "../../css/SiteAdmin.scss";

const client = generateClient();

class SiteAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authorized: false,
      form: "site",
      site: null,
      groups: [],
      userEmail: ""
    };
  }

  async checkGroup() {
    try {
      const data = await getCurrentUserInfo();
      const groups = data.groups?.map((group) => group.toLowerCase());
      this.setState({ groups: groups });
      this.setState({ userEmail: data.email });
      const repo_type = process.env.REACT_APP_REP_TYPE.toLowerCase();
      if (groups && groups.indexOf(repo_type) !== -1) {
        this.setAuthorized(true);
      } else {
        this.setAuthorized(false);
      }
    } catch (err) {
      console.log("error: ", err);
      this.setAuthorized(false);
    }
  }

  async loadSite() {
    try {
      const site = await getSite();
      this.setState({ site: site });
    } catch (e) {
      console.error("Error fetch site config");
    }
  }

  setAuthorized(authorized) {
    this.setState({ authorized: authorized });
  }

  setForm = (form) => {
    this.setState({ form: form });
  };

  getForm = () => {
    const formProps = {
      site: this.state.site,
      updateSite: this.updateSiteHandler,
      siteChanged: this.props.siteChanged
    };
    switch (this.state.form) {
      case "site":
        return <SiteForm siteChanged={this.props.siteChanged} />;
      case "contentUpload":
        return <ContentUpload {...formProps} />;
      case "sitePages":
        return <SitePagesForm {...formProps} />;
      case "homepage":
        return <HomepageForm {...formProps} />;
      case "searchPage":
        return <SearchPageForm {...formProps} />;
      case "browseCollections":
        return <BrowseCollectionsForm {...formProps} />;
      case "displayedAttributes":
        return <DisplayedAttributesForm siteChanged={this.props.siteChanged} />;
      case "mediaSection":
        return <MediaSectionForm siteChanged={this.props.siteChanged} />;
      case "updateArchive":
        return <IdentifierForm type="archive" identifier={null} />;
      case "collectionForm":
        return <IdentifierForm type="collection" identifier={null} />;
      case "podcastDeposit":
        return <IdentifierForm type="podcast" identifier={null} />;
      case "CSVExport":
        return <CSVExport />;
      case "metadataUpload":
        return <MetadataUpload />;
      default:
        return <SiteForm siteChanged={this.props.siteChanged} />;
    }
  };

  updateSiteHandler = async (updateEvent, field = null, content = null) => {
    if (field) {
      this.setState((prevState) => {
        return {
          site: { ...prevState.site, [field]: content }
        };
      });
      const siteConfig = {
        id: this.state.site.id,
        [field]: content
      };
      await client.graphql({
        query: mutations.updateSite,
        variables: { input: siteConfig },
        authMode: "userPool"
      });
    }

    const historyInfo = {
      groups: this.state.groups,
      userEmail: this.state.userEmail,
      siteID: this.state.site.id,
      event: JSON.stringify(updateEvent)
    };
    await client.graphql({
      query: mutations.createHistory,
      variables: { input: historyInfo },
      authMode: "userPool"
    });
    if (typeof this.props.siteChanged === "function") {
      this.props.siteChanged(true);
    }
  };

  componentDidMount() {
    this.checkGroup();
    this.loadSite();
  }

  render() {
    if (this.state.site) {
      return (
        <div className="row admin-wrapper">
          <SiteContext.Provider
            value={{
              site: this.state.site,
              updateSite: this.updateSiteHandler
            }}
          >
            <div className="col-lg-3 col-sm-12 admin-sidebar">
              <ul>
                <li
                  className={
                    this.state.form === "site" ? "admin-active site" : "site"
                  }
                >
                  <Link onClick={() => this.setForm("site")} to={"/siteAdmin"}>
                    General Site Config
                  </Link>
                </li>
                <li
                  className={
                    this.state.form === "sitePages"
                      ? "admin-active sitePages"
                      : "sitePages"
                  }
                >
                  <Link
                    onClick={() => this.setForm("sitePages")}
                    to={"/siteAdmin"}
                  >
                    Site Pages Config
                  </Link>
                </li>
                <li
                  className={
                    this.state.form === "contentUpload"
                      ? "admin-active contentUpload"
                      : "contentUpload"
                  }
                >
                  <Link
                    onClick={() => this.setForm("contentUpload")}
                    to={"/siteAdmin"}
                  >
                    Upload Site Content
                  </Link>
                </li>
                <li
                  className={
                    this.state.form === "homepage"
                      ? "admin-active homepage"
                      : "homepage"
                  }
                >
                  <Link
                    onClick={() => this.setForm("homepage")}
                    to={"/siteAdmin"}
                  >
                    Homepage Config
                  </Link>
                </li>
                <li
                  className={
                    this.state.form === "searchPage"
                      ? "admin-active searchPage"
                      : "searchPage"
                  }
                >
                  <Link
                    onClick={() => this.setForm("searchPage")}
                    to={"/siteAdmin"}
                  >
                    Search Page Config
                  </Link>
                </li>
                <li
                  className={
                    this.state.form === "browseCollections"
                      ? "admin-active browseCollections"
                      : "browseCollections"
                  }
                >
                  <Link
                    onClick={() => this.setForm("browseCollections")}
                    to={"/siteAdmin"}
                  >
                    Browse Collections Page
                  </Link>
                </li>
                <li
                  className={
                    this.state.form === "displayedAttributes"
                      ? "admin-active displayedAttributes"
                      : "displayedAttributes"
                  }
                >
                  <Link
                    onClick={() => this.setForm("displayedAttributes")}
                    to={"/siteAdmin"}
                  >
                    Displayed Attributes
                  </Link>
                </li>
                <li
                  className={
                    this.state.form === "mediaSection"
                      ? "admin-active mediaSection"
                      : "mediaSection"
                  }
                >
                  <Link
                    onClick={() => this.setForm("mediaSection")}
                    to={"/siteAdmin"}
                  >
                    Homepage media section
                  </Link>
                </li>
                <li
                  className={
                    this.state.form === "updateArchive"
                      ? "admin-active updateArchive"
                      : "updateArchive"
                  }
                >
                  <Link
                    onClick={() => this.setForm("updateArchive")}
                    to={"/siteAdmin"}
                  >
                    New / Update Item
                  </Link>
                </li>
                <li
                  className={`collectionFormLink ${
                    this.state.form === "collectionForm"
                      ? " admin-active collectionForm"
                      : "collectionForm"
                  }`}
                >
                  <Link
                    onClick={() => this.setForm("collectionForm")}
                    to={"/siteAdmin"}
                  >
                    New / Update Collection
                  </Link>
                </li>
                <li>
                  <Link to={"/siteAdmin/pre-ingest-check"}>
                    Pre-ingest check tool
                  </Link>
                </li>
                <li
                  className={`metadataUploadLink ${
                    this.state.form === "metadataUpload"
                      ? " admin-active metadataUpload"
                      : "metadataUpload"
                  }`}
                >
                  <Link
                    onClick={() => this.setForm("metadataUpload")}
                    to={"/siteAdmin"}
                  >
                    Upload Metadata CSV
                  </Link>
                </li>
                {this.state.site && this.state.site.siteId === "podcasts" && (
                  <li
                    className={
                      this.state.form === "podcastDeposit"
                        ? "podcastDeposit admin-active"
                        : "podcastDeposit"
                    }
                  >
                    <Link
                      onClick={() => this.setForm("podcastDeposit")}
                      to={"/siteAdmin"}
                    >
                      New / Update Podcast Episode
                    </Link>
                  </li>
                )}
                <li
                  className={
                    this.state.form === "CSVExport"
                      ? "admin-active CSVExport"
                      : "CSVExport"
                  }
                >
                  <Link
                    onClick={() => this.setForm("CSVExport")}
                    to={"/siteAdmin"}
                  >
                    CSV Export
                  </Link>
                </li>
              </ul>
              <hr className="auth-divider" />
              <Authenticator>
                {({ signOut, user }) => (
                  <div className="auth-dialog">
                    <p>{user.username} successfully logged in.</p>
                    <button onClick={signOut}>Sign out</button>
                  </div>
                )}
              </Authenticator>
            </div>
            {this.state.authorized && this.state.site ? (
              this.getForm()
            ) : (
              <h1>"Not authorized to access this page!"</h1>
            )}
          </SiteContext.Provider>
        </div>
      );
    } else {
      return <></>;
    }
  }
}

export default withAuthenticator(SiteAdmin);
