import { promises as fs } from "fs";
import { parse, ParserOptionsArgs } from "@fast-csv/parse";
import * as XLSX from "xlsx";
import { Injectable } from "@nestjs/common";
import { FileGateway } from "@shared/core/File.gateway";

import { ERRORS } from "snu-lib";

@Injectable()
export class FileProvider implements FileGateway {
    async readCSV<T>(filePath: string, options: ParserOptionsArgs = { headers: true }): Promise<T[]> {
        const buffer = await fs.readFile(filePath);
        return new Promise((resolve, reject) => {
            const content: T[] = [];

            const stream = parse(options)
                .on("error", (error) => {
                    console.log(error);
                    reject(new Error(ERRORS.CANNOT_PARSE_CSV));
                })
                .on("data", (row) => {
                    content.push(row);
                })
                .on("end", () => {
                    resolve(content);
                });
            stream.write(buffer);
            stream.end();
        });
    }

    async generateExcel(excelSheets: { [sheet: string]: any[] }): Promise<Buffer> {
        const wb = XLSX.utils.book_new();
        for (const sheetName of Object.keys(excelSheets)) {
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(excelSheets[sheetName]), sheetName);
        }
        return XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
    }
}
