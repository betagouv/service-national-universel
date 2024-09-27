import React from "react";

export default function ApiEngagementTracker({ missionId }) {
  return <span name="tracker_counter" data-id={missionId} className="hidden" />;
}
