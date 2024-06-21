import request from "supertest";
import fetch from "node-fetch";
import getAppHelper from "../helpers/app";
import { ROLES } from "snu-lib";
import { getMockAppelAProjetDto } from "../fixtures/cle/appelAProjet";
import * as apiEducationModule from "../../services/gouv.fr/api-education";
import passport from "passport";
import { dbConnect, dbClose } from "../helpers/db";

beforeAll(dbConnect);
afterAll(dbClose);
beforeEach(() => {
  passport.user.role = ROLES.ADMIN;
  passport.user.subRole = null;
  fetch.mockClear();
  const apiEductionMock = jest.spyOn(apiEducationModule, "apiEducation");
  apiEductionMock.mockImplementation(() => Promise.resolve([]));
});

jest.mock("node-fetch", () => jest.fn());

describe("Appel A Projet Controller", () => {
  describe("POST /cle/appel-a-projet/simulate", () => {
    it("should return 200 OK with appelAProjet data for super admin", async () => {
      passport.user.subRole = "god";

      const response1 = Promise.resolve({
        json: () => {
          return getMockAppelAProjetDto(true);
        },
      });

      fetch.mockImplementationOnce(() => response1);
      await response1;

      const response2 = Promise.resolve({
        json: () => {
          return getMockAppelAProjetDto(false);
        },
      });
      fetch.mockImplementation(() => response2);
      await response2;

      const res = await request(getAppHelper()).post("/cle/appel-a-projet/simulate").send();
      expect(res.statusCode).toEqual(200);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it("should return 403 for non super admin", async () => {
      const res = await request(getAppHelper()).post("/cle/appel-a-projet/simulate").send();
      expect(res.statusCode).toEqual(403);
      expect(res.body.ok).toBe(false);
      expect(fetch).toHaveBeenCalledTimes(0);
    });

    it("should return a zip file", async () => {
      passport.user.subRole = "god";
      const response = Promise.resolve({
        json: () => {
          return getMockAppelAProjetDto(false);
        },
      });
      fetch.mockImplementation(() => response);

      await response;

      const res = await request(getAppHelper()).post("/cle/appel-a-projet/simulate").send();

      expect(res.statusCode).toEqual(200);
      expect(res.headers["content-type"]).toEqual("application/zip");
      expect(res.headers["content-disposition"]).toContain("attachment; filename=appelAProjet-simulate-");
    });

    it("should DS be called a maximum of 50 times", async () => {
      passport.user.subRole = "god";

      const response1 = Promise.resolve({
        json: () => {
          return getMockAppelAProjetDto(true);
        },
      });
      fetch.mockImplementation(() => response1);
      await response1;

      const res = await request(getAppHelper()).post("/cle/appel-a-projet/simulate").send();
      expect(res.statusCode).toEqual(200);
      expect(fetch).toHaveBeenCalledTimes(50);
    });
  });
});
