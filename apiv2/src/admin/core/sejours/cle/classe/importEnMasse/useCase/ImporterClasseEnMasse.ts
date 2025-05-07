import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";
import { CreateJeuneModel } from "@admin/core/sejours/jeune/Jeune.model";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { CryptoGateway } from "@shared/core/Crypto.gateway";
import { FileGateway } from "@shared/core/File.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { UseCase } from "@shared/core/UseCase";
import { CLASSE_IMPORT_EN_MASSE_COLUMNS, YOUNG_SOURCE, YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import { ClasseService } from "../../Classe.service";
import { ImportClasseEnMasseTaskParameters } from "../ClasseImportEnMasse.model";

@Injectable()
export class ImporterClasseEnMasse implements UseCase<void> {
    private readonly logger: Logger = new Logger(ImporterClasseEnMasse.name);
    constructor(
        private readonly classeService: ClasseService,
        @Inject(JeuneGateway)
        private readonly jeuneGateway: JeuneGateway,
        @Inject(FileGateway)
        private readonly fileGateway: FileGateway,
        @Inject(ClockGateway)
        private readonly clockGateway: ClockGateway,
        @Inject(CryptoGateway)
        private readonly cryptoGateway: CryptoGateway,
    ) {}
    async execute(parameters: ImportClasseEnMasseTaskParameters | undefined): Promise<void> {
        this.logger.log(
            `ImporterClasseEnMasse pour la classeId: ${parameters?.classeId}, fichierKey: ${parameters?.fileKey}`,
        );
        if (!parameters) {
            throw new FunctionalException(FunctionalExceptionCode.IMPORT_NOT_VALID);
        }
        const classe = await this.classeService.findById(parameters.classeId);
        const file = await this.fileGateway.downloadFile(parameters.fileKey);
        if (!file) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        let jeunes = await this.fileGateway.parseXLS<Record<CLASSE_IMPORT_EN_MASSE_COLUMNS, any>>(file.Body, {
            sheetIndex: 0,
        });
        if (parameters.mapping) {
            this.logger.log(`Mapping des champs: ${JSON.stringify(parameters.mapping)}`);
            const jeunesNotMapped = await this.fileGateway.parseXLS<Record<string, string>>(file.Body, {
                sheetIndex: 0,
            });
            jeunes = this.mapJeunes(jeunesNotMapped, parameters.mapping);
        }

        for (const jeune of jeunes) {
            const dateNaissance = this.clockGateway.parseDateNaissance(
                jeune[CLASSE_IMPORT_EN_MASSE_COLUMNS.DATE_DE_NAISSANCE],
            );
            const jeuneToCreate: CreateJeuneModel = {
                nom: jeune[CLASSE_IMPORT_EN_MASSE_COLUMNS.NOM],
                prenom: jeune[CLASSE_IMPORT_EN_MASSE_COLUMNS.PRENOM],
                dateNaissance: dateNaissance,
                genre: jeune[CLASSE_IMPORT_EN_MASSE_COLUMNS.GENRE],
                statut: YOUNG_STATUS.IN_PROGRESS,
                statutPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
                email: `${jeune[CLASSE_IMPORT_EN_MASSE_COLUMNS.PRENOM]}.${
                    jeune[CLASSE_IMPORT_EN_MASSE_COLUMNS.NOM]
                }@localhost-${this.cryptoGateway.getUuid().slice(0, 6)}`
                    .toLowerCase()
                    .replace(/\s/g, ""),
                sessionId: classe.sessionId,
                sessionNom: classe.sessionNom,
                youngPhase1Agreement: "true",
                classeId: classe.id,
                etablissementId: classe.etablissementId,
                scolarise: "true",
                psh: "false",
                departement: classe.departement,
                region: classe.region,
                consentement: "true",
                acceptCGU: "true",
                parentAllowSNU: "true",
                parent1AllowSNU: "true",
                parent1AllowImageRights: "true",
                imageRight: "true",
                source: YOUNG_SOURCE.CLE,
            };
            this.logger.log(`Création du jeune: ${jeuneToCreate.prenom} ${jeuneToCreate.nom} ${dateNaissance}`);
            const jeuneCreated = await this.jeuneGateway.create(jeuneToCreate);

            // TODO : passer statut à validated pour la data
            await this.jeuneGateway.update({
                ...jeuneCreated,
                statut: YOUNG_STATUS.VALIDATED,
            });
        }
    }

    private mapJeunes(
        jeunes: Record<string, string>[],
        mapping: Record<CLASSE_IMPORT_EN_MASSE_COLUMNS, string>,
    ): Record<CLASSE_IMPORT_EN_MASSE_COLUMNS, string>[] {
        return jeunes.map((jeune) => {
            return {
                [CLASSE_IMPORT_EN_MASSE_COLUMNS.NOM]: jeune[mapping[CLASSE_IMPORT_EN_MASSE_COLUMNS.NOM]],
                [CLASSE_IMPORT_EN_MASSE_COLUMNS.PRENOM]: jeune[mapping[CLASSE_IMPORT_EN_MASSE_COLUMNS.PRENOM]],
                [CLASSE_IMPORT_EN_MASSE_COLUMNS.DATE_DE_NAISSANCE]:
                    jeune[mapping[CLASSE_IMPORT_EN_MASSE_COLUMNS.DATE_DE_NAISSANCE]],
                [CLASSE_IMPORT_EN_MASSE_COLUMNS.GENRE]: jeune[mapping[CLASSE_IMPORT_EN_MASSE_COLUMNS.GENRE]],
                [CLASSE_IMPORT_EN_MASSE_COLUMNS.UAI]: jeune[mapping[CLASSE_IMPORT_EN_MASSE_COLUMNS.UAI]],
            };
        });
    }
}
