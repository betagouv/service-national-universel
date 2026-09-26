import { BadRequestException } from "@nestjs/common";
import {
    validerCorpsCampagneCreation,
    validerCorpsCampagneMiseAJour,
} from "@plan-marketing/infra/api/Campagne.validation";
import { CampagneJeuneType } from "snu-lib";

const campagneGeneriqueValide = {
    nom: "Rappel J-7",
    objet: "Objet",
    templateId: 1,
    listeDiffusionId: "liste-1",
    destinataires: [],
    type: CampagneJeuneType.VOLONTAIRE,
    generic: true,
    isProgrammationActive: false,
    programmations: [],
};

describe("Campagne - validation du corps (GOO-90)", () => {
    it("rejette un champ non déclaré sur une campagne générique à la création", async () => {
        await expect(
            validerCorpsCampagneCreation({ ...campagneGeneriqueValide, role: "admin" }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it("valide une campagne générique légitime à la création", async () => {
        const dto = await validerCorpsCampagneCreation(campagneGeneriqueValide);
        expect(dto).toMatchObject({ nom: "Rappel J-7", generic: true });
    });

    it("choisit la classe spécifique-avec-référence quand campagneGeneriqueId est fourni, et la valide", async () => {
        const corpsAvecRef = {
            generic: false,
            cohortId: "cohorte-1",
            campagneGeneriqueId: "generique-1",
            isProgrammationActive: false,
            programmations: [],
        };
        await expect(
            validerCorpsCampagneCreation({ ...corpsAvecRef, role: "admin" }),
        ).rejects.toBeInstanceOf(BadRequestException);

        const dto = await validerCorpsCampagneCreation(corpsAvecRef);
        expect(dto).toMatchObject({ cohortId: "cohorte-1", campagneGeneriqueId: "generique-1" });
    });

    it("valide une mise à jour spécifique sans référence, et rejette un champ non déclaré", async () => {
        const corpsMiseAJour = { id: "campagne-1", ...campagneGeneriqueValide, generic: false, cohortId: "cohorte-1" };

        const dto = await validerCorpsCampagneMiseAJour(corpsMiseAJour);
        expect(dto).toMatchObject({ id: "campagne-1", cohortId: "cohorte-1" });

        await expect(
            validerCorpsCampagneMiseAJour({ ...corpsMiseAJour, role: "admin" }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });
});
