import { ImportRegionAcademiqueModel, REGION_ACADEMIQUE_COLUMN_NAMES } from "../../../RegionAcademique.model";

export class RegionAcademiqueImportDto {  
    static fromRecord(record: Record<string, string>): ImportRegionAcademiqueModel {
        const dateDerniereModificationSI = this.parseDate(record[REGION_ACADEMIQUE_COLUMN_NAMES.date_derniere_modification_si]);
        const zone = record[REGION_ACADEMIQUE_COLUMN_NAMES.zone];

        return {
            code: record[REGION_ACADEMIQUE_COLUMN_NAMES.code],
            libelle: record[REGION_ACADEMIQUE_COLUMN_NAMES.libelle],
            zone: zone,
            dateDerniereModificationSI: dateDerniereModificationSI
        }
    }

    static fromRecords(records: Record<string, string>[]): ImportRegionAcademiqueModel[] {
        return records.map(record => RegionAcademiqueImportDto.fromRecord(record));
    }

    private static parseDate(dateString: string): Date {
        const dateParts = dateString.split('/');
        return new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
    }

}