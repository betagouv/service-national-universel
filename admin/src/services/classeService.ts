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
};

export { ClasseService };
