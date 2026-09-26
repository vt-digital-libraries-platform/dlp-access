import React, { Component } from "react";
import { generateClient } from "aws-amplify/api";
import { getCurrentUserInfo } from "../lib/authTools";
import { uploadData } from "aws-amplify/storage";
import * as mutations from "../graphql/mutations";
import { v4 as uuidv4 } from "uuid";

const client = generateClient();

class FileUploadField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: {},
      hasError: false,
      isUploaded: false
    };
  }

  validFileType(expectedType, file) {
    let match = null;
    switch (expectedType) {
      case "image":
        match = file.type.match(/\/(jpeg|jpg|gif|png)$/g);
        break;
      case "text":
        match = file.type.match(/\/(text|plain|csv|html)$/g);
        break;
      case "application":
        match = file.type.match(/\/(msword|json|rss\+xml)$/g);
        break;
      case "audio":
        match = file.type.match(/\/(mpeg|wav)$/g);
        break;
      case "any":
        match = true;
        break;
      default:
        break;
    }
    return match !== null;
  }

  folderNameByFileType(file) {
    let foldername = "";
    switch (file.type) {
      case "text/html":
        foldername = "text";
        break;
      case "text/plain":
        foldername = "text";
        break;
      case "audio/mpeg":
        foldername = "audio";
        break;
      case "audio/wav":
        foldername = "audio";
        break;
      case "image/jpeg":
        foldername = "image";
        break;
      case "image/png":
        foldername = "image";
        break;
      case "image/gif":
        foldername = "image";
        break;
      default:
        foldername = "misc";
        break;
    }
    return foldername;
  }

  setFile = (e) => {
    if (!e.target.files[0]) return;
    const file = e.target.files[0];
    if (this.validFileType(this.props.fileType, file)) {
      this.setState({ file: file, hasError: false, isUploaded: false });
    } else {
      this.setState({ file: {}, hasError: true });
    }
  };

  uploadFile = async () => {
    if (!this.state.hasError) {
      const folder = this.folderNameByFileType(this.state.file);
      const pathPrefix = `public/sitecontent/${folder}/${process.env.REACT_APP_REP_TYPE.toLowerCase()}/`;
      const prefixFolder = this.props.filepath ? `${this.props.filepath}/` : "";
      const s3Key = `${pathPrefix}${prefixFolder}${this.state.file.name}`;

      await uploadData({
        path: s3Key,
        data: this.state.file,
        options: { contentType: this.state.file.type }
      }).result;
      const evt = {
        target: {
          name: this.props.name,
          value: `${prefixFolder}${this.state.file.name}`,
          type: "upload"
        }
      };

      this.setState({ isUploaded: true }, () => {
        if (
          this.props.context &&
          typeof this.props.setFileFolder === "function"
        ) {
          this.props.setFileFolder(
            this.props.context,
            this.folderNameByFileType(this.state.file),
            evt
          );
        }
        if (
          this.props.context &&
          typeof this.props.setFileCharacterization === "function"
        ) {
          this.props.setFileCharacterization(
            this.props.context,
            this.state.file,
            evt
          );
        }
        this.props.setSrc(evt, this.props.fileType, this.props.field);
      });

      const eventInfo = {
        upload_content: {
          name: this.state.file.name,
          type: this.state.file.type,
          size: this.state.file.size
        }
      };

      const userInfo = await getCurrentUserInfo();
      let newID = uuidv4();
      let historyInfo = {
        id: newID,
        groups: userInfo.groups,
        userEmail: userInfo.email,
        siteID: this.props.siteID,
        event: JSON.stringify(eventInfo)
      };
      try {
        await client.graphql({
          query: mutations.createHistory,
          variables: {
            id: newID,
            input: historyInfo
          },
          authMode: "userPool"
        });
      } catch (error) {
        console.error(error);
        console.log("error creating history record");
      }
    } else {
      this.setState({ isUploaded: false });
    }
  };

  afterMessage = () => {
    let color = "green";
    let message = null;
    if (this.state.hasError) {
      color = "red";
      message = `Please upload ${this.props.fileType} file only.`;
    } else if (this.state.isUploaded) {
      message = `${this.state.file.name} is uploaded successfully!`;
    }
    return (
      <p
        id={`file_upload_results_message`}
        style={{ color: color }}
        data-test="upload-message"
      >
        {message}
      </p>
    );
  };

  render() {
    return (
      <div
        className={`fileUploadField ${
          this.props.required ? "required " : ""
        } field`}
      >
        <label htmlFor={this.props.input_id}>{this.props.label}</label>
        {this.props.value && (
          <div>
            <span>Current file:</span>{" "}
            <span className="wrap-content">{this.props.value}</span>
          </div>
        )}
        <input
          type="file"
          id={this.props.input_id || ""}
          onChange={this.setFile}
        />
        <button
          id={`${this.props.input_id}_button`}
          className="ui button uploadButton"
          onClick={this.uploadFile}
        >
          Upload File
        </button>
        {this.state.hasError || this.state.isUploaded
          ? this.afterMessage()
          : ""}
      </div>
    );
  }
}

export default FileUploadField;
