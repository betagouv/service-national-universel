const { findUnsafeHtml, findUnsafeSlate, findUnsafeUrlValue } = require("../utils/storedContentAudit");

const reasons = (findings) => findings.map((finding) => finding.reason);

describe("findUnsafeHtml", () => {
  it("ne signale rien sur un HTML de signature ordinaire", () => {
    const html = `<p>Bonjour,<br><strong>L'équipe SNU</strong></p><a href="https://www.snu.gouv.fr" target="_blank">site</a> <a href="mailto:contact@snu.gouv.fr">écrire</a><img src="https://cdn.snu.gouv.fr/logo.png" alt="logo"><a href="/aide">aide</a>`;
    expect(findUnsafeHtml(html)).toEqual([]);
  });

  it("ignore les valeurs vides ou non textuelles", () => {
    expect(findUnsafeHtml("")).toEqual([]);
    expect(findUnsafeHtml(undefined)).toEqual([]);
    expect(findUnsafeHtml(42)).toEqual([]);
  });

  it("signale un attribut d'événement", () => {
    expect(findUnsafeHtml(`<img src="https://x.fr/a.png" onerror="alert(1)">`)).toEqual([{ reason: "event-handler", tag: "img", attribute: "onerror", detail: "alert(1)" }]);
    expect(reasons(findUnsafeHtml(`<p ONCLICK="x">a</p>`))).toEqual(["event-handler"]);
  });

  it("signale un lien javascript:, y compris masqué par des caractères ignorés du navigateur", () => {
    expect(findUnsafeHtml(`<a href="javascript:alert(1)">x</a>`)).toEqual([{ reason: "url", tag: "a", attribute: "href", detail: "javascript:alert(1)" }]);
    expect(reasons(findUnsafeHtml(`<a href="java&#x09;script:alert(1)">x</a>`))).toEqual(["url"]);
    expect(reasons(findUnsafeHtml(`<a href="  JaVaScRiPt:alert(1)">x</a>`))).toEqual(["url"]);
    expect(reasons(findUnsafeHtml(`<svg><a xlink:href="javascript:alert(1)">x</a></svg>`))).toEqual(["url"]);
  });

  it("signale une ressource hors http(s)", () => {
    expect(reasons(findUnsafeHtml(`<img src="data:image/svg+xml;base64,PHN2Zz4=">`))).toEqual(["url"]);
    expect(reasons(findUnsafeHtml(`<form action="javascript:alert(1)"><button>ok</button></form>`))).toEqual(["url"]);
  });

  it("signale une balise script", () => {
    expect(reasons(findUnsafeHtml(`<p>a</p><script>alert(1)</script>`))).toEqual(["script"]);
  });

  it("signale une iframe hors du lecteur Vimeo et accepte le lecteur Vimeo", () => {
    expect(findUnsafeHtml(`<iframe src="https://player.vimeo.com/video/1"></iframe>`)).toEqual([]);
    expect(reasons(findUnsafeHtml(`<iframe src="https://evil.example/x"></iframe>`))).toEqual(["frame"]);
    expect(reasons(findUnsafeHtml(`<iframe srcdoc="<script>alert(1)</script>"></iframe>`))).toEqual(["frame"]);
    expect(reasons(findUnsafeHtml(`<iframe src="https://player.vimeo.com/video/1" srcdoc="<b>x</b>"></iframe>`))).toEqual(["frame"]);
    expect(reasons(findUnsafeHtml(`<iframe></iframe>`))).toEqual(["frame"]);
    expect(reasons(findUnsafeHtml(`<embed src="javascript:alert(1)">`))).toEqual(["frame"]);
  });

  it("tronque le détail d'une valeur longue", () => {
    const [finding] = findUnsafeHtml(`<a href="javascript:${"a".repeat(500)}">x</a>`);
    expect(finding.detail.length).toBeLessThanOrEqual(121);
  });
});

describe("findUnsafeSlate", () => {
  const paragraph = (...children) => ({ type: "paragraph", children });

  it("accepte liens, images et vidéos autorisés", () => {
    const content = [
      paragraph({ type: "link", url: "https://www.snu.gouv.fr", children: [{ text: "site" }] }),
      { type: "image", url: "https://cdn.snu.gouv.fr/a.png", children: [{ text: "" }] },
      { type: "video", url: "https://player.vimeo.com/video/1", children: [{ text: "" }] },
    ];
    expect(findUnsafeSlate(content, "shortcut")).toEqual([]);
    expect(findUnsafeSlate(content, "knowledgeBase")).toEqual([]);
  });

  it("signale toutes les URL refusées, à toute profondeur", () => {
    const content = [
      paragraph({ type: "link", url: "javascript:alert(1)", children: [{ text: "a" }] }),
      paragraph(paragraph({ type: "link", url: "data:text/html,<script>", children: [{ text: "b" }] })),
      { type: "video", url: "https://evil.example/embed", children: [{ text: "" }] },
    ];
    expect(findUnsafeSlate(content, "knowledgeBase").map((finding) => finding.type)).toEqual(["link", "link", "video"]);
  });

  it("accepte les liens internes dans un article, pas dans un module de texte", () => {
    const content = [paragraph({ type: "link", url: "/base-de-connaissance/inscription", children: [{ text: "a" }] })];
    expect(findUnsafeSlate(content, "knowledgeBase")).toEqual([]);
    expect(reasons(findUnsafeSlate(content, "shortcut"))).toEqual(["url"]);
  });

  it("signale href ou src portés par un nœud, et une url sur un nœud inattendu d'un module de texte", () => {
    expect(findUnsafeSlate([paragraph({ text: "a" }), { type: "paragraph", href: "https://x.fr", children: [{ text: "" }] }], "shortcut")).toEqual([
      { reason: "url", type: "paragraph", attribute: "href", detail: "https://x.fr" },
    ]);
    expect(reasons(findUnsafeSlate([{ type: "custom", url: "https://x.fr", children: [{ text: "" }] }], "shortcut"))).toEqual(["url"]);
  });

  it("tolère un contenu absent ou mal formé", () => {
    expect(findUnsafeSlate(undefined, "shortcut")).toEqual([]);
    expect(findUnsafeSlate([null, "texte", 3], "knowledgeBase")).toEqual([]);
  });

  it("refuse une règle inconnue", () => {
    expect(() => findUnsafeSlate([], "autre")).toThrow("règle Slate inconnue");
  });
});

describe("findUnsafeUrlValue", () => {
  it("exige une image http(s) absolue", () => {
    expect(findUnsafeUrlValue("https://cdn.snu.gouv.fr/a.png", "image")).toEqual([]);
    expect(reasons(findUnsafeUrlValue("javascript:alert(1)", "image"))).toEqual(["url"]);
    expect(reasons(findUnsafeUrlValue("/images/a.png", "image"))).toEqual(["url"]);
    expect(findUnsafeUrlValue("", "image")).toEqual([]);
  });

  it("ne signale un lien que pour un schéma interdit", () => {
    expect(findUnsafeUrlValue("www.exemple.fr", "link")).toEqual([]);
    expect(findUnsafeUrlValue("https://exemple.fr", "link")).toEqual([]);
    expect(reasons(findUnsafeUrlValue("javascript:alert(1)", "link"))).toEqual(["url"]);
    expect(findUnsafeUrlValue(null, "link")).toEqual([]);
  });
});
