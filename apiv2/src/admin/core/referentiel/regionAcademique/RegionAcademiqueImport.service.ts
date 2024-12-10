import { Inject, Injectable } from "@nestjs/common";
import { RegionAcademiqueGateway } from "./RegionAcademique.gateway";
import { CreateRegionAcademiqueModel, RegionAcademiqueModel } from "./RegionAcademique.model";

@Injectable()
export class RegionAcademiqueImportService {
    constructor(
        @Inject(RegionAcademiqueGateway) private readonly regionAcademiqueGateway: RegionAcademiqueGateway,
    ) {}

    async import(regionAcademique: CreateRegionAcademiqueModel | RegionAcademiqueModel): Promise<RegionAcademiqueModel> {
        const regionAcademiqueDB = await this.regionAcademiqueGateway.findByCode(regionAcademique.code);

        if (!regionAcademiqueDB) {
            return this.regionAcademiqueGateway.create(regionAcademique);
        }
       
        if (this.canBeUpdated(regionAcademique, regionAcademiqueDB)) {
            return this.regionAcademiqueGateway.update({
                ...regionAcademique,
                id: regionAcademiqueDB.id
            } as RegionAcademiqueModel);
        }

        return regionAcademiqueDB;
    }

    private canBeUpdated(siEntity, internalEntity) {
        return siEntity.dateDerniereModificationSI > internalEntity.dateDerniereModificationSI;
    }
}
