import { Injectable } from "@nestjs/common";

Injectable();
export class ReferentielService {
    constructor() {}
    getMissingColumns(requiredColumns: string[], columns: Record<string, any>): string[] {
        const missingColumns: string[] = [];
        for (const requiredColumn of requiredColumns) {
            if (!columns.hasOwnProperty(requiredColumn)) {
                missingColumns.push(requiredColumn);
            }
        }
        return missingColumns;
    }
}
