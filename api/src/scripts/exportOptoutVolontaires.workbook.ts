import * as ExcelJS from "exceljs";

export type ExportWorkbook = {
  openSheet(name: string, columns: string[]): void;
  writeRow(name: string, row: Record<string, any>): void;
  commitSheet(name: string): Promise<void>;
  commit(): Promise<void>;
};

/**
 * Écriture Excel en streaming (faible mémoire) : chaque ligne est flushée
 * immédiatement (row.commit()), chaque onglet est finalisé via commitSheet().
 * Évite l'OOM connu à ~47k volontaires (SheetJS construit tout en mémoire).
 */
export function createExportWorkbook(outFile: string): ExportWorkbook {
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ filename: outFile });
  const sheets = new Map<string, ExcelJS.Worksheet>();
  return {
    openSheet(name, columns) {
      const ws = workbook.addWorksheet(name);
      ws.columns = columns.map((c) => ({ header: c, key: c }));
      sheets.set(name, ws);
    },
    writeRow(name, row) {
      const ws = sheets.get(name);
      if (!ws) throw new Error(`Onglet inconnu: ${name}`);
      ws.addRow(row).commit();
    },
    async commitSheet(name) {
      const ws = sheets.get(name);
      if (!ws) throw new Error(`Onglet inconnu: ${name}`);
      await ws.commit();
    },
    async commit() {
      await workbook.commit();
    },
  };
}
