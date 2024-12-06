import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ReferentAuthGateway } from "@admin/core/iam/ReferentAuth.gateway";
import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { ReferentTokenModel } from "@admin/core/iam/ReferentToken.model";
import { AuthProvider } from "./Auth.provider";
import * as bcrypt from "bcrypt";
import { ReferentMapper } from "../repository/mongo/Referent.mapper";
import { TechnicalException, TechnicalExceptionType } from "@shared/infra/TechnicalException";

@Injectable()
export class ReferentAuthFacade implements ReferentAuthGateway {
    constructor(
        @Inject(ReferentGateway) private referentGateway: ReferentGateway,
        @Inject(AuthProvider) private authProvider: AuthProvider,
    ) {}
    async signin(email: string, password: string): Promise<ReferentTokenModel> {
        const referent = await this.referentGateway.findReferentPasswordByEmail(email);
        if (!referent) {
            throw new TechnicalException(TechnicalExceptionType.UNAUTORIZED, "no referent");
        }
        if (!referent.password) {
            throw new TechnicalException(TechnicalExceptionType.UNAUTORIZED, "no password");
        }
        const isSamePassword = await bcrypt.compare(password, referent.password);

        if (!isSamePassword) {
            throw new TechnicalException(TechnicalExceptionType.UNAUTORIZED, "password does not match");
        }
        const token = await this.authProvider.forgeToken(referent);
        return { user: { ...ReferentMapper.toModelWithoutPassword(referent) }, token };
    }
}
