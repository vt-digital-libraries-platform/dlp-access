import React, { Component } from "react";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { NavLink } from "react-router-dom";
import { Form, Button, Label } from "semantic-ui-react";
import { updatedDiff } from "deep-object-diff";
import { API, Auth } from "aws-amplify";
import {
  getSite,
  getFileContent,
  getPageContentById,
  downloadFile
} from "../../lib/fetchTools";
import { input } from "../../components/FormFields";
import * as mutations from "../../graphql/mutations";
import FocusLock from "react-focus-lock";
import { v4 as uuidv4 } from "uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Editor from "../../components/Editor";

import "../../css/adminForms.scss";

const initialFormState = [];

const editorModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline"],
    [{ script: "sub" }, { script: "super" }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["link", "code-block", "blockquote"],
    ["clean"]
  ],
  clipboard: {
    matchVisual: false
  }
};

const editorFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "script",
  "list",
  "bullet",
  "indent",
  "align",
  "link",
  "code-block",
  "blockquote",
  "image",
  "color",
  "background"
];
class SitePagesForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formState: initialFormState,
      prevFormState: initialFormState,
      viewState: "view",
      site: null,
      added: 0,
      fileFolder: "",
      copy: "",
      pageId: null,
      isEditorActive: false,
      pageContentId: null
    };
  }

  async loadSite() {
    const site = await getSite();
    if (site) {
      const sitePages = JSON.parse(site.sitePages);
      let pages = [];
      for (const key in sitePages) {
        const page = sitePages[key];
        pages.push({ pageName: key, ...page });
      }
      this.setState({
        formState: pages,
        prevFormState: pages,
        site: site
      });
    }
  }

  componentDidMount() {
    this.loadSite();
  }

  setFileFolder(context, folder, event) {
    context.setState({ fileFolder: folder }, () =>
      context.updateInputValue(event)
    );
  }

  getFileUrl(value) {
    const folder = this.state.fileFolder;
    const pathPrefix = `public/sitecontent/${folder}/${process.env.REACT_APP_REP_TYPE.toLowerCase()}/`;
    return `${pathPrefix}${value}`;
  }

  updateInputValue = (event, data) => {
    let { name, value, type } = event.target;
    if (event.target.role === "option" || data?.name?.includes("useDataUrl")) {
      name = data.name;
      value = data.value || data.checked;
    }
    if (type === "upload") {
      const url = this.getFileUrl(value);
      if (name.indexOf("assets") !== -1) {
        let obj = {};
        obj.download = url;
        value = obj;
      } else {
        value = url;
      }
    }

    const page = name.split("_")[0];
    let formField = name.split("_")[1];
    let tempState = JSON.parse(JSON.stringify(this.state.formState));

    for (const idx in tempState) {
      if (tempState[idx].pageName === page) {
        if (formField === "localURL") {
          formField = "local_url";
        } else if (formField === "dataURL") {
          formField = "data_url";
          tempState[idx]["useDataUrl"] = true;
        }
        tempState[idx][formField] = value;
      }
    }

    this.setState({ formState: tempState });
  };

  handleSubmit = async () => {
    const pagesObj = {};
    for (const idx in this.state.formState) {
      let page = this.state.formState[idx];
      pagesObj[page.pageName] = page;
    }
    this.setState({ viewState: "view" });
    const siteID = this.state.site.id;
    const siteInfo = { id: siteID, sitePages: JSON.stringify(pagesObj) };

    await API.graphql({
      query: mutations.updateSite,
      variables: { input: siteInfo },
      authMode: "AMAZON_COGNITO_USER_POOLS"
    });
    const newData = updatedDiff(this.state.prevFormState, this.state.formState);
    const oldData = updatedDiff(this.state.formState, this.state.prevFormState);
    let newPages = [];
    let deletedPages = [];

    // check if pages were deleted (for history)
    for (const idx in this.state.prevFormState) {
      const pageName = this.state.prevFormState[idx].pageName;
      let found = false;
      for (const i in this.state.formState) {
        if (this.state.formState[i].pageName === pageName) {
          found = true;
        }
      }
      if (!found) {
        deletedPages.push(this.state.prevFormState[idx]);
      }
    }

    // check if pages were added (for history)
    const numNewPages =
      this.state.formState.length - this.state.prevFormState.length;
    if (numNewPages > 0) {
      newPages = this.state.formState.slice(
        Math.max(this.state.formState.length - numNewPages, 0)
      );
    }
    if (newPages.length) {
      for (const idx in newPages) {
        newData[Object.keys(newData).length] = newPages[idx];
      }
    }
    let eventInfo = {};
    if (!deletedPages.length) {
      eventInfo = Object.keys(newData).reduce((acc, key) => {
        return {
          ...acc,
          [key]: {
            old: oldData[key] || "New Page",
            new: newData[key]
          }
        };
      }, {});
    } else {
      for (const idx in deletedPages) {
        eventInfo[idx] = {
          old: deletedPages[idx],
          new: "Deleted"
        };
      }
    }

    const userInfo = await Auth.currentUserPoolUser();
    let historyInfo = {
      groups: userInfo.signInUserSession.accessToken.payload["cognito:groups"],
      userEmail: userInfo.attributes.email,
      siteID: siteID,
      event: JSON.stringify(eventInfo)
    };
    await API.graphql({
      query: mutations.createHistory,
      variables: { input: historyInfo },
      authMode: "AMAZON_COGNITO_USER_POOLS"
    });
    if (typeof this.props.siteChanged === "function") {
      this.props.siteChanged(true);
    }
  };

  handleChange = (e, data) => {
    if (data) {
      this.setState({ viewState: data.value });
    } else {
      this.setState({ copy: e });
    }
  };

  addPage() {
    let pages = JSON.parse(JSON.stringify(this.state.formState));
    pages.push({ pageName: `new${this.state.added + 1}` });
    this.setState({ formState: pages, added: this.state.added + 1 });
  }

  async deletePage(page) {
    let pages = JSON.parse(JSON.stringify(this.state.formState));
    for (const idx in pages) {
      if (pages[idx].pageName === page) {
        if (pages[idx].pageContentId) {
          let pageContent = {
            id: pages[idx].pageContentId
          };
          await API.graphql({
            query: mutations.deletePageContent,
            variables: { input: pageContent },
            authMode: "AMAZON_COGNITO_USER_POOLS"
          });
        }
        pages.splice(idx, 1);
      }
    }
    this.setState({ formState: pages });
  }

  editSitePagesForm = () => {
    return (
      <div>
        <Form>
          {this.state.formState.map((item, idx) => {
            return this.editSitePagesSection(item, idx);
          })}
          <div>
            <NavLink className="add" to="#" onClick={() => this.addPage()}>
              New Page
            </NavLink>
            <div className="clear"></div>
          </div>
          <Form.Button onClick={this.handleSubmit}>Update Site</Form.Button>
        </Form>
      </div>
    );
  };

  currentAssetFile(item) {
    let retVal = "";
    const current = this.formatAssets(item.assets);
    if (current) {
      retVal = (
        <span className="current-asset-file">
          Current asset file: {current}
        </span>
      );
    }
    return retVal;
  }

  formatAssets(input) {
    let assets = input;
    if (typeof input === "object") {
      assets = input.download;
    }
    return assets;
  }

  async openEditor(htmlUrl, pageId, pageContentId, useDataUrl) {
    if (htmlUrl && useDataUrl) {
      await getFileContent(htmlUrl, "html", this);
    } else if (pageContentId) {
      await getPageContentById(pageContentId).then((resp) => {
        this.setState({
          copy: resp,
          pageContentId: pageContentId
        });
      });
    }
    this.setState({
      pageId: pageId,
      isEditorActive: true
    });
  }

  async handleEditorSave() {
    let page = {
      content: this.state.copy
    };
    let temp = this.state.formState;
    if (!this.state.pageContentId) {
      page.id = uuidv4();
      page.page_content_category = process.env.REACT_APP_REP_TYPE.toLowerCase();
      await API.graphql({
        query: mutations.createPageContent,
        variables: { input: page },
        authMode: "AMAZON_COGNITO_USER_POOLS"
      });
      temp.forEach((item) => {
        if (item.pageName === this.state.pageId) {
          item.pageContentId = page.id;
          item.useDataUrl = false;
        }
      });
    } else {
      page.id = this.state.pageContentId;
      await API.graphql({
        query: mutations.updatePageContent,
        variables: { input: page },
        authMode: "AMAZON_COGNITO_USER_POOLS"
      });
      temp.forEach((item) => {
        if (item.pageName === this.state.pageId) {
          item.useDataUrl = false;
        }
      });
    }
    this.setState({
      formState: temp,
      copy: "",
      pageId: null,
      isEditorActive: false,
      pageContentId: null
    });
    this.handleSubmit();
  }

  editSitePagesSection = (item, idx) => {
    return (
      <section key={idx}>
        <div className="deleteWrapper">
          <Button
            className="delete float-right"
            onClick={() => this.deletePage(item.pageName)}
          >
            Delete Page
          </Button>
        </div>
        <h2 className="admin">{`Configuration for page: ${item.text}`}</h2>
        <fieldset>
          <legend>Page Details</legend>
          <Form.Input
            key={`${idx}_pageName`}
            id={`${idx}_pageName`}
            label="Page ID"
            value={item.pageName}
            name={`${item.pageName}_pageName`}
            placeholder="Enter Page ID"
            onChange={this.updateInputValue}
          />
          <Form.Select
            key={`${idx}_component`}
            id={`${idx}_component`}
            label="Page Type"
            value={item.component || ""}
            name={`${item.pageName}_component`}
            placeholder="Select the type of page to create"
            onChange={this.updateInputValue}
            options={[
              { key: "a", text: "About Page", value: "AboutPage" },
              { key: "p", text: "Permissions Page", value: "PermissionsPage" },
              { key: "ad", text: "Additional Page", value: "AdditionalPages" }
            ]}
          />
          <Form.Input
            key={`${idx}_text`}
            id={`${idx}_text`}
            label="Page Title"
            value={item.text || ""}
            name={`${item.pageName}_text`}
            placeholder="Enter Page Name"
            onChange={this.updateInputValue}
          />
          <Form.Input
            key={`${idx}_localURL`}
            id={`${idx}_localURL`}
            label="Page URL"
            value={item.local_url || ""}
            name={`${item.pageName}_localURL`}
            placeholder="/example-page-url"
            onChange={this.updateInputValue}
          >
            <Label>{`${window.location.href.substring(
              0,
              window.location.href.lastIndexOf("/")
            )}`}</Label>
            <input />
          </Form.Input>
          {item.component === "PermissionsPage" ? (
            <div className="field">
              {this.currentAssetFile(item)}
              {input(
                {
                  label: "Upload Assets",
                  id: `${item.pageName}_assets`,
                  name: `${item.pageName}_assets`,
                  placeholder: "Enter Page Assets",
                  setSrc: this.updateInputValue,
                  setFileFolder: this.setFileFolder,
                  context: this,
                  fileType: "any"
                },
                "file"
              )}
            </div>
          ) : (
            <></>
          )}
        </fieldset>
        <fieldset>
          <legend>Page Content</legend>
          <div className="field">
            <p>
              Page content can be added by either uploading an HTML file, or
              using the editor below.
            </p>
            <div className="file-status">
              {item.data_url ? (
                <div>
                  <span>Current HTML file:</span>{" "}
                  {item.data_url.split("/").pop()}
                  <button
                    className="download-link"
                    title="Download HTML file"
                    aria-label="Download HTML file"
                    onClick={() => downloadFile(item.data_url)}
                  >
                    <FontAwesomeIcon icon="download" />
                  </button>
                </div>
              ) : (
                <strong>No HTML file uploaded</strong>
              )}
              {"useDataUrl" in item && item.data_url ? (
                <Form.Checkbox
                  key={`${item.pageName}_useDataUrl`}
                  id={`${item.pageName}_useDataUrl`}
                  label="Use HTML file"
                  name={`${item.pageName}_useDataUrl`}
                  onChange={(e, data) => this.updateInputValue(e, data)}
                  checked={item.useDataUrl}
                />
              ) : (
                <></>
              )}
            </div>
            {input(
              {
                label: "File Upload:",
                id: `${item.pageName}_dataURL`,
                name: `${item.pageName}_dataURL`,
                placeholder: "Enter Data URL",
                setSrc: this.updateInputValue,
                setFileFolder: this.setFileFolder,
                context: this,
                fileType: "text"
              },
              "file"
            )}
          </div>
          <br />
          <Button
            key={`${item.pageName}_openEditor`}
            id={`${item.pageName}_openEditor`}
            onClick={() =>
              this.openEditor(
                item.data_url,
                item.pageName,
                item.pageContentId,
                item.useDataUrl
              )
            }
          >
            Open text editor
          </Button>
        </fieldset>
        <div className="clear"></div>
      </section>
    );
  };

  viewSitePages() {
    return (
      <ul>
        {this.state.formState.map((page) => {
          return (
            <li key={page.pageName}>
              <div>
                <p>Page ID: {page.pageName} </p>
                <p>Page Type: {page.component}</p>
                <p>Assets: {JSON.stringify(page.assets) || ""}</p>
                <p>Page URL: {page.local_url}</p>
                <p>Page Title: {page.text}</p>
                <p>
                  Current HTML File: {page.data_url?.split("/").pop() || "None"}{" "}
                </p>
              </div>
              <hr />
            </li>
          );
        })}
      </ul>
    );
  }

  render() {
    return (
      <div className="col-lg-9 col-sm-12 admin-content">
        <h1>{`Site Pages for: ${process.env.REACT_APP_REP_TYPE.toLowerCase()}`}</h1>
        <Form>
          <Form.Group inline>
            <label>Current mode:</label>
            <Form.Radio
              label="Edit"
              name="editStatePagesRadioGroup"
              value="edit"
              checked={this.state.viewState === "edit"}
              onChange={this.handleChange}
            />

            <Form.Radio
              label="View"
              name="viewStatePagesRadioGroup"
              value="view"
              checked={this.state.viewState === "view"}
              onChange={this.handleChange}
            />
          </Form.Group>
        </Form>
        {this.state.viewState === "view"
          ? this.viewSitePages()
          : this.editSitePagesForm()}
        {this.state.isEditorActive ? (
          <div className="editor-modal-wrapper" role="dialog" aria-modal="true">
            <FocusLock>
              <div className="editor-wrapper">
                <Editor
                  value={this.state.copy}
                  placeholder={"Enter page content"}
                  onChange={this.handleChange}
                  modules={editorModules}
                  formats={editorFormats}
                ></Editor>
                <Button
                  className="mr-2"
                  onClick={() =>
                    this.setState({
                      copy: "",
                      pageId: null,
                      isEditorActive: false,
                      pageContentId: null
                    })
                  }
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    this.handleEditorSave();
                  }}
                >
                  Save
                </Button>
              </div>
            </FocusLock>
          </div>
        ) : (
          <></>
        )}
      </div>
    );
  }
}

export default withAuthenticator(SitePagesForm);
