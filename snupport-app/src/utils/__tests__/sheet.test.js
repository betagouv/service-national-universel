import { test } from "node:test";
import assert from "node:assert/strict";
import * as XLSX from "xlsx";
import { safeJsonToSheet, toSheetCellValue } from "../sheet.js";

test("toSheetCellValue ramène tableaux et objets à du texte", () => {
  assert.equal(toSheetCellValue(["Ain", "Aisne"]), "Ain, Aisne");
  assert.equal(toSheetCellValue({ f: "1+1" }), '{"f":"1+1"}');
  assert.equal(toSheetCellValue("recherche"), "recherche");
  assert.equal(toSheetCellValue(3), 3);
  assert.equal(toSheetCellValue(null), null);
});

test("safeJsonToSheet n'écrit aucune formule depuis une valeur objet", () => {
  const ws = safeJsonToSheet([{ Recherche: { f: 'HYPERLINK("http://x")' }, Résultats: 2 }]);
  const wb = XLSX.read(XLSX.write({ SheetNames: ["s"], Sheets: { s: ws } }, { bookType: "xlsx", type: "buffer" }), { type: "buffer", cellFormula: true });
  const cell = wb.Sheets.s.A2;
  assert.equal(cell.f, undefined);
  assert.equal(cell.v, '{"f":"HYPERLINK(\\"http://x\\")"}');
});
