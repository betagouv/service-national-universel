// https://data.education.gouv.fr/api/explore/v2.1/console

import { capture } from "../../sentry";
import { EtablissementProviderDto } from "../../services/gouv.fr/etablissementType";

const baseUrl = "https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-annuaire-education/records";

export const apiEducation = async ({ filters, page, size }, options = { headers: {} }) => {
  try {
    const type = filters.find((filter: { key: string; value: string | string[] }) => filter.key === "type")?.value ?? [];
    size = size ?? 20;

    let where = "";
    (filters || []).forEach((filter) => {
      if (filter.key === "uai") {
        if (Array.isArray(filter.value)) {
          where += `identifiant_de_l_etablissement IN ("${filter.value.join('","')}")`;
        } else {
          where += `identifiant_de_l_etablissement = "${filter.value}"`;
        }
      }
      if (filter.key === "name") where += `${where.length ? " AND " : ""}nom_etablissement LIKE "${filter.value}"`;
      if (filter.key === "city") where += `${where.length ? " AND " : ""}nom_commune LIKE "${filter.value}"`;
    });

    const params = new URLSearchParams({ where, limit: size.toString(), offset: (page * size).toString() });

    if (!type.length || type.includes("LYC")) params.append("refine", `type_etablissement:"Lycée"`);
    if (!type.length || type.includes("COL")) params.append("refine", `type_etablissement:"Collège"`);
    if (!type.length || type.includes("EREA")) params.append("refine", `type_etablissement:"EREA"`);

    const res = await fetch(new URL(baseUrl + "?" + params.toString()), {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      mode: "cors",
      method: "GET",
    });

    const data: { error?: string; results: EtablissementProviderDto[] } = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }
    if (!data.results) {
      throw new Error("No result found");
    }
    return data.results;
  } catch (e) {
    capture(e);
    return [];
  }
};
