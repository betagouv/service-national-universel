// API doc: https://www.notion.so/jeveuxaider/API-x-SNU-MIG-b6fd11bcb6ff485ca1d42ae175af8411?pvs=4#0df977f0cbe04f74bbb0c1ee16e0e4a9

import { API_ENGAGEMENT_SNU_ID, API_ENGAGEMENT_URL, environment } from "@/config";
import { capture } from "@/sentry";

export async function sendDataToJVA(jvaMissionId) {
  try {
    const url = `${API_ENGAGEMENT_URL}/v2/activity/${jvaMissionId}/${API_ENGAGEMENT_SNU_ID}/click?tag=MIG`;
    const options = { method: "POST" };

    if (environment === "production") {
      const res = await fetch(url, options);
      const { ok, data, code } = await res.json();
      if (!ok) {
        throw new Error(code);
      }
      localStorage.setItem("jva_mission_click_id", data.clickId);
    } else {
      console.log("Sending tracking data to API Engagement:", url);
    }
  } catch (e) {
    capture(e);
  }
}
