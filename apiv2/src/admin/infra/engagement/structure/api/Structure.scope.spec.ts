import { ROLES } from "snu-lib";

import { buildStructureScopeFilter } from "./Structure.scope";

describe("buildStructureScopeFilter", () => {
    it("returns null (no restriction) for an ADMIN", () => {
        expect(buildStructureScopeFilter({ role: ROLES.ADMIN })).toBeNull();
    });

    it("returns a region filter for a REFERENT_REGION with a region", () => {
        expect(buildStructureScopeFilter({ role: ROLES.REFERENT_REGION, region: "Bretagne" })).toEqual({
            region: "Bretagne",
        });
    });

    it("returns undefined (forbidden) for a REFERENT_REGION without a region", () => {
        expect(buildStructureScopeFilter({ role: ROLES.REFERENT_REGION })).toBeUndefined();
    });

    it("returns a department $in filter for a REFERENT_DEPARTMENT with departements", () => {
        expect(
            buildStructureScopeFilter({ role: ROLES.REFERENT_DEPARTMENT, departement: ["A", "B"] }),
        ).toEqual({ department: { $in: ["A", "B"] } });
    });

    it("returns undefined (forbidden) for a REFERENT_DEPARTMENT with an empty departement array", () => {
        expect(buildStructureScopeFilter({ role: ROLES.REFERENT_DEPARTMENT, departement: [] })).toBeUndefined();
    });

    it("returns undefined (forbidden) for a REFERENT_DEPARTMENT with no departement", () => {
        expect(buildStructureScopeFilter({ role: ROLES.REFERENT_DEPARTMENT })).toBeUndefined();
    });

    it("returns an $or structureId filter for a RESPONSIBLE with a structureId", () => {
        expect(buildStructureScopeFilter({ role: ROLES.RESPONSIBLE, structureId: "s1" })).toEqual({
            $or: [{ _id: "s1" }, { networkId: "s1" }],
        });
    });

    it("returns undefined (forbidden) for a RESPONSIBLE without a structureId", () => {
        expect(buildStructureScopeFilter({ role: ROLES.RESPONSIBLE })).toBeUndefined();
    });

    it("returns an $or structureId filter for a SUPERVISOR with a structureId", () => {
        expect(buildStructureScopeFilter({ role: ROLES.SUPERVISOR, structureId: "s1" })).toEqual({
            $or: [{ _id: "s1" }, { networkId: "s1" }],
        });
    });

    it("returns undefined (forbidden) for a SUPERVISOR without a structureId", () => {
        expect(buildStructureScopeFilter({ role: ROLES.SUPERVISOR })).toBeUndefined();
    });

    it("returns undefined (forbidden) for an unknown role", () => {
        expect(buildStructureScopeFilter({ role: "unknown" as any })).toBeUndefined();
    });
});
