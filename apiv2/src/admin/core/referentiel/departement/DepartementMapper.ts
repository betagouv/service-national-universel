import { ImportDepartementModel, DEPARTEMENT_COLUMN_NAMES } from "./Departement.model";

export class DepartementImportMapper {  
    static fromRecord(record: Record<string, string>): ImportDepartementModel {
        const dateDerniereModificationSI = this.parseDate(record[DEPARTEMENT_COLUMN_NAMES.dateDerniereModificationSI]);
        const dateCreationSI = this.parseDate(record[DEPARTEMENT_COLUMN_NAMES.dateCreationSI]);

        return {
            code: record[DEPARTEMENT_COLUMN_NAMES.code],
            libelle: record[DEPARTEMENT_COLUMN_NAMES.libelle],
            chefLieu: record[DEPARTEMENT_COLUMN_NAMES.chefLieu],
            regionAcademique: record[DEPARTEMENT_COLUMN_NAMES.regionAcademique],
            academie: record[DEPARTEMENT_COLUMN_NAMES.academie],
            dateCreationSI: dateCreationSI,
            dateDerniereModificationSI: dateDerniereModificationSI,
        }
    }

    static fromRecords(records: Record<string, string>[]): ImportDepartementModel[] {
        return records.map(record => DepartementImportMapper.fromRecord(record));
    }

    private static parseDate(dateString: string): Date {
        const dateParts = dateString.split('/');
        return new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
    }

}