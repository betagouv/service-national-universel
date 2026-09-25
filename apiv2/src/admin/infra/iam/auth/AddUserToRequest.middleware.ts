import { NextFunction, Response } from "express";
import { ClsService } from "nestjs-cls";
import { Inject, Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ReferentStatus } from "snu-lib";
import { CustomRequest } from "../../../../shared/infra/CustomRequest";
import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { AuthProvider, AuthTokenPayload } from "./Auth.provider";
import { PermissionService } from "@auth/core/Permission.service";
import { ReferentModel } from "@admin/core/iam/Referent.model";
import { ReferentMapper } from "../repository/mongo/Referent.mapper";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

/**
 * Version de signature des JWT de session émis par la v1.
 * Doit rester alignée sur `JWT_SIGNIN_VERSION` (api/src/jwt-options.js) : la faire évoluer
 * côté v1 invalide toutes les sessions, y compris ici.
 */
const JWT_SIGNIN_VERSION = "0";

/** Cookie httpOnly de session posé par la v1 (api/src/auth.ts) pour l'espace admin. */
const COOKIE_SESSION_ADMIN = "jwt_ref";

export const lireCookie = (entete: string | undefined, nom: string): string | undefined => {
    if (!entete) {
        return undefined;
    }
    for (const paire of entete.split(";")) {
        const separateur = paire.indexOf("=");
        if (separateur === -1 || paire.slice(0, separateur).trim() !== nom) {
            continue;
        }
        const valeur = paire.slice(separateur + 1).trim();
        try {
            return decodeURIComponent(valeur);
        } catch {
            return valeur;
        }
    }
    return undefined;
};

const memeInstant = (gauche?: Date | string | null, droite?: Date | string | null): boolean => {
    const a = gauche ? new Date(gauche).getTime() : undefined;
    const b = droite ? new Date(droite).getTime() : undefined;
    return a === b;
};

@Injectable()
export class AddUserToRequestMiddleware implements NestMiddleware {
    constructor(
        @Inject(ReferentGateway) private referentGateway: ReferentGateway,
        @Inject(AuthProvider) private authProvider: AuthProvider,
        @Inject(PermissionService) private permissionService: PermissionService,
        private readonly cls: ClsService,
        private readonly config: ConfigService,
    ) {}

    async use(req: CustomRequest, _: Response, next: NextFunction) {
        const token = this.extraireJeton(req);
        if (!token) {
            throw new UnauthorizedException();
        }

        const payload = await this.authProvider.parseToken(token);
        const user = await this.trouverTitulaire(payload.id);
        if (!user) {
            throw new UnauthorizedException();
        }
        // Signature et expiration ne suffisent pas : un jeton capturé restait sinon valide sur
        // /v2 après un logout, un changement de mot de passe ou la désactivation du compte,
        // alors que la passport v1 (api/src/passport.ts) le rejette.
        if (!this.estSessionValide(payload, user)) {
            throw new UnauthorizedException();
        }
        const acl = await this.permissionService.getAcl(ReferentMapper.toEntity(user as ReferentModel));
        req.user = {
            ...user,
            acl,
        };

        this.cls.set("user", {
            id: user?.id,
            firstName: user?.prenom,
            lastName: user?.nom,
            role: user?.role,
            subRole: user?.sousRole,
            acl,
        });
        next();
    }

    /**
     * Le dépôt lève NOT_FOUND sur un compte absent (jeton d'un jeune, compte supprimé) et
     * mongoose un CastError sur un identifiant mal formé : sans ce filet, un jeton signé mais
     * sans titulaire référent répondait 422 ou 500 au lieu de 401.
     */
    private async trouverTitulaire(id: unknown): Promise<ReferentModel | null> {
        if (typeof id !== "string" || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return null;
        }
        try {
            return await this.referentGateway.findById(id);
        } catch (error) {
            if (error instanceof FunctionalException && error.message === FunctionalExceptionCode.NOT_FOUND) {
                return null;
            }
            throw error;
        }
    }

    /**
     * L'en-tête Authorization reste prioritaire. À défaut, le cookie httpOnly `jwt_ref` est lu, ce
     * qui permet à l'admin de ne plus garder le JWT en localStorage, où toute XSS le lisait (FM16,
     * audit des fronts du 23/09/2026). Comme dans la passport v1 (api/src/passport.ts), le cookie
     * n'est accepté que d'une requête émise par l'admin : le cookie est partagé par tous les
     * sous-domaines, et une autre origine (formulaire, autre front) agirait sinon avec la session.
     */
    private extraireJeton(req: CustomRequest): string | undefined {
        const enTete = req.headers.authorization?.split(" ")?.[1];
        if (enTete) {
            return enTete;
        }
        if (req.headers.origin !== this.config.getOrThrow<string>("urls.admin")) {
            return undefined;
        }
        return lireCookie(req.headers.cookie, COOKIE_SESSION_ADMIN);
    }

    private estSessionValide(payload: AuthTokenPayload, user: ReferentModel): boolean {
        if (payload.__v !== JWT_SIGNIN_VERSION) {
            return false;
        }
        if (user.deletedAt || user.status === ReferentStatus.INACTIVE) {
            return false;
        }
        return (
            memeInstant(payload.lastLogoutAt, user.lastLogoutAt) &&
            memeInstant(payload.passwordChangedAt, user.passwordChangedAt)
        );
    }
}
