// API doc: https://doc.api-engagement.beta.gouv.fr/api-reference/tracking-activity/qualifier

import { Model } from "mongoose";
import { ApplicationDocument } from "../../models";

const { APPLICATION_STATUS } = require("snu-lib");
const { config } = require("../../config");
const { capture } = require("../../sentry");

const statusMap = {
  [APPLICATION_STATUS.WAITING_VALIDATION]: "PENDING",
  [APPLICATION_STATUS.VALIDATED]: "VALIDATED",
  [APPLICATION_STATUS.DONE]: "CARRIED_OUT",
  [APPLICATION_STATUS.CANCEL]: "CANCELED",
  [APPLICATION_STATUS.REFUSED]: "REFUSED",
};

export const apiEngagement = {
  /**
   * Create a new application in API Engagement.
   * @param {object} application - Application object
   * @param {string} optional clickId - Click ID
   */
  create: async (application: Partial<ApplicationDocument>, clickId?: string) => {
    try {
      if (config.ENVIRONMENT !== "production") return;

      // When a ref proposes a mission, it does not count as an application creation in API Engagement
      if (application.status === APPLICATION_STATUS.WAITING_ACCEPTATION) return;

      let url = config.API_ENGAGEMENT_URL + "/v2/activity";

      const options = {
        method: "POST",
        headers: {
          "X-API-KEY": config.API_ENGAGEMENT_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "apply", clickId, tag: "MIG" }),
      };

      const res = await fetch(url, options);
      const { ok, data, code } = await res.json();

      if (!ok) {
        capture(`API Engagement responded with code ${code} for application ${application._id}`, "Error while sending tracking data to API Engagement:");
        throw new Error(code);
      }

      return data;
    } catch (e) {
      capture(e, "Error while sending tracking data to API Engagement:");
    }
  },

  update: async (application) => {
    try {
      if (config.ENVIRONMENT !== "production") return;

      if (!Object.keys(statusMap).includes(application.status)) return;

      if (!application.apiEngagementId) return;

      const url = config.API_ENGAGEMENT_URL + "/v2/activity/" + application.apiEngagementId;

      const options = {
        method: "PUT",
        headers: {
          "X-API-KEY": config.API_ENGAGEMENT_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: statusMap[application.status] }),
      };

      const res = await fetch(url, options);
      const { ok, data, code } = await res.json();

      if (!ok) {
        capture(`API Engagement responded with code ${code} for application ${application._id}`, "Error while sending tracking data to API Engagement:");
        throw new Error(code);
      }

      return data;
    } catch (e) {
      capture(e);
    }
  },
};
