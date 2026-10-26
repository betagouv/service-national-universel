import { test } from "node:test";
import assert from "node:assert/strict";
import { detectMimeTypeFromBytes, getSafeDownloadFileName } from "../downloadFileName.js";

test("getSafeDownloadFileName impose l'extension du type détecté", () => {
  assert.equal(getSafeDownloadFileName("piece.hta", "application/pdf"), "piece.pdf");
  assert.equal(getSafeDownloadFileName("photo.jpeg", "image/jpeg"), "photo.jpeg");
  assert.equal(getSafeDownloadFileName("../x/piece.html", "image/png"), "piece.png");
});

test("getSafeDownloadFileName retombe sur .bin sans type reconnu ni extension sûre", () => {
  assert.equal(getSafeDownloadFileName("piece.hta", undefined), "piece.bin");
  assert.equal(getSafeDownloadFileName("tableau.xlsx", undefined), "tableau.xlsx");
  assert.equal(getSafeDownloadFileName("", undefined), "document.bin");
});

test("detectMimeTypeFromBytes lit la signature du contenu", () => {
  assert.equal(detectMimeTypeFromBytes(new Uint8Array(Buffer.from("%PDF-1.4"))), "application/pdf");
  assert.equal(detectMimeTypeFromBytes(new Uint8Array([0xff, 0xd8, 0xff, 0xe1])), "image/jpeg");
  assert.equal(detectMimeTypeFromBytes(new Uint8Array(Buffer.from("<html>"))), undefined);
});
