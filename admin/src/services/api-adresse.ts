import { capture } from "../sentry";

/**
 * API Adresse (BAN)
 * https://adresse.data.gouv.fr/api-doc/adresse
 * Filtres possibles : postcode, citycode (INSEE), type, limit, autocomplete
 *
 * TODO: Déplacer dans la snu-lib (en fusionnant avec l'implementation côté api)
 */

export const apiAdress = async (
  query: string,
  filters: {
    postcode?: string;
    citycode?: string; // INSEE
    type?: "municipality" | "locality";
    limit?: number;
    autocomplete?: 1 | 0;
  } = {},
) => {
  let url = `https://data.geopf.fr/geocodage/search/?q=${encodeURIComponent(query)}`;

  for (const [key, value] of Object.entries(filters)) {
    url += `&${key}=${encodeURIComponent(value)}`;
  }

  try {
    const res = await fetch(url, {
      // @ts-ignore
      retries: 3,
      retryDelay: 1000,
      retryOn: [502, 503, 504],
      headers: { "Content-Type": "application/json" },
      mode: "cors",
      method: "GET",
    });
    return await res.json();
  } catch (e) {
    capture(e, { extra: { url: url } });
  }
};
