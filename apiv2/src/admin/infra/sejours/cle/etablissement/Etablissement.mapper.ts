import { EtablissementType } from "snu-lib";
import { EtablissementModel } from "@admin/core/sejours/cle/etablissement/Etablissement.model";
import { EtablissementDocument } from "./provider/EtablissementMongo.provider";
import e from "express";

export class EtablissementMapper {
    static toModel(etablissementDocument: EtablissementDocument): EtablissementModel {
        return {
            id: etablissementDocument._id,
            adresse: etablissementDocument.address,
            codePostal: etablissementDocument.zip,
            commune: etablissementDocument.city,
            pays: etablissementDocument.country,
            departement: etablissementDocument.department,
            academie: etablissementDocument.academy,
            region: etablissementDocument.region,
            nom: etablissementDocument.name,
            type: etablissementDocument.type,
            uai: etablissementDocument.uai,
            etat: etablissementDocument.state,
            anneesScolaires: etablissementDocument.schoolYears,
            secteur: etablissementDocument.sector,
            referentEtablissementIds: etablissementDocument.referentEtablissementIds,
            coordinateurIds: etablissementDocument.coordinateurIds,
            createdAt: etablissementDocument.createdAt,
            updatedAt: etablissementDocument.updatedAt,
            deletedAt: etablissementDocument.deletedAt,
            schoolId: etablissementDocument.schoolId,
        };
    }

    static toEntity(etablissementModel: EtablissementModel): EtablissementType {
        return {
            _id: etablissementModel.id,
            address: etablissementModel.adresse,
            zip: etablissementModel.codePostal,
            city: etablissementModel.commune,
            country: etablissementModel.pays,
            department: etablissementModel.departement,
            academy: etablissementModel.academie,
            region: etablissementModel.region,
            name: etablissementModel.nom,
            type: etablissementModel.type,
            uai: etablissementModel.uai,
            state: etablissementModel.etat,
            schoolYears: etablissementModel.anneesScolaires,
            sector: etablissementModel.secteur,
            referentEtablissementIds: etablissementModel.referentEtablissementIds,
            coordinateurIds: etablissementModel.coordinateurIds,
            createdAt: etablissementModel.createdAt,
            updatedAt: etablissementModel.updatedAt,
            deletedAt: etablissementModel.deletedAt,
            schoolId: etablissementModel.schoolId,
        };
    }
}
