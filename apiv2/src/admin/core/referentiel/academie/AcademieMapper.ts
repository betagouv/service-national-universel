import { ACADEMIE_COLUMN_NAMES, ImportAcademieModel } from "./Academie.model";

export class AcademieMapper {
    static fromRecord(record: Record<string, string>): ImportAcademieModel {
        const dateDerniereModificationSI = this.parseDate(record[ACADEMIE_COLUMN_NAMES.dateDerniereModificationSI]);
        const dateCreationSI = this.parseDate(record[ACADEMIE_COLUMN_NAMES.dateCreationSI]);

        return {
            code: record[ACADEMIE_COLUMN_NAMES.code],
            libelle: record[ACADEMIE_COLUMN_NAMES.libelle],
            regionAcademique: record[ACADEMIE_COLUMN_NAMES.regionAcademique],
            dateCreationSI: dateCreationSI,
            dateDerniereModificationSI: dateDerniereModificationSI,
        }
    }

    static fromRecords(records: Record<string, string>[]): ImportAcademieModel[] {
        return records.map(record => AcademieMapper.fromRecord(record));
    }

    private static parseDate(dateString: string): Date {
        const dateParts = dateString.split('/');
        return new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
    }
}