import { RegionAcademiqueModel, CreateRegionAcademiqueModel } from "../regionAcademique/RegionAcademique.model";

export interface RegionAcademiqueGateway {
    findByCode(code: string): Promise<RegionAcademiqueModel | undefined>;
    create(academie: CreateRegionAcademiqueModel): Promise<RegionAcademiqueModel>;
    update(academie: RegionAcademiqueModel): Promise<RegionAcademiqueModel>;
    deleteAll(): Promise<void>;
}

export const RegionAcademiqueGateway = Symbol("RegionAcademiqueGateway");
