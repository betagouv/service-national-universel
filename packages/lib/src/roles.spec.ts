import { UserDto } from "./dto";
import { canSigninAs, ROLES, SUB_ROLE_GOD } from "./roles";

describe("canSigninAs function", () => {
  it("should return true if actor is admin and target is not god", () => {
    const actor = { role: ROLES.ADMIN } as UserDto;
    const target = { subRole: "not_god", department: ["dep1"], region: "region1" };
    expect(canSigninAs(actor, target, "referent")).toBe(true);
  });

  it("should return false if actor is admin and target is god", () => {
    const actor = { role: ROLES.ADMIN } as UserDto;
    const target = { role: ROLES.ADMIN, subRole: SUB_ROLE_GOD, department: ["dep1"], region: "region1" };
    expect(canSigninAs(actor, target, "referent")).toBe(false);
  });

  it("should return false if actor is not admin or referent reg dep", () => {
    const actor = { role: ROLES.VISITOR } as UserDto;
    const target = { role: ROLES.ADMINISTRATEUR_CLE, department: ["dep1"], region: "region1" };
    expect(canSigninAs(actor, target, "referent")).toBe(false);
  });

  it("should return true if actor is referent department and target is in same department", () => {
    const actor = { role: ROLES.REFERENT_DEPARTMENT, department: ["dep1"] } as UserDto;
    const target = { role: ROLES.ADMINISTRATEUR_CLE, department: ["dep1"], region: "region1" };
    expect(canSigninAs(actor, target, "referent")).toBe(true);
  });

  it("should return true if actor is referent region and target is in same region", () => {
    const actor = { role: ROLES.REFERENT_REGION, region: "region1" } as UserDto;
    const target = { department: "dep1", region: "region1" };
    expect(canSigninAs(actor, target, "young")).toBe(true);
  });

  it("should return false if actor is referent region and target is not in same region", () => {
    const actor = { role: ROLES.REFERENT_REGION, region: "region1" } as UserDto;
    const target = { department: "dep1", region: "region2" };
    expect(canSigninAs(actor, target, "young")).toBe(false);
  });
});
