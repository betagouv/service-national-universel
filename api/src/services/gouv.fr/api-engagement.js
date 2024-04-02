// API doc: https://www.notion.so/jeveuxaider/API-x-SNU-MIG-b6fd11bcb6ff485ca1d42ae175af8411?pvs=4

const { APPLICATION_STATUS } = require("snu-lib");
const config = require("../../config");

const apiEngagementStatus = {
  [APPLICATION_STATUS.WAITING_VALIDATION]: "PENDING",
  [APPLICATION_STATUS.VALIDATED]: "VALIDATED",
  [APPLICATION_STATUS.DONE]: "DONE",
};

const apiEngagement = {
  /**
   * @param {string} missionId - API Engagement GUID, not SNU ID or JVA ID
   * @param {string} [clickId] - Optional. Click ID stored in local storage to match a redirection to an application creation.
   */
  create: async (missionId, clickId) => {
    let url = config.API_ENGAGEMENT_URL + "/v2/activity/" + missionId + "/click";
    if (clickId) url += `?clickId=${clickId}`;

    const res = await fetch(url, { method: "POST" });
    const { ok, data, code, message } = await res.json();

    if (!ok) {
      console.error("Error while sending tracking data to API Engagement:", code, message);
      throw new Error(code);
    }
    console.log("🚀 ~ sendTrackingDataToJva ~ data:", data);
    return data;
  },

  update: async (application) => {
    if (!application.apiEngagementId) {
      console.error("No API Engagement ID found for application", application._id);
      return;
    }

    // We only track application creation, validation and completion (not cancellation, refusal, etc.)
    if (!Object.keys(apiEngagementStatus).includes(application.status)) {
      return;
    }

    const url = config.API_ENGAGEMENT_URL + "/v2/activity/" + application.apiEngagementId;
    console.log("🚀 ~ update: ~ url:", url);

    const options = {
      method: "PUT",
      headers: { "X-API-KEY": config.API_ENGAGEMENT_KEY },
      body: JSON.stringify({ status: apiEngagementStatus[application.status] }),
    };
    console.log("🚀 ~ update: ~ options:", options);

    const res = await fetch(url, options);
    const { ok, data, code, message } = await res.json();

    if (!ok) {
      console.error("Error while sending tracking data to API Engagement:", code, message);
      throw new Error(code);
    }
    console.log("🚀 ~ sendTrackingDataToJva ~ data:", data);
  },
};

module.exports = { apiEngagement };
