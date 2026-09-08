import { getPolicyMongoFilter } from "./policyQuery";
import { PERMISSION_ACTIONS } from "./constantes/actions";

const STRUCTURE = "structure";

describe("getPolicyMongoFilter", () => {
  it("returns undefined when user has no acl", () => {
    expect(getPolicyMongoFilter({ user: { _id: "u1" } as any, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ })).toBeUndefined();
  });

  it("returns null (no restriction) when a permission has no policy", () => {
    const user = { _id: "u1", acl: [{ resource: STRUCTURE, action: PERMISSION_ACTIONS.FULL, policy: [] }] } as any;
    expect(getPolicyMongoFilter({ user, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ })).toBeNull();
  });

  it("builds an _id filter for a responsible", () => {
    const user = {
      _id: "u1",
      structureId: "s1",
      acl: [{ resource: STRUCTURE, action: PERMISSION_ACTIONS.READ, policy: [{ where: [{ field: "_id", source: "structureId" }] }] }],
    } as any;
    expect(getPolicyMongoFilter({ user, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ })).toEqual({ $or: [{ _id: "s1" }] });
  });

  it("merges several permissions/policies into one $or (supervisor: own structure + network)", () => {
    const user = {
      _id: "u1",
      structureId: "s1",
      acl: [
        { resource: STRUCTURE, action: PERMISSION_ACTIONS.READ, policy: [{ where: [{ field: "_id", source: "structureId" }] }] },
        { resource: STRUCTURE, action: PERMISSION_ACTIONS.READ, policy: [{ where: [{ field: "networkId", source: "structureId" }] }] },
      ],
    } as any;
    expect(getPolicyMongoFilter({ user, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ })).toEqual({ $or: [{ _id: "s1" }, { networkId: "s1" }] });
  });

  it("uses $in when the user value is an array (referent_department)", () => {
    const user = {
      _id: "u1",
      department: ["Loire-Atlantique", "Vendée"],
      acl: [{ resource: STRUCTURE, action: PERMISSION_ACTIONS.READ, policy: [{ where: [{ field: "department", source: "department" }] }] }],
    } as any;
    expect(getPolicyMongoFilter({ user, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ })).toEqual({
      $or: [{ department: { $in: ["Loire-Atlantique", "Vendée"] } }],
    });
  });

  it("supports static values", () => {
    const user = {
      _id: "u1",
      acl: [{ resource: STRUCTURE, action: PERMISSION_ACTIONS.READ, policy: [{ where: [{ field: "region", value: "Bretagne" }] }] }],
    } as any;
    expect(getPolicyMongoFilter({ user, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ })).toEqual({ $or: [{ region: "Bretagne" }] });
  });

  it("ignores where clauses targeting another resource", () => {
    const user = {
      _id: "u1",
      structureId: "s1",
      acl: [{ resource: "mission", action: PERMISSION_ACTIONS.READ, policy: [{ where: [{ resource: "structure", field: "_id", source: "structureId" }] }] }],
    } as any;
    expect(getPolicyMongoFilter({ user, resource: "mission", action: PERMISSION_ACTIONS.READ })).toBeUndefined();
  });

  it("is fail-closed: returns undefined when the user value is empty", () => {
    const user = {
      _id: "u1",
      structureId: "",
      acl: [{ resource: STRUCTURE, action: PERMISSION_ACTIONS.READ, policy: [{ where: [{ field: "_id", source: "structureId" }] }] }],
    } as any;
    expect(getPolicyMongoFilter({ user, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ })).toBeUndefined();
  });

  it("ignores permissions for another action", () => {
    const user = {
      _id: "u1",
      structureId: "s1",
      acl: [{ resource: STRUCTURE, action: PERMISSION_ACTIONS.WRITE, policy: [{ where: [{ field: "_id", source: "structureId" }] }] }],
    } as any;
    expect(getPolicyMongoFilter({ user, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ })).toBeUndefined();
  });
});
