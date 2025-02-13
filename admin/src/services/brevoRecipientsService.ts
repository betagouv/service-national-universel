import { ClassesRoutes, EtablissementsRoutes, ReferentsRoutes, SessionPhase1Routes } from "snu-lib";
import { buildRequest } from "@/utils/buildRequest";

const BrevoRecipientsService = {
  getClassesByIds: async (classIds: string[]) => {
    return await buildRequest<ClassesRoutes["GetMany"]>({
      path: "/cle/classes",
      method: "POST",
      payload: { ids: classIds },
      target: "API",
    })();
  },

  getReferentsByIds: async (referentIds: string[]) => {
    return await buildRequest<ReferentsRoutes["GetMany"]>({
      path: "/cle/referent",
      method: "POST",
      payload: { ids: referentIds },
      target: "API",
    })();
  },

  getSessionsPhase1ByIds: async (sessionIds: string[]) => {
    return await buildRequest<SessionPhase1Routes["GetMany"]>({
      path: "/session-phase1/getMany",
      method: "POST",
      payload: { ids: sessionIds },
      target: "API",
    })();
  },

  getEtablissementsByIds: async (etablissementIds: string[]) => {
    return await buildRequest<EtablissementsRoutes["GetMany"]>({
      path: "/cle/etablissement/getMany",
      method: "POST",
      payload: { ids: etablissementIds },
      target: "API",
    })();
  },

  // getCohesionCentersByIds: async (cohesionCenterIds: string[]) => {
  //   return await buildRequest<CohesionCenterRoutes["GetMany"]>({
  //     path: "/cohesion-center/getMany",
  //     method: "POST",
  //     payload: { ids: cohesionCenterIds },
  //     target: "API",
  //   })();
  // },
};

export { BrevoRecipientsService };
