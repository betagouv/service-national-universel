import mongoose from "mongoose";

import { getAdminTestModuleRef } from "../../../setUpAdminTest";
import { SejourModel } from "@admin/core/sejours/phase1/sejour/Sejour.model";
import { SejourGateway } from "@admin/core/sejours/phase1/sejour/Sejour.gateway";

export const createSejour = async (sejour?: Partial<SejourModel>) => {
    const adminTestModule = getAdminTestModuleRef();
    const sejourGateway = adminTestModule.get<SejourGateway>(SejourGateway);

    return await sejourGateway.create({
        sessionId: new mongoose.Types.ObjectId().toString(),
        sessionNom: "2021",
        departement: "Yvelines",
        placesTotal: 15,
        placesRestantes: 15,
        status: "VALIDATED",
        sejourSnuIds: [],
        ...sejour,
    });
};
