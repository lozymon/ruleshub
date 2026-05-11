import { BadRequestException } from "@nestjs/common";
import { parseGitHubUrl, validateTagName } from "./imports.service";

describe("parseGitHubUrl", () => {
  it.each([
    ["https://github.com/owner/repo", { owner: "owner", repo: "repo" }],
    ["https://github.com/owner/repo/", { owner: "owner", repo: "repo" }],
    ["https://github.com/owner/repo.git", { owner: "owner", repo: "repo" }],
    [
      "https://github.com/My-Org/my.repo-name",
      { owner: "My-Org", repo: "my.repo-name" },
    ],
  ])("parses %s", (url, expected) => {
    expect(parseGitHubUrl(url)).toEqual(expected);
  });

  it.each([
    "http://github.com/owner/repo", // wrong scheme
    "https://github.com/owner/repo#evil", // anchor junk
    "https://github.com/owner/repo/extra", // extra path segment
    "https://evil.com/foo/github.com/owner/repo", // unanchored slip
    "https://github.com.attacker.com/owner/repo", // host smuggle
    "ftp://github.com/owner/repo",
    "https://github.com/owner/", // missing repo
  ])("rejects %s", (url) => {
    expect(() => parseGitHubUrl(url)).toThrow(BadRequestException);
  });
});

describe("validateTagName", () => {
  it.each([
    "v1.0.0",
    "1.2.3",
    "v1.0.0-rc.1",
    "release_2024",
    "v1/beta",
    "abc",
    "1.0.0_pre",
  ])("accepts %s", (tag) => {
    expect(() => validateTagName(tag)).not.toThrow();
  });

  it.each([
    "../etc/passwd",
    "../../main",
    "v1..0",
    ".hidden",
    "-leading-dash",
    "trailing-slash/",
    "trailing-dot.",
    "spaces are bad",
    "semicolon;evil",
    "%2e%2e/escape",
    "back\\slash",
    "tab\tinside",
    "",
    "a".repeat(201),
  ])("rejects %s", (tag) => {
    expect(() => validateTagName(tag)).toThrow(BadRequestException);
  });
});
