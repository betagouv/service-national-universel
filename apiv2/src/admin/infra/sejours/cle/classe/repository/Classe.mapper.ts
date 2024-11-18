import { ClasseType } from "snu-lib";
import { ClasseModel } from "../../../../../core/sejours/cle/classe/Classe.model";
import { ClasseDocument } from "../provider/ClasseMongo.provider";

export class ClasseMapper {
    static toModels(classeDocuments: ClasseDocument[]): ClasseModel[] {
        return classeDocuments.map((classeDocument) => this.toModel(classeDocument));
    }

    static toModel(classeDocument: ClasseDocument): ClasseModel {
        return {
            id: classeDocument._id.toString(),
            nom: classeDocument.name,
            sessionNom: classeDocument.cohort,
            departement: classeDocument.department,
            statut: classeDocument.status,
            region: classeDocument.region,
            etablissementId: classeDocument.etablissementId,
            anneeScolaire: classeDocument.schoolYear,
            statutPhase1: classeDocument.statusPhase1,
            placesEstimees: classeDocument.estimatedSeats,
            placesTotal: classeDocument.totalSeats,
            uniqueKey: classeDocument.uniqueKey,
            uniqueKeyAndId: classeDocument.uniqueKeyAndId,
            academie: classeDocument.academy,
            referentClasseIds: classeDocument.referentClasseIds,
            sessionId: classeDocument.sessionId,
            uniqueId: classeDocument.uniqueId,
            placesPrises: classeDocument.seatsTaken,
            niveau: classeDocument.grade,
            niveaux: classeDocument.grades,
            centreCohesionId: classeDocument.cohesionCenterId,
            sessionPhase1Id: classeDocument.sessionId,
            ligneId: classeDocument.ligneId,
            pointDeRassemblementId: classeDocument.pointDeRassemblementId,
            commentaires: classeDocument.comments,
            trimestre: classeDocument.trimester,
            type: classeDocument.type,
            filiere: classeDocument.filiere,
            coloration: classeDocument.coloration,
        };
    }

    static toEntity(classeModel: ClasseModel): Omit<ClasseType, "metadata" | "createdAt" | "updatedAt"> {
        return {
            _id: classeModel.id,
            name: classeModel.nom,
            cohort: classeModel.sessionNom,
            department: classeModel.departement,
            status: classeModel.statut,
            region: classeModel.region,
            etablissementId: classeModel.etablissementId,
            schoolYear: classeModel.anneeScolaire,
            statusPhase1: classeModel.statutPhase1,
            estimatedSeats: classeModel.placesEstimees,
            totalSeats: classeModel.placesTotal,
            uniqueKey: classeModel.uniqueKey,
            uniqueKeyAndId: classeModel.uniqueKeyAndId,
            academy: classeModel.academie,
            referentClasseIds: classeModel.referentClasseIds,
            sessionId: classeModel.sessionId,
            uniqueId: classeModel.uniqueId,
            seatsTaken: classeModel.placesPrises,
            grade: classeModel.niveau,
            grades: classeModel.niveaux,
            cohesionCenterId: classeModel.centreCohesionId,
            ligneId: classeModel.ligneId,
            pointDeRassemblementId: classeModel.pointDeRassemblementId,
            comments: classeModel.commentaires,
            trimester: classeModel.trimestre,
            type: classeModel.type,
            filiere: classeModel.filiere,
            coloration: classeModel.coloration,
        };
    }
}
