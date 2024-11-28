import { ClassesRoutes } from "snu-lib";

import { buildRequest } from "@/utils/buildRequest";

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
};

export { ClasseService };
