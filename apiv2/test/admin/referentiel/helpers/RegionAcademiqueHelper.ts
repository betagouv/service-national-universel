import mongoose from "mongoose";
import { RegionAcademiqueGateway } from "@admin/core/referentiel/regionAcademique/RegionAcademique.gateway";
import { RegionAcademiqueModel } from "@admin/core/referentiel/regionAcademique/RegionAcademique.model";
import { getAdminTestModuleRef } from "../../setUpAdminTest";

export const createRegionAcademique = async (regionAcademique?: Partial<RegionAcademiqueModel>) => {
    const adminTestModule = getAdminTestModuleRef();
    const regionAcademiqueGateway = adminTestModule.get<RegionAcademiqueGateway>(RegionAcademiqueGateway);
    return await regionAcademiqueGateway.create({
        id: new mongoose.Types.ObjectId().toString(),
        code: "BRE",
        libelle: "BRETAGNE", 
        zone: "B",
        dateDerniereModificationSI: new Date("2024-07-31"),
        ...regionAcademique,
    });
};

export const deleteAllRegionAcademiques = async () => {
    const adminTestModule = getAdminTestModuleRef();
    const regionAcademiqueGateway = adminTestModule.get<RegionAcademiqueGateway>(RegionAcademiqueGateway);
    await regionAcademiqueGateway.deleteAll();
};
