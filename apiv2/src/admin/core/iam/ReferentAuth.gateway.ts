import { ReferentTokenModel } from "./ReferentToken.model";

export interface ReferentAuthGateway {
    signin(email: string, password: string): Promise<ReferentTokenModel>;
}

export const ReferentAuthGateway = Symbol("ReferentAuthGateway");
