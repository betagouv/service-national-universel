import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ReferentPasswordModel } from "src/admin/core/iam/Referent.model";
import { TechnicalException, TechnicalExceptionType } from "@shared/infra/TechnicalException";
import { AuthProvider } from "./Auth.provider";

// TODO inject secret from node-config
const secret = "blabla";
@Injectable()
export class JwtTokenService implements AuthProvider {
    constructor(private jwtService: JwtService) {}

    async forgeToken(referent: ReferentPasswordModel): Promise<string> {
        const payload = { id: referent.id, lastLogoutAt: referent.lastLogoutAt }; //
        // TODO inject secret from node-config
        return await this.jwtService.signAsync(payload, { secret: secret });
    }

    async parseToken(token: string): Promise<string> {
        // TODO inject secret from node-config
        try {
            return (await this.jwtService.verifyAsync(token, { secret: secret })).id;
        } catch (error: any) {
            throw new TechnicalException(TechnicalExceptionType.UNAUTORIZED, error);
        }
    }
}
