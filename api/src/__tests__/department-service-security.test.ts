import request from "supertest";
import { Types } from "mongoose";
const { ObjectId } = Types;
import { ROLES } from "snu-lib";

import getAppHelper, { resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { DepartmentServiceModel } from "../models";

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);
afterEach(resetAppAuth);
beforeEach(async () => {
  await DepartmentServiceModel.deleteMany({});
});

const DEP_ATTAQUANT = "Ain";
const REGION_ATTAQUANT = "Auvergne-Rhône-Alpes";
const DEP_CIBLE = "Nord";
const REGION_CIBLE = "Hauts-de-France";

/** Référent départemental d'un autre département que celui du service visé. */
const referentHorsPerimetre = () => ({ role: ROLES.REFERENT_DEPARTMENT, department: [DEP_ATTAQUANT], region: REGION_ATTAQUANT });
/** Référent départemental du département du service visé. */
const referentDuPerimetre = () => ({ role: ROLES.REFERENT_DEPARTMENT, department: [DEP_CIBLE], region: REGION_CIBLE });
/** Référent régional d'une autre région que celle du service visé. */
const referentRegionHorsPerimetre = () => ({ role: ROLES.REFERENT_REGION, department: [DEP_ATTAQUANT], region: REGION_ATTAQUANT });
/** Référent régional de la région du service visé. */
const referentRegionDuPerimetre = () => ({ role: ROLES.REFERENT_REGION, department: [DEP_CIBLE], region: REGION_CIBLE });
const admin = () => ({ role: ROLES.ADMIN, department: [DEP_ATTAQUANT], region: REGION_ATTAQUANT });

async function createServiceCible(overrides: Record<string, any> = {}) {
  return await DepartmentServiceModel.create({
    department: DEP_CIBLE,
    region: REGION_CIBLE,
    directionName: "Direction du Nord",
    address: "1 rue du Nord",
    contacts: [{ cohort: "Juillet 2024", contactName: "Contact légitime", contactMail: "legitime@example.org", contactPhone: "0600000000" }],
    representantEtat: { firstName: "Jean", lastName: "Légitime", mobile: "0600000000", email: "jean.legitime@example.org", role: "Préfet" },
    ...overrides,
  });
}

describe("Périmètre géographique des services départementaux (M14)", () => {
  describe("POST /department-service", () => {
    it("refuse à un référent départemental d'écraser le service d'un autre département", async () => {
      const service = await createServiceCible();

      const res = await request(getAppHelper(referentHorsPerimetre()))
        .post("/department-service")
        .send({ department: DEP_CIBLE, region: REGION_CIBLE, address: "Adresse pirate", directionName: "Direction pirate" });

      expect(res.statusCode).toEqual(403);
      const apres = await DepartmentServiceModel.findById(service._id);
      expect(apres?.address).toEqual("1 rue du Nord");
      expect(apres?.directionName).toEqual("Direction du Nord");
    });

    it("refuse à un référent départemental de créer le service d'un autre département", async () => {
      const res = await request(getAppHelper(referentHorsPerimetre())).post("/department-service").send({ department: DEP_CIBLE, region: REGION_CIBLE, address: "Adresse pirate" });

      expect(res.statusCode).toEqual(403);
      expect(await DepartmentServiceModel.countDocuments({ department: DEP_CIBLE })).toEqual(0);
    });

    it("refuse à un référent régional d'écraser le service d'une autre région", async () => {
      const service = await createServiceCible();

      const res = await request(getAppHelper(referentRegionHorsPerimetre()))
        .post("/department-service")
        .send({ department: DEP_CIBLE, region: REGION_CIBLE, address: "Adresse pirate" });

      expect(res.statusCode).toEqual(403);
      expect((await DepartmentServiceModel.findById(service._id))?.address).toEqual("1 rue du Nord");
    });

    it("refuse une écriture sans département cible (sinon le premier service trouvé est écrasé)", async () => {
      const service = await createServiceCible();

      const res = await request(getAppHelper(admin())).post("/department-service").send({ address: "Adresse pirate" });

      expect(res.statusCode).toEqual(400);
      expect((await DepartmentServiceModel.findById(service._id))?.address).toEqual("1 rue du Nord");
    });

    it("autorise le référent départemental de son propre département", async () => {
      const service = await createServiceCible();

      const res = await request(getAppHelper(referentDuPerimetre())).post("/department-service").send({ department: DEP_CIBLE, region: REGION_CIBLE, address: "2 rue du Nord" });

      expect(res.statusCode).toEqual(200);
      expect((await DepartmentServiceModel.findById(service._id))?.address).toEqual("2 rue du Nord");
    });

    it("autorise le référent régional de la région du département", async () => {
      const service = await createServiceCible();

      const res = await request(getAppHelper(referentRegionDuPerimetre()))
        .post("/department-service")
        .send({ department: DEP_CIBLE, region: REGION_CIBLE, address: "3 rue du Nord" });

      expect(res.statusCode).toEqual(200);
      expect((await DepartmentServiceModel.findById(service._id))?.address).toEqual("3 rue du Nord");
    });
  });

  describe("POST /department-service/:id/cohort/:cohort/contact", () => {
    it("refuse à un référent départemental de détourner le contact de convocation d'un autre département", async () => {
      const service = await createServiceCible();

      const res = await request(getAppHelper(referentHorsPerimetre()))
        .post(`/department-service/${service._id}/cohort/Juillet 2024/contact`)
        .send({ contactName: "Contact pirate", contactMail: "pirate@example.org", contactPhone: "0611111111" });

      expect(res.statusCode).toEqual(403);
      const apres = await DepartmentServiceModel.findById(service._id);
      expect(apres?.contacts.map((c) => c.contactMail)).toEqual(["legitime@example.org"]);
    });

    it("autorise le référent départemental de son propre département", async () => {
      const service = await createServiceCible();

      const res = await request(getAppHelper(referentDuPerimetre()))
        .post(`/department-service/${service._id}/cohort/Juillet 2024/contact`)
        .send({ contactName: "Nouveau contact", contactMail: "nouveau@example.org", contactPhone: "0622222222" });

      expect(res.statusCode).toEqual(200);
      const apres = await DepartmentServiceModel.findById(service._id);
      expect(apres?.contacts.map((c) => c.contactMail)).toContain("nouveau@example.org");
    });
  });

  describe("DELETE /department-service/:id/cohort/:cohort/contact/:contactId", () => {
    it("refuse à un référent départemental de supprimer le contact de convocation d'un autre département", async () => {
      const service = await createServiceCible();
      const contactId = (service.contacts[0] as any)._id;

      const res = await request(getAppHelper(referentHorsPerimetre())).delete(`/department-service/${service._id}/cohort/Juillet 2024/contact/${contactId}`).send();

      expect(res.statusCode).toEqual(403);
      expect((await DepartmentServiceModel.findById(service._id))?.contacts.length).toEqual(1);
    });

    it("autorise le référent départemental de son propre département", async () => {
      const service = await createServiceCible();
      const contactId = (service.contacts[0] as any)._id;

      const res = await request(getAppHelper(referentDuPerimetre())).delete(`/department-service/${service._id}/cohort/Juillet 2024/contact/${contactId}`).send();

      expect(res.statusCode).toEqual(200);
      expect((await DepartmentServiceModel.findById(service._id))?.contacts.length).toEqual(0);
    });
  });

  describe("POST /department-service/:id/representant", () => {
    it("refuse à un référent départemental de remplacer le représentant de l'État d'un autre département", async () => {
      const service = await createServiceCible();

      const res = await request(getAppHelper(referentHorsPerimetre())).post(`/department-service/${service._id}/representant`).send({
        firstName: "Pirate",
        lastName: "Pirate",
        mobile: "0611111111",
        email: "pirate@example.org",
        role: "Préfet",
      });

      expect(res.statusCode).toEqual(403);
      expect((await DepartmentServiceModel.findById(service._id))?.representantEtat?.email).toEqual("jean.legitime@example.org");
    });

    it("ne crée pas de service fantôme quand l'identifiant est inconnu", async () => {
      const idInconnu = new ObjectId();

      const res = await request(getAppHelper(admin())).post(`/department-service/${idInconnu}/representant`).send({
        firstName: "Fantôme",
        lastName: "Fantôme",
        mobile: "0611111111",
        email: "fantome@example.org",
        role: "Préfet",
      });

      expect(res.statusCode).toEqual(404);
      expect(await DepartmentServiceModel.countDocuments({ _id: idInconnu })).toEqual(0);
    });

    it("autorise le référent départemental de son propre département", async () => {
      const service = await createServiceCible();

      const res = await request(getAppHelper(referentDuPerimetre())).post(`/department-service/${service._id}/representant`).send({
        firstName: "Nouvelle",
        lastName: "Préfète",
        mobile: "0622222222",
        email: "nouvelle.prefete@example.org",
        role: "Préfète",
      });

      expect(res.statusCode).toEqual(200);
      expect((await DepartmentServiceModel.findById(service._id))?.representantEtat?.email).toEqual("nouvelle.prefete@example.org");
    });
  });
});
