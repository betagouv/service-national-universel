import { CentreModel } from "@admin/core/sejours/phase1/centre/Centre.model";
import { CentreDocument } from "../provider/CentreMongo.provider";
import { CohesionCenterType } from "snu-lib";

export class CentreMapper {
    static toModels(centreDocuments: CentreDocument[]): CentreModel[] {
        return centreDocuments.map((centreDocument) => this.toModel(centreDocument));
    }

    static toModel(centreDocument: CentreDocument): CentreModel {
        return {
            id: centreDocument._id.toString(),
            matricule: centreDocument.matricule,
            nom: centreDocument.name,
            region: centreDocument.region,
            departement: centreDocument.department,
            ville: centreDocument.city,
            codePostal: centreDocument.zip,
            sessionNames: centreDocument.cohorts,
            sessionIds: centreDocument.cohortIds,
            listeAttente: centreDocument.waitingList,
            statutSejour: centreDocument.sessionStatus,
        };
    }

    static toEntity(centreModel: CentreModel): Omit<CohesionCenterType, "createdAt" | "updatedAt"> {
        return {
            _id: centreModel.id,
            matricule: centreModel.matricule,
            name: centreModel.nom,
            region: centreModel.region,
            department: centreModel.departement,
            city: centreModel.ville,
            zip: centreModel.codePostal,
            cohorts: centreModel.sessionNames,
            cohortIds: centreModel.sessionIds,
            waitingList: centreModel.listeAttente,
            sessionStatus: centreModel.statutSejour,
        };
    }
}
