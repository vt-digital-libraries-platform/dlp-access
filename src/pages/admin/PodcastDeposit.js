import React, { Component } from "react";
import { Authenticator, withAuthenticator } from "@aws-amplify/ui-react";
import { Form } from "semantic-ui-react";
import { updatedDiff } from "deep-object-diff";
import { API, Auth } from "aws-amplify";
import {
  getArchiveByIdentifier,
  getPodcastCollections,
  mintNOID
} from "../../lib/fetchTools";
import * as mutations from "../../graphql/mutations";
import { input } from "../../components/FormFields";
import { v4 as uuidv4 } from "uuid";

import "@aws-amplify/ui-react/styles.css";
import "../../css/adminForms.scss";

const initialFormState = {
  selectedCollectionID: null,
  title: "",
  description: "",
  thumbnail_url: "",
  asset_url: "",
  source_link: "",
  source_text: "",
  season_number: "",
  episode_number: "",
  publication_date: "",
  visibility: false,
  manifest_file_characterization: {},
  audioTranscript: ""
};

const requiredFields = [
  "title",
  "asset_url",
  "selectedCollectionID",
  "season_number",
  "episode_number",
  "publication_date",
  "source_link",
  "source_text"
];

class PodcastDeposit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formState: initialFormState,
      prevFormState: initialFormState,
      viewState: "edit",
      collections: null,
      valid_source_link: true,
      source_link_edited: false,
      valid_audio_upload: true,
      audio_upload_edited: false,
      archive: {}
    };
  }

  isRequiredField(attribute) {
    return requiredFields.includes(attribute);
  }

  async loadPodcast() {
    let item;
    try {
      item = await getArchiveByIdentifier(this.props.identifier);
    } catch (e) {
      console.error(
        `Error fetch archive for ${this.props.identifier} due to ${e}`
      );
    }
    let itemState = {};
    if (item) {
      const asset_urls = JSON.parse(item.asset_urls);
      const sourceDetails = this.getSourceLinkDetails(item);
      const seasonDetails = this.getSeasonDetails(item);
      itemState = {
        selectedCollectionID: item.collectionArchivesId,
        title: item.title || "",
        description: item.description || "",
        thumbnail_url: asset_urls.thumbnail_url || "",
        asset_url: JSON.parse(item.asset_urls).audio_url || "",
        source_link: sourceDetails.link || item.archiveOptions.sourceLink || "",
        source_text: sourceDetails.text || item.archiveOptions.sourceText || "",
        season_number: seasonDetails.season || "",
        episode_number: seasonDetails.episode || "",
        publication_date: item.create_date || "",
        visibility: item.visibility || false,
        manifest_file_characterization:
          item.manifest_file_characterization || {},
        audioTranscript: item.archiveOptions
          ? JSON.parse(item.archiveOptions).audioTranscript
          : ""
      };
    } else {
      itemState = initialFormState;
    }
    this.setState({ formState: itemState, archive: item });
  }

  async loadCollections() {
    const collections = await getPodcastCollections();
    if (collections) {
      const stateObj = { formState: this.state.formState || {} };
      stateObj["collections"] = collections;
      this.setState(stateObj);
    }
  }

  htmlToElement(html) {
    var template = document.createElement("template");
    html = html[0].trim();
    template.innerHTML = html;
    return template.content.firstChild;
  }

  getSourceLinkDetails(item) {
    let sourceDetails = {};
    try {
      if (
        !item.archiveOptions ||
        !item.archiveOptions.sourceLink ||
        !!item.archiveOptions.sourceText
      ) {
        const sourceElement = this.htmlToElement(item.source);
        sourceDetails["text"] = sourceElement.innerText;
        sourceDetails["link"] = sourceElement.getAttribute("href");
      }
    } catch (error) {
      console.error("Error parsing sourceLink details");
    }
    return sourceDetails;
  }

  getSeasonDetails(item) {
    let seasonDetails = {};
    if (item.identifier && item.identifier.length > 0) {
      try {
        seasonDetails["season"] = item.identifier.substring(
          item.identifier.length - 6,
          3
        );
        seasonDetails["episode"] = item.identifier.substring(
          item.identifier.length - 3,
          3
        );
      } catch (error) {
        console.error("Error parsing season info");
      }
    }
    return seasonDetails;
  }

  getCollectionById(id) {
    let selected = null;
    for (const i in this.state.collections) {
      if (this.state.collections[i].id === id) {
        selected = this.state.collections[i];
      }
    }
    return selected;
  }

  getFolderByName(name) {
    let folder = "";
    switch (name) {
      case "asset_url":
        folder = "audio";
        break;
      case "audioTranscript":
        folder = "text";
        break;
      case "thumbnail_url":
        folder = "image";
        break;
      default:
        break;
    }
    return folder;
  }

  getFileUrl(name, value) {
    const folder = this.getFolderByName(name);
    const pathPrefix = `public/sitecontent/${folder}/${process.env.REACT_APP_REP_TYPE.toLowerCase()}/`;
    return `${pathPrefix}${value}`;
  }

  setFileCharacterization(context, file) {
    let fileDetails = {};
    fileDetails.name = file.name;
    fileDetails.type = file.type;
    fileDetails.size = file.size;
    let audio = new Audio();
    audio.addEventListener(
      "loadedmetadata",
      function () {
        fileDetails.duration = new Date(audio.duration * 1000)
          .toISOString()
          .substr(11, 8);
        let event = { target: {} };
        event.target.name = "manifest_file_characterization";
        event.target.value = JSON.stringify(fileDetails);
        context.updateInputValue(event);
      },
      false
    );
    audio.src = window.URL.createObjectURL(file);
  }

  updateInputValue = (event) => {
    const { name, type } = event.target;
    let value = type === "checkbox" ? event.target.checked : event.target.value;

    let attributes = JSON.parse(JSON.stringify(this.state.formState));
    if (type === "upload") {
      value = this.getFileUrl(name, value);
      attributes[name] = value;
      this.setState({
        formState: attributes,
        audio_upload_edited: true,
        valid_audio_upload: true
      });
    } else {
      attributes[name] = value;
      this.setState({ formState: attributes });
    }
  };

  sourceLinkFormatted(link, text) {
    return [`<a href="${link}">${text}</a>.`];
  }

  publicationDateFormatted(publication_date) {
    return publication_date
      ? `${publication_date.replaceAll("-", "/")} 00:00:00`
      : null;
  }

  isValidForm() {
    let valid = true;
    for (const f in requiredFields) {
      const field = requiredFields[f];
      if (
        !this.state.formState[field] ||
        (this.state.formState[field] && !this.state.formState[field].length)
      ) {
        valid = false;
      }
    }
    return valid;
  }

  handleSubmit = async () => {
    let id, noid, customKeyPrefix, customKey;
    if (this.props.identifier) {
      id = this.state.archive.id;
      customKey = this.state.archive.custom_key;
    } else {
      id = uuidv4();
      noid = await mintNOID();
      customKeyPrefix = "ark:/53696";
      customKey = `${customKeyPrefix}/${noid}`;
    }

    const selectedCollection = this.getCollectionById(
      this.state.formState.selectedCollectionID
    );

    const modifiedPubDate = this.publicationDateFormatted(
      this.state.formState.publication_date
    );

    let options = {
      audioTranscript: this.state.formState.audioTranscript,
      sourceLink: this.state.formState.source_link,
      sourceText: this.state.formState.source_text,
      seasonNumber: this.state.formState.season_number,
      episodeNumber: this.state.formState.episode_number
    };

    let archive = {
      id: id,
      title: this.state.formState.title,
      identifier:
        selectedCollection.identifier +
        this.state.formState.season_number +
        this.state.formState.episode_number,
      description: this.state.formState.description,
      creator: [selectedCollection.title],
      source: this.sourceLinkFormatted(
        this.state.formState.source_link,
        this.state.formState.source_text
      ),
      language: ["en"],
      custom_key: customKey,
      collectionArchivesId: [selectedCollection.id],
      site_category: "podcasts",
      type: ["podcast"],
      visibility: !!this.state.formState.visibility,
      asset_urls: {
        thumbnail_url: this.state.formState.thumbnail_url,
        audio_url: this.state.formState.audio_url
      },
      manifest_file_characterization:
        this.state.formState.manifest_file_characterization,
      heirarchy_path: selectedCollection.heirarchy_path,
      create_date: modifiedPubDate,
      modified_date: modifiedPubDate,
      archiveOptions: JSON.stringify(options)
    };

    let mutation = mutations.createArchive;
    if (this.props.identifier) {
      mutation = mutations.updateArchive;
    }
    await API.graphql({
      query: mutation,
      variables: { input: archive },
      authMode: "AMAZON_COGNITO_USER_POOLS"
    });

    this.setState({
      archive: archive,
      viewState: "view"
    });

    const newData = updatedDiff(this.state.prevFormState, this.state.formState);
    const oldData = updatedDiff(this.state.formState, this.state.prevFormState);
    const eventInfo = Object.keys(newData).reduce((acc, key) => {
      return {
        ...acc,
        [key]: {
          old: oldData[key],
          new: newData[key]
        }
      };
    }, {});
    const userInfo = await Auth.currentUserPoolUser();
    let historyInfo = {
      groups: userInfo.signInUserSession.accessToken.payload["cognito:groups"],
      userEmail: userInfo.attributes.email,
      event: JSON.stringify(eventInfo)
    };

    await API.graphql({
      query: mutations.createHistory,
      variables: { input: historyInfo },
      authMode: "AMAZON_COGNITO_USER_POOLS"
    });
  };

  handleChange = (e, { value }) => {
    this.setState({ viewState: value });
  };

  validateURL = (event) => {
    const { value } = event.target;
    const re = new RegExp(
      "^(https?:\\/\\/)?" +
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
        "((\\d{1,3}\\.){3}\\d{1,3}))" +
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
        "(\\?[;&a-z\\d%_.~+=-]*)?" +
        "(\\#[-a-z\\d_]*)?$",
      "i"
    );

    this.setState({
      source_link_edited: true,
      valid_source_link: !!re.test(value)
    });
  };

  newPodcastForm = () => {
    return (
      <div>
        <h2>New / Edit Podcast Episode</h2>
        <Form>
          <section className="podcast-metadata">
            <h3>Episode Metadata</h3>
            {input(
              {
                required: this.isRequiredField("selectedCollectionID"),
                label: "Podcast Collection:",
                name: "selectedCollectionID",
                value: this.state.formState.selectedCollectionID || "",
                onChange: this.updateInputValue,
                entries: this.state.collections.map((collection) => {
                  return { id: collection.id, text: collection.title };
                })
              },
              "select"
            )}
            {input({
              required: this.isRequiredField("title"),
              label: "Episode title",
              name: "title",
              placeholder: "Enter episode title",
              value: this.state.formState.title,
              onChange: this.updateInputValue
            })}
            {input(
              {
                name: "description",
                label: "Episode description",
                placeholder: "Enter episode description",
                value: this.state.formState.description || "",
                onChange: this.updateInputValue
              },
              "textArea"
            )}
            {input({
              required: this.isRequiredField("season_number"),
              label: "Season Number. E.g, 001",
              name: "season_number",
              placeholder: "Enter Season number",
              value: this.state.formState.season_number,
              onChange: this.updateInputValue
            })}
            {input({
              required: this.isRequiredField("episode_number"),
              label: "Episode Number. E.g, 001",
              name: "episode_number",
              placeholder: "Enter episode number",
              value: this.state.formState.episode_number,
              onChange: this.updateInputValue
            })}
            {!this.state.valid_source_link && (
              <span className="validation_msg">
                Please enter a valid URL below
              </span>
            )}
            {input({
              required: this.isRequiredField("source_link"),
              label: "Website Link",
              name: "source_link",
              placeholder: "Enter Website link",
              value: this.state.formState.source_link,
              onChange: this.updateInputValue,
              onBlur: this.validateURL
            })}
            {input({
              required: this.isRequiredField("source_text"),
              label: "Website Text",
              name: "source_text",
              placeholder: "Enter Website text",
              value: this.state.formState.source_text,
              onChange: this.updateInputValue
            })}
            {input(
              {
                required: this.isRequiredField("publication_date"),
                outerClass: "field",
                innerClass: "ui input",
                label: "Publication date:",
                name: "publication_date",
                value: this.state.formState.publication_date
                  .split(" ")[0]
                  .replace(/\//g, "-"),
                onChange: this.updateInputValue
              },
              "date"
            )}

            {input(
              {
                outerClass: "field visibility-checkbox",
                label: "Visibility:",
                name: "visibility",
                id: "visibility-checkbox",
                onChange: this.updateInputValue,
                checked: this.state.formState.visibility
              },
              "checkBox"
            )}
          </section>
          <section className="file-uploads">
            <h3>Episode files</h3>
            {input(
              {
                required: this.isRequiredField("asset_url"),
                label: "Episode audio file",
                id: "asset_url_upload",
                name: "asset_url",
                placeholder: "Audio file",
                context: this,
                value: JSON.parse(this.state.formState).audio_url,
                setSrc: this.updateInputValue,
                setFileCharacterization: this.setFileCharacterization,
                fileType: "audio"
              },
              "file"
            )}
            {input(
              {
                label: "HTML audio transcript (optional)",
                id: "audio_transcript_upload",
                name: "audioTranscript",
                placeholder: "Audio transcript",
                setSrc: this.updateInputValue,
                fileType: "text"
              },
              "file"
            )}
            {input(
              {
                label: "Episode image (optional)",
                id: "thumbnail_url_upload",
                name: "thumbnail_url",
                placeholder: "Episode image",
                setSrc: this.updateInputValue,
                fileType: "image"
              },
              "file"
            )}
          </section>
        </Form>
        <button
          disabled={!this.isValidForm()}
          className="submit"
          onClick={this.handleSubmit}
        >
          Submit Podcast Episode
        </button>
      </div>
    );
  };

  view = () => {
    if (this.state.archive) {
      return (
        <div className="view-section">
          <div>
            <h3>Podcast entry successfully created</h3>
            {Object.keys(this.state.archive).map((key) => (
              <div key={key}>
                <span id={`${key}_key`}>{key}:</span>{" "}
                <span id={`${key}_value`}>
                  {this.state.archive[key] !== null
                    ? this.state.archive[key].toString()
                    : "null"}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      return <div>Error creating archive</div>;
    }
  };

  componentDidMount() {
    if (this.props.identifier) {
      this.loadPodcast();
    }
    this.loadCollections();
  }

  render() {
    let content = <></>;
    if (this.state.collections) {
      content = (
        <>
          <div className="col-lg-9 col-sm-12 admin-content">
            <Form>
              <Form.Group inline>
                <label>Current mode:</label>
                <Form.Radio
                  label="Edit"
                  name="viewRadioGroup"
                  value="edit"
                  checked={this.state.viewState === "edit"}
                  onChange={this.handleChange}
                />
                <Form.Radio
                  label="View"
                  name="viewRadioGroup"
                  value="view"
                  checked={this.state.viewState === "view"}
                  onChange={this.handleChange}
                />
              </Form.Group>
            </Form>
            {this.state.viewState === "edit"
              ? this.newPodcastForm()
              : this.view()}
          </div>
          <hr class="auth-divider" />
          <div className="signout-wrapper">
            <Authenticator>
              {({ signOut, user }) => (
                <div className="auth-dialog">
                  <p>{user.username} successfully logged in.</p>
                  <button onClick={signOut}>Sign out</button>
                </div>
              )}
            </Authenticator>
          </div>
        </>
      );
    }
    return content;
  }
}

export default withAuthenticator(PodcastDeposit);
