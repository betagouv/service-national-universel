import { ExecutionContext } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { BrevoIpGuard } from "./BrevoIpGuard";
import { ROLES } from "snu-lib";

describe("BrevoIpGuard", () => {
    let guard: BrevoIpGuard;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [BrevoIpGuard],
        }).compile();

        guard = module.get<BrevoIpGuard>(BrevoIpGuard);
    });

    const createMockContext = (ip: string | null, role = ROLES.ADMIN, subRole = "") => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({
                    ip,
                    user: { role, sousRole: subRole },
                }),
            }),
        } as ExecutionContext;
    };

    it("should allow super admin regardless of IP", async () => {
        const context = createMockContext("192.168.1.1", ROLES.ADMIN, "god");
        expect(await guard.canActivate(context)).toBe(true);
    });

    it.each([["1.179.112.1"], ["1.179.112.255"], ["1.179.127.0"], ["1.179.127.254"], ["1.179.115.123"]])(
        "should allow valid IP %s",
        async (ip) => {
            const context = createMockContext(ip);
            expect(await guard.canActivate(context)).toBe(true);
        },
    );

    it.each([
        ["1.179.111.255"],
        ["1.179.128.0"],
        ["1.179.111.1"],
        ["1.178.112.0"],
        ["2.179.112.0"],
        ["192.168.1.1"],
        ["10.0.0.1"],
    ])("should reject invalid IP %s", async (ip) => {
        const context = createMockContext(ip);
        expect(await guard.canActivate(context)).toBe(false);
    });

    it("should reject if IP is missing", async () => {
        const context = createMockContext(null);
        expect(await guard.canActivate(context)).toBe(false);
    });

    it("should reject malformed IPs", async () => {
        const context = createMockContext("1.179.112.256");
        expect(await guard.canActivate(context)).toBe(false);
    });
});
