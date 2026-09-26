import React, { Component } from "react";
import { Form } from "semantic-ui-react";
import { uploadData } from "aws-amplify/storage";

class ContentUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: {},
      hasError: false,
      isUploaded: false
    };
  }

  setFile = (e) => {
    if (!e.target.files[0]) return;
    const file = e.target.files[0];
    if (file.type.match(/\/(jpeg|jpg|gif|png|html|csv)$/g)) {
      this.setState({ file: file, hasError: false, isUploaded: false });
    } else {
      this.setState({ file: {}, hasError: true });
    }
  };

  folderNameByFileType = (fileType) => {
    const fileTypeArray = fileType.split("/");
    const prefix = fileTypeArray[0];
    let type = "";
    if (fileTypeArray.length > 1) {
      type = fileTypeArray[1];
    }
    let folderName;
    switch (prefix) {
      case "text":
        if (type === "html") {
          folderName = "html";
        } else if (type === "csv") {
          folderName = "metadata";
        }
        break;
      case "image":
        folderName = "image";
        break;
      default:
        break;
    }

    return folderName;
  };

  getS3Key = (prefix) => {
    let fileName = this.state.file.name;
    if (
      this.props?.contentType === "metadata" &&
      this.state.file.type === "text/csv" &&
      !!this.props?.recordType
    ) {
      if (
        this.props.recordType === "collection" &&
        fileName.indexOf("_collection_metadata.csv") === -1
      ) {
        fileName = fileName.replace(".csv", "_collection_metadata.csv");
      } else if (
        this.props.recordType === "archive" &&
        fileName.indexOf("_archive_metadata.csv") === -1
      ) {
        fileName = fileName.replace(".csv", "_archive_metadata.csv");
      }
    }
    return `${prefix}/${fileName}`;
  };

  uploadFile = async () => {
    if (!this.state.hasError) {
      const folder = this.folderNameByFileType(this.state.file.type);
      const prefix = `public/sitecontent/${folder}/${process.env.REACT_APP_REP_TYPE.toLowerCase()}`;
      const s3Key = this.getS3Key(prefix);

      await uploadData({
        path: s3Key,
        data: this.state.file,
        options: { contentType: this.state.file.type }
      }).result;
      const eventInfo = {
        upload_content: {
          name: this.state.file.name,
          type: this.state.file.type,
          size: this.state.file.size
        }
      };
      this.setState({ isUploaded: true });
      if (typeof this.props.updateSite === "function") {
        this.props.updateSite(eventInfo);
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
      message = "Sorry, this is an unsupported file type. :(";
    } else if (this.state.isUploaded) {
      message = `${this.state.file.name} is uploaded successfully!`;
    }
    return (
      <p
        style={{ color: color }}
        id="upload-message"
        data-test="upload-message"
      >
        {message}
      </p>
    );
  };

  uploadForm = () => {
    return (
      <div>
        <Form onSubmit={this.uploadFile}>
          <Form.Field>
            <input type="file" onChange={this.setFile} />
          </Form.Field>
          <Form.Button>Upload File</Form.Button>
        </Form>
        {this.state.hasError || this.state.isUploaded
          ? this.afterMessage()
          : ""}
      </div>
    );
  };

  getPrompt = () => {
    return this.props?.prompt || "Upload Site Content";
  };

  render() {
    return (
      <div className="col-lg-9 col-sm-12 admin-content">
        <h2 className="content-upload-prompt">{`Site: ${
          process.env.REACT_APP_REP_TYPE
        } - ${this.getPrompt()}`}</h2>
        {this.uploadForm()}
      </div>
    );
  }
}

export default ContentUpload;
