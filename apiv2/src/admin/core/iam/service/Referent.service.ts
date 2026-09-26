import { Inject, Injectable } from "@nestjs/common";
import { ReferentGateway } from "../Referent.gateway";
import { ReferentModel } from "../Referent.model";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

@Injectable()
export class ReferentService {
    constructor(@Inject(ReferentGateway) private readonly referentGateway: ReferentGateway) {}

    async findByEmail(email: string): Promise<ReferentModel> {
        const referent = await this.referentGateway.findByEmail(email);
        if (!referent) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return referent;
    }
}
