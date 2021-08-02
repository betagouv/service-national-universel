require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

describe("Email", () => {
  it("should work", async () => {
    let res = await request(getAppHelper()).post("/email").set("x-forwarded-for", "185.107.232.1").send({ subject: "hello", email: "foo@bar.fr" });
    expect(res.status).toBe(200);

    res = await request(getAppHelper()).post("/email").set("x-forwarded-for", "1.2.3.4").send({ subject: "hello", email: "foo@bar.fr" });
    expect(res.status).toBe(401);

    res = await request(getAppHelper()).post("/email").send({ subject: "hello", email: "foo@bar.fr" });
    expect(res.status).toBe(401);

    res = await request(getAppHelper()).get("/email?email=foo@bar.fr");
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({ data: expect.arrayContaining([expect.objectContaining({ subject: "hello", email: "foo@bar.fr" })]), ok: true });
  });
});
