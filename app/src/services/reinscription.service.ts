import { apiURL } from "@/config";

export async function fetchReInscriptionOpen(): Promise<boolean> {
  return fetch(`${apiURL}/cohort-session/isReInscriptionOpen`, {
    credentials: "include",
    headers: { "x-user-timezone": new Date().getTimezoneOffset().toString() },
  })
    .then((res) => res.json())
    .then((res) => {
      if (!res.ok) throw new Error(res.code);
      return res.data;
    });
}
