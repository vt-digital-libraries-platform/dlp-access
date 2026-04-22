import { FC } from "react";
import { Link } from "react-router-dom";
import Pagination from "../../../components/Pagination";
import ResultsNumberDropdown from "../../../components/ResultsNumberDropdown";
import SortOrderDropdown from "../../../components/SortOrderDropdown";
import { Thumbnail } from "../../../components/Thumbnail";
import "../../../css/Select.scss";
import { language_codes } from "../../../lib/language_codes";
import { RenderItems, arkLinkFormatted } from "../../../lib/MetadataRenderer";
import { useGetCollectionItems } from "./useGetCollectionItems";

const languages = language_codes["abbr"];

type Props = {
  collection: Collection;
  site: Site;
  viewOption: string;
};
export const CollectionItems: FC<Props> = ({
  collection,
  site,
  viewOption
}) => {
  const {
    items,
    total,
    sortOpt,
    totalPages,
    page,
    limit,
    handleResultsNumberDropdown,
    handleSortOrderDropdown,
    handlePrevPage,
    handleNextPage
  } = useGetCollectionItems(collection.id);

  if (site && items !== null && total > 0) {
    return (
      <div
        className={`collection-items-list-wrapper ${
          viewOption === "list" ? "col-12 col-lg-8" : "no-size"
        }`}
        role="region"
        aria-labelledby="collection-items-section-header"
      >
        <div className="row justify-content-between mb-3">
          <h2
            className="collection-items-header col-auto"
            id="collection-items-section-header"
          >
            {`Items in Collection (${total})`}
          </h2>
          <div className="col-auto mr-1">
            <div className="display-option-container">
              <ResultsNumberDropdown
                setLimit={handleResultsNumberDropdown}
                className="select-dropdown mr-2"
              />
              <SortOrderDropdown
                sortOpt={sortOpt}
                setSortOrder={handleSortOrderDropdown}
              />
            </div>
          </div>
        </div>
        <div aria-live="polite" className="mb-3">
          <Pagination
            numResults={items.length}
            total={total}
            page={page}
            limit={limit}
            previousPage={handlePrevPage}
            nextPage={handleNextPage}
            totalPages={totalPages}
            isSearch={false}
            atBottom={true}
          />
        </div>
        <div
          className={
            viewOption === "list"
              ? "collection-items-list"
              : "collection-items-grid"
          }
          role="group"
          aria-roledescription="Collection items"
        >
          {items.map((item) => {
            if (viewOption === "list") {
              return (
                <div key={item.identifier} className="collection-entry">
                  <Link to={`/archive/${arkLinkFormatted(item.custom_key)}`}>
                    <div className="collection-img">
                      <Thumbnail item={item} site={site} />
                    </div>
                    <div className="collection-details">
                      <h3>{item.title}</h3>
                      <RenderItems
                        keyArray={[
                          { field: "description", label: "Description" }
                        ]}
                        item={item}
                        site={site}
                        languages={languages}
                      />
                    </div>
                  </Link>
                </div>
              );
            } else {
              return (
                <div className="collection-item" key={item.identifier}>
                  <div className="collection-item-wrapper">
                    <Link to={`/archive/${arkLinkFormatted(item.custom_key)}`}>
                      <div className="item-image">
                        <Thumbnail item={item} site={site} />
                      </div>
                      <div className="item-info">
                        <h3>{item.title}</h3>
                      </div>
                    </Link>
                  </div>
                </div>
              );
            }
          })}
        </div>
        <div aria-live="polite">
          <Pagination
            numResults={items.length}
            total={total}
            page={page}
            limit={limit}
            previousPage={handlePrevPage}
            nextPage={handleNextPage}
            totalPages={totalPages}
            isSearch={false}
            atBottom={true}
          />
        </div>
      </div>
    );
  } else if (items !== null) {
    return (
      <div
        className={`collection-items-list-wrapper ${
          viewOption === "list" ? "col-12 col-lg-8" : "no-size"
        }`}
      >
        <h2
          className="collection-items-header col-auto"
          id="collection-items-section-header"
        >
          {`Items in Collection (${items.length})`}
        </h2>
      </div>
    );
  } else {
    return (
      <div
        className={`collection-items-list-wrapper ${
          viewOption === "list" ? "col-12 col-lg-8" : "no-size"
        }`}
      >
        <p>Loading...</p>
      </div>
    );
  }
};
