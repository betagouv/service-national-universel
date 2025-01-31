import { AcademieType } from "snu-lib";
import { ACADEMIE_COLUMN_NAMES, AcademieModel, ImportAcademieModel } from "@admin/core/referentiel/academie/Academie.model";
import { AcademieDocument } from "./Academie.provider";

export class AcademieMapper {
  static toDocument(academieModel: AcademieModel): AcademieType {
    const { id, ...rest } = academieModel;
    return {
      _id: id,
      ...rest,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  static toModel(academieDocument: AcademieDocument): AcademieModel {
    return {
      ...academieDocument,
      id: academieDocument._id.toString(),
    };
  }

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
