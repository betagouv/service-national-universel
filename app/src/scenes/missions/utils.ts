// API doc: https://www.notion.so/jeveuxaider/API-x-SNU-MIG-b6fd11bcb6ff485ca1d42ae175af8411?pvs=4#0df977f0cbe04f74bbb0c1ee16e0e4a9

import { API_ENGAGEMENT_SNU_ID, API_ENGAGEMENT_URL, environment } from "@/config";
import { capture } from "@/sentry";
import API from "@/services/api";
import { APPLICATION_STATUS, SENDINBLUE_TEMPLATES } from "snu-lib";
import { MissionAndApplicationType } from "../phase2/engagement.repository";

export async function apiEngagement(missionId) {
  try {
    if (environment !== "production") return;

    const url = `${API_ENGAGEMENT_URL}/v2/activity/${missionId}/${API_ENGAGEMENT_SNU_ID}/click?tag=MIG`;
    const options = { method: "POST" };
    const res = await fetch(url, options);
    const { ok, data, code } = await res.json();

    if (!ok) throw new Error(code);

    localStorage.setItem("jva_mission_click_id", data._id);
  } catch (e) {
    capture(e);
  }
}

export async function notifyApiEngagement(mission: MissionAndApplicationType) {
  if (mission?.apiEngagementId && (!mission.application || mission.application?.status === APPLICATION_STATUS.WAITING_ACCEPTATION)) {
    await apiEngagement(mission.apiEngagementId);
  }
}

const templateMap = {
  [APPLICATION_STATUS.ABANDON]: [SENDINBLUE_TEMPLATES.referent.ABANDON_APPLICATION],
  [APPLICATION_STATUS.WAITING_VALIDATION]: [SENDINBLUE_TEMPLATES.referent.NEW_APPLICATION],
  [APPLICATION_STATUS.CANCEL]: [SENDINBLUE_TEMPLATES.young.CANCEL_APPLICATION, SENDINBLUE_TEMPLATES.referent.CANCEL_APPLICATION],
};

export async function notifyApplicationUpdated(applicationId: string, newStatus: string) {
  for (const template of templateMap[newStatus]) {
    try {
      const { ok, code } = await API.post(`/application/${applicationId}/notify/${template}`);
      if (!ok) throw new Error(code);
    } catch (e) {
      capture(e);
    }
  }
}
