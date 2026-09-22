import { getPolicyElasticFilter, getPolicyMongoFilter } from "./policyQuery";
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
      structureId: "64a1f0c2b7e4d3a9c8f1e2d3",
      acl: [{ resource: STRUCTURE, action: PERMISSION_ACTIONS.READ, policy: [{ where: [{ field: "_id", source: "structureId" }] }] }],
    } as any;
    expect(getPolicyMongoFilter({ user, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ })).toEqual({ $or: [{ _id: "64a1f0c2b7e4d3a9c8f1e2d3" }] });
  });

  it("merges several permissions/policies into one $or (supervisor: own structure + network)", () => {
    const user = {
      _id: "u1",
      structureId: "64a1f0c2b7e4d3a9c8f1e2d3",
      acl: [
        { resource: STRUCTURE, action: PERMISSION_ACTIONS.READ, policy: [{ where: [{ field: "_id", source: "structureId" }] }] },
        { resource: STRUCTURE, action: PERMISSION_ACTIONS.READ, policy: [{ where: [{ field: "networkId", source: "structureId" }] }] },
      ],
    } as any;
    expect(getPolicyMongoFilter({ user, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ })).toEqual({
      $or: [{ _id: "64a1f0c2b7e4d3a9c8f1e2d3" }, { networkId: "64a1f0c2b7e4d3a9c8f1e2d3" }],
    });
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
      structureId: "64a1f0c2b7e4d3a9c8f1e2d3",
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

  it("is fail-closed when a value targeting _id is not a valid ObjectId (avoids a Mongoose CastError)", () => {
    const user = {
      _id: "u1",
      structureId: "not-an-object-id",
      acl: [{ resource: STRUCTURE, action: PERMISSION_ACTIONS.READ, policy: [{ where: [{ field: "_id", source: "structureId" }] }] }],
    } as any;
    expect(getPolicyMongoFilter({ user, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ })).toBeUndefined();
  });

  it("keeps a valid ObjectId targeting _id and does not validate other fields", () => {
    const user = {
      _id: "u1",
      structureId: "64a1f0c2b7e4d3a9c8f1e2d3",
      acl: [
        { resource: STRUCTURE, action: PERMISSION_ACTIONS.READ, policy: [{ where: [{ field: "_id", source: "structureId" }] }] },
        { resource: STRUCTURE, action: PERMISSION_ACTIONS.READ, policy: [{ where: [{ field: "networkId", source: "structureId" }] }] },
      ],
    } as any;
    expect(getPolicyMongoFilter({ user, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ })).toEqual({
      $or: [{ _id: "64a1f0c2b7e4d3a9c8f1e2d3" }, { networkId: "64a1f0c2b7e4d3a9c8f1e2d3" }],
    });
  });

  it("ignores permissions for another action", () => {
    const user = {
      _id: "u1",
      structureId: "64a1f0c2b7e4d3a9c8f1e2d3",
      acl: [{ resource: STRUCTURE, action: PERMISSION_ACTIONS.WRITE, policy: [{ where: [{ field: "_id", source: "structureId" }] }] }],
    } as any;
    expect(getPolicyMongoFilter({ user, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ })).toBeUndefined();
  });
});

describe("getPolicyElasticFilter", () => {
  it("returns undefined when user has no acl (caller must reject)", () => {
    expect(getPolicyElasticFilter({ user: { _id: "u1" } as any, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ })).toBeUndefined();
  });

  it("returns null (no restriction) when a permission has no policy", () => {
    const user = { _id: "u1", acl: [{ resource: STRUCTURE, action: PERMISSION_ACTIONS.FULL, policy: [] }] } as any;
    expect(getPolicyElasticFilter({ user, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ })).toBeNull();
  });

  it("targets _id without the .keyword suffix and other fields with it", () => {
    const user = {
      _id: "u1",
      structureId: "64a1f0c2b7e4d3a9c8f1e2d3",
      department: ["Morbihan"],
      acl: [
        {
          resource: STRUCTURE,
          action: PERMISSION_ACTIONS.READ,
          policy: [
            {
              where: [
                { field: "_id", source: "structureId" },
                { field: "department", source: "department" },
              ],
            },
          ],
        },
      ],
    } as any;
    expect(getPolicyElasticFilter({ user, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ })).toEqual({
      bool: {
        minimum_should_match: 1,
        should: [{ terms: { _id: ["64a1f0c2b7e4d3a9c8f1e2d3"] } }, { terms: { "department.keyword": ["Morbihan"] } }],
      },
    });
  });

  it("grants exactly the same perimeter as the mongo translation", () => {
    const user = {
      _id: "u1",
      structureId: "64a1f0c2b7e4d3a9c8f1e2d3",
      acl: [
        { resource: STRUCTURE, action: PERMISSION_ACTIONS.READ, policy: [{ where: [{ field: "_id", source: "structureId" }] }] },
        { resource: STRUCTURE, action: PERMISSION_ACTIONS.READ, policy: [{ where: [{ field: "networkId", source: "structureId" }] }] },
      ],
    } as any;
    const mongo = getPolicyMongoFilter({ user, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ }) as any;
    const elastic = getPolicyElasticFilter({ user, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ }) as any;
    expect(mongo.$or).toHaveLength(2);
    expect(elastic.bool.should).toHaveLength(2);
  });

  it("is fail-closed when no clause is usable", () => {
    const user = {
      _id: "u1",
      region: "",
      acl: [{ resource: STRUCTURE, action: PERMISSION_ACTIONS.READ, policy: [{ where: [{ field: "region", source: "region" }] }] }],
    } as any;
    expect(getPolicyElasticFilter({ user, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ })).toBeUndefined();
  });
});
