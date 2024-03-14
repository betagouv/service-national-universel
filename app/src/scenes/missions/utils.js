import { apiEngagementKey, apiEngagementUrl } from "@/config";
import { capture } from "@/sentry";

export async function sendDataToJVA(missionId) {
  try {
    const res = await fetch(apiEngagementUrl + "/v2/activity/" + missionId + "/click?tag=MIG", {
      method: "POST",
      headers: { "X-API-KEY": apiEngagementKey },
    });
    const { ok, data, code } = await res.json();

    if (!ok) {
      throw new Error(code);
    }

    // save clickId in data in localstorage
    localStorage.setItem("jva_mission_click_id", data.clickId);
  } catch (e) {
    capture(e);
  }
}
