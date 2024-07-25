import React from "react";
import { statusColors } from "../engagement.utils";
import { translateStatusMilitaryPreparationFiles } from "snu-lib";

export default function MilitaryStatusBadge({ status }) {
  console.log("🚀 ~ MilitaryStatusBadge ~ status:", status);
  return <p className={`text-xs ${statusColors[status]} rounded-full px-2 py-1`}>{translateStatusMilitaryPreparationFiles(status)}</p>;
}
