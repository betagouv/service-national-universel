import { HTML_CLEANER_OPTIONS, HTML_LINK_SCHEMES, htmlCleaner, sanitizeStoredHtml } from "./common";

describe("htmlCleaner", () => {
  it("retire scripts et gestionnaires d'événements", () => {
    const out = htmlCleaner(`<p onclick="x()">Bonjour</p><script>alert(1)</script><img src=x onerror=alert(1)>`);
    expect(out).toBe("<p>Bonjour</p>");
  });

  it("ne garde que les schémas web dans les liens", () => {
    expect(htmlCleaner(`<a href="javascript:alert(1)">a</a>`)).not.toContain("javascript");
    expect(htmlCleaner(`<a href="//evil.example">a</a>`)).not.toContain("evil.example");
  });

  it("impose rel=noopener noreferrer, même si le lien en fournit un autre", () => {
    const out = htmlCleaner(`<a href="https://example.org" target="_blank" rel="opener">a</a>`);
    expect(out).toBe(`<a href="https://example.org" target="_blank" rel="noopener noreferrer">a</a>`);
  });
});

describe("sanitizeStoredHtml", () => {
  it("laisse intact un texte sans balisage", () => {
    expect(sanitizeStoredHtml("Sport & culture")).toBe("Sport & culture");
    expect(sanitizeStoredHtml("Âge > 16 ans")).toBe("Âge > 16 ans");
    expect(sanitizeStoredHtml("Âge < 16 ans & 3<4")).toBe("Âge < 16 ans & 3<4");
    expect(sanitizeStoredHtml("")).toBe("");
    expect(sanitizeStoredHtml(null)).toBeNull();
    expect(sanitizeStoredHtml(undefined)).toBeUndefined();
  });

  it("assainit un texte balisé", () => {
    expect(sanitizeStoredHtml(`<b>Asso</b><img src=x onerror=alert(1)>`)).toBe("<b>Asso</b>");
    expect(sanitizeStoredHtml(`Texte <IMG SRC=x onerror=alert(1)>`)).toBe("Texte ");
    expect(sanitizeStoredHtml(`a</p><!--x--><?x>`)).not.toMatch(/<!--|<\?/);
  });
});

describe("HTML_CLEANER_OPTIONS", () => {
  it("dérive ses schémas du filtre d'URL partagé, plus tel", () => {
    expect(HTML_LINK_SCHEMES).toEqual(["http", "https", "mailto", "tel"]);
    expect(HTML_CLEANER_OPTIONS.allowedSchemes).toBe(HTML_LINK_SCHEMES);
  });

  it("garde les liens tel et mailto, retire data: et vbscript:", () => {
    expect(htmlCleaner(`<a href="tel:0102030405">t</a>`)).toContain(`href="tel:0102030405"`);
    expect(htmlCleaner(`<a href="mailto:a@b.fr">m</a>`)).toContain(`href="mailto:a@b.fr"`);
    expect(htmlCleaner(`<a href="data:text/html,x">d</a>`)).not.toContain("data:");
    expect(htmlCleaner(`<a href="vbscript:x">v</a>`)).not.toContain("vbscript");
  });
});
