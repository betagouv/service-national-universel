import mongoose from "mongoose";
import { fakerFR as faker } from "@faker-js/faker";

import { getAdminTestModuleRef } from "../../../setUpAdminTest";
import { PointDeRassemblementModel } from "@admin/core/sejours/phase1/pointDeRassemblement/PointDeRassemblement.model";
import { PointDeRassemblementGateway } from "@admin/core/sejours/phase1/pointDeRassemblement/PointDeRassemblement.gateway";
import { departmentList, regionList } from "snu-lib";

export const createPointDeRassemblement = async (pdr?: Partial<PointDeRassemblementModel>) => {
    const adminTestModule = getAdminTestModuleRef();
    const pointDeRassemblementGateway = adminTestModule.get<PointDeRassemblementGateway>(PointDeRassemblementGateway);

    return await pointDeRassemblementGateway.create({
        id: new mongoose.Types.ObjectId().toString(),
        code: faker.lorem.words(),
        sessionNoms: ["Février 2023 - C"],
        sessionIds: [new mongoose.Types.ObjectId().toString()],
        nom: faker.company.name(),
        adresse: faker.location.streetAddress(),
        codePostal: faker.location.zipCode(),
        ville: faker.location.city(),
        departement: faker.helpers.arrayElement(departmentList),
        region: faker.helpers.arrayElement(regionList),
        academie: faker.location.state(),
        // country: faker.location.country(),
        localisation: {
            lat: Number(faker.location.latitude()),
            lon: Number(faker.location.longitude()),
        },
        matricule: faker.lorem.words(),
        particularitesAcces: faker.lorem.words(),
        uai: faker.string.alpha(8).toUpperCase(),
        numeroOrdre: faker.number.int({ min: 4, max: 16 }).toString().padStart(3, "0"),
        // dateCreation: faker.date.past(),
        // dateDebutValidite: faker.date.past(),
        // dateDerniereModification: faker.date.past(),
        ...pdr,
    });
};
