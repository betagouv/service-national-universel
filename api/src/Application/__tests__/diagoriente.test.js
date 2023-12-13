require("dotenv").config({ path: "./.env-testing" });
const fetch = require("node-fetch");
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");

jest.setTimeout(10_000);

jest.mock("node-fetch");

beforeAll(dbConnect);
afterAll(dbClose);

describe("Diagoriente", () => {
  describe("POST /diagoriente/generateUrl", () => {
    it("should return 200", async () => {
      const jsonResponse = jest.fn().mockReturnValueOnce(Promise.resolve({ data: { generateUrl: "foo" } }));
      fetch.mockReturnValueOnce(Promise.resolve({ status: 200, json: jsonResponse }));
      const res = await request(getAppHelper()).get("/diagoriente/generateUrl");
      expect(res.status).toBe(200);
      expect(res.body.data).toStrictEqual({ url: "foo" });
    });
  });
  describe("POST /diagoriente/getCard", () => {
    it("should return 200", async () => {
      const jsonResponse = jest.fn().mockReturnValueOnce(Promise.resolve({ data: { getCard: "foo" } }));
      fetch.mockReturnValueOnce(Promise.resolve({ status: 200, json: jsonResponse }));
      const res = await request(getAppHelper()).get("/diagoriente/getCard");
      expect(res.status).toBe(200);
      expect(res.body.data).toStrictEqual("foo");
    });
  });
});
