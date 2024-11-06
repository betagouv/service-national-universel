import request from "supertest";
import { Types } from "mongoose";
const ObjectId = Types.ObjectId;
import getAppHelper from "../helpers/app";
import { dbConnect, dbClose } from "../helpers/db";

beforeAll(dbConnect);
afterAll(dbClose);

describe("GET /cle/young/by-classe-stats/:id", () => {
  it("should return 400 when id is invalid", async () => {
    const res = await request(getAppHelper()).get("/cle/young/by-classe-stats/invalidId").send();
    expect(res.status).toBe(400);
  });
  it("should return 404 when id is not found", async () => {
    const res = await request(getAppHelper()).get(`/cle/young/by-classe-stats/${new ObjectId()}`).send();
    expect(res.status).toBe(404);
  });
});
