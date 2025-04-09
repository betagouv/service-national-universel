import mongoose from "mongoose";
import { fakerFR as faker } from "@faker-js/faker";

import { PlanDeTransportGateway } from "@admin/core/sejours/phase1/PlanDeTransport/PlanDeTransport.gateway";
import { PlanDeTransportModel } from "@admin/core/sejours/phase1/PlanDeTransport/PlanDeTransport.model";

import { getAdminTestModuleRef } from "../../../setUpAdminTest";

export const createPlanDeTransport = async (planDeTransport?: Partial<PlanDeTransportModel>) => {
    const adminTestModule = getAdminTestModuleRef();
    const planDeTransportGateway = adminTestModule.get<PlanDeTransportGateway>(PlanDeTransportGateway);

    return await planDeTransportGateway.create({
        id: new mongoose.Types.ObjectId().toString(),
        numeroLigne: faker.lorem.words(),
        capaciteJeunes: faker.number.int({ min: 11, max: 20 }),
        placesOccupeesJeunes: faker.number.int({ min: 1, max: 10 }),
        heureDepartCentre: "10:00",
        heureArriveeCentre: "16:00",
        dureeTrajet: faker.number.int({ min: 1, max: 4 }).toString(),
        capaciteAccompagnateurs: faker.number.int({ min: 1, max: 10 }),
        capaciteTotal: faker.number.int({ min: 31, max: 40 }),
        dateRetour: faker.date.past().toISOString(),
        dateDepart: faker.date.past().toISOString(),
        // name: faker.lorem.words(),
        centreId: new mongoose.Types.ObjectId().toString(),
        sessionId: new mongoose.Types.ObjectId().toString(),
        sessionNom: "Février 2023 - C",
        centreNom: "centreNom",
        centreRegion: "centreRegion",
        centreDepartement: "centreDepartement",
        ligneFusionneeNumerosLignes: [],
        ...planDeTransport,
    });
};
