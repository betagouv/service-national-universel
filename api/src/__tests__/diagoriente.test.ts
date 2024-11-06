import fetch from "node-fetch";

import request from "supertest";
import getAppHelper from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";

jest.mock("node-fetch");

beforeAll(dbConnect);
afterAll(dbClose);

describe("Diagoriente", () => {
  describe("POST /diagoriente/generateUrl", () => {
    it("should return 200", async () => {
      const jsonResponse = jest.fn().mockReturnValueOnce(Promise.resolve({ data: { generateUrl: "foo" } }));
      // @ts-ignore
      fetch.mockReturnValueOnce(Promise.resolve({ status: 200, json: jsonResponse }));
      const res = await request(getAppHelper()).get("/diagoriente/generateUrl");
      expect(res.status).toBe(200);
      expect(res.body.data).toStrictEqual({ url: "foo" });
    });
  });
  describe("POST /diagoriente/getCard", () => {
    it("should return 200", async () => {
      const jsonResponse = jest.fn().mockReturnValueOnce(Promise.resolve({ data: { getCard: "foo" } }));
      // @ts-ignore
      fetch.mockReturnValueOnce(Promise.resolve({ status: 200, json: jsonResponse }));
      const res = await request(getAppHelper()).get("/diagoriente/getCard");
      expect(res.status).toBe(200);
      expect(res.body.data).toStrictEqual("foo");
    });
  });
});
