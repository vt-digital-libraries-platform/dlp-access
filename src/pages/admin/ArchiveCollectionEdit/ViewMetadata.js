import React from "react";

const viewMetadata = React.memo((props) => {
  let displayValues = props.values;
  let displayMarkup = null;

  if (typeof displayValues === "boolean") {
    displayValues = displayValues.toString();
  }
  if (displayValues && typeof displayValues === "object") {
    displayValues = JSON.stringify(displayValues);
  }

  if (props.values && props.isMulti) {
    displayMarkup = (
      <ul>
        {props.values.map((value, index) => (
          <li key={`${props.attribute.field}_${index}`}>{value}</li>
        ))}
      </ul>
    );
  } else {
    displayMarkup = displayValues;
  }
  return (
    <div className="view-section">
      {props.values && <span className="key">{props.attribute.label}: </span>}
      <span className="wrap-content">{displayMarkup}</span>
    </div>
  );
});

export default viewMetadata;
