import mongoose from "mongoose";
import { fakerFR as faker } from "@faker-js/faker";

import { LigneDeBusGateway } from "@admin/core/sejours/phase1/ligneDeBus/LigneDeBus.gateway";
import { LigneDeBusModel } from "@admin/core/sejours/phase1/ligneDeBus/LigneDeBus.model";

import { getAdminTestModuleRef } from "../../../setUpAdminTest";

export const createLigneDeBus = async (ligneDeBus?: Partial<LigneDeBusModel>) => {
    const adminTestModule = getAdminTestModuleRef();
    const ligneDeBusGateway = adminTestModule.get<LigneDeBusGateway>(LigneDeBusGateway);

    return await ligneDeBusGateway.create({
        id: new mongoose.Types.ObjectId().toString(),
        numeroLigne: faker.lorem.words(),
        capaciteJeunes: faker.number.int({ min: 11, max: 20 }),
        placesOccupeesJeunes: faker.number.int({ min: 1, max: 10 }),
        heureDepartCentre: "10:00",
        heureArriveeCentre: "16:00",
        dureeTrajet: faker.number.int({ min: 1, max: 4 }).toString(),
        capaciteAccompagnateurs: faker.number.int({ min: 1, max: 10 }),
        capaciteTotal: faker.number.int({ min: 31, max: 40 }),
        dateRetour: faker.date.past(),
        dateDepart: faker.date.past(),
        // name: faker.lorem.words(),
        centreId: new mongoose.Types.ObjectId().toString(),
        sessionId: new mongoose.Types.ObjectId().toString(),
        sejourId: new mongoose.Types.ObjectId().toString(),
        sessionNom: "Février 2023 - C",
        pointDeRassemblementIds: [],
        ...ligneDeBus,
    });
};
