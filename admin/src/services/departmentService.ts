import { DepartmentServiceRoutes } from "snu-lib";

import { buildRequest } from "@/utils/buildRequest";

const DepartmentService = {
  exportContacts: async ({ sessionId }: DepartmentServiceRoutes["ExportContacts"]["params"]) => {
    const { ok, code, data } = await buildRequest<DepartmentServiceRoutes["ExportContacts"]>({
      method: "GET",
      path: "/department-service/{sessionId}/DepartmentServiceContact/export",
      params: {
        sessionId,
      },
    })();
    if (!ok) {
      throw new Error(code);
    }
    return data!;
  },
};

export { DepartmentService };
