import { Inject, Injectable } from "@nestjs/common";
import { CreateJeuneModel, JeuneModel, JeuneWithMinimalDataModel } from "./Jeune.model";
import { JeuneGateway } from "./Jeune.gateway";
import { YOUNG_STATUS_PHASE1, YOUNG_SOURCE, YOUNG_STATUS, YOUNG_ACCOUNT_STATUS } from "snu-lib";
import { ClasseService } from "../cle/classe/Classe.service";
import { CryptoGateway } from "@shared/core/Crypto.gateway";
import { ClasseModel } from "../cle/classe/Classe.model";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

@Injectable()
export class JeuneService {
    constructor(
        @Inject(JeuneGateway)
        private readonly jeuneGateway: JeuneGateway,
        private readonly classeService: ClasseService,
        @Inject(CryptoGateway)
        private readonly cryptoGateway: CryptoGateway,
    ) {}

    async create(jeune: CreateJeuneModel): Promise<JeuneModel> {
        const jeuneCreated = await this.jeuneGateway.create(jeune);

        // On met à jour l'effectif de la classe
        if (jeuneCreated.source === YOUNG_SOURCE.CLE) {
            await this.classeService.updatePlacesPrises(jeuneCreated.classeId);
        }
        return jeuneCreated;
    }

    async update(jeune: JeuneModel): Promise<JeuneModel> {
        const jeuneUpdated = await this.jeuneGateway.update(jeune);

        // On met à jour l'effectif de la classe
        if (jeuneUpdated.source === YOUNG_SOURCE.CLE) {
            await this.classeService.updatePlacesPrises(jeuneUpdated.classeId);
        }
        return jeuneUpdated;
    }

    async findByNomPrenomDateDeNaissanceAndClasseId(
        prenom: string,
        nom: string,
        dateNaissance: Date,
        classeId: string,
    ): Promise<JeuneModel[]> {
        return this.jeuneGateway.findByNomPrenomDateDeNaissanceAndClasseId(nom, prenom, dateNaissance, classeId);
    }

    buildJeuneCleWithMinimalData(jeune: JeuneWithMinimalDataModel, classe: ClasseModel): CreateJeuneModel {
        return {
            nom: jeune.nom,
            prenom: jeune.prenom,
            dateNaissance: jeune.dateNaissance,
            genre: jeune.genre,
            statut: YOUNG_STATUS.IN_PROGRESS,
            statutPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
            email: `${jeune.prenom}.${jeune.nom}@localhost-${this.cryptoGateway.getUuid().slice(0, 6)}.fr`
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
            statutCompte: YOUNG_ACCOUNT_STATUS.PRECOMPTE,
            adresse: "fake address",
            ville: "fake city",
            villeNaissance: "fake city",
            codePostalNaissance: "fake code postal",
            paysNaissance: "fake country",
            pays: "fake country",
            telephone: "0600000000",
            codePostal: "fake code postal",
        };
    }

    async existsByPersonalIdentifiers(
        jeune: JeuneModel | JeuneWithMinimalDataModel,
        classeId?: string,
    ): Promise<boolean> {
        if (!jeune.nom || !jeune.prenom || !jeune.dateNaissance) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_ENOUGH_DATA,
                "Jeune missing data to check if it exists",
            );
        }
        const jeunesInClasse = await this.jeuneGateway.findByNomPrenomDateDeNaissanceAndClasseId(
            jeune.nom,
            jeune.prenom,
            jeune.dateNaissance,
            classeId,
        );
        return jeunesInClasse.length > 0;
    }
}
