// import { buildRequest } from "@/utils/buildRequest";
import { apiv2URL } from "@/config";
import API from "./api";

const AffectationService = {
  postAffectationMetropole: async ({ cohortId, departements, niveauScolaires }: { cohortId: string; departements?: string[]; niveauScolaires?: string[] }) => {
    const response = await fetch(`${apiv2URL}/affectation/${cohortId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `JWT ${API.getToken()}` },
      body: JSON.stringify({
        departements,
        niveauScolaires,
      }),
    });

    if (!response.ok) {
      throw new Error(JSON.stringify(await response.json()));
    }

    return response.blob();
  },

  getSimulations: async (cohortId: string) => {
    const response = await fetch(`${apiv2URL}/affectation/${cohortId}/simulations`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `JWT ${API.getToken()}` },
    });
    if (!response.ok) {
      throw new Error(JSON.stringify(await response.json()));
    }

    return response.json();
  },
};

export { AffectationService };
