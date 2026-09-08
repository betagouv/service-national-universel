import { ForbiddenException } from "@nestjs/common";
import { ROLES } from "snu-lib";

import { CustomRequest } from "@shared/infra/CustomRequest";
import { StructureController } from "./Structure.controller";

describe("StructureController", () => {
    it("passes a scope filter for a RESPONSIBLE", async () => {
        const gateway = { findAll: jest.fn().mockResolvedValue([]) };
        const controller = new StructureController(gateway as any);
        const req = { user: { role: ROLES.RESPONSIBLE, structureId: "s1" } } as unknown as CustomRequest;

        await controller.findAll({ fields: ["id", "name"] } as any, req);

        expect(gateway.findAll).toHaveBeenCalledWith(["id", "name"], { $or: [{ _id: "s1" }, { networkId: "s1" }] });
    });

    it("passes no filter for an ADMIN", async () => {
        const gateway = { findAll: jest.fn().mockResolvedValue([]) };
        const controller = new StructureController(gateway as any);
        const req = { user: { role: ROLES.ADMIN } } as unknown as CustomRequest;

        await controller.findAll({} as any, req);

        expect(gateway.findAll).toHaveBeenCalledWith(undefined, undefined);
    });

    it("throws ForbiddenException for a user without a usable perimeter", async () => {
        const gateway = { findAll: jest.fn().mockResolvedValue([]) };
        const controller = new StructureController(gateway as any);
        const req = { user: { role: ROLES.REFERENT_REGION } } as unknown as CustomRequest;

        await expect(controller.findAll({} as any, req)).rejects.toBeInstanceOf(ForbiddenException);
        expect(gateway.findAll).not.toHaveBeenCalled();
    });
});
