import { Component } from "react";
import { Button, Dropdown, Icon } from "semantic-ui-react";

class SortOrderDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortField: props.sortOpt?.field || "title",
      sortDirection: props.sortOpt?.direction || "asc"
    };
    this.sortFieldOptions = [
      {
        key: "title",
        text: "Title",
        value: "title"
      },
      {
        key: "creator",
        text: "Creator",
        value: "creator"
      },
      {
        key: "contributor",
        text: "Contributor",
        value: "contributor"
      },
      {
        key: "description",
        text: "Description",
        value: "description"
      },
      {
        key: "format",
        text: "Format",
        value: "format"
      },
      {
        key: "language",
        text: "Language",
        value: "language"
      },
      {
        key: "source",
        text: "Source",
        value: "source"
      },
      {
        key: "subject",
        text: "Subject",
        value: "subject"
      },
      {
        key: "spatial",
        text: "Spatial",
        value: "spatial"
      },
      {
        key: "start_date",
        text: "Start Date",
        value: "start_date"
      },
      {
        key: "type",
        text: "Type",
        value: "type"
      },
      {
        key: "tags",
        text: "Tags",
        value: "tags"
      }
    ];
  }

  handleFieldChange = (_, result) => {
    this.setState((prevState) => ({
      ...prevState,
      sortField: result.value
    }));
    if (typeof this.props.setSortOrder === "function") {
      this.props.setSortOrder(result.value, this.state.sortDirection);
    }
  };

  handleSortOrderChange = () => {
    const newSortOrder = this.state.sortDirection === "asc" ? "desc" : "asc";
    this.setState((prevState) => ({
      ...prevState,
      sortDirection: newSortOrder
    }));
    if (typeof this.props.setSortOrder === "function") {
      this.props.setSortOrder(this.state.sortField, newSortOrder);
    }
  };

  formatActiveDisplayText = () => {
    try {
      const currentSortOpt = this.sortFieldOptions.find(
        (option) => option.value === this.state.sortField
      );
      return `Sort by ${currentSortOpt.text}`;
    } catch (err) {
      console.error(err);
    }
  };

  render() {
    return (
      <>
        <Dropdown
          selection
          compact
          scrolling
          text={this.formatActiveDisplayText()}
          value={this.state.sortField}
          options={this.sortFieldOptions}
          onChange={this.handleFieldChange}
          aria-label="Sort field option dropdown"
          aria-haspopup="listbox"
          className="mr-2"
          title="Sort fields"
        />
        <Button
          basic
          icon
          className="sort-btn"
          title="Sort order"
          aria-label="Sort order button"
          onClick={this.handleSortOrderChange}
        >
          {this.state.sortDirection === "asc" ? (
            <Icon name="sort content ascending" className="sort-btn-icon" />
          ) : (
            <Icon name="sort content descending" className="sort-btn-icon" />
          )}
        </Button>
      </>
    );
  }
}

export default SortOrderDropdown;
