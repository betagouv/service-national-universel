import React from "react";
import { statusColors } from "../engagement.utils";
import { translateEquivalenceStatus } from "snu-lib";

export default function EngagementStatusBadge({ status }) {
  return <p className={`text-xs rounded-full px-2 py-1 w-fit ${statusColors[status]}`}>{translateEquivalenceStatus(status)}</p>;
}
