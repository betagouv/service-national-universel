import request from "supertest";
import { Types } from "mongoose";
const { ObjectId } = Types;

import { dbConnect, dbClose } from "./helpers/db";
import getAppHelper from "./helpers/app";

// young
import getNewYoungFixture from "./fixtures/young";
import { createYoungHelper } from "./helpers/young";

beforeAll(dbConnect);
afterAll(dbClose);

describe("Young Note Controller", () => {
  describe("POST /young/:youngId/note", () => {
    it("should add a note to a young", async () => {
      const young = await createYoungHelper(getNewYoungFixture());
      const res = await request(getAppHelper()).post(`/young/note/${young._id}`).send({
        note: "Test note",
        phase: "INSCRIPTION",
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body.ok).toEqual(true);
      expect(res.body.data.notes.length).toBeGreaterThan(0);
      expect(res.body.data.notes[res.body.data.notes.length - 1].note).toEqual("Test note");
      expect(res.body.data.notes[res.body.data.notes.length - 1]._id).toBeDefined();
    });

    it("should return 400 if the youngId is invalid", async () => {
      const res = await request(getAppHelper()).post("/young/note/invalidId").send({
        note: "Test note",
        phase: "INSCRIPTION",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.ok).toEqual(false);
    });

    it("should return 400 if the request body is invalid", async () => {
      const res = await request(getAppHelper()).post(`/young/note/${new ObjectId().toString()}`).send({
        note: "Test note",
        phase: "INVALID_PHASE",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.ok).toEqual(false);
    });

    it("should return 404 if the young is not found", async () => {
      const res = await request(getAppHelper()).post(`/young/note/${new ObjectId().toString()}`).send({
        note: "Test note",
        phase: "INSCRIPTION",
      });

      expect(res.statusCode).toEqual(404);
      expect(res.body.ok).toEqual(false);
    });
  });
});
