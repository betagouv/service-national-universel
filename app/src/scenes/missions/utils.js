import { capture } from "@/sentry";
import { API_ENGAGEMENT_KEY, API_ENGAGEMENT_URL } from "@/config";

export async function sendDataToJVA(missionId) {
  try {
    const { ok, data, code } = await fetch(API_ENGAGEMENT_URL + "/v2/activity/" + missionId + "/click?tag=MIG", {
      method: "POST",
      headers: { "X-API-KEY": API_ENGAGEMENT_KEY },
    });

    if (!ok) {
      throw new Error(code);
    }

    // save clickId in data in localstorage
    localStorage.setItem("jva_mission_click_id", data.clickId);
  } catch (e) {
    capture(e);
  }
}
