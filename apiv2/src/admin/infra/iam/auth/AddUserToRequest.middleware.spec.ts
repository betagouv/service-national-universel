/**
 * Révocation des sessions côté apiv2 (H74).
 *
 * Le middleware ne vérifiait que la signature et l'expiration du JWT : un jeton capturé restait
 * pleinement valide sur toutes les routes /v2 après un logout, un changement de mot de passe ou
 * la désactivation du compte, alors que la passport v1 (api/src/passport.ts) rejette ces jetons.
 */
import { UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ClsService } from "nestjs-cls";
import { ReferentStatus, ROLES } from "snu-lib";

import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { ReferentModel } from "@admin/core/iam/Referent.model";
import { PermissionService } from "@auth/core/Permission.service";
import { CustomRequest } from "@shared/infra/CustomRequest";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

import { AddUserToRequestMiddleware } from "./AddUserToRequest.middleware";
import { AuthProvider } from "./Auth.provider";

const LOGOUT = new Date("2026-09-20T10:00:00.000Z");
const CHANGEMENT_MDP = new Date("2026-09-18T08:30:00.000Z");

describe("AddUserToRequestMiddleware - validité de la session", () => {
    let middleware: AddUserToRequestMiddleware;
    const authProvider = { parseToken: jest.fn() };
    const referentGateway = { findById: jest.fn() };
    const permissionService = { getAcl: jest.fn().mockResolvedValue([]) };

    beforeEach(async () => {
        jest.clearAllMocks();
        permissionService.getAcl.mockResolvedValue([]);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AddUserToRequestMiddleware,
                { provide: AuthProvider, useValue: authProvider },
                { provide: ReferentGateway, useValue: referentGateway },
                { provide: PermissionService, useValue: permissionService },
                { provide: ClsService, useValue: { set: jest.fn() } },
            ],
        }).compile();

        middleware = module.get(AddUserToRequestMiddleware);
    });

    const referent = (surcharge: Partial<ReferentModel> = {}): ReferentModel =>
        ({
            id: "6600000000000000000000aa",
            email: "referent@example.org",
            role: ROLES.REFERENT_DEPARTMENT,
            region: "Bretagne",
            departement: ["Finistère"],
            metadata: {},
            invitationToken: "",
            status: ReferentStatus.ACTIVE,
            lastLogoutAt: LOGOUT,
            passwordChangedAt: CHANGEMENT_MDP,
            ...surcharge,
        }) as ReferentModel;

    const appeler = async (payload: Record<string, unknown>, compte: ReferentModel) => {
        authProvider.parseToken.mockResolvedValue(payload);
        referentGateway.findById.mockResolvedValue(compte);
        const req = { headers: { authorization: "JWT un.jeton.signe" } } as unknown as CustomRequest;
        const next = jest.fn();
        await middleware.use(req, {} as any, next);
        return { req, next };
    };

    const payloadValide = {
        id: "6600000000000000000000aa",
        __v: "0",
        lastLogoutAt: LOGOUT.toISOString(),
        passwordChangedAt: CHANGEMENT_MDP.toISOString(),
    };

    it("accepte un jeton dont les marqueurs de session correspondent au compte", async () => {
        const { req, next } = await appeler(payloadValide, referent());

        expect(next).toHaveBeenCalled();
        expect(req.user.id).toBe("6600000000000000000000aa");
    });

    it("rejette un jeton émis avant un logout", async () => {
        await expect(
            appeler({ ...payloadValide, lastLogoutAt: new Date("2026-09-19T10:00:00.000Z").toISOString() }, referent()),
        ).rejects.toThrow(UnauthorizedException);
    });

    it("rejette un jeton émis avant un changement de mot de passe", async () => {
        await expect(
            appeler(
                { ...payloadValide, passwordChangedAt: new Date("2026-09-01T08:30:00.000Z").toISOString() },
                referent(),
            ),
        ).rejects.toThrow(UnauthorizedException);
    });

    it("rejette un jeton d'une version de signature obsolète", async () => {
        await expect(appeler({ ...payloadValide, __v: "-1" }, referent())).rejects.toThrow(UnauthorizedException);
    });

    it("rejette le jeton d'un compte désactivé", async () => {
        await expect(appeler(payloadValide, referent({ status: ReferentStatus.INACTIVE }))).rejects.toThrow(
            UnauthorizedException,
        );
    });

    it("rejette le jeton d'un compte supprimé", async () => {
        await expect(appeler(payloadValide, referent({ deletedAt: new Date() }))).rejects.toThrow(
            UnauthorizedException,
        );
    });

    it("accepte un compte qui ne s'est jamais déconnecté ni n'a changé de mot de passe", async () => {
        const { next } = await appeler(
            { id: "6600000000000000000000aa", __v: "0", lastLogoutAt: null, passwordChangedAt: null },
            referent({ lastLogoutAt: undefined, passwordChangedAt: undefined }),
        );

        expect(next).toHaveBeenCalled();
    });

    it("rejette un jeton dont le compte n'existe plus", async () => {
        await expect(appeler(payloadValide, null as unknown as ReferentModel)).rejects.toThrow(UnauthorizedException);
    });

    it("répond 401 quand le dépôt ne trouve pas le titulaire du jeton (NOT_FOUND, pas 422)", async () => {
        authProvider.parseToken.mockResolvedValue(payloadValide);
        referentGateway.findById.mockRejectedValue(new FunctionalException(FunctionalExceptionCode.NOT_FOUND));
        const req = { headers: { authorization: "JWT un.jeton.signe" } } as unknown as CustomRequest;

        await expect(middleware.use(req, {} as any, jest.fn())).rejects.toThrow(UnauthorizedException);
    });

    it("répond 401 sans interroger la base quand l'identifiant du jeton n'est pas un ObjectId", async () => {
        await expect(appeler({ ...payloadValide, id: "pas-un-object-id" }, referent())).rejects.toThrow(
            UnauthorizedException,
        );
        expect(referentGateway.findById).not.toHaveBeenCalled();
    });

    it("propage les erreurs techniques du dépôt au lieu de les masquer en 401", async () => {
        authProvider.parseToken.mockResolvedValue(payloadValide);
        referentGateway.findById.mockRejectedValue(new Error("mongo indisponible"));
        const req = { headers: { authorization: "JWT un.jeton.signe" } } as unknown as CustomRequest;

        await expect(middleware.use(req, {} as any, jest.fn())).rejects.toThrow("mongo indisponible");
    });
});
