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
   * Create a new application in API Engagement.
   * @param {object} application - Application object
   * @param {string} missionId - API Engagement GUID, not SNU ID or JVA ID
   * @param {string} [clickId] - Optional. Click ID stored in local storage to match a redirection with an application creation.
   */
  create: async (application, missionId, clickId) => {
    try {
      if (config.ENVIRONMENT !== "production") return;

      if (application.status !== APPLICATION_STATUS.WAITING_VALIDATION) return;

      let url = config.API_ENGAGEMENT_URL + "/v2/activity/" + missionId + "/apply?tag=MIG";
      if (clickId) url += `&clickId=${clickId}`;

      const options = {
        method: "POST",
        headers: { "X-API-KEY": config.API_ENGAGEMENT_KEY },
      };

      const res = await fetch(url, options);
      const { ok, data, code } = await res.json();

      if (!ok) throw new Error(code);

      return data;
    } catch (e) {
      console.error("Error while sending tracking data to API Engagement:", e);
    }
  },

  update: async (application) => {
    try {
      if (config.ENVIRONMENT !== "production") return;

      // We only track application creation, validation and completion (not cancelation, refusal, etc.)
      if (!Object.keys(apiEngagementStatus).includes(application.status)) return;

      if (!application.apiEngagementId) {
        throw new Error("No API Engagement ID found for application" + application._id);
      }

      const url = config.API_ENGAGEMENT_URL + "/v2/activity/" + application.apiEngagementId;

      const options = {
        method: "PUT",
        headers: {
          "X-API-KEY": config.API_ENGAGEMENT_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: apiEngagementStatus[application.status] }),
      };

      const res = await fetch(url, options);
      const { ok, data, code } = await res.json();

      if (!ok) throw new Error(code);

      return data;
    } catch (e) {
      console.error("Error while sending tracking data to API Engagement:", e);
    }
  },
};

module.exports = { apiEngagement };
