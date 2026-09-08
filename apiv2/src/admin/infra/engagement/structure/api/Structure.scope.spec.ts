import { PERMISSION_ACTIONS, PERMISSION_RESOURCES, PermissionDto } from "snu-lib";

import { buildStructureScopeFilter } from "./Structure.scope";

// Mirrors production STRUCTURE READ policies seeded by
// api/migrations/20250624122150-seed-responsable-permissions.js.
const adminAcl: PermissionDto[] = [
    { code: "STRUCTURE_FULL", action: PERMISSION_ACTIONS.FULL, resource: PERMISSION_RESOURCES.STRUCTURE, policy: [] },
];

const referentRegionAcl: PermissionDto[] = [
    {
        code: "STRUCTURE_REGIONread",
        action: PERMISSION_ACTIONS.READ,
        resource: PERMISSION_RESOURCES.STRUCTURE,
        policy: [{ where: [{ field: "region", source: "region" }] } as any],
    },
];

const referentDepartmentAcl: PermissionDto[] = [
    {
        code: "STRUCTURE_DEPARTEMENTread",
        action: PERMISSION_ACTIONS.READ,
        resource: PERMISSION_RESOURCES.STRUCTURE,
        policy: [{ where: [{ field: "department", source: "department" }] } as any],
    },
];

const responsibleAcl: PermissionDto[] = [
    {
        code: "STRUCTURE_SAME_STRUCTUREread",
        action: PERMISSION_ACTIONS.READ,
        resource: PERMISSION_RESOURCES.STRUCTURE,
        policy: [{ where: [{ field: "_id", source: "structureId" }] } as any],
    },
];

// Supervisor accumulates both the "tête de réseau" and "same structure" policies (order matters).
const supervisorAcl: PermissionDto[] = [
    {
        code: "STRUCTURE_TETERESEAUread",
        action: PERMISSION_ACTIONS.READ,
        resource: PERMISSION_RESOURCES.STRUCTURE,
        policy: [{ where: [{ field: "networkId", source: "structureId" }] } as any],
    },
    {
        code: "STRUCTURE_SAME_STRUCTUREread",
        action: PERMISSION_ACTIONS.READ,
        resource: PERMISSION_RESOURCES.STRUCTURE,
        policy: [{ where: [{ field: "_id", source: "structureId" }] } as any],
    },
];

const otherResourceAcl: PermissionDto[] = [
    {
        code: "MISSION_READ",
        action: PERMISSION_ACTIONS.READ,
        resource: PERMISSION_RESOURCES.MISSION,
        policy: [{ where: [{ field: "structureId", source: "structureId" }] } as any],
    },
];

describe("buildStructureScopeFilter", () => {
    it("returns null (no restriction) for an admin (FULL permission without policy)", () => {
        expect(buildStructureScopeFilter({ acl: adminAcl })).toBeNull();
    });

    it("returns a region filter for a referent_region with a region", () => {
        expect(buildStructureScopeFilter({ acl: referentRegionAcl, region: "Bretagne" })).toEqual({
            $or: [{ region: "Bretagne" }],
        });
    });

    it("returns undefined (forbidden) for a referent_region without a region", () => {
        expect(buildStructureScopeFilter({ acl: referentRegionAcl, region: "" })).toBeUndefined();
    });

    it("returns a department $in filter for a referent_department with departements", () => {
        expect(
            buildStructureScopeFilter({ acl: referentDepartmentAcl, departement: ["A", "B"] }),
        ).toEqual({ $or: [{ department: { $in: ["A", "B"] } }] });
    });

    it("returns undefined (forbidden) for a referent_department with an empty departement array", () => {
        expect(buildStructureScopeFilter({ acl: referentDepartmentAcl, departement: [] })).toBeUndefined();
    });

    it("returns an $or _id filter for a responsible with a structureId", () => {
        expect(buildStructureScopeFilter({ acl: responsibleAcl, structureId: "64a1f0c2b7e4d3a9c8f1e2d3" })).toEqual({
            $or: [{ _id: "64a1f0c2b7e4d3a9c8f1e2d3" }],
        });
    });

    it("returns an $or networkId/_id filter for a supervisor with a structureId, in policy order", () => {
        expect(buildStructureScopeFilter({ acl: supervisorAcl, structureId: "64a1f0c2b7e4d3a9c8f1e2d3" })).toEqual({
            $or: [{ networkId: "64a1f0c2b7e4d3a9c8f1e2d3" }, { _id: "64a1f0c2b7e4d3a9c8f1e2d3" }],
        });
    });

    it("returns undefined (forbidden) for a supervisor without a structureId", () => {
        expect(buildStructureScopeFilter({ acl: supervisorAcl })).toBeUndefined();
    });

    it("returns undefined (forbidden) for a user with no acl", () => {
        expect(buildStructureScopeFilter({})).toBeUndefined();
    });

    it("returns undefined (forbidden) for a user whose acl only covers another resource", () => {
        expect(buildStructureScopeFilter({ acl: otherResourceAcl, structureId: "64a1f0c2b7e4d3a9c8f1e2d3" })).toBeUndefined();
    });
});
