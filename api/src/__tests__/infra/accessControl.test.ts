// @ts-ignore
import request from "supertest";
import getAppHelper from "../helpers/app";
import passport from "passport";
import { ROLES } from "snu-lib";
import SpyInstance = jest.SpyInstance;

const app = getAppHelper();
app.use("/fake-endpoint", require("./fakeEndpoint").default);

beforeEach(() => {
  passport.user = { _id: "123" };
  passport.user.role = ROLES.VISITOR;
});

describe("GET /fake-endpoint/admin", () => {
  it("should return 403 when called with unauthorized user", async () => {
    const response = await request(app).get("/fake-endpoint/admin").send();
    expect(response.status).toBe(403);
  });

  it("should return 200 when called with authorized user", async () => {
    passport.user.role = ROLES.ADMIN;
    const response = await request(app).get("/fake-endpoint/admin").send();
    expect(response.status).toBe(200);
  });
});

describe("GET /fake-endpoint/referent-classe", () => {
  it("should return 403 when called with unauthorized user", async () => {
    const response = await request(app).get("/fake-endpoint/referent-classe").send();
    expect(response.status).toBe(403);
  });

  it("should return 200 when called with authorized user", async () => {
    passport.user.role = ROLES.REFERENT_CLASSE;
    const response = await request(app).get("/fake-endpoint/referent-classe").send();
    expect(response.status).toBe(200);
  });
});

describe("GET /fake-endpoint/unprotected", () => {
  it("should return 200 when called with visitor", async () => {
    const response = await request(app).get("/fake-endpoint/unprotected").send();
    expect(response.status).toBe(200);
  });

  it("should return 200 when called with authorized user", async () => {
    passport.user.role = ROLES.REFERENT_CLASSE;
    const response = await request(app).get("/fake-endpoint/referent-classe").send();
    expect(response.status).toBe(200);
  });
});

describe("Unknown user", () => {
  let passportSpy: SpyInstance;
  beforeAll(() => {
    passportSpy = jest.spyOn(passport, "authenticate").mockImplementation(() => {
      return (req, res, next) => {
        res.status(401).send();
      };
    });
  });
  afterAll(() => {
    passportSpy.mockRestore();
  });
  it("should return 200 when /public is called with unknown user", async () => {
    const response = await request(app).get("/fake-endpoint/public").send();
    expect(response.status).toBe(200);
  });
  it("should return 401 when protected route is called with unknown user", async () => {
    const response = await request(app).get("/fake-endpoint/referent-classe").send();
    expect(response.status).toBe(401);
  });

  it("should return 401 when protected /admin route is called with unknown user", async () => {
    const response = await request(app).get("/fake-endpoint/admin").send();
    expect(response.status).toBe(401);
  });

  it("should return 401 when unprotected /unprotected route is called with unknown user", async () => {
    const response = await request(app).get("/fake-endpoint/admin").send();
    expect(response.status).toBe(401);
  });

  it("should return 404 when unknown route is called with /public as a prefix", async () => {
    const response = await request(app).get("/fake-endpoint/public/unknown").send();
    expect(response.status).toBe(404);
  });
});
