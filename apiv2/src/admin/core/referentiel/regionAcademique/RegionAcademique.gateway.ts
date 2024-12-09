import { RegionAcademiqueModel, CreateRegionAcademiqueModel } from "../regionAcademique/RegionAcademique.model";

export interface RegionAcademiqueGateway {
    findByCode(code: string): Promise<RegionAcademiqueModel>;
    insert(academie: CreateRegionAcademiqueModel): Promise<RegionAcademiqueModel>;
    update(academie: RegionAcademiqueModel): Promise<RegionAcademiqueModel>;
}

export const RegionAcademiqueGateway = Symbol("RegionAcademiqueGateway");
