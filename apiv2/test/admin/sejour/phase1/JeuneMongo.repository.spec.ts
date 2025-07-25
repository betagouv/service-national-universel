import mongoose from "mongoose";

import { createJeune } from "./helper/JeuneHelper";
import { setupAdminTest } from "../../setUpAdminTest";
import { INestApplication } from "@nestjs/common";
import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";
import { GRADES, YOUNG_STATUS } from "snu-lib";
import { createSession } from "./helper/SessionHelper";

describe("JeuneGateway", () => {
    let jeuneGateway: JeuneGateway;
    let app: INestApplication;

    beforeAll(async () => {
        const appSetup = await setupAdminTest();
        app = appSetup.app;
        const module = appSetup.adminTestModule;
        jeuneGateway = module.get<JeuneGateway>(JeuneGateway);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
        mongoose.disconnect();
    });

    it("should be defined", () => {
        expect(jeuneGateway).toBeDefined();
    });

    describe("findBySessionIdStatutNiveauScolairesAndDepartementsCible", () => {
        it("prise en compte des département cible des jeunes", async () => {
            const session = await createSession();
            // scolarisé dans sa zone de résidence
            await createJeune({
                statut: YOUNG_STATUS.VALIDATED,
                sessionId: session.id,
                sessionNom: session.nom,
                departement: "Loire-Atlantique",
                departementScolarite: "Loire-Atlantique",
            });
            // non scolarisé
            await createJeune({
                statut: YOUNG_STATUS.VALIDATED,
                sessionId: session.id,
                sessionNom: session.nom,
                departement: "Loire-Atlantique",
                departementScolarite: undefined,
            });
            // HZR
            await createJeune({
                statut: YOUNG_STATUS.VALIDATED,
                sessionId: session.id,
                sessionNom: session.nom,
                departement: "Maine-et-Loire",
                departementScolarite: "Loire-Atlantique",
            });
            // etranger
            await createJeune({
                statut: YOUNG_STATUS.VALIDATED,
                sessionId: session.id,
                sessionNom: session.nom,
                departement: "Loire-Atlantique",
                departementScolarite: "N/A",
                paysScolarite: "ESPAGNE",
            });
            // jeune hors departement
            await createJeune({
                statut: YOUNG_STATUS.VALIDATED,
                sessionId: session.id,
                sessionNom: session.nom,
                departement: "Alpes-Maritimes",
                departementScolarite: "Alpes-Maritimes",
                paysScolarite: "FRANCE",
            });

            const result = await jeuneGateway.findBySessionIdStatutNiveauScolairesAndDepartementsCible(
                session.id,
                YOUNG_STATUS.VALIDATED,
                Object.values(GRADES),
                ["Loire-Atlantique"],
            );

            expect(result.length).toBe(4);
        });
    });

    describe("findByNomPrenomDateDeNaissanceAndClasseId", () => {
        it("should find a jeune by nom, prenom, date de naissance", async () => {
            const session = await createSession();
            const jeune1 = await createJeune({
                prenom: "Émilie",
                nom: "Dupont",
                dateNaissance: new Date("2005-01-15"),
                statut: YOUNG_STATUS.VALIDATED,
                sessionId: session.id,
                sessionNom: session.nom,
            });
            await createJeune({
                prenom: "EMILIE",
                nom: "DUPONT",
                dateNaissance: new Date("2005-01-15"),
                statut: YOUNG_STATUS.VALIDATED,
                sessionId: session.id,
                sessionNom: session.nom,
            });

            const prenom = "emilie";
            const result = await jeuneGateway.findByNomPrenomDateDeNaissanceAndClasseId(
                jeune1.nom!,
                prenom,
                jeune1.dateNaissance!,
            );

            expect(result).toBeDefined();
            expect(result.length).toBe(2);
        });

        it("should find a jeune by nom, prenom, date de naissance and classe id", async () => {
            const session = await createSession();
            const jeune1 = await createJeune({
                prenom: "Émilie",
                nom: "Dupont",
                dateNaissance: new Date("2005-01-15"),
                statut: YOUNG_STATUS.VALIDATED,
                sessionId: session.id,
                sessionNom: session.nom,
                classeId: "classe-id-1",
            });
            await createJeune({
                prenom: "EMILIE",
                nom: "DUPONT",
                dateNaissance: new Date("2005-01-15"),
                statut: YOUNG_STATUS.VALIDATED,
                sessionId: session.id,
                sessionNom: session.nom,
                classeId: "classe-id-2",
            });

            const prenom = "emilie";
            const result = await jeuneGateway.findByNomPrenomDateDeNaissanceAndClasseId(
                jeune1.nom!,
                prenom,
                jeune1.dateNaissance!,
                "classe-id-1",
            );

            expect(result).toBeDefined();
            expect(result.length).toBe(1);
        });
    });
});
