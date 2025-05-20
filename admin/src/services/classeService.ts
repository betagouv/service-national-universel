import { ClassesRoutes } from "snu-lib";

import { buildFileRequest, buildRequest } from "@/utils/buildRequest";
import { ReferentService } from "./referentService";

const ClasseService = {
  getOne: async (id: ClassesRoutes["GetOne"]["params"]["id"]) => {
    const {
      ok,
      code,
      data: classe,
    } = await buildRequest<ClassesRoutes["GetOne"]>({
      path: "/cle/classe/{id}",
      method: "GET",
      params: { id },
    })();
    if (!ok || !classe) {
      throw new Error(code);
    }
    return classe;
  },

  modifierReferentClasse: async (id: ClassesRoutes["ModifierReferentClasse"]["params"]["id"], modifierReferentDto: ClassesRoutes["ModifierReferentClasse"]["payload"]) => {
    return await buildRequest<ClassesRoutes["ModifierReferentClasse"]>({
      path: "/classe/{id}/referent/modifier-ou-creer",
      method: "POST",
      params: { id },
      payload: modifierReferentDto,
      target: "API_V2",
    })();
  },

  inscrireEleveManuellement: async (
    id: ClassesRoutes["InscriptionManuelle"]["params"]["id"],
    payload: {
      prenom: string;
      nom: string;
      dateDeNaissance: string;
      sexe: string;
    },
  ) => {
    return buildRequest<ClassesRoutes["InscriptionManuelle"]>({
      path: "/classe/{id}/inscription-manuelle",
      method: "POST",
      params: { id },
      payload,
      target: "API_V2",
    })();
  },

  mapDtoToView: (classeDto): NonNullable<ClassesRoutes["GetOne"]["response"]["data"]> => {
    return {
      _id: classeDto.id,
      name: classeDto.nom,
      cohort: classeDto.sessionNom,
      department: classeDto.departement,
      status: classeDto.statut,
      region: classeDto.region,
      etablissementId: classeDto.etablissementId,
      schoolYear: classeDto.anneeScolaire,
      statusPhase1: classeDto.statutPhase1,
      estimatedSeats: classeDto.placesEstimees,
      totalSeats: classeDto.placesTotal,
      uniqueKey: classeDto.uniqueKey,
      uniqueKeyAndId: classeDto.uniqueKeyAndId,
      academy: classeDto.academie,
      referentClasseIds: classeDto.referentClasseIds,
      referents: classeDto.referents.map((referent) => ReferentService.mapReferentToView(referent)),
      sessionId: classeDto.sessionId,
      uniqueId: classeDto.uniqueId,
      seatsTaken: classeDto.placesPrises,
      grade: classeDto.niveau,
      grades: classeDto.niveaux,
      cohesionCenterId: classeDto.centreCohesionId,
      ligneId: classeDto.ligneId,
      pointDeRassemblementId: classeDto.pointDeRassemblementId,
      comments: classeDto.commentaires,
      trimester: classeDto.trimestre,
      type: classeDto.type,
      filiere: classeDto.filiere,
      coloration: classeDto.coloration,
      metadata: classeDto.metadata,
      createdAt: classeDto.createdAt,
      updatedAt: classeDto.updatedAt,
      deletedAt: classeDto.deletedAt,
    };
  },

  validateInscriptionEnMasse: async (
    id: ClassesRoutes["InscriptionEnMasseValider"]["params"]["id"],
    mapping: ClassesRoutes["InscriptionEnMasseValider"]["payload"]["mapping"],
    file: File,
  ) => {
    return await buildFileRequest<ClassesRoutes["InscriptionEnMasseValider"]>({
      path: "/classe/{id}/inscription-en-masse/valider",
      method: "POST",
      params: { id },
      payload: { mapping },
      file,
      target: "API_V2",
    })();
  },

  importInscriptionEnMasse: async (
    id: ClassesRoutes["InscriptionEnMasseImporter"]["params"]["id"],
    mapping: ClassesRoutes["InscriptionEnMasseImporter"]["payload"]["mapping"],
    fileKey: string,
  ) => {
    return await buildRequest<ClassesRoutes["InscriptionEnMasseImporter"]>({
      path: "/classe/{id}/inscription-en-masse/importer",
      method: "POST",
      params: { id },
      payload: { mapping, fileKey },
      target: "API_V2",
    })();
  },

  getStatusInscriptionEnMasse: async (id: ClassesRoutes["InscriptionEnMasseStatut"]["params"]["id"]) => {
    return await buildRequest<ClassesRoutes["InscriptionEnMasseStatut"]>({
      path: "/classe/{id}/inscription-en-masse",
      method: "GET",
      params: { id },
      target: "API_V2",
    })();
  },
};

export { ClasseService };
