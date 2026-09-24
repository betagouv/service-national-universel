import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { sanitizeHttpsUrl, sanitizeImageUrl, sanitizeLinkUrl, sanitizeVideoUrl } from "../safeUrl.js";
import { sanitizeLinkUrl as sanitizeArticleLinkUrl } from "../../scenes/knowledge-base/utils/safeUrl.js";

// Vecteurs partagés avec snu-lib (GOO-19) : cette copie du filtre doit se comporter comme la référence.
const VECTORS = JSON.parse(readFileSync(new URL("../../../../packages/lib/src/utils/safeUrl.vectors.json", import.meta.url), "utf8"));
const FILTERS = {
  link: (value) => sanitizeLinkUrl(value),
  linkWithSitePath: (value) => sanitizeLinkUrl(value, { allowSitePath: true }),
  image: sanitizeImageUrl,
  video: sanitizeVideoUrl,
  https: sanitizeHttpsUrl,
};

test("respecte les vecteurs partagés de snu-lib", () => {
  assert.deepEqual(
    Object.keys(VECTORS).filter((key) => !key.startsWith("_")),
    Object.keys(FILTERS),
  );
  for (const [name, filter] of Object.entries(FILTERS)) {
    for (const value of VECTORS[name].accept) assert.notEqual(filter(value), null, `${name} accepte ${JSON.stringify(value)}`);
    for (const value of VECTORS[name].reject) assert.equal(filter(value), null, `${name} refuse ${JSON.stringify(value)}`);
  }
});

test("les liens d'article acceptent les chemins internes", () => {
  for (const value of VECTORS.linkWithSitePath.accept) assert.notEqual(sanitizeArticleLinkUrl(value), null, value);
  for (const value of VECTORS.linkWithSitePath.reject) assert.equal(sanitizeArticleLinkUrl(value), null, String(value));
});

const DANGEROUS = [
  "javascript:alert(1)",
  "JaVaScRiPt:alert(1)",
  " javascript:alert(1)",
  "java\tscript:alert(1)",
  "javascript://%0aalert(1)",
  "data:text/html,<script>alert(1)</script>",
  "vbscript:msgbox(1)",
];

test("sanitizeLinkUrl accepte http, https et mailto", () => {
  assert.equal(sanitizeLinkUrl("https://snu.gouv.fr/page"), "https://snu.gouv.fr/page");
  assert.equal(sanitizeLinkUrl("http://snu.gouv.fr"), "http://snu.gouv.fr/");
  assert.equal(sanitizeLinkUrl("mailto:contact@snu.gouv.fr"), "mailto:contact@snu.gouv.fr");
});

test("sanitizeLinkUrl refuse les schémas exécutables et les valeurs non URL", () => {
  for (const url of DANGEROUS) assert.equal(sanitizeLinkUrl(url), null, url);
  for (const value of [undefined, null, "", "   ", 42, "snu.gouv.fr", "//evil.example"]) assert.equal(sanitizeLinkUrl(value), null, String(value));
});

test("sanitizeImageUrl n'accepte que http et https", () => {
  assert.equal(sanitizeImageUrl("https://cellar-c2.services.clever-cloud.com/img.png"), "https://cellar-c2.services.clever-cloud.com/img.png");
  assert.equal(sanitizeImageUrl("mailto:a@b.fr"), null);
  for (const url of DANGEROUS) assert.equal(sanitizeImageUrl(url), null, url);
});

test("sanitizeVideoUrl limite l'iframe au lecteur Vimeo en https", () => {
  assert.equal(sanitizeVideoUrl("https://player.vimeo.com/video/123"), "https://player.vimeo.com/video/123");
  assert.equal(sanitizeVideoUrl("http://player.vimeo.com/video/123"), null);
  assert.equal(sanitizeVideoUrl("https://evil.example/video/123"), null);
  assert.equal(sanitizeVideoUrl("https://player.vimeo.com.evil.example/video"), null);
  for (const url of DANGEROUS) assert.equal(sanitizeVideoUrl(url), null, url);
});

test("sanitizeHttpsUrl n'accepte que https (attributs de contact)", () => {
  assert.equal(sanitizeHttpsUrl("https://moncompte.snu.gouv.fr/phase1"), "https://moncompte.snu.gouv.fr/phase1");
  assert.equal(sanitizeHttpsUrl("http://moncompte.snu.gouv.fr"), null);
  // l'ancien test `value.includes("https://")` laissait passer ceci
  assert.equal(sanitizeHttpsUrl("javascript:alert(document.cookie)//https://snu.gouv.fr"), null);
  for (const url of DANGEROUS) assert.equal(sanitizeHttpsUrl(url), null, url);
});
