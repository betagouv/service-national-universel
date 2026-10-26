import { test } from "node:test";
import assert from "node:assert/strict";
import sanitizeHtml from "sanitize-html";
import { hasHiddenRemoteImages, htmlCleaner, noteToSafeHtml, revealRemoteImages, urlify } from "../html.js";

// Relit le HTML produit comme le ferait le navigateur et renvoie les balises et attributs réels.
const parseTags = (html) => {
  const tags = [];
  sanitizeHtml(html, {
    allowedTags: false,
    allowedAttributes: false,
    allowVulnerableTags: true,
    transformTags: {
      "*": (tagName, attribs) => {
        tags.push({ tagName, attribs });
        return { tagName, attribs };
      },
    },
  });
  return tags;
};

test("htmlCleaner retire scripts, gestionnaires d'événements et schémas dangereux", () => {
  assert.equal(htmlCleaner('<p onclick="alert(1)">a</p><script>alert(1)</script>'), "<p>a</p>");
  assert.equal(htmlCleaner('<a href="javascript:alert(1)">x</a>'), '<a rel="noopener noreferrer">x</a>');
  assert.equal(htmlCleaner('<a href="data:text/html;base64,PHNjcmlwdD4=">x</a>'), '<a rel="noopener noreferrer">x</a>');
  assert.equal(htmlCleaner('<a href="data:image/png;base64,AAAA">x</a>'), '<a rel="noopener noreferrer">x</a>');
  assert.equal(htmlCleaner('<a href="//evil.example">x</a>'), '<a rel="noopener noreferrer">x</a>');
});

test("htmlCleaner garde les images collées dans un e-mail (data:image en base64) et elles seules", () => {
  assert.equal(htmlCleaner('<img src="data:image/png;base64,iVBORw0KGgo=" alt="capture" />'), '<img src="data:image/png;base64,iVBORw0KGgo=" alt="capture" />');
  assert.equal(htmlCleaner('<img src="data:image/jpeg;base64,/9j/4AAQ" />'), '<img src="data:image/jpeg;base64,/9j/4AAQ" />');
  for (const src of ["data:image/svg+xml;base64,PHN2Zz4=", "data:text/html;base64,PHNjcmlwdD4=", "data:image/png,<svg onload=alert(1)>", "javascript:alert(1)"]) {
    assert.equal(htmlCleaner(`<img src="${src}" />`), "<img />", src);
  }
});

test("htmlCleaner retire l'attribut style (FM23)", () => {
  assert.equal(htmlCleaner('<blockquote style="position:fixed;top:0">x</blockquote>'), "<blockquote>x</blockquote>");
  assert.equal(htmlCleaner('<img src="https://a.fr/i.png" style="width:100%" />'), '<img iwc-no-src="https://a.fr/i.png" />');
});

// PL25 : une image distante d'un e-mail entrant (pixel de suivi) ne doit pas se charger automatiquement
// chez l'agent qui ouvre le ticket ; elle est neutralisée par htmlCleaner et restaurée uniquement à la
// demande explicite de l'agent (bouton « afficher les images »).
test("htmlCleaner neutralise les images distantes (http et https) au lieu de les charger (PL25)", () => {
  assert.equal(htmlCleaner('<img src="https://tiers.example/pixel.gif" width="1" height="1" />'), '<img width="1" height="1" iwc-no-src="https://tiers.example/pixel.gif" />');
  assert.equal(htmlCleaner('<img src="http://tiers.example/pixel.gif" />'), '<img iwc-no-src="http://tiers.example/pixel.gif" />');
});

test("htmlCleaner garde les images collées (data:) chargées directement, sans neutralisation", () => {
  assert.equal(htmlCleaner('<img src="data:image/png;base64,iVBORw0KGgo=" />'), '<img src="data:image/png;base64,iVBORw0KGgo=" />');
});

test("hasHiddenRemoteImages détecte une image distante neutralisée", () => {
  assert.equal(hasHiddenRemoteImages(htmlCleaner('<img src="https://tiers.example/pixel.gif" />')), true);
  assert.equal(hasHiddenRemoteImages(htmlCleaner('<img src="data:image/png;base64,iVBORw0KGgo=" />')), false);
  assert.equal(hasHiddenRemoteImages(htmlCleaner("<p>rien</p>")), false);
});

test("revealRemoteImages restaure l'image distante à la demande de l'agent", () => {
  const hidden = htmlCleaner('<img src="https://tiers.example/pixel.gif" alt="x" />');
  assert.equal(revealRemoteImages(hidden), '<img alt="x" src="https://tiers.example/pixel.gif" />');
});

test("revealRemoteImages refuse un schéma dangereux même glissé directement dans iwc-no-src", () => {
  assert.equal(revealRemoteImages('<img iwc-no-src="javascript:alert(1)" />'), "<img />");
});

test("htmlCleaner garde les listes à puces et force rel sur tout lien, comme snu-lib", () => {
  assert.equal(htmlCleaner("<ul><li>a</li></ul>"), "<ul><li>a</li></ul>");
  assert.equal(htmlCleaner('<a href="https://a.fr">x</a>'), '<a href="https://a.fr" rel="noopener noreferrer">x</a>');
});

test("htmlCleaner force rel=noopener noreferrer sur target=_blank", () => {
  assert.equal(htmlCleaner('<a href="https://a.fr" target="_blank">x</a>'), '<a href="https://a.fr" target="_blank" rel="noopener noreferrer">x</a>');
  assert.equal(htmlCleaner('<a href="https://a.fr" target="_blank" rel="opener">x</a>'), '<a href="https://a.fr" target="_blank" rel="noopener noreferrer">x</a>');
});

test("htmlCleaner tolère les valeurs absentes", () => {
  assert.equal(htmlCleaner(undefined), "");
  assert.equal(htmlCleaner(null), "");
});

test("urlify ne touche que le texte hors des liens", () => {
  assert.equal(urlify("voir https://snu.gouv.fr/a ici"), 'voir <a href="https://snu.gouv.fr/a" target="_blank" rel="noopener noreferrer">https://snu.gouv.fr/a</a> ici');
  const existing = '<a href="https://snu.gouv.fr/a">https://snu.gouv.fr/a</a>';
  assert.equal(urlify(existing), existing);
});

test("noteToSafeHtml neutralise les injections dans une note (FH14)", () => {
  const payloads = [
    '<a href="https://x/ onmouseover=alert(1) x">lien</a>',
    'https://x/"onmouseover="alert(1)',
    "https://x/<img src=x onerror=alert(1)>",
    '<a href="https://a.fr">https://b.fr/" onfocus="alert(1)" autofocus="</a>',
  ];
  for (const payload of payloads) {
    const html = noteToSafeHtml(payload);
    for (const { attribs } of parseTags(html)) {
      for (const [name, value] of Object.entries(attribs)) {
        assert.doesNotMatch(name, /^on/i, html);
        if (name === "href") assert.match(value, /^(https?:|mailto:)/, html);
      }
    }
  }
});

test("noteToSafeHtml rend les URL cliquables", () => {
  assert.equal(noteToSafeHtml("voir https://snu.gouv.fr"), 'voir <a href="https://snu.gouv.fr" target="_blank" rel="noopener noreferrer">https://snu.gouv.fr</a>');
});
