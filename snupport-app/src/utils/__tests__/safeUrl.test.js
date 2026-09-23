import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeHttpsUrl, sanitizeImageUrl, sanitizeLinkUrl, sanitizeVideoUrl } from "../safeUrl.js";

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
