import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
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
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("Our Featured Items");
    expect(await screen.findAllByRole("listitem")).toHaveLength(4);
    const toggle = screen.getByRole("button", { name: /Show More/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(screen.getAllByRole("listitem")).toHaveLength(featuredItems.length);
    expect(screen.getByRole("button", { name: /Show Fewer/ })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  it("uses the Browse heading on the federated site", async () => {
    jest
      .spyOn(FunctionalFileGetter, "getFile")
      .mockResolvedValue(featuredItems[0].src);
    render(
      <FeaturedItems
        featuredItems={featuredItems}
        site={{ siteId: "federated" }}
      />
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Browse"
    );
    await screen.findAllByRole("listitem");
  });

  it("does not display section if featuredItems prop is null", () => {
    render(<FeaturedItems featuredItems={null} site={{ siteId: "default" }} />);
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("does not display section if featuredItems prop is an empty array", () => {
    render(<FeaturedItems featuredItems={[]} site={{ siteId: "default" }} />);
    expect(screen.queryByRole("heading")).toBeNull();
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
        site={{ siteId: "default" }}
        style={{ display: "block" }}
      />
    );
    const card = await screen.findByRole("listitem");
    expect(card).toBeVisible();
    expect(card).toHaveStyle("display: block");
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      featuredItems[0].link
    );
    const img = screen.getByRole("presentation");
    expect(img).toHaveAttribute("src", featuredItems[0].src);
    expect(img).toHaveAttribute("alt", "");
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      featuredItems[0].cardTitle
    );
  });
});
