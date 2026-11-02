import React, { Component } from "react";
import ItemListView from "../../components/ItemListView";
import GalleryView from "../../components/GalleryView";
import { getCategory } from "../../lib/MetadataRenderer";
import MasonryView from "./MasonryView";
import "../../css/CardDisplay.css";

class ItemsList extends Component {
  getClassName() {
    if (this.props.view === "Masonry") {
      return "card-columns";
    } else if (this.props.view === "Gallery") {
      return "card-display card-display--gallery";
    } else {
      return "row justify-content-center";
    }
  }

  render() {
    return (
      <div
        className="search-results-section"
        id="search-results"
        role="region"
        aria-label="Search results"
      >
        <ul className={this.getClassName()}>
          {this.props.items.map((item) => {
            if (this.props.view === "Gallery") {
              return (
                <GalleryView
                  key={item.id}
                  item={item}
                  category={getCategory(item)}
                  site={this.props.site}
                />
              );
            } else if (this.props.view === "Masonry") {
              return (
                <MasonryView
                  key={item.id}
                  item={item}
                  category={getCategory(item)}
                  site={this.props.site}
                />
              );
            } else {
              return (
                <ItemListView
                  key={item.id}
                  item={item}
                  category={getCategory(item)}
                  site={this.props.site}
                />
              );
            }
          })}
        </ul>
      </div>
    );
  }
}

export default ItemsList;
