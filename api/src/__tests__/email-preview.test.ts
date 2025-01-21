import request from "supertest";
import getAppHelper from "./helpers/app";
import { ERRORS, ROLES } from "snu-lib";
import { getPreviewTemplate } from "../brevo";

jest.mock("../brevo");

const userSuperAdmin = {
  role: ROLES.ADMIN,
  subRole: "god",
};

const userAdmin = {
  role: ROLES.ADMIN,
};

describe("Email Preview Controller", () => {
  describe("GET /email-preview/template/:id", () => {
    it("should return 400 if id is not provided", async () => {
      const res = await request(getAppHelper(userAdmin)).get("/email-preview/template/");
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe(ERRORS.INVALID_PARAMS);
    });

    it("should return 403 if user is not a super admin", async () => {
      const res = await request(getAppHelper(userAdmin)).get("/email-preview/template/123");
      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe(ERRORS.OPERATION_UNAUTHORIZED);
    });

    it("should return 200 with HTML content for valid request", async () => {
      const mockHtmlContent = "<html><body>Test email</body></html>";
      (getPreviewTemplate as jest.Mock).mockResolvedValue({ htmlContent: mockHtmlContent });

      const res = await request(getAppHelper(userSuperAdmin)).get("/email-preview/template/123");
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.html).toBe(mockHtmlContent);
    });

    it("should return 200 with empty HTML if no content is found", async () => {
      const mockHtmlContentEmpty = "";
      (getPreviewTemplate as jest.Mock).mockResolvedValue({ htmlContent: mockHtmlContentEmpty });

      const res = await request(getAppHelper(userSuperAdmin)).get("/email-preview/template/123");
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.html).toBe("");
    });

    it("should return 500 if an error occurs", async () => {
      (getPreviewTemplate as jest.Mock).mockRejectedValue(new Error("Test error"));

      const res = await request(getAppHelper(userSuperAdmin)).get("/email-preview/template/123");
      expect(res.status).toBe(500);
      expect(res.body.ok).toBe(false);
      expect(res.body.code).toBe(ERRORS.SERVER_ERROR);
    });
  });
});
