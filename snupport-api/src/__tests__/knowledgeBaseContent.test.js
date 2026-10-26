const { findUnsafeUrl, isSafeLinkUrl, isSafeImageUrl, isSafeVideoUrl } = require("../utils/knowledgeBaseContent");

const paragraph = (...children) => ({ type: "paragraph", children });
const link = (url) => ({ type: "link", url, children: [{ text: "lien" }] });

describe("URL des nœuds Slate de la base de connaissance (M85 / FH17)", () => {
  it("accepte les liens http(s), mailto et les liens internes entre articles", () => {
    expect(isSafeLinkUrl("https://www.snu.gouv.fr/")).toBe(true);
    expect(isSafeLinkUrl("http://example.org/a")).toBe(true);
    expect(isSafeLinkUrl("mailto:contact@snu.gouv.fr")).toBe(true);
    expect(isSafeLinkUrl("/base-de-connaissance/mon-article")).toBe(true);
  });

  it("refuse javascript:, data: et les chemins qui changent d'hôte", () => {
    expect(isSafeLinkUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeLinkUrl(" JavaScript:alert(1)")).toBe(false);
    expect(isSafeLinkUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isSafeLinkUrl("//evil.example")).toBe(false);
    expect(isSafeLinkUrl("/\\evil.example")).toBe(false);
    expect(isSafeLinkUrl(undefined)).toBe(false);
  });

  it("n'accepte que http(s) pour les images", () => {
    expect(isSafeImageUrl("https://cellar-c2.services.clever-cloud.com/kb/a.png")).toBe(true);
    expect(isSafeImageUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeImageUrl("/relative.png")).toBe(false);
  });

  it("n'accepte que le lecteur Vimeo en https pour les vidéos (iframe exécutée sans clic)", () => {
    expect(isSafeVideoUrl("https://player.vimeo.com/video/123")).toBe(true);
    expect(isSafeVideoUrl("http://player.vimeo.com/video/123")).toBe(false);
    expect(isSafeVideoUrl("https://evil.example/video/123")).toBe(false);
    expect(isSafeVideoUrl("javascript:alert(document.cookie)//")).toBe(false);
  });

  it("trouve une URL dangereuse imbriquée dans le contenu", () => {
    const content = [paragraph({ text: "a" }, link("https://ok.example")), paragraph(paragraph(link("javascript:alert(1)")))];
    expect(findUnsafeUrl(content)).toEqual({ type: "link", url: "javascript:alert(1)" });
  });

  it("contrôle le nœud vidéo selon sa propre règle", () => {
    expect(findUnsafeUrl([{ type: "video", url: "https://example.org/x", children: [{ text: "" }] }])).toEqual({ type: "video", url: "https://example.org/x" });
    expect(findUnsafeUrl([{ type: "video", url: "https://player.vimeo.com/video/1", children: [{ text: "" }] }])).toBeNull();
  });

  it("contrôle tout nœud qui porte une URL, même d'un type inconnu", () => {
    expect(findUnsafeUrl([{ type: "custom", url: "javascript:alert(1)", children: [] }])).not.toBeNull();
  });

  it("laisse passer un contenu sans URL", () => {
    expect(findUnsafeUrl([paragraph({ text: "bonjour", bold: true })])).toBeNull();
    expect(findUnsafeUrl([])).toBeNull();
  });
});
