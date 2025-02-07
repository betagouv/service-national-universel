import { Inject, Injectable, Logger } from "@nestjs/common";
import { FileGateway } from "@shared/core/File.gateway";
import { UseCase } from "@shared/core/UseCase";
import { RegionAcademiqueImportService } from "../../RegionAcademiqueImport.service";
import { RegionAcademiqueValidationError } from "./RegionAcademiqueValidationError";
import { RegionAcademiqueImportMapper } from "../../RegionAcademiqueMapper";
import { ImportRegionAcademiqueModel, RegionAcademiqueImportRapport } from "../../RegionAcademique.model";
import { ReferentielImportTaskParameters } from "@admin/core/referentiel/ReferentielImportTask.model";
import { ClockGateway } from "@shared/core/Clock.gateway";

@Injectable()
export class ImporterRegionsAcademiques implements UseCase<RegionAcademiqueImportRapport[]> {
  constructor(@Inject( ) private readonly regionAcademiqueImportService: RegionAcademiqueImportService,
    @Inject(FileGateway) private readonly fileGateway: FileGateway,
    @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
    private readonly logger: Logger,
  ) {}

  async execute(params: ReferentielImportTaskParameters): Promise<RegionAcademiqueImportRapport[]> { 
    const report: RegionAcademiqueImportRapport[] = [];
    const regionsAcademiques = await this.getDataFromReferentielImportTaskParameters(params);
    
    for (const regionAcademique of regionsAcademiques) {
     try {
       this.validateRegionAcademique(regionAcademique);
       this.regionAcademiqueImportService.import(regionAcademique);
       report.push({
        ...regionAcademique,
        result: "success",
       });
       this.logger.log(`RegionAcademique ${regionAcademique.code} imported successfully`, ImporterRegionsAcademiques.name);
     } catch (error) {
       report.push({
        ...regionAcademique,
         result: "error",
         error: (error as Error)?.message,
       });
       this.logger.warn(
        `Error importing regionAcademique ${regionAcademique.code}: ${(error as Error)?.message}`,
        ImporterRegionsAcademiques.name,
    );
     }
   }

   return report;
  }

  private validateRegionAcademique(regionAcademique: ImportRegionAcademiqueModel) {
    if (!regionAcademique.code || regionAcademique.code.length !== 3) {
      throw new RegionAcademiqueValidationError('Invalid format - code');
    }

    if (!regionAcademique.libelle) {
      throw new RegionAcademiqueValidationError('Invalid format - libelle');
    }

    if (typeof regionAcademique.zone !== 'string' || !['', 'A', 'B', 'C'].includes(regionAcademique.zone.trim())) {
      throw new RegionAcademiqueValidationError('Invalid format - zone');
    }

    if (!regionAcademique.dateDerniereModificationSI || !this.clockGateway.isValidDate(regionAcademique.dateDerniereModificationSI)) {
      throw new RegionAcademiqueValidationError('Invalid format - dateDerniereModificationSI');
    }
  }

  private async getDataFromReferentielImportTaskParameters(params: ReferentielImportTaskParameters) {
    const file = await this.fileGateway.downloadFile(params.fileKey);
    const regionsAcademiquesXLSX = await this.fileGateway.parseXLS<Record<string, string>>(file.Body, {
      defval: "",
    });

    const regionsAcademiques = RegionAcademiqueImportMapper.fromRecords(regionsAcademiquesXLSX);

    return regionsAcademiques;
  }
}
