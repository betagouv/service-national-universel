import { Inject, Injectable, Logger } from "@nestjs/common";
import { FileGateway } from "@shared/core/File.gateway";
import { UseCase } from "@shared/core/UseCase";
import { isValidDate } from "snu-lib";
import { ReferentielImportTaskParameters } from "@admin/core/referentiel/ReferentielImportTask.model";
import { DepartementImportRapport, ImportDepartementModel } from "../../Departement.model";
import { DepartementImportService } from "../../DepartementImport.service";
import { DepartementValidationError } from "./DepartementValidationError";
import { DepartementMapper } from "../../DepartementMapper";

@Injectable()
export class ImporterDepartements implements UseCase<DepartementImportRapport[]> {
  constructor(@Inject( ) private readonly departementImportService: DepartementImportService,
    @Inject(FileGateway) private readonly fileGateway: FileGateway,
    private readonly logger: Logger,
  ) {}

  async execute(params: ReferentielImportTaskParameters): Promise<DepartementImportRapport[]> { 
    const report: DepartementImportRapport[] = [];
    const departements = await this.getDataFromReferentielImportTaskParameters(params);
    for (const departement of departements) {
     try {
       this.validateDepartement(departement);
       this.departementImportService.import(departement);
       report.push({
        ...departement,
        result: "success",
       });
       this.logger.log(`Departement ${departement.code} - ${departement.libelle} imported successfully`, ImporterDepartements.name);
     } catch (error) {
       report.push({
        ...departement,
         result: "error",
         error: (error as Error)?.message,
       });
       this.logger.warn(
        `Error importing regionAcademique ${departement.code} - ${departement.libelle} : ${(error as Error)?.message}`,
        ImporterDepartements.name,
    );
     }
   }

   return report;
  }

  private validateDepartement(departement: ImportDepartementModel) {
    if (!departement.code || departement.code.length !== 3) {
      throw new DepartementValidationError('Invalid format - code');
    }

    if (!departement.libelle) {
      throw new DepartementValidationError('Invalid format - libelle');
    }

    if (!departement.regionAcademique) {
      throw new DepartementValidationError('Invalid format - regionAcademique');
    }

    if (!departement.academie) {
      throw new DepartementValidationError('Invalid format - academie');
    }

    if (!departement.dateDerniereModificationSI || !isValidDate(departement.dateDerniereModificationSI)) {
      throw new DepartementValidationError('Invalid format - dateDerniereModificationSI');
    }
  }

  private async getDataFromReferentielImportTaskParameters(params: ReferentielImportTaskParameters) {
    const file = await this.fileGateway.downloadFile(params.fileKey);
    const departementsXLSX = await this.fileGateway.parseXLS<Record<string, string>>(file.Body, {
      defval: "",
    });

    const departements = DepartementMapper.fromRecords(departementsXLSX);

    return departements;
  }
}
