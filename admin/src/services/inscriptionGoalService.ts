import { InscriptionGoalsRoutes } from "snu-lib";

import { buildRequest } from "@/utils/buildRequest";

const InscriptionGoalService = {
  getTauxRemplissage: async ({ cohort, department }: InscriptionGoalsRoutes["GetTauxRemplissage"]["params"]) => {
    const {
      ok,
      code,
      data: fillingRate,
    } = await buildRequest<InscriptionGoalsRoutes["GetTauxRemplissage"]>({
      method: "GET",
      path: "/inscription-goal/{cohort}/department/{department}",
      params: {
        cohort,
        department,
      },
    })();
    if (!ok) {
      throw new Error(code);
    }
    return fillingRate!;
  },
};

export { InscriptionGoalService };
