import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import * as FunctionalFileGetter from "../../../lib/FunctionalFileGetter";
import { FeaturedItems } from "./FeaturedItems";
import { FeaturedItem } from "./FeaturedItem";

const featuredItems = [
  {
    altText: "alt 1",
    cardTitle: "Title 1",
    link: "https://vtdlp-demo.cloud.lib.vt.edu/archive/test1",
    src: "featuredItems/featured_item1.jpg"
  },
  {
    altText: "alt 2",
    cardTitle: "Title 2",
    link: "https://vtdlp-demo.cloud.lib.vt.edu/archive/test2",
    src: "featuredItems/featured_item2.jpg"
  },
  {
    altText: "alt 3",
    cardTitle: "Title 3",
    link: "https://vtdlp-demo.cloud.lib.vt.edu/archive/test3",
    src: "featuredItems/featured_item3.jpg"
  },
  {
    altText: "alt 4",
    cardTitle: "Title 4",
    link: "https://vtdlp-demo.cloud.lib.vt.edu/archive/test4",
    src: "featuredItems/featured_item4.jpg"
  },
  {
    altText: "alt 5",
    cardTitle: "Title 5",
    link: "https://vtdlp-demo.cloud.lib.vt.edu/archive/test5",
    src: "featuredItems/featured_item5.jpg"
  }
];

describe("FeaturedItems component", () => {
  it("displays Featured Items section", async () => {
    jest
      .spyOn(FunctionalFileGetter, "getFile")
      .mockResolvedValue(featuredItems[0].src);
    render(
      <FeaturedItems
        featuredItems={featuredItems}
        site={{ siteId: "default" }}
      />
    );
    const section = screen.getByRole("region");
    expect(section).toBeVisible();
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("Our Featured Items");
    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(await screen.findAllByRole("img")).toHaveLength(4);
  });

  it("does not display section if featuredItems prop is null", () => {
    render(<FeaturedItems featuredItems={null} site={{ siteId: "default" }} />);
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("does not display section if featuredItems prop is an empty array", () => {
    render(<FeaturedItems featuredItems={[]} site={{ siteId: "default" }} />);
    expect(screen.queryByRole("region")).toBeNull();
  });
});

describe("FeaturedItem component", () => {
  it("displays featured item card", async () => {
    jest
      .spyOn(FunctionalFileGetter, "getFile")
      .mockResolvedValue(featuredItems[0].src);
    render(
      <FeaturedItem
        item={featuredItems[0]}
        position={1}
        length={featuredItems.length}
        site={{ siteId: "default" }}
        style={{ display: "block" }}
      />
    );
    const card = await screen.findByRole("group");
    expect(card).toBeVisible();
    expect(card).toHaveAccessibleName("1 of 5");
    expect(card).toHaveStyle("display: block");
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      featuredItems[0].link
    );
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      featuredItems[0].src
    );
    expect(screen.getByRole("img")).toHaveAttribute(
      "alt",
      featuredItems[0].altText
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      featuredItems[0].cardTitle
    );
  });
});
