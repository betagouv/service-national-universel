require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const getNewYoungFixture = require("./fixtures/young");
const { getYoungsHelper, createYoungHelper } = require("./helpers/young");
const { dbConnect, dbClose } = require("./helpers/db");

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

describe("Young", () => {
  it("DELETE /young/:id", async () => {
    const youngFixture = getNewYoungFixture();
    const young = await createYoungHelper(youngFixture);
    const youngsBefore = await getYoungsHelper();
    const res = await request(getAppHelper()).delete(`/young/${young._id}`);
    expect(res.statusCode).toEqual(200);
    const youngsAfter = await getYoungsHelper();
    expect(youngsAfter.length).toEqual(youngsBefore.length - 1);
  });
});
