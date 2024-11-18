import { Inject, Injectable } from "@nestjs/common";
import { ReferentAuthGateway } from "../ReferentAuth.gateway";
import { UseCase } from "@shared/core/UseCase";
import { ReferentTokenModel } from "../ReferentToken.model";

@Injectable()
export class SigninReferent implements UseCase<ReferentTokenModel> {
    constructor(@Inject(ReferentAuthGateway) private readonly referentAuthGateway: ReferentAuthGateway) {}
    async execute(email: string, password: string): Promise<any> {
        return await this.referentAuthGateway.signin(email, password);
    }
}
