import request from "supertest";
import fetch from "node-fetch";
import getAppHelper from "../helpers/app";
import { ROLES, InvitationType } from "snu-lib";
import { getMockAppelAProjetDto } from "../fixtures/cle/appelAProjet";
import * as apiEducationModule from "../../services/gouv.fr/api-education";
import passport from "passport";
import { dbConnect, dbClose } from "../helpers/db";
import { getEtablissementsFromAnnuaire } from "../fixtures/providers/annuaireEtablissement";
import { ClasseDocument, ClasseModel, EtablissementDocument, EtablissementModel, ReferentDocument, ReferentModel } from "../../models";
import * as featureServiceModule from "../../featureFlag/featureFlagService";

jest.mock("../../utils", () => ({
  ...jest.requireActual("../../utils"),
  uploadFile: () => Promise.resolve(),
}));

beforeAll(dbConnect);
afterAll(dbClose);
beforeEach(async () => {
  // @ts-ignore
  passport.user.role = ROLES.ADMIN;
  // @ts-ignore
  passport.user.subRole = null;
  // @ts-ignore
  fetch.mockClear();
  await EtablissementModel.deleteMany();
  await ClasseModel.deleteMany();
  await ReferentModel.deleteMany();
  const apiEductionMock = jest.spyOn(apiEducationModule, "apiEducation");
  apiEductionMock.mockImplementation(() => Promise.resolve(getEtablissementsFromAnnuaire()));
  jest.spyOn(featureServiceModule, "isFeatureAvailable").mockImplementation(() => Promise.resolve(true));
});

afterEach(async () => {
  await EtablissementModel.deleteMany();
  await ClasseModel.deleteMany();
  await ReferentModel.deleteMany();
});

jest.mock("node-fetch", () => jest.fn());

describe("Appel A Projet Controller", () => {
  describe("POST /cle/appel-a-projet/simulate", () => {
    it("should return 200 OK with appelAProjet data for super admin", async () => {
      // @ts-ignore
      passport.user.subRole = "god";

      const response1 = Promise.resolve({
        json: () => {
          return getMockAppelAProjetDto(true);
        },
      });

      // @ts-ignore
      fetch.mockImplementationOnce(() => response1);
      await response1;

      const response2 = Promise.resolve({
        json: () => {
          return getMockAppelAProjetDto(false);
        },
      });
      // @ts-ignore
      fetch.mockImplementation(() => response2);
      await response2;

      const res = await request(getAppHelper()).post("/cle/appel-a-projet/simulate").send({});
      expect(res.statusCode).toEqual(200);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it("should return 403 for non super admin", async () => {
      const res = await request(getAppHelper()).post("/cle/appel-a-projet/simulate").send({});
      expect(res.statusCode).toEqual(403);
      expect(res.body.ok).toBe(false);
      expect(fetch).toHaveBeenCalledTimes(0);
    });

    it("should return a zip file", async () => {
      // @ts-ignore
      passport.user.subRole = "god";
      const response = Promise.resolve({
        json: () => {
          return getMockAppelAProjetDto(false);
        },
      });
      // @ts-ignore
      fetch.mockImplementation(() => response);

      await response;

      const res = await request(getAppHelper()).post("/cle/appel-a-projet/simulate").send({});

      expect(res.statusCode).toEqual(200);
      expect(res.headers["content-type"]).toEqual("application/zip");
      expect(res.headers["content-disposition"]).toContain("attachment; filename=appelAProjet-simulate-");
    });

    it("should DS be called a maximum of 50 times", async () => {
      // @ts-ignore
      passport.user.subRole = "god";

      const response1 = Promise.resolve({
        json: () => {
          return getMockAppelAProjetDto(true);
        },
      });
      // @ts-ignore
      fetch.mockImplementation(() => response1);
      await response1;

      const res = await request(getAppHelper()).post("/cle/appel-a-projet/simulate").send({});
      expect(res.statusCode).toEqual(200);
      expect(fetch).toHaveBeenCalledTimes(50);
    });
  });

  describe("POST /cle/appel-a-projet/real", () => {
    it("should persist data", async () => {
      const etablissementBeforeSync = await EtablissementModel.findOne({ uai: "UAI_42" });
      expect(etablissementBeforeSync).toBeNull();
      // @ts-ignore
      passport.user.subRole = "god";
      const responseAppelAProjetMock = Promise.resolve({
        json: () => {
          return getMockAppelAProjetDto(false);
        },
      });

      // @ts-ignore
      fetch.mockImplementation(() => responseAppelAProjetMock);
      await responseAppelAProjetMock;

      await request(getAppHelper()).post("/cle/appel-a-projet/real").send({});
      const referentEtablissementAfterSync = await ReferentModel.findOne({ email: "mail@etablissement.fr" });
      const etablissementAfterSync = await EtablissementModel.findOne({ uai: "UAI_42" });
      const referentClasseAfterSync = await ReferentModel.findOne({ email: "email@referent.fr" });
      const classeAfterSync = await ClasseModel.findOne({ etablissementId: etablissementAfterSync!._id });

      expect(referentEtablissementAfterSync!.email).toEqual("mail@etablissement.fr");
      expect(referentEtablissementAfterSync!.lastName).toEqual("NOM_CHEF_ETABLISSEMENT");
      expect(referentEtablissementAfterSync!.firstName).toEqual("PRENOM_CHEF_ETABLISSEMENT");
      expect(etablissementAfterSync!.uai).toEqual("UAI_42");
      expect(etablissementAfterSync!.referentEtablissementIds).toContain(referentEtablissementAfterSync!._id.toString());
      expect(classeAfterSync!.etablissementId).toEqual(etablissementAfterSync!._id.toString());
      expect(classeAfterSync!.referentClasseIds).toContain(referentClasseAfterSync!._id.toString());
    });

    it("should persist data and update existing etablissement", async () => {
      const mockEtablissement = {
        uai: "UAI_42",
        name: "Example School",
        referentEtablissementIds: ["referentId1", "referentId2"],
        coordinateurIds: ["coordinateurId1", "coordinateurId2"],
        department: "Example Department",
        region: "Example Region",
        zip: "12345",
        city: "Example City",
        country: "France",
        state: "inactive",
        academy: "Example Academy",
        schoolYears: ["2021-2022", "2022-2023"],
      };
      await EtablissementModel.create(mockEtablissement);

      // @ts-ignore
      passport.user.subRole = "god";
      const responseAppelAProjetMock = Promise.resolve({
        json: () => {
          return getMockAppelAProjetDto(false);
        },
      });

      // @ts-ignore
      fetch.mockImplementation(() => responseAppelAProjetMock);
      await responseAppelAProjetMock;

      await request(getAppHelper()).post("/cle/appel-a-projet/real").send({});
      const etablissementAfterSync = await EtablissementModel.findOne({ uai: "UAI_42" });

      expect(etablissementAfterSync!.uai).toEqual("UAI_42");
      expect(etablissementAfterSync!.name).toEqual("Lycée Jean Monnet");
    });

    it("should persist data and link existing referent to created etablissement", async () => {
      const mockEtablissement = {
        uai: "UAI_42",
        name: "Example School",
        referentEtablissementIds: [],
        coordinateurIds: ["coordinateurId1", "coordinateurId2"],
        department: "Example Department",
        region: "Example Region",
        zip: "12345",
        city: "Example City",
        country: "France",
        state: "inactive",
        academy: "Example Academy",
        schoolYears: ["2021-2022", "2022-2023"],
      };
      await EtablissementModel.create(mockEtablissement);

      const mockReferent = {
        email: "mail@etablissement.fr",
        firstName: "John",
        lastName: "Doe",
        phoneNumber: "1234567890",
        password: "password",
        role: "administrateur_cle",
        subRole: "coordinateur_cle",
        etablissementIds: [],
        classeIds: [],
      };

      const referent = await ReferentModel.create(mockReferent);

      // @ts-ignore
      passport.user.subRole = "god";
      const responseAppelAProjetMock = Promise.resolve({
        json: () => {
          return getMockAppelAProjetDto(false);
        },
      });

      // @ts-ignore
      fetch.mockImplementation(() => responseAppelAProjetMock);
      await responseAppelAProjetMock;

      await request(getAppHelper()).post("/cle/appel-a-projet/real").send({});
      const etablissementAfterSync = await EtablissementModel.findOne({ uai: "UAI_42" });

      expect([...etablissementAfterSync!.referentEtablissementIds]).toEqual([referent?.id]);
    });

    it("should not change invitationType if run twice", async () => {
      // @ts-ignore
      passport.user.subRole = "god";
      const responseAppelAProjetMock = Promise.resolve({
        json: () => {
          return getMockAppelAProjetDto(false);
        },
      });

      // @ts-ignore
      fetch.mockImplementation(() => responseAppelAProjetMock);
      await responseAppelAProjetMock;

      await request(getAppHelper()).post("/cle/appel-a-projet/real").send({});
      const referentEtablissementAfterSync = await ReferentModel.findOne({ email: "mail@etablissement.fr" });

      expect(referentEtablissementAfterSync!.email).toEqual("mail@etablissement.fr");
      expect(referentEtablissementAfterSync!.metadata.invitationType).toEqual(InvitationType.INSCRIPTION);

      await request(getAppHelper()).post("/cle/appel-a-projet/real").send({});
      const referentEtablissementAfterSecondSync = await ReferentModel.findOne({ email: "mail@etablissement.fr" });

      expect(referentEtablissementAfterSecondSync!.email).toEqual("mail@etablissement.fr");
      expect(referentEtablissementAfterSecondSync!.metadata.invitationType).toEqual(InvitationType.INSCRIPTION);
    });
  });
});
