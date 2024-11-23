import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { ReferentPasswordModel } from "@admin/core/iam/Referent.model";
import { TechnicalException, TechnicalExceptionType } from "@shared/infra/TechnicalException";
import { AuthProvider } from "./Auth.provider";

@Injectable()
export class JwtTokenService implements AuthProvider {
    constructor(
        private jwtService: JwtService,
        private readonly config: ConfigService,
    ) {}

    async forgeToken(referent: ReferentPasswordModel): Promise<string> {
        const v1Payload = {
            _id: referent.id,
            __v: "0",
            lastLogoutAt: referent.lastLogoutAt,
            passwordChangedAt: referent.passwordChangedAt,
        }; // fields required by apiv1 - TODO REMOVE
        const payload = { ...v1Payload, id: referent.id }; //
        return await this.jwtService.signAsync(payload, { secret: this.config.getOrThrow("auth.jwtSecret") });
    }

    async parseToken(token: string): Promise<string> {
        const secret = this.config.getOrThrow("auth.jwtSecret");
        try {
            const payload = await this.jwtService.verifyAsync(token, { secret });
            const id = payload.id ?? payload._id; // _id is the field used in v1 - TODO REMOVE
            return id;
        } catch (error: any) {
            throw new TechnicalException(TechnicalExceptionType.UNAUTORIZED, error);
        }
    }
}
