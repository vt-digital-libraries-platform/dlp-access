import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import * as FunctionalFileGetter from "src/lib/FunctionalFileGetter";
import * as FetchTools from "src/lib/fetchTools";
import { RSSFeeds } from "../RSSFeeds";
import userEvent from "@testing-library/user-event";

describe("RSSFeeds component", () => {
  const rssSrc = "/public/sitecontent/text/podcasts/rss/9mrrrrrh.rss";
  const podcast_links = ["https://amazon.com"];

  const setup = (links = podcast_links, rss = rssSrc) => {
    jest.spyOn(FunctionalFileGetter, "getFile").mockResolvedValue(rss);
    render(
      <RSSFeeds
        customKey="9mrrrrrh"
        site={{ siteId: "podcasts" }}
        podcast_links={links}
      />
    );
  };

  it("displays RSSFeeds", async () => {
    setup();
    const rssButton = await screen.findByRole("button", { name: /RSS Feed/i });
    expect(rssButton).toBeVisible();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "https://amazon.com");
    expect(screen.getByRole("img")).toHaveAccessibleName(
      /Listen on Amazon Music/i
    );
  });

  it("Calls downloadFile when RSS Feed button is clicked", async () => {
    const spy = jest
      .spyOn(FetchTools, "downloadFile")
      .mockImplementation((path, type) => console.log(path));
    setup();
    const rssButton = await screen.findByRole("button", { name: /RSS Feed/i });
    await userEvent.click(rssButton);
    expect(spy).toHaveBeenCalled();
  });

  it("displays RSSFeed without podcast links", async () => {
    setup(null);
    const rssButton = await screen.findByRole("button", { name: /RSS Feed/i });
    expect(rssButton).toBeVisible();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("displays does not display RSS link if no source", async () => {
    setup(undefined, null);
    const links = await screen.findAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "https://amazon.com");
    expect(screen.queryByRole("button", { name: /RSS Feed/i })).toBeNull();
  });
});
