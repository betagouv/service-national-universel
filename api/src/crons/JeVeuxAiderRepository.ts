import { config } from "../config";
import { capture } from "../sentry";

export async function fetchMissions(skip = 0) {
  return fetch(`${config.API_ENGAGEMENT_URL}/v2/mission?snu=true&skip=${skip}&limit=50`, {
    headers: { "x-api-key": config.API_ENGAGEMENT_KEY },
    method: "GET",
  })
    .then((response) => response.json())
    .catch((error) => capture(error));
}

export async function fetchStructureById(id: string) {
  return fetch(`https://www.jeveuxaider.gouv.fr/api/api-engagement/organisations/${id}?apikey=${config.JVA_API_KEY}`, {
    method: "GET",
    redirect: "follow",
  })
    .then((response) => response.json())
    .catch((error) => capture(error));
}
