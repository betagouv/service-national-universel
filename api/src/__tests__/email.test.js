require("dotenv").config({ path: "./.env-testing" });
const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { dbConnect, dbClose } = require("./helpers/db");
const { ROLES } = require("snu-lib");

jest.setTimeout(10_000);

beforeAll(dbConnect);
afterAll(dbClose);

describe("Email", () => {
  describe("POST /email", () => {
    it("should work with valid IP", async () => {
      let res = await request(getAppHelper()).post("/email").set("x-forwarded-for", "185.107.232.1").send({ subject: "hello", email: "foo@bar.fr" });
      expect(res.status).toBe(200);

      res = await request(getAppHelper()).get("/email?email=foo@bar.fr");
      expect(res.status).toBe(200);
      expect(res.body).toStrictEqual({
        data: expect.arrayContaining([expect.objectContaining({ subject: "hello", email: "foo@bar.fr" })]),
        ok: true,
      });
    });
    it("should work with sendinblue documentation example", async () => {
      const example = {
        event: "click",
        email: "example@example.org",
        id: 123999,
        date: "2020-10-09 00:00:00",
        ts: 123456789,
        "message-id": "xxxxx.xxxxx@example.org",
        ts_event: 123456789,
        subject: "My first Transactional",
        "X-Mailin-custom": "some_custom_header",
        sending_ip: "xxx.xxx.xxx.xxx",
        ts_epoch: 123456789,
        template_id: 22,
        tags: ["transac_messages"],
        link: "https://example.org/product",
      };
      let res = await request(getAppHelper()).post("/email").set("x-forwarded-for", "185.107.232.1").send(example);
      expect(res.status).toBe(200);

      res = await request(getAppHelper()).get("/email?email=example@example.org");
      expect(res.status).toBe(200);
      expect(res.body).toStrictEqual({
        data: expect.arrayContaining([
          expect.objectContaining({
            event: "click",
            email: "example@example.org",
            subject: "My first Transactional",
            messageId: "xxxxx.xxxxx@example.org",
            templateId: "22",
            tags: ["transac_messages"],
          }),
        ]),
        ok: true,
      });
    });
    it("should should reject invalid IP", async () => {
      const res = await request(getAppHelper()).post("/email").set("x-forwarded-for", "1.2.3.4").send({ subject: "hello", email: "foo@bar.fr" });
      expect(res.status).toBe(401);
    });
    it("should reject when no IP", async () => {
      const res = await request(getAppHelper()).post("/email").send({ subject: "hello", email: "foo@bar.fr" });
      expect(res.status).toBe(401);
    });
  });
  describe("GET /email", () => {
    it("should return 400 if email param is missing", async () => {
      let res = await request(getAppHelper()).get("/email");
      expect(res.status).toBe(400);
    });
    it("should return 400 if email param is not an email", async () => {
      let res = await request(getAppHelper()).get("/email?email=test");
      expect(res.status).toBe(400);
    });
    it("should return 200 if email param is an email", async () => {
      let res = await request(getAppHelper()).get("/email?email=test@example.org");
      expect(res.status).toBe(200);
    });
    it("should reject if not admin", async () => {
      const passport = require("passport");
      const { ADMIN, ...unauthorizedRoles } = ROLES;
      for (const role of Object.values(unauthorizedRoles)) {
        passport.user.role = role;
        let res = await request(getAppHelper()).get("/email?email=test@example.org");
        expect(res.statusCode).toEqual(401);
      }
      passport.user.role = ADMIN;
      res = await request(getAppHelper()).get("/email?email=test@example.org");
      expect(res.statusCode).toEqual(200);
    });
  });
});
