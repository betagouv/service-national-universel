import { ClassesRoutes } from "snu-lib";

import { buildRequest } from "@/utils/buildRequest";

const ClasseService = {
  getOne: (id: ClassesRoutes["GetOne"]["params"]["id"]) => {
    return buildRequest<ClassesRoutes["GetOne"]>({
      path: "/cle/classe/{id}",
      method: "GET",
      params: { id },
    })();
  },
};

export { ClasseService };
