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
      resource: PERMISSION_RESOURCES.REFERENT,
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
      resource: PERMISSION_RESOURCES.REFERENT,
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
              resource: PERMISSION_RESOURCES.REFERENT,
              action: PERMISSION_ACTIONS.READ,
              code: "referent:read",
              policy: [],
            },
          ],
        },
        resource: PERMISSION_RESOURCES.REFERENT,
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
              resource: PERMISSION_RESOURCES.REFERENT,
              action: PERMISSION_ACTIONS.FULL,
              code: "referent:full",
              policy: [],
            },
          ],
        },
        resource: PERMISSION_RESOURCES.REFERENT,
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
              resource: PERMISSION_RESOURCES.REFERENT,
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
        resource: PERMISSION_RESOURCES.REFERENT,
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
              resource: PERMISSION_RESOURCES.REFERENT,
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
        resource: PERMISSION_RESOURCES.REFERENT,
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
              resource: PERMISSION_RESOURCES.REFERENT,
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
        resource: PERMISSION_RESOURCES.REFERENT,
        action: PERMISSION_ACTIONS.READ,
        context: { referent: { department: "13" } },
      });
      expect(result).toBe(false);
    });
    it("should return false when policy has no where clause", () => {
      const result = isAuthorized({
        user: {
          ...mockUser,
          acl: [
            {
              resource: PERMISSION_RESOURCES.REFERENT,
              action: PERMISSION_ACTIONS.FULL,
              code: "referent:full",
              policy: [
                {
                  where: [],
                  blacklist: [],
                  whitelist: [],
                },
              ],
            },
          ],
        },
        resource: PERMISSION_RESOURCES.REFERENT,
        action: PERMISSION_ACTIONS.READ,
      });
      expect(result).toBe(false);
    });
    it("should return false when where clause has neither source nor value", () => {
      const result = isAuthorized({
        user: {
          ...mockUser,
          acl: [
            {
              resource: PERMISSION_RESOURCES.REFERENT,
              action: PERMISSION_ACTIONS.FULL,
              code: "referent:full",
              policy: [
                {
                  where: [
                    {
                      field: "department",
                    },
                  ],
                  blacklist: [],
                  whitelist: [],
                },
              ],
            },
          ],
        },
        resource: PERMISSION_RESOURCES.REFERENT,
        action: PERMISSION_ACTIONS.READ,
      });
      expect(result).toBe(false);
    });
    it("should return false when user has no matching permissions", () => {
      const result = isAuthorized({
        user: {
          ...mockUser,
          acl: [
            {
              resource: PERMISSION_RESOURCES.REFERENT,
              action: PERMISSION_ACTIONS.WRITE,
              code: "referent:write",
              policy: [],
            },
          ],
        },
        resource: PERMISSION_RESOURCES.REFERENT,
        action: PERMISSION_ACTIONS.READ,
      });
      expect(result).toBe(false);
    });
    it("should return true when ignorePolicy is true, even if policy conditions are not met", () => {
      const result = isAuthorized({
        user: {
          ...mockUser,
          department: "13",
          acl: [
            {
              resource: PERMISSION_RESOURCES.REFERENT,
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
        resource: PERMISSION_RESOURCES.REFERENT,
        action: PERMISSION_ACTIONS.READ,
        ignorePolicy: true,
      });
      expect(result).toBe(true);
    });
  });
});
