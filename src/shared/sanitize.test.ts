import { describe, expect, it } from "vitest";
import { escapeHtml } from "./escape-html";
import { safeHref, safeNextPath } from "./safe-url";

describe("safeHref", () => {
  it("keeps ordinary web and mail links", () => {
    expect(safeHref("https://example.com/post")).toBe("https://example.com/post");
    expect(safeHref("http://example.com")).toBe("http://example.com/");
    expect(safeHref("mailto:hello@example.com")).toBe("mailto:hello@example.com");
  });

  it("keeps same-document and same-origin paths", () => {
    expect(safeHref("/blog/a-post")).toBe("/blog/a-post");
    expect(safeHref("#section")).toBe("#section");
  });

  it("blocks script-bearing schemes", () => {
    for (const hostile of [
      "javascript:alert(1)",
      "JavaScript:alert(1)",
      "  javascript:alert(1)  ",
      "java\tscript:alert(1)",
      "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
      "vbscript:msgbox(1)",
      "file:///etc/passwd",
    ]) {
      expect(safeHref(hostile), hostile).toBe("#");
    }
  });

  it("treats protocol-relative and backslash paths as external, not same-origin", () => {
    expect(safeHref("//evil.test/x")).toBe("#");
    expect(safeHref("/\\evil.test")).toBe("#");
  });

  it("falls back to # for anything that is not a usable string", () => {
    expect(safeHref(undefined)).toBe("#");
    expect(safeHref(null)).toBe("#");
    expect(safeHref({ href: "https://example.com" })).toBe("#");
    expect(safeHref("")).toBe("#");
  });
});

describe("escapeHtml", () => {
  it("neutralises markup in a value bound for an email body", () => {
    expect(escapeHtml('<a href="x">click</a>')).toBe(
      "&lt;a href=&quot;x&quot;&gt;click&lt;/a&gt;",
    );
  });

  it("escapes the ampersand first so entities are not double-formed", () => {
    expect(escapeHtml("Tom & <b>Jerry</b>")).toBe("Tom &amp; &lt;b&gt;Jerry&lt;/b&gt;");
  });

  it("leaves ordinary names untouched", () => {
    expect(escapeHtml("André Tonelli")).toBe("André Tonelli");
  });
});

describe("safeNextPath", () => {
  it("keeps a same-origin path", () => {
    expect(safeNextPath("/blog/a-post", "/blog")).toBe("/blog/a-post");
    expect(safeNextPath("/profile?tab=1", "/blog")).toBe("/profile?tab=1");
  });

  it("rejects the protocol-relative bypass that a prefix check lets through", () => {
    // new URL("//evil.test", origin) resolves to https://evil.test/
    expect(safeNextPath("//evil.test", "/blog")).toBe("/blog");
    expect(safeNextPath("//evil.test/path", "/blog")).toBe("/blog");
  });

  it("rejects the backslash variant a browser normalizes to //", () => {
    expect(safeNextPath("/\\evil.test", "/blog")).toBe("/blog");
  });

  it("rejects an absolute URL and a scheme", () => {
    for (const hostile of ["https://evil.test", "javascript:alert(1)", "data:text/html,x"]) {
      expect(safeNextPath(hostile, "/blog"), hostile).toBe("/blog");
    }
  });

  it("rejects a control character that a browser would strip", () => {
    expect(safeNextPath("/\u0000//evil.test", "/blog")).toBe("/blog");
    expect(safeNextPath("/bl\u000dog", "/blog")).toBe("/blog");
  });

  it("falls back for anything that is not a string", () => {
    expect(safeNextPath(undefined, "/blog")).toBe("/blog");
    expect(safeNextPath(["/blog"], "/blog")).toBe("/blog");
  });
});
