import { test } from "node:test";
import assert from "node:assert/strict";
import sanitizeHtml from "sanitize-html";
import { htmlCleaner, noteToSafeHtml, urlify } from "../html.js";

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
  assert.equal(htmlCleaner('<a href="javascript:alert(1)">x</a>'), "<a>x</a>");
  assert.equal(htmlCleaner('<img src="data:image/png;base64,AAAA" />'), "<img />");
  assert.equal(htmlCleaner('<a href="//evil.example">x</a>'), "<a>x</a>");
});

test("htmlCleaner retire l'attribut style (FM23)", () => {
  assert.equal(htmlCleaner('<blockquote style="position:fixed;top:0">x</blockquote>'), "<blockquote>x</blockquote>");
  assert.equal(htmlCleaner('<img src="https://a.fr/i.png" style="width:100%" />'), '<img src="https://a.fr/i.png" />');
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
