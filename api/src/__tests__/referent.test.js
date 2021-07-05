require("dotenv").config({ path: "./.env-testing" });
const faker = require("faker");
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const getNewYoungFixture = require("./fixtures/young");
const getNewReferentFixture = require("./fixtures/referent");
const { getYoungsHelper, getYoungByIdHelper, deleteYoungByIdHelper, createYoungHelper, expectYoungToEqual } = require("./helpers/young");
const { getReferentsHelper, deleteReferentByIdHelper } = require("./helpers/referent");
const { dbConnect, dbClose } = require("./helpers/db");

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

describe("Referent", () => {
  it("POST /referent/signup_invite/admin", async () => {
    const referentFixture = getNewReferentFixture();
    const referentsBefore = await getReferentsHelper();
    const res = await request(getAppHelper()).post("/referent/signup_invite/admin").send(referentFixture);
    expect(res.statusCode).toEqual(200);
    const referentsAfter = await getReferentsHelper();
    expect(referentsAfter.length).toEqual(referentsBefore.length + 1);
    await deleteReferentByIdHelper(res.body.data._id);
  });

  it("GET /referent", async () => {
    const res = await request(getAppHelper()).get("/referent").send();
    expect(res.statusCode).toEqual(200);
  });

  it("POST /referent/young", async () => {
    const youngFixture = getNewYoungFixture();
    const youngsBefore = await getYoungsHelper();
    const res = await request(getAppHelper()).post("/referent/young/").send(youngFixture);
    expect(res.statusCode).toEqual(200);
    expectYoungToEqual(youngFixture, res.body.young);
    const youngsAfter = await getYoungsHelper();
    expect(youngsAfter.length).toEqual(youngsBefore.length + 1);
    await deleteYoungByIdHelper(res.body.young._id);
  });

  it("PUT /referent/young/:id", async () => {
    const youngFixture = getNewYoungFixture();
    let young = await createYoungHelper(youngFixture);
    const modifiedYoung = { ...youngFixture };
    modifiedYoung.firstName = faker.name.firstName();
    const put = await request(getAppHelper()).put(`/referent/young/${young._id}`).send(modifiedYoung);
    expect(put.statusCode).toEqual(200);
    young = await getYoungByIdHelper(young._id);
    expectYoungToEqual(young, modifiedYoung);
    await deleteYoungByIdHelper(young._id);
  });
});
