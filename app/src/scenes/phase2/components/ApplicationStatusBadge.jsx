import React from "react";
import { statusColors } from "../engagement.utils";
import { translateApplicationForYoungs } from "snu-lib";

export default function ApplicationStatusBadge({ status }) {
  return <p className={`text-xs rounded-full px-2 py-1 w-fit ${statusColors[status]}`}>{translateApplicationForYoungs(status)}</p>;
}
