import { isAuthorized } from "./accessControl";
import { PERMISSION_ACTIONS } from "./constantes/actions";
import { ROLES } from "../roles";
import { PERMISSION_RESOURCES } from "./constantes/resources";

const mockUser = {
  _id: "123",
  role: ROLES.ADMIN,
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  region: "Ile-de-France",
  department: "75",
};

describe("isAuthorized", () => {
  it("should return false when user is not defined", () => {
    const result = isAuthorized({
      user: null as any,
      ressource: PERMISSION_RESOURCES.REFERENT,
      action: PERMISSION_ACTIONS.READ,
    });
    expect(result).toBe(false);
  });
  it("should return false when user has no acl", () => {
    const result = isAuthorized({
      user: {
        ...mockUser,
        acl: undefined,
      },
      ressource: PERMISSION_RESOURCES.REFERENT,
      action: PERMISSION_ACTIONS.READ,
    });
    expect(result).toBe(false);
  });
  describe("when user has permission without policy", () => {
    it("should return true when user has permission without policy", () => {
      const result = isAuthorized({
        user: {
          ...mockUser,
          acl: [
            {
              ressource: PERMISSION_RESOURCES.REFERENT,
              action: PERMISSION_ACTIONS.READ,
              code: "referent:read",
              policy: [],
            },
          ],
        },
        ressource: PERMISSION_RESOURCES.REFERENT,
        action: PERMISSION_ACTIONS.READ,
      });
      expect(result).toBe(true);
    });
    it("should return true when user has FULL permission (READ)", () => {
      const result = isAuthorized({
        user: {
          ...mockUser,
          acl: [
            {
              ressource: PERMISSION_RESOURCES.REFERENT,
              action: PERMISSION_ACTIONS.FULL,
              code: "referent:full",
              policy: [],
            },
          ],
        },
        ressource: PERMISSION_RESOURCES.REFERENT,
        action: PERMISSION_ACTIONS.READ,
      });
      expect(result).toBe(true);
    });
  });
  describe("when user has permission with policy", () => {
    it("should return true when policy conditions are met (value)", () => {
      const result = isAuthorized({
        user: {
          ...mockUser,
          acl: [
            {
              ressource: PERMISSION_RESOURCES.REFERENT,
              action: PERMISSION_ACTIONS.FULL,
              code: "referent:full",
              policy: [
                {
                  where: [
                    {
                      field: "department",
                      value: "75",
                    },
                  ],
                  blacklist: [],
                  whitelist: [],
                },
              ],
            },
          ],
        },
        ressource: PERMISSION_RESOURCES.REFERENT,
        action: PERMISSION_ACTIONS.READ,
        context: { referent: { department: "75" } },
      });
      expect(result).toBe(true);
    });
    it("should return true when policy conditions are met (source)", () => {
      const result = isAuthorized({
        user: {
          ...mockUser,
          acl: [
            {
              ressource: PERMISSION_RESOURCES.REFERENT,
              action: PERMISSION_ACTIONS.FULL,
              code: "referent:full",
              policy: [
                {
                  where: [
                    {
                      field: "_id",
                      source: "_id",
                    },
                  ],
                  blacklist: [],
                  whitelist: [],
                },
              ],
            },
          ],
        },
        ressource: PERMISSION_RESOURCES.REFERENT,
        action: PERMISSION_ACTIONS.READ,
      });
      expect(result).toBe(true);
    });
    it("should return false when policy conditions are not met (value)", () => {
      const result = isAuthorized({
        user: {
          ...mockUser,
          department: "13",
          acl: [
            {
              ressource: PERMISSION_RESOURCES.REFERENT,
              action: PERMISSION_ACTIONS.FULL,
              code: "referent:full",
              policy: [
                {
                  where: [
                    {
                      field: "department",
                      value: "75",
                    },
                  ],
                  blacklist: [],
                  whitelist: [],
                },
              ],
            },
          ],
        },
        ressource: PERMISSION_RESOURCES.REFERENT,
        action: PERMISSION_ACTIONS.READ,
        context: { referent: { department: "13" } },
      });
      expect(result).toBe(false);
    });
  });
});
