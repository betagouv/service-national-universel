import { Inject, Injectable } from "@nestjs/common";
import { ReferentielImportTaskParameters } from "snu-lib";
import { FileGateway } from "@shared/core/File.gateway";
import { UseCase } from "@shared/core/UseCase";
import { RegionAcademiqueImportService } from "../RegionAcademiqueImport.service";
import { complyDate, isValidDate } from "snu-lib";

export type ImportRegionAcademiqueRow = {
  code: string;
  libelle: string;
  zone: string;
  dateDerniereModificationSI: string;
};

export class RegionAcademiqueValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RegionAcademiqueValidationError';
  }
}

@Injectable()
export class ImportRegionsAcademiques implements UseCase<void> {
  constructor(@Inject(RegionAcademiqueImportService) private readonly regionAcademiqueImportService: RegionAcademiqueImportService,
    @Inject(FileGateway) private readonly fileGateway: FileGateway,
  ) {}

  async execute(params: ReferentielImportTaskParameters): Promise<void> { 
    const regionsAcademiques = await this.getDataFromReferentielImportTaskParameters(params);

    
    for (const regionAcademique of regionsAcademiques) {
      if (!regionAcademique.code || regionAcademique.code.length !== 3) {
        throw new RegionAcademiqueValidationError('Invalid format');
      }

      if (!regionAcademique.libelle) {
        throw new RegionAcademiqueValidationError('Invalid format');
      }

      if (!regionAcademique.zone || !['A', 'B', 'C'].includes(regionAcademique.zone)) {
        throw new RegionAcademiqueValidationError('Invalid format');
      }

      if (!regionAcademique.dateDerniereModificationSI || !isValidDate(regionAcademique.dateDerniereModificationSI)) {
        throw new RegionAcademiqueValidationError('Invalid format');
      }

      const row = {
        code: regionAcademique.code,
        libelle: regionAcademique.libelle,
        zone: regionAcademique.zone,
        dateDerniereModificationSI: complyDate(regionAcademique.dateDerniereModificationSI)
    }
    
    this.regionAcademiqueImportService.import(row);
   }
  }

  private async getDataFromReferentielImportTaskParameters(params: ReferentielImportTaskParameters) {
    const file = await this.fileGateway.downloadFile(params.fileKey);
    const regionsAcademiques = await this.fileGateway.parseXLS<Record<string, string>>(file.Body, {
      defval: "",
    });
    return regionsAcademiques;
  }

}


