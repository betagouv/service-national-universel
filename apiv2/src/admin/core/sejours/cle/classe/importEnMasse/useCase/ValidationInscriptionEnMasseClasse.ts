import { ClasseGateway } from "@admin/core/sejours/cle/classe/Classe.gateway";

import { Inject, Injectable, Logger } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { UseCase } from "@shared/core/UseCase";
import { FileGateway } from "@shared/core/File.gateway";
import {
    CLASSE_IMPORT_EN_MASSE_COLUMNS,
    CLASSE_IMPORT_EN_MASSE_ERRORS,
    IMPORT_REQUIRED_COLUMN,
    ClasseImportEnMasseValidationDto,
    STATUS_CLASSE,
} from "snu-lib";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { ClasseModel } from "../../Classe.model";
import { EtablissementGateway } from "../../../etablissement/Etablissement.gateway";
import { EtablissementModel } from "../../../etablissement/Etablissement.model";
import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";

@Injectable()
export class ValidationInscriptionEnMasseClasse implements UseCase<ClasseImportEnMasseValidationDto> {
    constructor(
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        @Inject(EtablissementGateway) private readonly etablissementGateway: EtablissementGateway,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
        private readonly logger: Logger,
    ) {}
    async execute(
        classeId: string,
        mapping: Record<string, string> | null,
        file: { fileName: string; buffer: Buffer; mimetype: string },
    ): Promise<ClasseImportEnMasseValidationDto> {
        const classe = await this.classeGateway.findById(classeId);
        if (!classe) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND, "Classe non trouvée");
        }
        if (classe.statut !== STATUS_CLASSE.OPEN) {
            throw new FunctionalException(
                FunctionalExceptionCode.CLASSE_STATUT_INVALIDE_IMPORT_EN_MASSE,
                "La classe n'est pas ouverte",
            );
        }
        const etablissement = await this.etablissementGateway.findById(classe.etablissementId);
        if (!etablissement) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND, "Etablissement non trouvé");
        }
        let dataToImport = await this.fileGateway.parseXLS<Record<string, string>>(file.buffer, {
            defval: "",
        });

        this.logger.log("Nombre de jeunes à inscrire", dataToImport.length);

        if (dataToImport.length === 0) {
            return {
                isValid: false,
                validRowsCount: 0,
                errors: [{ code: CLASSE_IMPORT_EN_MASSE_ERRORS.EMPTY_FILE }],
            };
        }

        if (dataToImport.length > 100) {
            return {
                isValid: false,
                validRowsCount: 0,
                errors: [{ code: CLASSE_IMPORT_EN_MASSE_ERRORS.TOO_MANY_JEUNES }],
            };
        }

        if (mapping) {
            dataToImport = dataToImport.map((row) =>
                Object.keys(IMPORT_REQUIRED_COLUMN)
                    .map((column) => ({
                        [column]: mapping[column] ? row[mapping[column]] : row[column],
                    }))
                    .reduce((acc, curr) => ({ ...acc, ...curr }), {}),
            );
        }

        const errorsFormat = await this.validateFormat(dataToImport);
        const errorsCoherence = await this.validateCoherence(dataToImport, classe, etablissement, errorsFormat);

        const errors = [...errorsFormat, ...errorsCoherence];
        const isValid = errors.length === 0;

        let fileKey: string | undefined = undefined;
        if (isValid) {
            // Save file to s3
            const timestamp = this.clockGateway.formatSafeDateTime(this.clockGateway.now({ timeZone: "Europe/Paris" }));
            const fileName = `inscription_en_masse_${classeId}_${timestamp}.xlsx`;
            const fileS3 = await this.fileGateway.uploadFile(
                `file/admin/sejours/cle/classe/${classeId}/inscription-en-masse/${fileName}`,
                {
                    data: file.buffer,
                    mimetype: file.mimetype,
                },
            );
            fileKey = fileS3.Key;
        }

        return {
            isValid,
            validRowsCount: this.countValidRows(dataToImport, errors),
            errors,
            fileKey,
        };
    }

    async validateFormat(dataToImport: Record<string, string>[]) {
        const errors: ClasseImportEnMasseValidationDto["errors"] = [];

        for (const columnName of Object.keys(IMPORT_REQUIRED_COLUMN)) {
            const column = IMPORT_REQUIRED_COLUMN[columnName];
            if (!dataToImport[0].hasOwnProperty(columnName)) {
                if (column.required) {
                    errors.push({
                        column: columnName,
                        code: CLASSE_IMPORT_EN_MASSE_ERRORS.MISSING_COLUMN,
                    });
                }
            } else {
                for (const [index, row] of dataToImport.entries()) {
                    const rowValue = row[columnName];
                    const line = index + 2;
                    if (column.required && !rowValue) {
                        errors.push({
                            column: columnName,
                            code: CLASSE_IMPORT_EN_MASSE_ERRORS.REQUIRED_COLUMN,
                            line,
                        });
                        continue;
                    }
                    switch (column.type) {
                        case "string":
                            if (column.minLength && rowValue && String(rowValue).length < column.minLength) {
                                errors.push({
                                    column: columnName,
                                    code: CLASSE_IMPORT_EN_MASSE_ERRORS.INVALID_FORMAT,
                                    message: `minLength ${column.minLength}`,
                                    line,
                                });
                            }
                            if (column.maxLength && rowValue && String(rowValue).length > column.maxLength) {
                                errors.push({
                                    column: columnName,
                                    code: CLASSE_IMPORT_EN_MASSE_ERRORS.INVALID_FORMAT,
                                    message: `maxLength ${column.maxLength}`,
                                    line,
                                });
                            }
                            break;
                        case "date":
                            if (!this.clockGateway.isValidDateFormat(rowValue, column.format!)) {
                                errors.push({
                                    column: columnName,
                                    code: CLASSE_IMPORT_EN_MASSE_ERRORS.INVALID_FORMAT,
                                    message: `format ${column.format}`,
                                    line,
                                });
                            }
                            break;
                        case "value":
                            if (!column.values?.includes(rowValue)) {
                                errors.push({
                                    column: columnName,
                                    code: CLASSE_IMPORT_EN_MASSE_ERRORS.INVALID_FORMAT,
                                    message: `allowed values ${column.values?.join(", ")}`,
                                    line,
                                });
                            }
                            break;
                    }
                }
            }
        }

        return errors;
    }

    async validateCoherence(
        dataToImport: Record<string, string>[],
        classe: ClasseModel,
        etablissement: EtablissementModel,
        errorsFormat: ClasseImportEnMasseValidationDto["errors"],
    ) {
        const errors: ClasseImportEnMasseValidationDto["errors"] = [];
        for (const [index, row] of dataToImport.entries()) {
            const line = index + 2;
            const hasError = this.hasErrors(errorsFormat, line);
            if (!hasError) {
                // check etablissement
                if (
                    row[CLASSE_IMPORT_EN_MASSE_COLUMNS.UAI] &&
                    row[CLASSE_IMPORT_EN_MASSE_COLUMNS.UAI] !== etablissement.uai
                ) {
                    errors.push({
                        column: CLASSE_IMPORT_EN_MASSE_COLUMNS.UAI,
                        code: CLASSE_IMPORT_EN_MASSE_ERRORS.UAI_NOT_MATCH,
                        message: `L’UAI renseigné ne correspond pas à l’établissement associé à cette classe. Merci de vérifier que le fichier correspond bien à cette classe.`,
                        line,
                    });
                }
                // check doublons
                const jeune = await this.jeuneGateway.findByNomPrenomDateDeNaissanceAndClasseId(
                    row[CLASSE_IMPORT_EN_MASSE_COLUMNS.NOM],
                    row[CLASSE_IMPORT_EN_MASSE_COLUMNS.PRENOM],
                    this.clockGateway.parseDateNaissance(row[CLASSE_IMPORT_EN_MASSE_COLUMNS.DATE_DE_NAISSANCE]),
                    classe.id,
                );
                if (jeune) {
                    errors.push({
                        column: CLASSE_IMPORT_EN_MASSE_COLUMNS.NOM,
                        code: CLASSE_IMPORT_EN_MASSE_ERRORS.ALREADY_EXIST,
                        message: `Le jeune ${row[CLASSE_IMPORT_EN_MASSE_COLUMNS.NOM]} ${
                            row[CLASSE_IMPORT_EN_MASSE_COLUMNS.PRENOM]
                        } existe déjà dans la classe.`,
                        line,
                    });
                }
            }
        }
        return errors;
    }

    countValidRows(dataToImport: Record<string, string>[], errorsFormat: ClasseImportEnMasseValidationDto["errors"]) {
        let count = 0;
        for (const [index] of dataToImport.entries()) {
            const line = index + 2;
            const hasError = this.hasErrors(errorsFormat, line);
            if (!hasError) {
                count++;
            }
        }
        return count;
    }

    hasErrors(errorsFormat: ClasseImportEnMasseValidationDto["errors"], line: number) {
        return errorsFormat.find((error) => !error.line || error.line === line);
    }
}
