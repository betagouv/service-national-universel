import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";
import { CreateJeuneModel, JeuneGenre, JeuneWithMinimalDataModel } from "@admin/core/sejours/jeune/Jeune.model";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { CryptoGateway } from "@shared/core/Crypto.gateway";
import { FileGateway } from "@shared/core/File.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { UseCase } from "@shared/core/UseCase";
import { CLASSE_IMPORT_EN_MASSE_COLUMNS, YOUNG_STATUS } from "snu-lib";
import { ClasseService } from "../../Classe.service";
import { ImportClasseEnMasseTaskParameters } from "../ClasseImportEnMasse.model";
import { JeuneService } from "@admin/core/sejours/jeune/Jeune.service";

@Injectable()
export class ImporterClasseEnMasse implements UseCase<void> {
    private readonly logger: Logger = new Logger(ImporterClasseEnMasse.name);
    constructor(
        private readonly classeService: ClasseService,
        @Inject(FileGateway)
        private readonly fileGateway: FileGateway,
        @Inject(ClockGateway)
        private readonly clockGateway: ClockGateway,
        @Inject(CryptoGateway)
        private readonly cryptoGateway: CryptoGateway,
        private readonly jeuneService: JeuneService,
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
            let genre = JeuneGenre.FEMALE;
            if (jeune[CLASSE_IMPORT_EN_MASSE_COLUMNS.GENRE] === "M") {
                genre = JeuneGenre.MALE;
            }
            const jeuneWithMinimalData: JeuneWithMinimalDataModel = {
                prenom: jeune[CLASSE_IMPORT_EN_MASSE_COLUMNS.PRENOM],
                nom: jeune[CLASSE_IMPORT_EN_MASSE_COLUMNS.NOM],
                dateNaissance: dateNaissance,
                genre: genre,
            };
            const jeuneToCreate: CreateJeuneModel = this.jeuneService.buildJeuneCleWithMinimalData(
                jeuneWithMinimalData,
                classe,
            );

            this.logger.log(`Création du jeune: ${jeuneToCreate.prenom} ${jeuneToCreate.nom} ${dateNaissance}`);
            const jeuneCreated = await this.jeuneService.create(jeuneToCreate);

            // TODO : passer statut à validated pour la data
            await this.jeuneService.update({
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
