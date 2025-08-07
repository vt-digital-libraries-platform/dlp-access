import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import * as FetchTools from "../../../lib/fetchTools";
import * as FunctionalFileGetter from "../../../lib/FunctionalFileGetter";
import { BrowseCollections } from "./BrowseCollections";
import { MemoryRouter } from "react-router-dom";
import { mock_collection } from "src/fixtures/mock_collection";
import { mock_site } from "src/fixtures/mock_site";

describe("BrowseCollections component", () => {
  const singleItem = [{ ...mock_collection }];
  const multipleItems = Array(10)
    .fill(singleItem[0])
    .map((item, index) => {
      const asset_urls = item.asset_urls;
      return {
        thumbnail_url: `${asset_urls.thumbnail_url}/${index}`,
        title: `${item.title} ${index}`,
        custom_key: `${item.custom_key}/${index}`,
        description: [`${item.description[0]} ${index}`],
        id: `${item.id}/${index}`
      };
    });
  const setup = (items, nextToken, total) => {
    const scrollUp = jest.fn();
    jest
      .spyOn(FunctionalFileGetter, "getFile")
      .mockResolvedValue(mock_collection.thumbnail_url);
    jest.spyOn(FetchTools, "fetchSearchResults").mockResolvedValue({
      items: items,
      nextToken: nextToken,
      total: total
    });
    render(
      <MemoryRouter>
        <BrowseCollections site={mock_site} scrollUp={scrollUp} />
      </MemoryRouter>
    );
  };
  it("displays Browse Collections page with collections", async () => {
    setup(multipleItems, "Test Collection 10", 11);
    const images = await screen.findAllByRole("img");
    expect(images.length).toBe(10);
    expect(
      screen.getByRole("heading", { name: /Test Collection 0/ })
    ).toBeVisible();
    expect(screen.getByText(/Test collection description 0/)).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /About Our Collections/ })
    ).toBeVisible();
    expect(screen.getByRole("listbox", { name: "Subject" })).toBeVisible();
    expect(screen.getByRole("listbox", { name: "Sort by" })).toBeVisible();
    expect(screen.getByRole("button", { name: /Gallery view/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /List view/ })).toBeVisible();
    expect(
      screen.getByRole("listbox", { name: "Results per page" })
    ).toBeVisible();
    expect(screen.getByText(/Displaying: 1 - 10 of 11/)).toBeVisible();
    expect(screen.getByRole("button", { name: /Next/ })).toBeVisible();
  });

  it("displays Browse Collections page when no collections found", async () => {
    setup([], null, null);
    expect(await screen.findByText(/No results/)).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /About Our Collections/ })
    ).toBeVisible();
    expect(screen.getByRole("listbox", { name: "Subject" })).toBeVisible();
    expect(screen.getByRole("listbox", { name: "Sort by" })).toBeVisible();
    expect(screen.getByRole("button", { name: /Gallery view/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /List view/ })).toBeVisible();
    expect(
      screen.getByRole("listbox", { name: "Results per page" })
    ).toBeVisible();
  });

  it("displays loading message when collections are null", async () => {
    setup(null, null, null);
    expect(await screen.findByText(/Loading/)).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /About Our Collections/ })
    ).toBeVisible();
    expect(screen.queryByRole("listbox", { name: "Subject" })).toBeVisible();
  });
});
