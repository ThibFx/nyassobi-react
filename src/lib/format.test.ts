import { describe, expect, it } from "vitest";

import { formatDate, plainText, youtubeId } from "./format";

describe("youtubeId", () => {
  it("reconnaît les formes de liens collées dans WordPress", () => {
    expect(youtubeId("https://youtu.be/RJVoCQoynbI")).toBe("RJVoCQoynbI");
    expect(youtubeId("https://www.youtube.com/watch?v=qpO0oJ8f8Fc&feature=youtu.be")).toBe("qpO0oJ8f8Fc");
    expect(youtubeId("https://www.youtube.com/embed/walhlqkzawk")).toBe("walhlqkzawk");
  });

  it("ignore ce qui n'est pas une vidéo YouTube", () => {
    expect(youtubeId("https://drive.google.com/file/d/abc/view")).toBeNull();
    expect(youtubeId("pas une adresse")).toBeNull();
    expect(youtubeId(null)).toBeNull();
  });
});

describe("plainText", () => {
  it("décode les entités et retire le « [...] » des extraits", () => {
    expect(plainText("<p>L&rsquo;asso &amp; ses ateliers [&hellip;]</p>")).toBe("L’asso & ses ateliers…");
  });
});

describe("formatDate", () => {
  it("écrit la date en toutes lettres", () => {
    expect(formatDate("2026-08-30T22:16:59")).toBe("30 août 2026");
    expect(formatDate(null)).toBe("");
  });
});
