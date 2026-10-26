const { SCHEMA_SLATE_CONTENT, sanitizeSlateContent, sanitizeUserHtml } = require("../utils/userContent");

const paragraph = (...children) => ({ type: "paragraph", children });
const link = (url, text = "lien") => ({ type: "link", url, children: [{ text }] });

describe("sanitizeSlateContent", () => {
  it("keeps http, https and mailto links", () => {
    const content = [paragraph(link("https://snu.gouv.fr"), link("http://snu.gouv.fr"), link("mailto:contact@snu.gouv.fr"))];
    expect(sanitizeSlateContent(content)).toEqual(content);
  });

  it.each(["javascript:alert(1)", "JaVaScRiPt:alert(1)", "javascript://%0aalert(1)", "data:text/html,<script>alert(1)</script>", "/relatif", undefined])(
    "replaces a link to %s by its text",
    (url) => {
      expect(sanitizeSlateContent([paragraph({ text: "avant " }, link(url, "cliquez"))])).toEqual([paragraph({ text: "avant " }, { text: "cliquez" })]);
    }
  );

  it("drops an image whose URL is not http(s) and keeps the block renderable", () => {
    const content = [paragraph({ type: "image", url: "javascript:alert(1)", alt: "x", children: [{ text: "" }] })];
    expect(sanitizeSlateContent(content)).toEqual([paragraph({ text: "" })]);
  });

  it("keeps a Vimeo video and drops any other iframe source", () => {
    const vimeo = { type: "video", url: "https://player.vimeo.com/video/1", children: [{ text: "" }] };
    expect(sanitizeSlateContent([vimeo])).toEqual([vimeo]);
    for (const url of ["javascript:alert(1)", "https://evil.example/video", "http://player.vimeo.com/video/1", "https://player.vimeo.com.evil.example/v"]) {
      expect(sanitizeSlateContent([{ ...vimeo, url }])).toEqual([]);
    }
  });

  it("strips url, href and src from nodes that are not links, images or videos", () => {
    expect(sanitizeSlateContent([{ type: "paragraph", url: "javascript:alert(1)", href: "x", src: "y", children: [{ text: "a" }] }])).toEqual([paragraph({ text: "a" })]);
  });

  it("sanitizes nested nodes", () => {
    const content = [{ type: "bulleted-list", children: [{ type: "list-item", children: [link("javascript:alert(1)", "x")] }] }];
    expect(sanitizeSlateContent(content)).toEqual([{ type: "bulleted-list", children: [{ type: "list-item", children: [{ text: "x" }] }] }]);
  });

  it("rejects content that is not a Slate tree", () => {
    expect(() => sanitizeSlateContent({})).toThrow();
    expect(() => sanitizeSlateContent([null])).toThrow();
    expect(() => sanitizeSlateContent([{ text: 1 }])).toThrow();
    let deep = [{ text: "" }];
    for (let i = 0; i < 40; i++) deep = [{ type: "paragraph", children: deep }];
    expect(() => sanitizeSlateContent(deep)).toThrow();
  });

  it("is applied by the Joi schema used on shortcuts", () => {
    const { value, error } = SCHEMA_SLATE_CONTENT.validate([paragraph(link("javascript:alert(1)", "x"))]);
    expect(error).toBeUndefined();
    expect(value).toEqual([paragraph({ text: "x" })]);
    expect(SCHEMA_SLATE_CONTENT.validate([{ text: 1 }]).error).toBeDefined();
  });
});

describe("sanitizeUserHtml", () => {
  it("removes scripts, event handlers, styles and unsafe schemes", () => {
    expect(sanitizeUserHtml('<p onclick="alert(1)" style="color:red">a</p><script>alert(1)</script>')).toBe("<p>a</p>");
    expect(sanitizeUserHtml('<a href="javascript:alert(1)">x</a><img src="data:image/png;base64,AA" />')).toBe("<a>x</a><img />");
    expect(sanitizeUserHtml('<a href="//evil.example">x</a>')).toBe("<a>x</a>");
  });

  it("keeps the markup produced by the editor", () => {
    const html = '<p><strong>Bonjour</strong> <a href="https://snu.gouv.fr">lien</a></p><ul><li>un</li></ul>';
    expect(sanitizeUserHtml(html)).toBe(html);
  });

  it("is idempotent, so re-saving a note does not double-encode it", () => {
    const once = sanitizeUserHtml("A & B < C");
    expect(sanitizeUserHtml(once)).toBe(once);
  });

  it("leaves non-string values untouched", () => {
    expect(sanitizeUserHtml(undefined)).toBeUndefined();
  });
});
