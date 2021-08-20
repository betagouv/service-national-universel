require("dotenv").config({ path: "./.env-testing" });
const { ROLES } = require("snu-lib/roles");
const request = require("supertest");

// This part should be done at the beginning (before require models or anything else.).
process.env.ES_ENDPOINT = "http://localhost:9200";
jest.mock("@selego/mongoose-elastic", () => () => () => {});
jest.mock("@elastic/elasticsearch", () => ({
  Client: jest.fn().mockImplementation(() => {
    return {
      msearch: jest.fn(),
    };
  }),
}));
const esClient = require("../es");
const getNewStructureFixture = require("./fixtures/structure");
const getNewYoungFixture = require("./fixtures/young");

const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");
const { createStructureHelper } = require("./helpers/structure");
const { createYoungHelper } = require("./helpers/young");

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

const matchAll = { query: { match_all: {} } };

function buildMsearchQuery(index, body) {
  const header = { index, type: "_doc" };
  return [header, body].map((e) => `${JSON.stringify(e)}\n`).join("");
}

async function msearch(index, body, resolvedValue = { body: "hello" }) {
  esClient.msearch.mockClear();
  esClient.msearch.mockResolvedValue(resolvedValue);
  return request(getAppHelper()).post(`/es/${index}/_msearch`).send(body).set("Content-Type", "application/x-ndjson");
}

function getFilter() {
  return JSON.parse(esClient.msearch.mock.calls[0][0].body.split(`\n`)[1]).query.bool.filter;
}

describe("Es", () => {
  describe("POST /es/mission/_msearch", () => {
    it("should only return VALIDATED missions for young", async () => {
      const young = await createYoungHelper({ ...getNewYoungFixture() });
      const passport = require("passport");
      const previous = passport.user;
      passport.user = young;

      const res = await msearch("mission", buildMsearchQuery("mission", matchAll));
      const expectedBody = buildMsearchQuery("mission", {
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "status.keyword": "VALIDATED" } }] } },
      });

      expect(res.statusCode).toEqual(200);
      expect(esClient.msearch).toHaveBeenCalledWith({ body: expectedBody, index: "mission" });
      passport.user = previous;
    });

    it("should return 404 for a responsible/supervisor with no structureId", async () => {
      const passport = require("passport");

      passport.user.role = ROLES.RESPONSIBLE;
      let res = await msearch("mission", buildMsearchQuery("mission", matchAll));
      expect(res.statusCode).toEqual(404);

      passport.user.role = ROLES.SUPERVISOR;
      res = await msearch("mission", buildMsearchQuery("mission", matchAll));
      expect(res.statusCode).toEqual(404);

      passport.user.role = ROLES.ADMIN;
    });

    it("should not be authorized to head center", async () => {
      const passport = require("passport");

      passport.user.role = ROLES.HEAD_CENTER;
      let res = await msearch("mission", buildMsearchQuery("mission", matchAll));
      expect(res.statusCode).toEqual(401);

      passport.user.role = ROLES.ADMIN;
    });

    it("should return 200 for a responsible/supervisor with no structureId", async () => {
      const passport = require("passport");

      const structure = await createStructureHelper({ ...getNewStructureFixture(), isNetwork: "false" });
      const parent = await createStructureHelper(getNewStructureFixture());
      parent.networkId = parent._id.toString();
      structure.networkId = parent._id.toString();
      await structure.save();
      await parent.save();

      passport.user.role = ROLES.RESPONSIBLE;
      passport.user.structureId = structure._id.toString();
      let res = await msearch("mission", buildMsearchQuery("mission", matchAll));
      let expectedBody = buildMsearchQuery("mission", {
        query: { bool: { must: { match_all: {} }, filter: [{ terms: { "structureId.keyword": [passport.user.structureId] } }] } },
      });

      expect(res.statusCode).toEqual(200);
      expect(esClient.msearch).toHaveBeenCalledWith({ body: expectedBody, index: "mission" });

      passport.user.role = ROLES.SUPERVISOR;
      passport.user.structureId = parent._id.toString();
      res = await msearch("mission", buildMsearchQuery("mission", matchAll));
      expect(res.statusCode).toEqual(200);
      expect(getFilter()[0].terms["structureId.keyword"]).toStrictEqual([structure._id.toString(), parent._id.toString()]);

      passport.user.role = ROLES.ADMIN;
    });
  });
  describe("POST /es/missionapi/_msearch", () => {
    describe("POST /es/missionapi/_msearch", () => {
      it("Should call msearch with correct index", async () => {
        const body = buildMsearchQuery("missionapi", matchAll);
        const res = await msearch("missionapi", body);
        expect(res.statusCode).toEqual(200);
        expect(esClient.msearch).toHaveBeenCalledWith({ body, index: "missionapi" });
      });
    });
  });
  describe("POST /es/school/_msearch", () => {
    describe("POST /es/school/_msearch", () => {
      it("Should call msearch with correct index", async () => {
        const body = buildMsearchQuery("school", matchAll);
        const res = await msearch("school", body);
        expect(res.statusCode).toEqual(200);
        expect(esClient.msearch).toHaveBeenCalledWith({ body, index: "school" });
      });
    });
  });
  describe("POST /es/meetingpoint/_msearch", () => {
    it("Should call msearch with correct index", async () => {
      const body = buildMsearchQuery("meetingpoint", matchAll);
      const res = await msearch("meetingpoint", body);
      expect(res.statusCode).toEqual(200);
      expect(esClient.msearch).toHaveBeenCalledWith({ body, index: "meetingpoint" });
    });
  });

  describe("POST /es/structure/_msearch", () => {
    it("should return 404 for a responsible/supervisor with no structureId", async () => {
      const passport = require("passport");

      passport.user.role = ROLES.RESPONSIBLE;
      passport.user.structureId = undefined;
      let res = await msearch("structure", buildMsearchQuery("structure", matchAll));
      expect(res.statusCode).toEqual(404);

      passport.user.role = ROLES.SUPERVISOR;
      res = await msearch("structure", buildMsearchQuery("structure", matchAll));
      expect(res.statusCode).toEqual(404);

      passport.user.role = ROLES.ADMIN;
    });

    it("should not be authorized to head center", async () => {
      const passport = require("passport");

      passport.user.role = ROLES.HEAD_CENTER;
      let res = await msearch("structure", buildMsearchQuery("structure", matchAll));
      expect(res.statusCode).toEqual(401);

      passport.user.role = ROLES.ADMIN;
    });

    it("should return 200 for a responsible/supervisor with no structureId", async () => {
      const passport = require("passport");

      const structure = await createStructureHelper({ ...getNewStructureFixture(), isNetwork: "false" });
      const parent = await createStructureHelper(getNewStructureFixture());
      const anotherStructure = await createStructureHelper(getNewStructureFixture());
      parent.networkId = parent._id.toString();
      structure.networkId = parent._id.toString();
      anotherStructure.networkId = parent._id.toString();
      await structure.save();
      await parent.save();
      await anotherStructure.save();

      passport.user.role = ROLES.RESPONSIBLE;
      passport.user.structureId = structure._id.toString();
      let res = await msearch("structure", buildMsearchQuery("structure", matchAll));
      expect(res.statusCode).toEqual(200);
      expect(getFilter()[0].terms["structureId.keyword"]).toStrictEqual([structure._id.toString(), parent._id.toString()]);

      passport.user.role = ROLES.SUPERVISOR;
      passport.user.structureId = parent._id.toString();
      res = await msearch("structure", buildMsearchQuery("structure", matchAll));
      expect(res.statusCode).toEqual(200);
      expect(getFilter()[0].terms["structureId.keyword"]).toStrictEqual([
        structure._id.toString(),
        parent._id.toString(),
        anotherStructure._id.toString(),
      ]);

      passport.user.role = ROLES.ADMIN;
    });
  });

  describe("POST /es/cohesioncenter/_msearch", () => {
    it("should not be authorized to head center, responsible and supervisor", async () => {
      const passport = require("passport");
      let res;
      for (const role of [ROLES.HEAD_CENTER, ROLES.RESPONSIBLE, ROLES.SUPERVISOR]) {
        passport.user.role = role;
        res = await msearch("cohesioncenter", buildMsearchQuery("cohesioncenter", matchAll));
        expect(res.statusCode).toEqual(401);
      }
      passport.user.role = ROLES.ADMIN;
    });
    it("should filter region for referent region", async () => {
      const passport = require("passport");
      passport.user.role = ROLES.REFERENT_REGION;
      passport.user.region = "lol";

      let res = await msearch("cohesioncenter", buildMsearchQuery("cohesioncenter", matchAll));
      expect(res.statusCode).toEqual(200);
      expect(getFilter()[0].term["region.keyword"]).toStrictEqual("lol");

      passport.user.role = ROLES.ADMIN;
    });

    it("should filter department for referent department", async () => {
      const passport = require("passport");
      passport.user.role = ROLES.REFERENT_DEPARTMENT;
      passport.user.department = "foo";

      let res = await msearch("cohesioncenter", buildMsearchQuery("cohesioncenter", matchAll));
      expect(res.statusCode).toEqual(200);
      expect(getFilter()[0].term["department.keyword"]).toStrictEqual("foo");

      passport.user.role = ROLES.ADMIN;
    });
  });
});
