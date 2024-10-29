import { apiURL } from "@/config";

export async function fetchReInscriptionOpen() {
  fetch(`${apiURL}/cohort-session/isReInscriptionOpen`, {
    headers: { "x-user-timezone": new Date().getTimezoneOffset() },
  })
    .then((res) => res.json())
    .then((res) => {
      if (!res.ok) throw new Error(res.code);
      return res.data;
    });
}
