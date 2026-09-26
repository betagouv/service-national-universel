/**
 * Révocation des sessions côté apiv2 (H74).
 *
 * Le middleware ne vérifiait que la signature et l'expiration du JWT : un jeton capturé restait
 * pleinement valide sur toutes les routes /v2 après un logout, un changement de mot de passe ou
 * la désactivation du compte, alors que la passport v1 (api/src/passport.ts) rejette ces jetons.
 */
import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { ClsService } from "nestjs-cls";
import { ReferentStatus, ROLES } from "snu-lib";

import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { ReferentModel } from "@admin/core/iam/Referent.model";
import { PermissionService } from "@auth/core/Permission.service";
import { CustomRequest } from "@shared/infra/CustomRequest";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

import { AddUserToRequestMiddleware, lireCookie } from "./AddUserToRequest.middleware";
import { AuthProvider } from "./Auth.provider";

const LOGOUT = new Date("2026-09-20T10:00:00.000Z");
const CHANGEMENT_MDP = new Date("2026-09-18T08:30:00.000Z");
const ADMIN_URL = "https://admin.snu.gouv.fr";
const configService = { getOrThrow: (cle: string) => ({ "urls.admin": ADMIN_URL })[cle] };

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
                { provide: ConfigService, useValue: configService },
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

    // GOO-56 (P24, audit du 25/09/2026) : chaque API refuse la session de son côté pour les rôles
    // décommissionnés, même sur un compte resté ACTIVE et un jeton par ailleurs valide.
    it("rejette le jeton d'un compte au rôle décommissionné (GOO-56)", async () => {
        await expect(appeler(payloadValide, referent({ role: ROLES.TRANSPORTER }))).rejects.toThrow(
            UnauthorizedException,
        );
    });

    it("teste roles[] en plus de role pour les rôles décommissionnés", async () => {
        await expect(
            appeler(payloadValide, referent({ role: ROLES.ADMIN, roles: [ROLES.HEAD_CENTER] } as any)),
        ).rejects.toThrow(UnauthorizedException);
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

/**
 * FM16 (audit des fronts du 23/09/2026) : l'admin ne garde plus le JWT en localStorage et
 * s'authentifie sur /v2 par le cookie httpOnly `jwt_ref`, lu seulement depuis l'origine admin.
 */
describe("AddUserToRequestMiddleware - cookie de session admin", () => {
    let middleware: AddUserToRequestMiddleware;
    const authProvider = { parseToken: jest.fn() };
    const referentGateway = { findById: jest.fn() };

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AddUserToRequestMiddleware,
                { provide: AuthProvider, useValue: authProvider },
                { provide: ReferentGateway, useValue: referentGateway },
                { provide: PermissionService, useValue: { getAcl: jest.fn().mockResolvedValue([]) } },
                { provide: ClsService, useValue: { set: jest.fn() } },
                { provide: ConfigService, useValue: configService },
            ],
        }).compile();

        middleware = module.get(AddUserToRequestMiddleware);
        authProvider.parseToken.mockResolvedValue({ id: "6600000000000000000000aa", __v: "0", lastLogoutAt: null, passwordChangedAt: null });
        referentGateway.findById.mockResolvedValue({
            id: "6600000000000000000000aa",
            role: ROLES.REFERENT_DEPARTMENT,
            status: ReferentStatus.ACTIVE,
            metadata: {},
        } as unknown as ReferentModel);
    });

    const appeler = async (headers: Record<string, string>) => {
        const req = { headers } as unknown as CustomRequest;
        const next = jest.fn();
        await middleware.use(req, {} as any, next);
        return next;
    };

    it("lit le cookie jwt_ref d'une requête émise par l'admin", async () => {
        const next = await appeler({ origin: ADMIN_URL, cookie: "autre=1; jwt_ref=jeton.du.cookie" });

        expect(next).toHaveBeenCalled();
        expect(authProvider.parseToken).toHaveBeenCalledWith("jeton.du.cookie");
    });

    it("ignore le cookie d'une requête émise par une autre origine", async () => {
        await expect(appeler({ origin: "https://moncompte.snu.gouv.fr", cookie: "jwt_ref=jeton.du.cookie" })).rejects.toThrow(
            UnauthorizedException,
        );
        expect(authProvider.parseToken).not.toHaveBeenCalled();
    });

    it("ignore le cookie d'une requête sans origine", async () => {
        await expect(appeler({ cookie: "jwt_ref=jeton.du.cookie" })).rejects.toThrow(UnauthorizedException);
    });

    it("garde l'en-tête Authorization prioritaire sur le cookie", async () => {
        await appeler({ authorization: "JWT jeton.de.l.entete", origin: ADMIN_URL, cookie: "jwt_ref=jeton.du.cookie" });

        expect(authProvider.parseToken).toHaveBeenCalledWith("jeton.de.l.entete");
    });

    it("se rabat sur le cookie quand l'en-tête est vide", async () => {
        await appeler({ authorization: "JWT ", origin: ADMIN_URL, cookie: "jwt_ref=jeton.du.cookie" });

        expect(authProvider.parseToken).toHaveBeenCalledWith("jeton.du.cookie");
    });
});

/**
 * PL7 (lot P27, audit du 25/09/2026) : l'apiv2 ne remontait jamais `_impersonateId` — une action
 * faite sous impersonation référent sur /v2 restait attribuée au compte emprunté, sans trace de
 * l'admin usurpateur.
 */
describe("AddUserToRequestMiddleware - traçabilité de l'impersonation (PL7, lot P27)", () => {
    let middleware: AddUserToRequestMiddleware;
    const authProvider = { parseToken: jest.fn() };
    const referentGateway = { findById: jest.fn() };
    const cls = { set: jest.fn() };

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AddUserToRequestMiddleware,
                { provide: AuthProvider, useValue: authProvider },
                { provide: ReferentGateway, useValue: referentGateway },
                { provide: PermissionService, useValue: { getAcl: jest.fn().mockResolvedValue([]) } },
                { provide: ClsService, useValue: cls },
                { provide: ConfigService, useValue: configService },
            ],
        }).compile();

        middleware = module.get(AddUserToRequestMiddleware);
        referentGateway.findById.mockResolvedValue({
            id: "6600000000000000000000aa",
            role: ROLES.REFERENT_DEPARTMENT,
            status: ReferentStatus.ACTIVE,
            metadata: {},
        } as unknown as ReferentModel);
    });

    const req = () => ({ headers: { authorization: "JWT un.jeton.signe" } }) as unknown as CustomRequest;

    it("propage impersonateId sur req.user et dans le contexte CLS", async () => {
        authProvider.parseToken.mockResolvedValue({
            id: "6600000000000000000000aa",
            __v: "0",
            lastLogoutAt: null,
            passwordChangedAt: null,
            impersonateId: "6600000000000000000000bb",
        });
        const requete = req();
        const next = jest.fn();

        await middleware.use(requete, {} as any, next);

        expect(next).toHaveBeenCalled();
        expect(requete.user.impersonateId).toBe("6600000000000000000000bb");
        expect(cls.set).toHaveBeenCalledWith("user", expect.objectContaining({ impersonateId: "6600000000000000000000bb" }));
    });

    it("laisse impersonateId absent hors impersonation", async () => {
        authProvider.parseToken.mockResolvedValue({
            id: "6600000000000000000000aa",
            __v: "0",
            lastLogoutAt: null,
            passwordChangedAt: null,
        });
        const requete = req();

        await middleware.use(requete, {} as any, jest.fn());

        expect(requete.user.impersonateId).toBeUndefined();
    });
});

describe("lireCookie", () => {
    it("extrait la valeur exacte du cookie demandé", () => {
        expect(lireCookie("jwt_ref_old=a; jwt_ref=b%2Ec; x=y", "jwt_ref")).toBe("b.c");
    });

    it("renvoie undefined sans en-tête ou sans cookie correspondant", () => {
        expect(lireCookie(undefined, "jwt_ref")).toBeUndefined();
        expect(lireCookie("jwt_young=a", "jwt_ref")).toBeUndefined();
    });
});
