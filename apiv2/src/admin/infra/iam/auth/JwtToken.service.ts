import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { TechnicalException, TechnicalExceptionType } from "@shared/infra/TechnicalException";
import { AuthProvider, AuthTokenPayload } from "./Auth.provider";

@Injectable()
export class JwtTokenService implements AuthProvider {
    constructor(
        private jwtService: JwtService,
        private readonly config: ConfigService,
    ) {}

    async parseToken(token: string): Promise<AuthTokenPayload> {
        const secret = this.config.getOrThrow("auth.jwtSecret");
        try {
            const payload = await this.jwtService.verifyAsync(token, { secret });
            const id = payload.id ?? payload._id; // _id is the field used in v1 - TODO REMOVE
            // Les marqueurs de session sont remontés tels quels : c'est le middleware qui les
            // confronte à la base pour rejeter un jeton révoqué (logout, changement de mot de passe).
            return {
                id,
                __v: payload.__v,
                lastLogoutAt: payload.lastLogoutAt,
                passwordChangedAt: payload.passwordChangedAt,
            };
        } catch (error: any) {
            throw new TechnicalException(TechnicalExceptionType.UNAUTORIZED, error);
        }
    }
}
