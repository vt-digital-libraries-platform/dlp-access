import { FC, EventHandler, useEffect, useState } from "react";
import { SiteTitle } from "../../../components/SiteTitle";
import ItemListView from "../../../components/ItemListView";
import GalleryView from "../../../components/GalleryView";
import ResultsNumberDropdown from "../../../components/ResultsNumberDropdown";
import FilterDropdown from "../../../components/FilterDropdown";
import SortbyDropdown from "../../../components/SortbyDropdown";
import Pagination from "../../../components/Pagination";
import ViewBar from "../../../components/ViewBar";

import "../../../css/ListPages.scss";
import "../../../css/CollectionsListPage.scss";
import { loadCollections } from "./loadCollections";
import { useView } from "./useView";

type Props = {
  scrollUp: EventHandler<any>;
  site: Site;
};

export const BrowseCollections: FC<Props> = ({ scrollUp, site }) => {
  const browseCollections =
    site?.browseCollections && JSON.parse(site.browseCollections);

  const { view, handleSetView } = useView();
  const [collections, setCollections]: any = useState(null);
  const [pg, setPg] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [limt, setLimit] = useState(10);
  const [filtr, setFilter]: any = useState({});
  const [tokns, setTokns]: any = useState([]);
  const [sort, setSort]: any = useState({
    field: "title",
    direction: "asc"
  });
  const [loadError, setLoadError] = useState<string | null>(null);

  const setCollectionDetails = async () => {
    try {
      const { collections, total, totalPages, page, limit, nextTokens } =
        await loadCollections({ pg, filtr, sort, limt, tokns, scrollUp });
      setCollections(collections);
      setTotal(total);
      setTotalPages(totalPages);
      setPg(page);
      setLimit(limit);
      setTokns(nextTokens);
      setLoadError(null);
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.message ||
        err?.message ||
        "Failed to load collections. Please try again.";
      setLoadError(message);
    }
  };

  useEffect(() => {
    setCollectionDetails();
  }, [pg, filtr, sort, limt]);

  if (!site || !browseCollections) {
    return null;
  }

  const handlePreviousPageClick = () => {
    setPg(Math.max(pg - 1, 0));
  };

  const handleNextPageClick = () => {
    setPg(Math.min(pg + 1, totalPages));
  };

  const handleFilterDropdown = (_: string, val: any) => {
    setFilter(val);
  };

  const handleSortbyDropdown = (_: string, val: any) => {
    setSort(val);
  };

  const handleResultsNumberDropdown = (e: Event, result: { value: number }) => {
    setLimit(result.value);
    setPg(0);
  };

  return (
    <>
      <SiteTitle
        data={{ title: "Browse Collections" }}
        site={site}
        template="{{title}}"
      />
      <div className="collection-browse-wrapper">
        <div className="container">
          {loadError && (
            <div className="alert alert-warning" role="alert">
              {loadError}
            </div>
          )}
          <div className="row justify-content-center">
            <div
              className="navbar navbar-light justify-content-between"
              role="region"
              aria-label="Browsing Tools"
              aria-controls="browse-results"
            >
              <div
                className="collection-filters"
                role="group"
                aria-roledescription="Filter and sort options"
              >
                <FilterDropdown
                  siteFilter={browseCollections.filter}
                  updateFormState={handleFilterDropdown}
                />
                <SortbyDropdown
                  siteSort={browseCollections.sort}
                  updateFormState={handleSortbyDropdown}
                />
              </div>
              <div className="form-inline collection-view-options">
                <ViewBar
                  view={view}
                  updateFormState={handleSetView}
                  pageViews={["Gallery", "List"]}
                />
                <ResultsNumberDropdown
                  className="select-dropdown"
                  setLimit={handleResultsNumberDropdown}
                />
              </div>
            </div>
          </div>
          {collections !== null ? (
            <>
              <div
                className="row justify-content-center"
                id="browse-results"
                role="region"
                aria-label="Browse results"
              >
                {collections?.map((collection: Collection) => {
                  if (view === "Gallery") {
                    return (
                      <GalleryView
                        site={site}
                        key={collection.id}
                        item={collection}
                        category="collection"
                        label={false}
                      />
                    );
                  } else {
                    return (
                      <ItemListView
                        site={site}
                        key={collection.id}
                        item={collection}
                        category="collection"
                        label={false}
                      />
                    );
                  }
                })}
              </div>
              <div aria-live="polite">
                <Pagination
                  numResults={collections.length}
                  total={total}
                  page={pg}
                  limit={limt}
                  previousPage={handlePreviousPageClick}
                  nextPage={handleNextPageClick}
                  totalPages={totalPages}
                  isSearch={false}
                  atBottom={true}
                />
              </div>
            </>
          ) : (
            <div>Loading</div>
          )}
        </div>
      </div>
    </>
  );
};
