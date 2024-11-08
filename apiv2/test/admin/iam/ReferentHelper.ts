import { randomUUID } from "crypto";
import mongoose from "mongoose";
import { ROLES } from "snu-lib";
import { ReferentGateway } from "src/admin/core/iam/Referent.gateway";
import { ReferentModel } from "src/admin/core/iam/Referent.model";
import { getAdminTestModuleRef } from "../setUpAdminTest";

export const createReferent = (referent?: Partial<ReferentModel>) => {
    const adminTestModule = getAdminTestModuleRef();
    const referentGateway = adminTestModule.get<ReferentGateway>(ReferentGateway);
    return referentGateway.create({
        id: new mongoose.Types.ObjectId().toString(),
        prenom: "prenom",
        nom: "nom",
        email: `${randomUUID()}@mail.com`,
        region: "",
        departement: ["Paris"],
        telephone: "0600000000",
        mobile: "0600000000",
        role: ROLES.ADMIN,
        sousRole: "god",
        metadata: {},
        invitationToken: "",
        ...referent,
    });
};
