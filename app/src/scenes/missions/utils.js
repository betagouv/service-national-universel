import { capture } from "@/sentry";

export async function sendDataToJVA(missionId) {
  try {
    const { ok, data, code } = await fetch("https://api.api-engagement.beta.gouv.fr/v2" + missionId + "click?tag=MIG", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!ok) {
      throw new Error(code);
    }

    // save clickId in data in localstorage
    localStorage.setItem("clickId", data.clickId);
  } catch (e) {
    capture(e);
  }
}
