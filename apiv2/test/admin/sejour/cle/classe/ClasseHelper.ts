import mongoose from "mongoose";
import { STATUS_CLASSE, STATUS_PHASE1_CLASSE } from "snu-lib";
import { ClasseGateway } from "src/admin/core/sejours/cle/classe/Classe.gateway";
import { ClasseModel } from "src/admin/core/sejours/cle/classe/Classe.model";
import { getAdminTestModuleRef } from "../../../setUpAdminTest";

export const createClasse = async (classe: Partial<ClasseModel>) => {
    const adminTestModule = getAdminTestModuleRef();
    const classeGateway = adminTestModule.get<ClasseGateway>(ClasseGateway);
    return await classeGateway.create({
        nom: "Default Class Name",
        sessionNom: "Nom de session",
        etablissementId: new mongoose.Types.ObjectId().toString(),
        anneeScolaire: "2024",
        academie: "ACADEMY",
        region: "Default Region",
        departement: "Default Department",
        statutPhase1: STATUS_PHASE1_CLASSE.AFFECTED,
        statut: STATUS_CLASSE.CREATED,
        placesTotal: 0,
        placesEstimees: 0,
        placesPrises: 0,
        uniqueKeyAndId: "uniqueKeyAndId",
        uniqueKey: "uniqueKey",
        referentClasseIds: [],
        niveaux: [],
        commentaires: "",
        ...classe,
    });
};
