import { useCallback, useEffect, useState } from "react";
import { getCollectionItems } from "../../../lib/fetchTools";

export const useGetCollectionItems = (id: string) => {
  const [items, setItems] = useState<Archive[] | null>(null);
  const [paginationState, setPaginationState] = useState({
    sortOpt: { field: "title", direction: "asc" },
    page: 0,
    limit: 10,
    totalPages: 1,
    total: 0,
    nextPageTokens: [null]
  });

  const { sortOpt, page, limit, totalPages, nextPageTokens, total } =
    paginationState;
  const currentToken = nextPageTokens[page];

  // Loads collection items based on collection id,
  // sort order, limit, and page
  useEffect(() => {
    const loadItems = async (collectionID: string) => {
      const response = await getCollectionItems(
        collectionID,
        sortOpt,
        limit,
        currentToken
      );
      console.log(response);
      setPaginationState((prevState) => {
        const newNextPageTokens = [...prevState.nextPageTokens];
        newNextPageTokens[page + 1] = response.nextToken;
        return {
          ...prevState,
          nextPageTokens: newNextPageTokens,
          totalPages: Math.ceil(response.total / limit),
          total: parseInt(response.total)
        };
      });
      setItems(response.items);
    };
    loadItems(id);
  }, [id, limit, sortOpt, page, currentToken]);

  const handleResultsNumberDropdown = useCallback(
    (_: object, result: { value: string }) => {
      setPaginationState((prevState) => ({
        ...prevState,
        limit: parseInt(result.value),
        nextPageTokens: [null],
        page: 0
      }));
    },
    []
  );

  const handleSortOrderDropdown = useCallback(
    (sortField: string, sortDirection: string) => {
      setPaginationState((prevState) => ({
        ...prevState,
        sortOpt: {
          field: sortField,
          direction: sortDirection
        },
        nextPageTokens: [null],
        page: 0
      }));
    },
    []
  );

  const handlePrevPage = useCallback(() => {
    setPaginationState((prevState) => ({
      ...prevState,
      page: Math.max(prevState.page - 1, 0)
    }));
  }, []);

  const handleNextPage = useCallback(() => {
    setPaginationState((prevState) => ({
      ...prevState,
      page: Math.min(prevState.page + 1, prevState.totalPages - 1)
    }));
  }, []);

  return {
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
  };
};
