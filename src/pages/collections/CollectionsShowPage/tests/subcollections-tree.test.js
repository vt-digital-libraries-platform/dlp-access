import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { SubCollectionsTree } from "../SubCollectionsTree";
import { MemoryRouter } from "react-router-dom";
import { mock_collection } from "../../../../fixtures/mock_collection";

const collectionMap = {
  id: "testid123",
  name: "Test Collection",
  custom_key: "xxxxj22hdemo",
  children: [
    {
      id: "testmap123folder",
      name: "Folder",
      custom_key: "xxxxj22hdemo_folder"
    }
  ]
};

describe("SubCollectionsTree component", () => {
  const setup = (map, expanded = ["testid123"]) =>
    render(
      <MemoryRouter>
        <SubCollectionsTree
          collection={mock_collection}
          collectionMap={map}
          expanded={expanded}
          handleToggle={jest.fn()}
        />
      </MemoryRouter>
    );

  it("displays SubCollectionsTree component", async () => {
    setup(collectionMap);
    expect(
      screen.getByRole("heading", { name: /Collection Organization/i })
    ).toBeVisible();
    await screen.findByRole("link", { name: /Folder/i });
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveTextContent("Test Collection");
    expect(links[0]).toHaveAttribute("href", "/collection/xxxxj22hdemo");
    expect(links[1]).toHaveTextContent("Folder");
    expect(links[1]).toHaveAttribute("href", "/collection/xxxxj22hdemo_folder");
  });

  it("renders nothing when the map has no children", () => {
    setup({ ...collectionMap, children: [] });
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("renders nothing when there is no map", () => {
    setup(null);
    expect(screen.queryByRole("heading")).toBeNull();
  });
});
