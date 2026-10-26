/**
 * Rattrapage du marqueur `proposalNotAccepted` sur les candidatures REFUSED / CANCEL qui existaient avant
 * lui : le hook du modèle ne le pose qu'à la sauvegarde d'un changement de statut, donc jamais sur une
 * ligne déjà sortie de WAITING_ACCEPTATION.
 *
 * Une candidature est rattrapée quand son historique de statuts (`application_patches`) commence par
 * WAITING_ACCEPTATION, ne passe par aucun statut d'engagement (acceptation du volontaire, validation) et
 * aboutit au statut courant.
 */
import mongoose, { Types } from "mongoose";

import { APPLICATION_STATUS } from "snu-lib";

import { ApplicationModel } from "../../models";
import { dbConnect, dbClose } from "../helpers/db";
import { insertLegacyApplication, newLegacyFields } from "../helpers/legacyApplication";

// La migration est un module CommonJS { up, down }.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const migration = require("../../../migrations/20261005120000-rattrapage-propositions-non-acceptees");

const { WAITING_ACCEPTATION, WAITING_VALIDATION, WAITING_VERIFICATION, VALIDATED, IN_PROGRESS, DONE, REFUSED, CANCEL } = APPLICATION_STATUS;

beforeAll(async () => await dbConnect(__filename.slice(__dirname.length + 1, -3)));
afterAll(dbClose);
beforeEach(async () => {
  await ApplicationModel.collection.deleteMany({});
  await mongoose.connection.db.collection("application_patches").deleteMany({});
});

const raw = (id: Types.ObjectId) => ApplicationModel.collection.findOne({ _id: id });
const marker = async (id: Types.ObjectId) => (await raw(id))?.proposalNotAccepted;

describe("Migration rattrapage des propositions non acceptées", () => {
  describe("candidatures rattrapées", () => {
    it.each([REFUSED, CANCEL])("pose le marqueur sur une proposition sortie en %s sans jamais avoir été acceptée", async (statut) => {
      const application = await insertLegacyApplication(newLegacyFields(), [WAITING_ACCEPTATION, statut]);

      await migration.up();

      expect(await marker(application._id)).toBe(true);
      expect((await raw(application._id))!.status).toBe(statut);
    });

    it("pose le marqueur quand la proposition a été refusée puis annulée", async () => {
      const application = await insertLegacyApplication(newLegacyFields(), [WAITING_ACCEPTATION, REFUSED, CANCEL]);

      await migration.up();

      expect(await marker(application._id)).toBe(true);
    });

    it("pose le marqueur quand le patch de création manque : le premier statut se lit dans la valeur d'origine du premier changement", async () => {
      const application = await insertLegacyApplication(newLegacyFields(), [WAITING_ACCEPTATION, REFUSED], { creationPatch: false });

      await migration.up();

      expect(await marker(application._id)).toBe(true);
    });

    it("lit l'historique par date, pas par ordre d'insertion", async () => {
      const application = await insertLegacyApplication(newLegacyFields(), [WAITING_ACCEPTATION, REFUSED, CANCEL], { reverseInsertion: true });

      await migration.up();

      expect(await marker(application._id)).toBe(true);
    });
  });

  describe("candidatures laissées en l'état", () => {
    it.each([REFUSED, CANCEL])("ne touche pas une candidature du volontaire lui-même, %s depuis WAITING_VALIDATION", async (statut) => {
      const application = await insertLegacyApplication(newLegacyFields(), [WAITING_VALIDATION, statut]);

      await migration.up();

      expect(await marker(application._id)).toBeUndefined();
    });

    it.each([WAITING_VALIDATION, WAITING_VERIFICATION, VALIDATED, IN_PROGRESS, DONE])(
      "ne touche pas une proposition que le volontaire a acceptée ou qu'un référent a engagée (passage par %s)",
      async (engage) => {
        const application = await insertLegacyApplication(newLegacyFields(), [WAITING_ACCEPTATION, engage, REFUSED]);

        await migration.up();

        expect(await marker(application._id)).toBeUndefined();
      },
    );

    it("ne touche pas une candidature dont l'historique saute un statut d'engagement (valeur d'origine d'un changement)", async () => {
      // Le patch de la sortie annonce WAITING_VALIDATION comme statut d'origine alors que l'historique n'y est jamais passé.
      const fields = newLegacyFields();
      const application = await insertLegacyApplication(fields, [WAITING_ACCEPTATION, REFUSED]);
      await mongoose.connection.db
        .collection("application_patches")
        .updateOne({ ref: application._id, "ops.value": REFUSED }, { $set: { "ops.0.originalValue": WAITING_VALIDATION } });

      await migration.up();

      expect(await marker(application._id)).toBeUndefined();
    });

    it.each([REFUSED, CANCEL])("ne touche pas une candidature créée directement en %s : son historique ne commence pas par une proposition", async (statut) => {
      const application = await insertLegacyApplication(newLegacyFields(), [statut]);
      const autre = await insertLegacyApplication(newLegacyFields(), [CANCEL, REFUSED]);

      await migration.up();

      expect(await marker(application._id)).toBeUndefined();
      expect(await marker(autre._id)).toBeUndefined();
    });

    it("ne touche pas une candidature sans historique", async () => {
      const application = await insertLegacyApplication(newLegacyFields(), [REFUSED], { creationPatch: false });

      await migration.up();

      expect(await marker(application._id)).toBeUndefined();
    });

    it("ne touche pas une candidature dont l'historique n'aboutit pas au statut courant", async () => {
      const application = await insertLegacyApplication(newLegacyFields(), [WAITING_ACCEPTATION], { creationPatch: true });
      await ApplicationModel.collection.updateOne({ _id: application._id }, { $set: { status: REFUSED } });

      await migration.up();

      expect(await marker(application._id)).toBeUndefined();
    });

    it.each([WAITING_ACCEPTATION, WAITING_VALIDATION, VALIDATED, IN_PROGRESS, DONE])("ne change ni le statut ni le marqueur d'une candidature %s", async (statut) => {
      const history = statut === WAITING_ACCEPTATION ? [WAITING_ACCEPTATION] : [WAITING_ACCEPTATION, REFUSED, statut];
      const application = await insertLegacyApplication(newLegacyFields(), history);

      await migration.up();

      const apres = await raw(application._id);
      expect(apres!.status).toBe(statut);
      expect(apres!.proposalNotAccepted).toBeUndefined();
    });

    it("ne réécrit pas une candidature déjà marquée", async () => {
      const application = await insertLegacyApplication({ ...newLegacyFields(), proposalNotAccepted: true }, [WAITING_ACCEPTATION, REFUSED]);
      const avant = (await raw(application._id))!.updatedAt;

      await migration.up();

      const apres = await raw(application._id);
      expect(apres!.proposalNotAccepted).toBe(true);
      expect(apres!.updatedAt).toEqual(avant);
    });
  });

  describe("exécution", () => {
    it("est rejouable : un second passage ne réécrit rien", async () => {
      const application = await insertLegacyApplication(newLegacyFields(), [WAITING_ACCEPTATION, REFUSED]);

      await migration.up();
      const premier = await raw(application._id);
      await new Promise((resolve) => setTimeout(resolve, 20));
      await migration.up();
      const second = await raw(application._id);

      expect(second!.proposalNotAccepted).toBe(true);
      expect(second!.updatedAt).toEqual(premier!.updatedAt);
    });

    it("traite toutes les candidatures quand elles dépassent la taille d'un lot, sans toucher aux autres", async () => {
      const visees: Types.ObjectId[] = [];
      const ignorees: Types.ObjectId[] = [];
      for (let i = 0; i < 7; i++) {
        visees.push((await insertLegacyApplication(newLegacyFields(), [WAITING_ACCEPTATION, i % 2 ? REFUSED : CANCEL]))._id);
        if (i % 2) ignorees.push((await insertLegacyApplication(newLegacyFields(), [WAITING_VALIDATION, REFUSED]))._id);
      }

      await migration.rattraper({ batchSize: 2 });

      for (const id of visees) expect(await marker(id)).toBe(true);
      for (const id of ignorees) expect(await marker(id)).toBeUndefined();
    });

    it("signale l'écriture au flux de modifications : la date de mise à jour avance", async () => {
      const application = await insertLegacyApplication(newLegacyFields(), [WAITING_ACCEPTATION, REFUSED]);
      const avant = (await raw(application._id))!.updatedAt as Date;
      await new Promise((resolve) => setTimeout(resolve, 20));

      await migration.up();

      expect(((await raw(application._id))!.updatedAt as Date).getTime()).toBeGreaterThan(avant.getTime());
    });

    it("down() ne retire pas le marqueur", async () => {
      const application = await insertLegacyApplication(newLegacyFields(), [WAITING_ACCEPTATION, REFUSED]);
      await migration.up();

      await migration.down();

      expect(await marker(application._id)).toBe(true);
    });
  });
});
