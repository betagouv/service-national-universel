/**
 * PL7 (lot P27, audit du 25/09/2026) : le jeton v1 porte `_impersonateId` sous impersonation,
 * mais rien côté apiv2 ne le remontait — le middleware ne pouvait pas tracer l'admin usurpateur.
 */
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { JwtTokenService } from "./JwtToken.service";

describe("JwtTokenService.parseToken — remontée de l'impersonateId", () => {
    let service: JwtTokenService;
    const jwtService = { verifyAsync: jest.fn() };
    const configService = { getOrThrow: () => "secret" };

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtTokenService,
                { provide: JwtService, useValue: jwtService },
                { provide: ConfigService, useValue: configService },
            ],
        }).compile();

        service = module.get(JwtTokenService);
    });

    it("remonte _impersonateId du jeton v1 sous le nom impersonateId", async () => {
        jwtService.verifyAsync.mockResolvedValue({ _id: "6600000000000000000000aa", __v: "0", _impersonateId: "6600000000000000000000bb" });

        const payload = await service.parseToken("un.jeton.signe");

        expect(payload.impersonateId).toBe("6600000000000000000000bb");
    });

    it("laisse impersonateId à null hors impersonation", async () => {
        jwtService.verifyAsync.mockResolvedValue({ _id: "6600000000000000000000aa", __v: "0" });

        const payload = await service.parseToken("un.jeton.signe");

        expect(payload.impersonateId).toBeNull();
    });
});
