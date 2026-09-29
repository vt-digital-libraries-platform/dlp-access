import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import * as FunctionalFileGetter from "../../../lib/FunctionalFileGetter";
import { CollectionHighlights } from "./CollectionHighlights";
import { Highlight } from "./Highlight";

const collectionHighlights = [
  {
    link: "/search?q=&field=description&view=Gallery&category=archive&type=Travel+sketches",
    itemCount: "51",
    title: "Travel sketches by IAWA architects",
    src: "highlights/highlight1.jpg"
  },
  {
    link: "/search/?category=archive&field=tags&q=Educational%20and%20research&view=Gallery",
    itemCount: "294",
    title: "Educational and Research Facilities",
    src: "highlights/highlight2.jpg"
  }
];

describe("CollectionHighlights component", () => {
  it("displays Collection Highlights section", async () => {
    jest
      .spyOn(FunctionalFileGetter, "getFile")
      .mockResolvedValue(collectionHighlights[0].src);
    render(
      <CollectionHighlights
        collectionHighlights={collectionHighlights}
        site={{
          siteId: "default"
        }}
      />
    );
    expect(screen.getByRole("list")).toBeVisible();
    expect(await screen.findAllByRole("listitem")).toHaveLength(
      collectionHighlights.length
    );
    expect(screen.getByText(collectionHighlights[1].title)).toBeVisible();
  });

  it("does not display section if collectionHighlights prop is null", () => {
    render(
      <CollectionHighlights
        collectionHighlights={null}
        site={{
          siteId: "default"
        }}
      />
    );
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("does not display section if collectionHighlights prop is an empty array", () => {
    render(
      <CollectionHighlights
        collectionHighlights={[]}
        site={{
          siteId: "default"
        }}
      />
    );
    expect(screen.queryByRole("list")).toBeNull();
  });
});

describe("Highlight card component", () => {
  it("displays card and card attributes", async () => {
    jest
      .spyOn(FunctionalFileGetter, "getFile")
      .mockResolvedValue(collectionHighlights[0].src);
    render(
      <Highlight
        highlight={collectionHighlights[0]}
        index="0"
        siteId="default"
        key="0"
      />
    );
    const card = await screen.findByTestId("collectionHighlight_0");
    expect(screen.getByText(collectionHighlights[0].title)).toBeVisible();
    expect(screen.getByText(collectionHighlights[0].itemCount)).toBeVisible();
    const styles = getComputedStyle(card);
    expect(styles.backgroundImage).toBe(`url(${collectionHighlights[0].src})`);
    expect(card.closest("a")).toHaveAttribute(
      "href",
      collectionHighlights[0].link
    );
  });
});
