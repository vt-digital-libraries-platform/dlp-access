import { Component } from "react";
import "../css/Select.scss";

class SortbyDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedValue: `${this.props.siteSort[0].field} ${this.props.siteSort[0].direction}`
    };
  }

  formatField = (field) => {
    let name = field === "start_date" ? "Date" : field;
    let capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    return capitalizedName;
  };

  formatDirection = (field, direction) => {
    if (field === "title" && direction === "asc") return "(A-Z)";
    else if (field === "title" && direction === "desc") return "(Z-A)";
    else if (field === "start_date" && direction === "desc")
      return "(Newest first)";
    else if (field === "start_date" && direction === "asc")
      return "(Oldest first)";
    else return `(${direction})`;
  };

  valueOptions = () => {
    return this.props.siteSort.map((val) => ({
      key: `${val.field} ${val.direction}`,
      text: `${this.formatField(val.field)} ${this.formatDirection(
        val.field,
        val.direction
      )}`,
      value: `${val.field} ${val.direction}`
    }));
  };

  updateSort = (e) => {
    this.setState({ selectedValue: e.target.value });

    let opt_arr = e.target.value.split(" ");
    let sort = {
      field: opt_arr[0],
      direction: opt_arr[1]
    };
    this.props.updateFormState("sort", sort);
  };

  render() {
    return (
      <div className="select-dropdown">
        <label htmlFor="sort-opt-dropdown">Sort By:</label>
        <select
          id="sort-opt-dropdown"
          defaultValue="title asc"
          onChange={this.updateSort}
        >
          {this.valueOptions().map((option) => (
            <option key={option.key} value={option.value}>
              {option.text}
            </option>
          ))}
        </select>
      </div>
    );
  }
}

export default SortbyDropdown;
