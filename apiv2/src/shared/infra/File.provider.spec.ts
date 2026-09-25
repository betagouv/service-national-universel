import { ConfigService } from "@nestjs/config";
import * as XLSX from "xlsx";

import { FileProvider } from "./File.provider";

describe("FileProvider.generateCSV", () => {
    it("neutralise les cellules qu'un tableur lirait comme des formules (L36)", async () => {
        const provider = new FileProvider({} as ConfigService);
        const csv = await provider.generateCSV([{ nom: '=HYPERLINK("http://x")', prenom: "Jean", age: -2 }], {
            headers: true,
            delimiter: ";",
        });
        const [, ligne] = csv.split("\n");
        expect(ligne).toBe(`"'=HYPERLINK(""http://x"")";Jean;-2`);
    });
});

describe("FileProvider.generateExcel / generateExcelFromValues", () => {
    // Avec SheetJS, un tableau passé à `aoa_to_sheet` devient une formule et un objet passé à
    // `json_to_sheet` est recopié tel quel comme cellule (GOO-18, FM7).
    const readCell = (buffer: Buffer, ref: string) => {
        const wb = XLSX.read(buffer, { type: "buffer", cellFormula: true });
        return wb.Sheets[wb.SheetNames[0]][ref];
    };

    it("ramène les objets et tableaux de generateExcel à du texte", async () => {
        const provider = new FileProvider({} as ConfigService);
        const buffer = await provider.generateExcel({
            data: [{ a: { f: 'HYPERLINK("http://x")' }, b: ["Ain", "Aisne"] }],
        });
        expect(readCell(buffer, "A2").f).toBeUndefined();
        expect(readCell(buffer, "A2").v).toBe('{"f":"HYPERLINK(\\"http://x\\")"}');
        expect(readCell(buffer, "B2").v).toBe("Ain, Aisne");
    });

    it("n'écrit pas de formule depuis un tableau [valeur, formule] dans generateExcelFromValues", async () => {
        const provider = new FileProvider({} as ConfigService);
        const buffer = await provider.generateExcelFromValues({
            columnsName: ["departement"],
            values: [[["Ain", 'HYPERLINK("http://x")']]],
            sheetName: "data",
        });
        expect(readCell(buffer, "A2").f).toBeUndefined();
        expect(readCell(buffer, "A2").v).toBe('Ain, HYPERLINK("http://x")');
    });
});
