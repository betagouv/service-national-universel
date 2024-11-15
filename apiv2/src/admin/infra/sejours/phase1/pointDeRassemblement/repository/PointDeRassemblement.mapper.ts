import { PointDeRassemblementType, YoungType } from "snu-lib";

import { PointDeRassemblementDocument } from "../provider/PointDeRassemblementMongo.provider";
import { PointDeRassemblementModel } from "src/admin/core/sejours/phase1/pointDeRassemblement/PointDeRassemblement.model";

export class PointDeRassemblementMapper {
    static toModels(pdrDocuments: PointDeRassemblementDocument[]): PointDeRassemblementModel[] {
        return pdrDocuments.map((pdrDocument) => this.toModel(pdrDocument));
    }

    static toModel(pdrDocument: PointDeRassemblementDocument): PointDeRassemblementModel {
        return {
            id: pdrDocument._id.toString(),
            code: pdrDocument.code,
            matricule: pdrDocument.matricule,
            region: pdrDocument.region,
            departement: pdrDocument.department,
            sessionIds: pdrDocument.cohortIds,
            sessionNoms: pdrDocument.cohorts,
            complementAddress: pdrDocument.complementAddress,
            nom: pdrDocument.name,
            adresse: pdrDocument.address,
            ville: pdrDocument.city,
            codePostal: pdrDocument.zip,
            particularitesAcces: pdrDocument.particularitesAcces,
            geoLoc: pdrDocument.location,
            academie: pdrDocument.academie,
        };
    }

    static toEntity(pdrModel: PointDeRassemblementModel): Omit<PointDeRassemblementType, "createdAt" | "updatedAt"> {
        return {
            _id: pdrModel.id,
            code: pdrModel.code,
            matricule: pdrModel.matricule,
            region: pdrModel.region,
            department: pdrModel.departement,
            cohorts: pdrModel.sessionNoms,
            cohortIds: pdrModel.sessionIds,
            complementAddress: pdrModel.complementAddress,
            name: pdrModel.nom,
            address: pdrModel.adresse,
            city: pdrModel.ville,
            zip: pdrModel.codePostal,
            particularitesAcces: pdrModel.particularitesAcces,
            location: pdrModel.geoLoc,
            academie: pdrModel.academie,
        };
    }
}
