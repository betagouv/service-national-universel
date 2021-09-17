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
const { getNewApplicationFixture } = require("./fixtures/application");
const { getNewCohesionCenterFixture } = require("./fixtures/cohesionCenter");
const getNewReferentFixture = require("./fixtures/referent");
const getNewStructureFixture = require("./fixtures/structure");
const getNewYoungFixture = require("./fixtures/young");

const getAppHelper = require("./helpers/app");
const { createApplication } = require("./helpers/application");
const { createCohesionCenter, notExistingCohesionCenterId } = require("./helpers/cohesionCenter");
const { dbConnect, dbClose } = require("./helpers/db");
const { createReferentHelper } = require("./helpers/referent");
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
      passport.user.structureId = undefined;
      let res = await msearch("mission", buildMsearchQuery("mission", matchAll));
      expect(res.statusCode).toEqual(404);

      passport.user.role = ROLES.SUPERVISOR;
      passport.user.structureId = undefined;
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

    it("should return 200 for a responsible/supervisor with a structureId", async () => {
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
      expect(getFilter()[0].terms["_id"]).toStrictEqual([structure._id.toString(), parent._id.toString()]);

      passport.user.role = ROLES.SUPERVISOR;
      passport.user.structureId = parent._id.toString();
      res = await msearch("structure", buildMsearchQuery("structure", matchAll));
      expect(res.statusCode).toEqual(200);
      expect(getFilter()[0].terms["_id"]).toStrictEqual([structure._id.toString(), parent._id.toString(), anotherStructure._id.toString()]);

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

  describe("POST /es/meetingpoint/_msearch", () => {
    it("should return 200", async () => {
      let res = await msearch("meetingpoint", buildMsearchQuery("meetingpoint", matchAll));
      expect(res.statusCode).toEqual(200);
    });
    it("should not be authorized to head center, responsible and supervisor", async () => {
      const passport = require("passport");
      let res;
      for (const role of [ROLES.HEAD_CENTER, ROLES.RESPONSIBLE, ROLES.SUPERVISOR]) {
        passport.user.role = role;
        res = await msearch("meetingpoint", buildMsearchQuery("meetingpoint", matchAll));
        expect(res.statusCode).toEqual(401);
      }
      passport.user.role = ROLES.ADMIN;
    });
  });

  describe("POST /es/application/_msearch", () => {
    it("should return 404 for a responsible/supervisor with no structureId", async () => {
      const passport = require("passport");

      passport.user.role = ROLES.RESPONSIBLE;
      passport.user.structureId = undefined;
      let res = await msearch("application", buildMsearchQuery("application", matchAll));
      expect(res.statusCode).toEqual(404);

      passport.user.role = ROLES.SUPERVISOR;
      passport.user.structureId = undefined;
      res = await msearch("application", buildMsearchQuery("application", matchAll));
      expect(res.statusCode).toEqual(404);

      passport.user.role = ROLES.ADMIN;
    });

    it("should not be authorized to head center", async () => {
      const passport = require("passport");

      passport.user.role = ROLES.HEAD_CENTER;
      let res = await msearch("application", buildMsearchQuery("application", matchAll));
      expect(res.statusCode).toEqual(401);

      passport.user.role = ROLES.ADMIN;
    });

    it("should return 200 for a responsible/supervisor with a structureId", async () => {
      const passport = require("passport");

      const structure = await createStructureHelper({ ...getNewStructureFixture(), isNetwork: "false" });
      const parent = await createStructureHelper(getNewStructureFixture());
      parent.networkId = parent._id.toString();
      structure.networkId = parent._id.toString();
      await structure.save();
      await parent.save();

      passport.user.role = ROLES.RESPONSIBLE;
      passport.user.structureId = structure._id.toString();
      let res = await msearch("application", buildMsearchQuery("application", matchAll));
      let expectedBody = buildMsearchQuery("application", {
        query: { bool: { must: { match_all: {} }, filter: [{ terms: { "structureId.keyword": [passport.user.structureId] } }] } },
      });
      expect(res.statusCode).toEqual(200);
      expect(esClient.msearch).toHaveBeenCalledWith({ body: expectedBody, index: "application" });

      passport.user.role = ROLES.SUPERVISOR;
      passport.user.structureId = parent._id.toString();
      res = await msearch("application", buildMsearchQuery("application", matchAll));
      expect(res.statusCode).toEqual(200);
      expect(getFilter()[0].terms["structureId.keyword"]).toStrictEqual([structure._id.toString(), parent._id.toString()]);

      passport.user.role = ROLES.ADMIN;
    });
  });

  describe("POST /es/referent/_msearch", () => {
    it("should return 404 for a responsible/supervisor with no structureId", async () => {
      const passport = require("passport");

      passport.user.role = ROLES.RESPONSIBLE;
      passport.user.structureId = undefined;
      let res = await msearch("referent", buildMsearchQuery("referent", matchAll));
      expect(res.statusCode).toEqual(404);

      passport.user.role = ROLES.SUPERVISOR;
      passport.user.structureId = undefined;
      res = await msearch("referent", buildMsearchQuery("referent", matchAll));
      expect(res.statusCode).toEqual(404);

      passport.user.role = ROLES.ADMIN;
    });

    it("should return 200 for head center", async () => {
      const passport = require("passport");

      passport.user.role = ROLES.HEAD_CENTER;
      let res = await msearch("referent", buildMsearchQuery("referent", matchAll));
      expect(res.statusCode).toEqual(200);
      expect(getFilter()[0].bool.must[0].terms["role.keyword"]).toStrictEqual([ROLES.HEAD_CENTER]);

      passport.user.role = ROLES.ADMIN;
    });

    it("should return 200 for a responsible/supervisor with a structureId", async () => {
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

      const responsible = await createReferentHelper({ ...getNewReferentFixture(), role: ROLES.RESPONSIBLE, structureId: structure._id.toString() });
      const supervisor = await createReferentHelper({ ...getNewReferentFixture(), role: ROLES.SUPERVISOR, structureId: parent._id.toString() });

      const previousUser = passport.user;
      passport.user = responsible;
      let res = await msearch("referent", buildMsearchQuery("referent", matchAll));
      expect(res.statusCode).toEqual(200);
      expect(getFilter()[0].terms["role.keyword"]).toStrictEqual([ROLES.RESPONSIBLE, ROLES.SUPERVISOR]);
      expect(getFilter()[1].terms["structureId.keyword"]).toStrictEqual([structure._id.toString(), parent._id.toString()]);

      passport.user = supervisor;
      res = await msearch("referent", buildMsearchQuery("referent", matchAll));
      expect(res.statusCode).toEqual(200);
      expect(getFilter()[0].terms["role.keyword"]).toStrictEqual([ROLES.RESPONSIBLE, ROLES.SUPERVISOR]);
      expect(getFilter()[1].terms["structureId.keyword"]).toStrictEqual([
        structure._id.toString(),
        parent._id.toString(),
        anotherStructure._id.toString(),
      ]);

      passport.user = previousUser;
    });

    it("should return work for referent department", async () => {
      const passport = require("passport");

      passport.user.role = ROLES.REFERENT_DEPARTMENT;
      passport.user.region = "foo";
      passport.department = "bar";
      const res = await msearch("referent", buildMsearchQuery("referent", matchAll));
      expect(res.statusCode).toEqual(200);
      const filters = getFilter()[0].bool.should;
      expect(filters[0].terms["role.keyword"]).toStrictEqual([ROLES.REFERENT_DEPARTMENT, ROLES.SUPERVISOR, ROLES.RESPONSIBLE]);
      expect(filters[1]).toStrictEqual({
        bool: { must: [{ term: { "role.keyword": ROLES.REFERENT_REGION } }, { term: { "region.keyword": passport.user.region } }] },
      });
      expect(filters[2]).toStrictEqual({
        bool: { must: [{ term: { "role.keyword": ROLES.HEAD_CENTER } }, { term: { "department.keyword": passport.user.department } }] },
      });

      passport.user.role = ROLES.ADMIN;
    });

    it("should return work for referent region", async () => {
      const passport = require("passport");

      passport.user.role = ROLES.REFERENT_REGION;
      passport.user.region = "foo";
      passport.department = "bar";
      const res = await msearch("referent", buildMsearchQuery("referent", matchAll));
      expect(res.statusCode).toEqual(200);
      const filters = getFilter()[0].bool.should;
      expect(filters[0].terms["role.keyword"]).toStrictEqual([ROLES.REFERENT_REGION, ROLES.SUPERVISOR, ROLES.RESPONSIBLE]);
      expect(filters[1]).toStrictEqual({
        bool: { must: [{ term: { "role.keyword": ROLES.REFERENT_DEPARTMENT } }, { term: { "region.keyword": passport.user.region } }] },
      });
      expect(filters[2]).toStrictEqual({
        bool: { must: [{ term: { "role.keyword": ROLES.HEAD_CENTER } }, { term: { "region.keyword": passport.user.region } }] },
      });

      passport.user.role = ROLES.ADMIN;
    });
  });

  describe("POST /es/cohesionyoung/:id/_msearch", () => {
    it("should not be authorized to head center, responsible and supervisor", async () => {
      const passport = require("passport");
      let res;
      for (const role of [ROLES.HEAD_CENTER, ROLES.RESPONSIBLE, ROLES.SUPERVISOR]) {
        passport.user.role = role;
        res = await msearch("cohesionyoung/foo", buildMsearchQuery("cohesionyoung", matchAll));
        expect(res.statusCode).toEqual(401);
      }
      passport.user.role = ROLES.ADMIN;
    });
    it("should return 401 for referent department with department without a cohesion center", async () => {
      const center = await createCohesionCenter(getNewCohesionCenterFixture());
      const passport = require("passport");

      passport.user.role = ROLES.REFERENT_DEPARTMENT;
      passport.user.department = "plop";
      let res = await msearch("cohesionyoung/" + center._id, buildMsearchQuery("referent", matchAll));
      expect(res.statusCode).toEqual(401);
    });
    it("should return 401 for referent region with region without a cohesion center", async () => {
      const center = await createCohesionCenter(getNewCohesionCenterFixture());
      const passport = require("passport");

      passport.user.role = ROLES.REFERENT_REGION;
      passport.user.region = "plop";
      let res = await msearch("cohesionyoung/" + center._id, buildMsearchQuery("referent", matchAll));
      expect(res.statusCode).toEqual(401);
    });
    it("should return 200 for referent department with department with a cohesion center", async () => {
      const center = await createCohesionCenter({ ...getNewCohesionCenterFixture(), department: "bim" });
      const passport = require("passport");

      passport.user.role = ROLES.REFERENT_DEPARTMENT;
      passport.user.department = "bim";
      let res = await msearch("cohesionyoung/" + center._id, buildMsearchQuery("referent", matchAll));
      expect(res.statusCode).toEqual(200);
    });
    it("should return 200 for referent region with region with a cohesion center", async () => {
      const center = await createCohesionCenter({ ...getNewCohesionCenterFixture(), region: "bam" });
      const passport = require("passport");

      passport.user.role = ROLES.REFERENT_REGION;
      passport.user.region = "bam";
      let res = await msearch("cohesionyoung/" + center._id, buildMsearchQuery("referent", matchAll));
      expect(res.statusCode).toEqual(200);
    });
  });

  describe("POST /es/young/_msearch", () => {
    it("should return 404 for head center when center does not exit", async () => {
      const passport = require("passport");

      passport.user.role = ROLES.HEAD_CENTER;
      passport.user.cohesionCenterId = notExistingCohesionCenterId;
      const res = await msearch("young", buildMsearchQuery("young", matchAll));
      expect(res.statusCode).toEqual(404);

      passport.user.role = ROLES.ADMIN;
    });
    it("should return young from center for head center when center exits", async () => {
      const center = await createCohesionCenter(getNewCohesionCenterFixture());
      const passport = require("passport");

      passport.user.role = ROLES.HEAD_CENTER;
      passport.user.cohesionCenterId = center._id.toString();

      const res = await msearch("young", buildMsearchQuery("young", matchAll));
      expect(res.statusCode).toEqual(200);
      expect(getFilter()[2].term["cohesionCenterId.keyword"]).toBe(center._id.toString());

      passport.user.role = ROLES.ADMIN;
    });

    it("should filter region for referent region", async () => {
      const passport = require("passport");
      passport.user.role = ROLES.REFERENT_REGION;
      passport.user.region = "lol";

      let res = await msearch("young", buildMsearchQuery("young", matchAll));
      expect(res.statusCode).toEqual(200);
      expect(getFilter()[1].term["region.keyword"]).toStrictEqual("lol");

      passport.user.role = ROLES.ADMIN;
    });

    it("should filter department for referent department", async () => {
      const passport = require("passport");
      passport.user.role = ROLES.REFERENT_DEPARTMENT;
      passport.user.department = "foo";

      let res = await msearch("young", buildMsearchQuery("young", matchAll));
      expect(res.statusCode).toEqual(200);
      expect(getFilter()[1].term["department.keyword"]).toStrictEqual("foo");

      passport.user.role = ROLES.ADMIN;
    });

    it("should return youngs for responsible", async () => {
      const structure = await createStructureHelper(getNewStructureFixture());
      const young = await createYoungHelper(getNewYoungFixture());
      await createApplication({ ...getNewApplicationFixture(), structureId: structure._id, youngId: young._id });

      const passport = require("passport");

      passport.user.role = ROLES.RESPONSIBLE;
      passport.user.structureId = structure._id.toString();

      const res = await msearch("young", buildMsearchQuery("young", matchAll));
      expect(res.statusCode).toEqual(200);
      expect(getFilter()[1].terms["_id"]).toStrictEqual([young._id.toString()]);

      passport.user.role = ROLES.ADMIN;
    });

    it("should return youngs for supervisor", async () => {
      const structure = await createStructureHelper(getNewStructureFixture());
      const structure2 = await createStructureHelper({ ...getNewStructureFixture(), networkId: structure._id.toString() });
      const young = await createYoungHelper(getNewYoungFixture());
      const young2 = await createYoungHelper(getNewYoungFixture());
      await createApplication({ ...getNewApplicationFixture(), structureId: structure._id.toString(), youngId: young._id.toString() });
      await createApplication({ ...getNewApplicationFixture(), structureId: structure2._id.toString(), youngId: young2._id.toString() });

      const passport = require("passport");

      passport.user.role = ROLES.SUPERVISOR;
      passport.user.structureId = structure._id.toString();

      const res = await msearch("young", buildMsearchQuery("young", matchAll));
      expect(res.statusCode).toEqual(200);
      expect(getFilter()[1].terms["_id"]).toStrictEqual([young._id.toString(), young2._id.toString()]);

      passport.user.role = ROLES.ADMIN;
    });
  });
});
