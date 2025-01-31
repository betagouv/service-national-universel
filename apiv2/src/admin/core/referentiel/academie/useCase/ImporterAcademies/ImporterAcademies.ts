import { Inject, Injectable, Logger } from "@nestjs/common";
import { FileGateway } from "@shared/core/File.gateway";
import { UseCase } from "@shared/core/UseCase";
import { isValidDate } from "snu-lib";
import { ReferentielImportTaskParameters } from "@admin/core/referentiel/ReferentielImportTask.model";
import { AcademieImportRapport, ImportAcademieModel } from "../../Academie.model";
import { AcademieImportService } from "../../AcademieImport.service";
import { AcademieValidationError } from "./AcademieValidationError";
import { AcademieMapper } from "../../AcademieMapper";


@Injectable()
export class ImporterAcademies implements UseCase<AcademieImportRapport[]> {
  constructor(@Inject( ) private readonly academieImportService: AcademieImportService,
    @Inject(FileGateway) private readonly fileGateway: FileGateway,
    private readonly logger: Logger,
  ) {}

  async execute(params: ReferentielImportTaskParameters): Promise<AcademieImportRapport[]> { 
    const report: AcademieImportRapport[] = [];
    const academies = await this.getDataFromReferentielImportTaskParameters(params);
    for (const academie of academies) {
     try {
       this.validateAcademie(academie);
       this.academieImportService.import(academie);
       report.push({
        ...academie,
        result: "success",
       });
       this.logger.log(`Academie ${academie.code} - ${academie.libelle} imported successfully`, ImporterAcademies.name);
     } catch (error) {
       report.push({
        ...academie,
         result: "error",
         error: (error as Error)?.message,
       });
       this.logger.warn(
        `Error importing academie ${academie.code} - ${academie.libelle} : ${(error as Error)?.message}`,
        ImporterAcademies.name,
    );
     }
   }

   return report;
  }

  private validateAcademie(academie: ImportAcademieModel) {
    if (!academie.code || academie.code.length !== 3) {
      throw new AcademieValidationError('Invalid format - code');
    }

    if (!academie.libelle) {
      throw new AcademieValidationError('Invalid format - libelle');
    }

    if (!academie.regionAcademique) {
      throw new AcademieValidationError('Invalid format - regionAcademique');
    }

    if (!academie.dateCreationSI || !isValidDate(academie.dateCreationSI)) {
      throw new AcademieValidationError('Invalid format - dateCreationSI');
    }

    if (!academie.dateDerniereModificationSI || !isValidDate(academie.dateDerniereModificationSI)) {
      throw new AcademieValidationError('Invalid format - dateDerniereModificationSI');
    }
  }

  private async getDataFromReferentielImportTaskParameters(params: ReferentielImportTaskParameters) {
    const file = await this.fileGateway.downloadFile(params.fileKey);
    const academiesXLSX = await this.fileGateway.parseXLS<Record<string, string>>(file.Body, {
      defval: "",
    });

    const academies = AcademieMapper.fromRecords(academiesXLSX);

    return academies;
  }
}
