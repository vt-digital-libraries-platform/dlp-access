import { Component } from "react";
import { Icon } from "semantic-ui-react";
import "../css/Select.scss";

class SortOrderDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortField: props.sortOpt?.field || "title",
      sortDirection: props.sortOpt?.direction || "asc"
    };
  }

  handleFieldChange = (e) => {
    this.setState((prevState) => ({
      ...prevState,
      sortField: e.target.value
    }));
    if (typeof this.props.setSortOrder === "function") {
      this.props.setSortOrder(e.target.value, this.state.sortDirection);
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

  render() {
    const sortFieldOptions = [
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
    return (
      <>
        {/* <Dropdown
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
        /> */}
        <div className="select-dropdown mr-2">
          <label htmlFor="sort-opt-dropdown">Sort By:</label>
          <select
            id="sort-opt-dropdown"
            defaultValue="title"
            onChange={this.handleFieldChange}
          >
            {sortFieldOptions.map((option) => (
              <option key={option.key} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="sort-btn"
          onClick={this.handleSortOrderChange}
        >
          {this.state.sortDirection === "asc" ? (
            <>
              <Icon name="sort amount up" className="sort-btn-icon" />
              <span className="sr-only">Sort order: ascending</span>
            </>
          ) : (
            <>
              <Icon name="sort amount down" className="sort-btn-icon" />
              <span className="sr-only">Sort order: descending</span>
            </>
          )}
        </button>
      </>
    );
  }
}

export default SortOrderDropdown;
