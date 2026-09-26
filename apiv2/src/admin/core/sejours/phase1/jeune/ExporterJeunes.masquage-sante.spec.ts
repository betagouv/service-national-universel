/**
 * Masquage des données de santé et de pièce d'identité dans l'export jeunes (PH22).
 *
 * GOO-11 (#5372) retire ces champs des réponses API v1 données aux structures d'accueil
 * (RESPONSIBLE, SUPERVISOR) via `getYoungFieldsHiddenFrom`/`omitYoungFields`. L'export v2
 * (`mapInscription`, qui ignore `selectedFields`, et `mapVolontaire`) ne les appliquait pas :
 * un responsable ou un superviseur recevait par email le handicap, le PPS/PAI, la structure
 * médico-sociale et la date de fin de validité de la pièce d'identité de chaque candidat.
 */
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { ROLES } from "snu-lib";

import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { StructureGateway } from "@admin/core/engagement/structure/Structure.gateway";
import { CandidatureGateway } from "@admin/core/engagement/candidature/Candidature.gateway";
import { SearchYoungGateway } from "@analytics/core/SearchYoung.gateway";
import { SearchSchoolGateway } from "@analytics/core/SearchSchool.gateway";
import { SearchCentreGateway } from "@analytics/core/SearchCentre.gateway";
import { SearchSejourGateway } from "@analytics/core/SearchSejour.gateway";
import { SearchLigneDeBusGateway } from "@analytics/core/SearchLigneDeBus.gateway";
import { SearchPointDeRassemblementGateway } from "@analytics/core/SearchPointDeRassemblement.gateway";
import { SearchSegmentDeLigneGateway } from "@analytics/core/SearchSegmentDeLigne.gateway";
import { SearchClasseGateway } from "@analytics/core/SearchClasse.gateway";
import { SearchEtablissementGateway } from "@analytics/core/SearchEtablissement.gateway";
import { FileGateway } from "@shared/core/File.gateway";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { CryptoGateway } from "@shared/core/Crypto.gateway";
import { NotificationGateway } from "@notification/core/Notification.gateway";

import { SejourGateway } from "../sejour/Sejour.gateway";
import { SessionGateway } from "../session/Session.gateway";
import { ExporterJeunes } from "./ExporterJeunes";
import { ExporterJeuneService } from "./ExporterJeune.service";

describe("ExporterJeunes - masquage santé / pièce d'identité (PH22)", () => {
    let exporterJeunes: ExporterJeunes;

    const jeuneSensible = () => ({
        _id: "jeune-1",
        firstName: "Jean",
        lastName: "Dupont",
        handicap: "true",
        ppsBeneficiary: "true",
        paiBeneficiary: "true",
        medicosocialStructure: "true",
        medicosocialStructureName: "IME Les Tournesols",
        specificAmenagment: "true",
        specificAmenagmentType: "Fauteuil roulant",
        reducedMobilityAccess: "true",
        handicapInSameDepartment: "true",
        allergies: "true",
        latestCNIFileExpirationDate: "2030-01-01T00:00:00.000Z",
        domains: [],
        periodRanking: [],
    });

    beforeEach(async () => {
        const mock = () => ({});
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ExporterJeunes,
                ExporterJeuneService,
                { provide: ReferentGateway, useValue: mock() },
                { provide: StructureGateway, useValue: mock() },
                { provide: SejourGateway, useValue: mock() },
                { provide: SessionGateway, useValue: mock() },
                { provide: CandidatureGateway, useValue: mock() },
                { provide: SearchYoungGateway, useValue: mock() },
                { provide: SearchSchoolGateway, useValue: mock() },
                { provide: SearchCentreGateway, useValue: mock() },
                { provide: SearchSejourGateway, useValue: mock() },
                { provide: SearchLigneDeBusGateway, useValue: mock() },
                { provide: SearchPointDeRassemblementGateway, useValue: mock() },
                { provide: SearchSegmentDeLigneGateway, useValue: mock() },
                { provide: SearchClasseGateway, useValue: mock() },
                { provide: SearchEtablissementGateway, useValue: mock() },
                { provide: FileGateway, useValue: mock() },
                { provide: ClockGateway, useValue: mock() },
                { provide: CryptoGateway, useValue: mock() },
                { provide: NotificationGateway, useValue: mock() },
                { provide: ConfigService, useValue: { get: jest.fn() } },
            ],
        }).compile();

        exporterJeunes = module.get(ExporterJeunes);
    });

    // generateRapport yield des lignes en tableau de valeurs (Object.values) : les noms de
    // colonnes viennent séparément de `columnsName`, dans le même ordre.
    const versLigne = ({ columnsName, rows }: { columnsName: string[]; rows: Generator<any[]> }): Record<string, any> => {
        const valeurs = Array.from(rows)[0] as any[];
        return Object.fromEntries(columnsName.map((nom, index) => [nom, valeurs[index]]));
    };

    it.each([[ROLES.RESPONSIBLE], [ROLES.SUPERVISOR]])(
        "masque les champs de santé et de pièce d'identité de mapInscription pour %s",
        async (role) => {
            const resultat = await exporterJeunes.generateRapport(
                [jeuneSensible() as any],
                ["identity"],
                { role } as any,
                "inscription",
            );
            const row = versLigne(resultat);

            expect(row.Handicap).toBeUndefined();
            expect(row["Bénéficiaire d'un PPS"]).toBeUndefined();
            expect(row["Bénéficiaire d'un PAI"]).toBeUndefined();
            expect(row["Nom de la structure médico-sociale"]).toBeUndefined();
            expect(row["Nature de l'aménagement spécifique"]).toBeUndefined();
            expect(row["Allergies ou intolérances alimentaires"]).toBeUndefined();
            expect(row["Date de fin de validité de la pièce d'identité"]).toBe("-");
        },
    );

    it.each([[ROLES.ADMIN], [ROLES.REFERENT_DEPARTMENT]])(
        "conserve les champs de santé et de pièce d'identité de mapInscription pour %s",
        async (role) => {
            const resultat = await exporterJeunes.generateRapport(
                [jeuneSensible() as any],
                ["identity"],
                { role } as any,
                "inscription",
            );
            const row = versLigne(resultat);

            expect(row.Handicap).toBe("Oui");
            expect(row["Nom de la structure médico-sociale"]).toBe("IME Les Tournesols");
            expect(row["Date de fin de validité de la pièce d'identité"]).not.toBe("-");
        },
    );

    it.each([[ROLES.RESPONSIBLE], [ROLES.SUPERVISOR]])(
        "masque les blocs situation et birth de mapVolontaire pour %s, même explicitement demandés",
        async (role) => {
            const resultat = await exporterJeunes.generateRapport(
                [jeuneSensible() as any],
                ["situation", "birth"],
                { role } as any,
                "volontaire",
            );
            const row = versLigne(resultat);

            expect(row.Handicap).toBeUndefined();
            expect(row["Nom de la structure médico-sociale"]).toBeUndefined();
            expect(row["Date de fin de validité de la pièce d'identité"]).toBe("-");
        },
    );

    it("conserve les blocs situation et birth de mapVolontaire pour un référent départemental", async () => {
        const resultat = await exporterJeunes.generateRapport(
            [jeuneSensible() as any],
            ["situation", "birth"],
            { role: ROLES.REFERENT_DEPARTMENT } as any,
            "volontaire",
        );
        const row = versLigne(resultat);

        expect(row.Handicap).toBe("Oui");
        expect(row["Nom de la structure médico-sociale"]).toBe("IME Les Tournesols");
    });
});
