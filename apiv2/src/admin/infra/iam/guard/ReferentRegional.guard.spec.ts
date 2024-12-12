import { ExecutionContext } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ReferentRegionalGuard } from "./ReferentRegional.guard";
import { ROLES } from "snu-lib";

describe("ReferentRegionalGuard", () => {
    let guard: ReferentRegionalGuard;
    let context: ExecutionContext;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ReferentRegionalGuard],
        }).compile();

        guard = module.get<ReferentRegionalGuard>(ReferentRegionalGuard);
        context = {
            switchToHttp: () => ({
                getRequest: () => ({
                    user: {
                        role: ROLES.REFERENT_REGION,
                    },
                }),
            }),
        } as ExecutionContext;
    });

    it("should return true for a referent regional", async () => {
        expect(await guard.canActivate(context)).toBe(true);
    });

    it("should return false for a non-referent regional", async () => {
        const nonReferentContext = {
            switchToHttp: () => ({
                getRequest: () => ({
                    user: {
                        role: "user",
                    },
                }),
            }),
        } as ExecutionContext;

        expect(await guard.canActivate(nonReferentContext)).toBe(false);
    });
});
