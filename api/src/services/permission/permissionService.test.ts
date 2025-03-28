import { PermissionService } from "./permissionService";
import { getPermissions } from "./permissionRepository";
import { CohortType, UserDto } from "snu-lib";

jest.mock("./permissionRepository");
const mockedGetPermissions = getPermissions as jest.Mock;

function flushPromises(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

describe("PermissionService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an error when the action is not found", async () => {
    mockedGetPermissions.mockResolvedValue({});
    const service = new PermissionService();
    await flushPromises();

    const user = { role: "admin" } as UserDto;
    const cohort = {} as CohortType;
    expect(() => service.check(user, cohort, "nonExistingAction")).toThrow("Action nonExistingAction not found");
  });

  it("should return false when permission for the user's role is not defined", async () => {
    mockedGetPermissions.mockResolvedValue({
      action1: {
        // no permission for role "user"
      },
    });
    const service = new PermissionService();
    await flushPromises();

    const user = { role: "user" } as UserDto;
    const cohort = {} as CohortType;
    expect(service.check(user, cohort, "action1")).toBe(false);
  });

  it("should return the boolean permission when defined directly", async () => {
    mockedGetPermissions.mockResolvedValue({
      action1: {
        admin: true,
        user: false,
      },
    });
    const service = new PermissionService();
    await flushPromises();

    const admin = { role: "admin" } as UserDto;
    const user = { role: "user" } as UserDto;
    const cohort = {} as CohortType;
    expect(service.check(admin, cohort, "action1")).toBe(true);
    expect(service.check(user, cohort, "action1")).toBe(false);
  });

  it("should return the cohort property when permission is defined as a string", async () => {
    mockedGetPermissions.mockResolvedValue({
      action1: {
        admin: "active",
      },
    });
    const service = new PermissionService();
    await flushPromises();

    const admin = { role: "admin" } as UserDto;
    const activeCohort = { active: true } as unknown as CohortType;
    const inactiveCohort = { active: false } as unknown as CohortType;
    expect(service.check(admin, activeCohort, "action1")).toBe(true);
    expect(service.check(admin, inactiveCohort, "action1")).toBe(false);
  });
});
