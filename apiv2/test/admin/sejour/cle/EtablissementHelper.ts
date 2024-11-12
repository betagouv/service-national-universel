import mongoose, { Types } from "mongoose";
import { CLE_SECTOR, CLE_TYPE } from "snu-lib";
import { EtablissementGateway } from "src/admin/core/sejours/cle/etablissement/Etablissement.gateway";
import { EtablissementModel } from "src/admin/core/sejours/cle/etablissement/Etablissement.model";
import { getAdminTestModuleRef } from "../../setUpAdminTest";

export const createEtablissement = async (etablissement?: Partial<EtablissementModel>) => {
    const adminTestModule = getAdminTestModuleRef();
    const etablissementGateway = adminTestModule.get<EtablissementGateway>(EtablissementGateway);
    return await etablissementGateway.create({
        id: new mongoose.Types.ObjectId().toString(),
        coordinateurIds: [],
        referentEtablissementIds: [],
        codePostal: "75000",
        commune: "Paris",
        pays: "France",
        departement: "Paris",
        academie: "Paris",
        region: "Ile de France",
        nom: "Lycée",
        type: [CLE_TYPE.GENERAL_HIGHSCHOOL],
        uai: "0750000A",
        anneesScolaires: ["2024-2025"],
        etat: "active",
        secteur: [CLE_SECTOR.PUBLIC],
        ...etablissement,
    });
};
