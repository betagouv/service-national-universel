import mongoose from "mongoose";
import { DepartementGateway } from "@admin/core/referentiel/departement/Departement.gateway";
import { DepartementModel } from "@admin/core/referentiel/departement/Departement.model";
import { getAdminTestModuleRef } from "../../setUpAdminTest";

export const createDepartement = async (departement?: Partial<DepartementModel>) => {
    const adminTestModule = getAdminTestModuleRef();
    const departementGateway = adminTestModule.get<DepartementGateway>(DepartementGateway);
    return await departementGateway.create({
        id: new mongoose.Types.ObjectId().toString(),
        code: "01",
        libelle: "AIN",
        academie: "LYON",
        regionAcademique: "AUVERGNE-RHONE-ALPES",
        dateCreationSI: new Date("2024-07-31"),
        dateDerniereModificationSI: new Date("2024-07-31"),
        ...departement,
    });
};
