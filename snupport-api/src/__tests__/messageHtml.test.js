const { sanitizeMessageHtml, plainTextToMessageHtml } = require("../utils/messageHtml");

describe("sanitizeMessageHtml (M92)", () => {
  it("retire les scripts, les gestionnaires d'événements et les URL javascript:", () => {
    const html = sanitizeMessageHtml(
      '<p onmouseover="x()">ok</p><script>alert(1)</script><a href="javascript:alert(1)">a</a><img src="javascript:x" onerror="y()"><iframe src="https://evil.com"></iframe>'
    );
    expect(html).toContain("ok");
    expect(html).not.toMatch(/script|onmouseover|onerror|javascript:|iframe/i);
  });

  it("conserve la mise en forme courante des messages", () => {
    const html = sanitizeMessageHtml('<p><strong>Bonjour</strong><br><a href="https://www.snu.gouv.fr">lien</a></p><ul><li>un</li></ul>');
    expect(html).toContain("<strong>Bonjour</strong>");
    expect(html).toContain('href="https://www.snu.gouv.fr"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("<li>un</li>");
  });

  it("garde le bandeau de citation de l'historique, sans autre style", () => {
    const html = sanitizeMessageHtml('<blockquote style="border-left: 3px solid; padding: 5px 2px ">cité</blockquote><p style="background:url(javascript:x)">p</p>');
    expect(html).toContain("<blockquote");
    expect(html).toContain("border-left:3px solid");
    expect(html).not.toContain("background");
  });

  it("renvoie une chaîne vide pour une valeur absente", () => {
    expect(sanitizeMessageHtml(undefined)).toBe("");
  });
});

describe("plainTextToMessageHtml (M91, M92)", () => {
  it("échappe le texte saisi au lieu de l'interpréter comme du HTML", () => {
    const html = plainTextToMessageHtml('<img src=x onerror="alert(1)"> 2 < 3');
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
    expect(html).toContain("2 &lt; 3");
  });

  it("met en forme les retours à la ligne et rend les URL cliquables", () => {
    const html = plainTextToMessageHtml("ligne 1\nvoir https://www.snu.gouv.fr/aide");
    expect(html).toContain("<br />");
    expect(html).toContain('<a href="https://www.snu.gouv.fr/aide"');
  });

  it("ne laisse pas une URL fabriquée sortir de l'attribut href", () => {
    const html = plainTextToMessageHtml('https://x.fr/"onmouseover="alert(1)');
    expect(html).not.toMatch(/\sonmouseover=/);
  });
});
