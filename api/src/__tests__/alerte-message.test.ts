import request from "supertest";

import getAppHelper from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";

import { AlerteMessageModel } from "../models";
import getNewAlerteMessageFixture from "./fixtures/alerteMessage";

beforeAll(dbConnect);
afterAll(dbClose);

describe("AlerteMessage Routes", () => {
  beforeEach(async () => {
    await AlerteMessageModel.deleteMany();
  });

  describe("GET /all", () => {
    it("should return 200 and all messages for authorized users", async () => {
      await AlerteMessageModel.create(getNewAlerteMessageFixture());
      const response = await request(getAppHelper()).get("/alerte-message/all");
      expect(response.statusCode).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data.length).toEqual(1);
    });
  });

  describe("GET /:id", () => {
    it("should return 200 and the message for valid ID and authorized users", async () => {
      const message = await AlerteMessageModel.create(getNewAlerteMessageFixture());
      const response = await request(getAppHelper()).get(`/alerte-message/${message._id}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data.content).toEqual(getNewAlerteMessageFixture().content);
    });
    it("should return 400 for invalid ID format", async () => {
      const response = await request(getAppHelper()).get("/alerte-message/invalid_id");
      expect(response.statusCode).toBe(400);
      expect(response.body.ok).toBe(false);
    });

    it("should return 404 for non-existing message ID", async () => {
      const response = await request(getAppHelper()).get("/alerte-message/123456789012345678901234");
      expect(response.statusCode).toBe(404);
      expect(response.body.ok).toBe(false);
    });
  });

  describe("GET /", () => {
    it("should return 200 and messages for the user's role", async () => {
      await AlerteMessageModel.create(getNewAlerteMessageFixture({ to_role: ["admin"] }));
      await AlerteMessageModel.create(getNewAlerteMessageFixture({ to_role: ["referent_region"] }));
      const response = await request(getAppHelper()).get("/alerte-message");
      expect(response.statusCode).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data.length).toEqual(1);
    });
  });

  describe("POST /", () => {
    it("should create a message and return 200 for valid data and authorized users", async () => {
      const response = await request(getAppHelper())
        .post("/alerte-message")
        .send({ content: "Test message", priority: "important", to_role: ["admin"] });
      expect(response.statusCode).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data.content).toEqual("Test message");
    });
    it("should return 400 for invalid data", async () => {
      const response = await request(getAppHelper()).post("/alerte-message").send({ content: "" });
      expect(response.statusCode).toBe(400);
      expect(response.body.ok).toBe(false);
    });
  });

  describe("PUT /:id", () => {
    it("should update a message and return 200 for valid data and authorized users", async () => {
      const message = await AlerteMessageModel.create(getNewAlerteMessageFixture());
      const response = await request(getAppHelper())
        .put(`/alerte-message/${message._id}`)
        .send({ content: "Updated message", priority: "normal", to_role: ["admin"] });
      expect(response.statusCode).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data.content).toEqual("Updated message");
    });
    it("should return 400 for invalid data", async () => {
      const message = await AlerteMessageModel.create(getNewAlerteMessageFixture());
      const response = await request(getAppHelper()).put(`/alerte-message/${message._id}`).send({ content: "" });
      expect(response.statusCode).toBe(400);
      expect(response.body.ok).toBe(false);
    });
    it("should return 404 for non-existing message ID", async () => {
      const response = await request(getAppHelper())
        .put("/alerte-message/123456789012345678901234")
        .send({ content: "Updated message", priority: "normal", to_role: ["admin"] });
      expect(response.statusCode).toBe(404);
      expect(response.body.ok).toBe(false);
    });
  });

  describe("DELETE /:id", () => {
    it("should delete a message and return 200 for authorized users", async () => {
      const message = await AlerteMessageModel.create(getNewAlerteMessageFixture());
      const response = await request(getAppHelper()).delete(`/alerte-message/${message._id}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.ok).toBe(true);
    });
    it("should return 400 for invalid ID format", async () => {
      const response = await request(getAppHelper()).delete("/alerte-message/invalid_id");
      expect(response.statusCode).toBe(400);
      expect(response.body.ok).toBe(false);
    });
    it("should return 404 for non-existing message ID", async () => {
      const response = await request(getAppHelper()).delete("/alerte-message/123456789012345678901234");
      expect(response.statusCode).toBe(404);
      expect(response.body.ok).toBe(false);
    });
  });
});
