import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";
import { CreateJeuneModel, JeuneGenre, JeuneWithMinimalDataModel } from "@admin/core/sejours/jeune/Jeune.model";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { CryptoGateway } from "@shared/core/Crypto.gateway";
import { FileGateway } from "@shared/core/File.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { UseCase } from "@shared/core/UseCase";
import { CLASSE_IMPORT_EN_MASSE_COLUMNS, YOUNG_STATUS } from "snu-lib";
import { ImportClasseEnMasseTaskParameters, isInscriptionEnMasseFileKeyOfClasse } from "../ClasseImportEnMasse.model";
import { JeuneService } from "@admin/core/sejours/jeune/Jeune.service";
import { ValidationInscriptionEnMasseClasse } from "./ValidationInscriptionEnMasseClasse";

@Injectable()
export class ImporterClasseEnMasse implements UseCase<void> {
    private readonly logger: Logger = new Logger(ImporterClasseEnMasse.name);
    constructor(
        @Inject(FileGateway)
        private readonly fileGateway: FileGateway,
        @Inject(ClockGateway)
        private readonly clockGateway: ClockGateway,
        @Inject(CryptoGateway)
        private readonly cryptoGateway: CryptoGateway,
        private readonly jeuneService: JeuneService,
        private readonly validationInscriptionEnMasseClasse: ValidationInscriptionEnMasseClasse,
    ) {}
    async execute(parameters: ImportClasseEnMasseTaskParameters | undefined): Promise<void> {
        this.logger.log(
            `ImporterClasseEnMasse pour la classeId: ${parameters?.classeId}, fichierKey: ${parameters?.fileKey}`,
        );
        if (!parameters) {
            throw new FunctionalException(FunctionalExceptionCode.IMPORT_NOT_VALID);
        }
        // La clé doit désigner un fichier validé pour cette classe : un fichier validé pour une
        // autre classe ne peut pas être importé ici.
        if (!isInscriptionEnMasseFileKeyOfClasse(parameters.fileKey, parameters.classeId)) {
            throw new FunctionalException(FunctionalExceptionCode.IMPORT_NOT_VALID, "fichier non rattaché à la classe");
        }
        const file = await this.fileGateway.downloadFile(parameters.fileKey);
        if (!file) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        // Les règles de la validation (statut de la classe, capacité, doublons, jeunes déjà inscrits)
        // sont rejouées sur le fichier au moment de l'import.
        const { classe, dataToImport, errors } = await this.validationInscriptionEnMasseClasse.validerFichier(
            parameters.classeId,
            parameters.mapping,
            file.Body,
        );
        if (errors.length > 0) {
            this.logger.warn(`Import refusé pour la classe ${parameters.classeId}: ${errors.length} erreur(s)`);
            throw new FunctionalException(FunctionalExceptionCode.IMPORT_NOT_VALID, JSON.stringify(errors));
        }
        const jeunes = dataToImport as Record<CLASSE_IMPORT_EN_MASSE_COLUMNS, any>[];

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
}
