import mongoose from "mongoose";
import { AcademieGateway } from "@admin/core/referentiel/academie/Academie.gateway";
import { AcademieModel } from "@admin/core/referentiel/academie/Academie.model";
import { getAdminTestModuleRef } from "../../setUpAdminTest";

export const createAcademie = async (academie?: Partial<AcademieModel>) => {
    const adminTestModule = getAdminTestModuleRef();
    const academieGateway = adminTestModule.get<AcademieGateway>(AcademieGateway);
    return await academieGateway.create({
        id: new mongoose.Types.ObjectId().toString(),
        code: "001",
        libelle: "LYON",
        regionAcademique: "AUVERGNE-RHONE-ALPES",
        dateCreationSI: new Date("2024-07-31"),
        dateDerniereModificationSI: new Date("2024-07-31"),
        ...academie,
    });
};


export const deleteAllAcademies = async () => {
    const adminTestModule = getAdminTestModuleRef();
    const academieGateway = adminTestModule.get<AcademieGateway>(AcademieGateway);
    await academieGateway.deleteAll();
};
