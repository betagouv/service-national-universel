import { ForbiddenException } from "@nestjs/common";
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES, PermissionDto } from "snu-lib";

import { CustomRequest } from "@shared/infra/CustomRequest";
import { StructureController } from "./Structure.controller";

// Mirrors the STRUCTURE READ policy seeded for responsible/supervisor by
// api/migrations/20250624122150-seed-responsable-permissions.js.
const responsibleAcl: PermissionDto[] = [
    {
        code: "STRUCTURE_SAME_STRUCTUREread",
        action: PERMISSION_ACTIONS.READ,
        resource: PERMISSION_RESOURCES.STRUCTURE,
        policy: [{ where: [{ field: "_id", source: "structureId" }] } as any],
    },
];

const referentRegionAcl: PermissionDto[] = [
    {
        code: "STRUCTURE_REGIONread",
        action: PERMISSION_ACTIONS.READ,
        resource: PERMISSION_RESOURCES.STRUCTURE,
        policy: [{ where: [{ field: "region", source: "region" }] } as any],
    },
];

const adminAcl: PermissionDto[] = [
    { code: "STRUCTURE_FULL", action: PERMISSION_ACTIONS.FULL, resource: PERMISSION_RESOURCES.STRUCTURE, policy: [] },
];

describe("StructureController", () => {
    it("passes a scope filter for a RESPONSIBLE", async () => {
        const gateway = { findAll: jest.fn().mockResolvedValue([]) };
        const controller = new StructureController(gateway as any);
        const req = { user: { acl: responsibleAcl, structureId: "s1" } } as unknown as CustomRequest;

        await controller.findAll({ fields: ["id", "name"] } as any, req);

        expect(gateway.findAll).toHaveBeenCalledWith(["id", "name"], { $or: [{ _id: "s1" }] });
    });

    it("passes no filter for an ADMIN", async () => {
        const gateway = { findAll: jest.fn().mockResolvedValue([]) };
        const controller = new StructureController(gateway as any);
        const req = { user: { acl: adminAcl } } as unknown as CustomRequest;

        await controller.findAll({} as any, req);

        expect(gateway.findAll).toHaveBeenCalledWith(undefined, undefined);
    });

    it("throws ForbiddenException for a user without a usable perimeter", async () => {
        const gateway = { findAll: jest.fn().mockResolvedValue([]) };
        const controller = new StructureController(gateway as any);
        const req = { user: { acl: referentRegionAcl, region: "" } } as unknown as CustomRequest;

        await expect(controller.findAll({} as any, req)).rejects.toBeInstanceOf(ForbiddenException);
        expect(gateway.findAll).not.toHaveBeenCalled();
    });
});
