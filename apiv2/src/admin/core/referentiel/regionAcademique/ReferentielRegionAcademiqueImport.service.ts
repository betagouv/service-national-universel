import { RegionAcademiqueGateway } from "./RegionAcademique.gateway";
import { CreateRegionAcademiqueModel, RegionAcademiqueModel } from "./RegionAcademique.model";

export class RegionAcademiqueImportService {
    constructor(
        private readonly regionAcademiqueGateway: RegionAcademiqueGateway,
    ) {}

    async import(regionAcademique: CreateRegionAcademiqueModel | RegionAcademiqueModel): Promise<RegionAcademiqueModel> {
        const regionAcademiqueDB = await this.regionAcademiqueGateway.findByCode(regionAcademique.code);

        if (!regionAcademiqueDB) {
            return this.regionAcademiqueGateway.insert(regionAcademique);
        }

       
        if (this.canBeUpdated(regionAcademique, regionAcademiqueDB)) {
            return this.regionAcademiqueGateway.update({
                ...regionAcademique,
                id: regionAcademiqueDB.id
            } as RegionAcademiqueModel);
        }

        return regionAcademiqueDB;
    }

    private canBeUpdated(externalEntity, internalEntity) {
        return externalEntity.date_derniere_modification_si > internalEntity.date_derniere_modification_si_db;
    }
}
