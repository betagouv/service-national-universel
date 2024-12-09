import { Inject, Injectable } from "@nestjs/common";
import { CreateRegionAcademiqueModel, RegionAcademiqueModel } from "../RegionAcademique.model";
import { ReferentielImportTaskParameters } from "snu-lib";
import { FileGateway } from "@shared/core/File.gateway";
import { UseCase } from "@shared/core/UseCase";
import { RegionAcademiqueImportService } from "../ReferentielRegionAcademiqueImport.service";

export type ImportRegionAcademiqueRow = {
  code: string;
  libelle: string;
  zone: string;
  dateCreationSI: string;
  dateDerniereModificationSI: string;
};

class RegionAcademiqueValidationError extends Error {
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

  async execute(referentielImportTaskParameters: ReferentielImportTaskParameters): Promise<void> { 

    const regionsAcademiquesRows = await this.getDataFromImportReferentielImportTaskParameters(referentielImportTaskParameters);

    for (const regionAcademiqueRow of regionsAcademiquesRows) {
      //this.validateRegionAcademique(regionAcademiqueRow);
      
      const newRegionAcademique: CreateRegionAcademiqueModel = {
       code: "BRE",
        libelle: "BRETAGNE",
        zone: "A",
       dateCreationSI: new Date("01/01/2024"),
        dateDerniereModificationSI: new Date("01/01/2024"),
    };
      
    await this.regionAcademiqueImportService.import(newRegionAcademique);
  }
  }

  
  private validateRegionAcademique(regionAcademique: ImportRegionAcademiqueRow): void {
    if (!regionAcademique.code || regionAcademique.code.trim().length === 0) {
      throw new RegionAcademiqueValidationError('Le code de la région académique est requis');
    }
    
    if (!regionAcademique.libelle || regionAcademique.libelle.trim().length === 0) {
      throw new RegionAcademiqueValidationError('Le libellé de la région académique est requis');
    }


    if (!regionAcademique.zone || regionAcademique.zone.trim().length === 0) {
      throw new RegionAcademiqueValidationError('La zone est requise');
    }
    
    try {
      this.convertirDateFrancaiseEnDate(regionAcademique.dateCreationSI);
      this.convertirDateFrancaiseEnDate(regionAcademique.dateDerniereModificationSI);
    } catch (error) {
      throw error;
    }
  }

  private async getDataFromImportReferentielImportTaskParameters(referentielImportTaskParameters: ReferentielImportTaskParameters) {
    const file = await this.fileGateway.downloadFile(referentielImportTaskParameters.fileKey);
    const regionsAcademiquesJSON = await this.fileGateway.parseXLS<string>(file.Body);   
    return regionsAcademiquesJSON;
  }

  private convertirDateFrancaiseEnDate(dateFr: string): Date {
    // Vérifie si la date est au format DD/MM/YYYY
    const regexDateFr = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateFr.match(regexDateFr);
  
    if (!match) {
      throw new RegionAcademiqueValidationError(`La date '${dateFr}' n'est pas au format DD/MM/YYYY`);
    }
  
    const [, jour, mois, annee] = match;
    const dateISO = `${annee}-${mois}-${jour}`;
    const date = new Date(dateISO);
  
    if (isNaN(date.getTime())) {
      throw new RegionAcademiqueValidationError(`La date '${dateFr}' n'est pas valide`);
    }
  
    return date;
  }
}
