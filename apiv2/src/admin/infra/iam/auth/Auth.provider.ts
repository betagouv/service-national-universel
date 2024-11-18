import { ReferentPasswordModel } from "src/admin/core/iam/Referent.model";

export interface AuthProvider {
    forgeToken(referent: ReferentPasswordModel): Promise<string>;
    parseToken(token: string): Promise<string>;
}

export const AuthProvider = Symbol("AuthProvider");
