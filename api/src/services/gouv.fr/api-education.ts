import { capture } from "../../sentry";
import { EtablissementProviderDto } from "./etablissementType";
import fetch from "node-fetch";

const baseUrl = "https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-annuaire-education/exports/json";

export const apiEducation = async ({ filters, page, size }, options = { headers: {} }) => {
  try {
    const params = formatParams(filters, page, size);
    const url = new URL(baseUrl + "?" + params);
    console.log("apiEducation - url: ", url.toString());

    const res = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      method: "GET",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.statusText}`);
    }

    const data: EtablissementProviderDto[] = await res.json();

    console.log("apiEducation - response.length: ", data.length);
    return data;
  } catch (e) {
    capture(e);
    return [];
  }
};

export function formatParams(filters: { key: string; value: string | string[] }[], page: number, size?: number): string {
  const type = filters.find((filter) => filter.key === "type")?.value ?? [];
  size = size ?? 20;

  let where = "";

  (filters || []).forEach((filter) => {
    if (filter.key === "uai") {
      if (Array.isArray(filter.value)) {
        where += `identifiant_de_l_etablissement IN ("${filter.value.join('","')}")`;
      } else {
        where += `identifiant_de_l_etablissement="${filter.value}"`;
      }
    }
    if (filter.key === "name") where += `${where.length ? " AND " : ""}nom_etablissement LIKE "${filter.value}"`;
    if (filter.key === "city") where += `${where.length ? " AND " : ""}nom_commune LIKE "${filter.value}"`;
  });

  const params = new URLSearchParams({ where, limit: size.toString(), offset: (page * size).toString() });

  if (type.includes("LYC")) params.append("refine", `type_etablissement:"Lycée"`);
  if (type.includes("COL")) params.append("refine", `type_etablissement:"Collège"`);
  if (type.includes("EREA")) params.append("refine", `type_etablissement:"EREA"`);

  return params.toString();
}
