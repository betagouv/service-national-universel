import React from "react";
import { Badge, TBadgeStatus, Tooltip } from "@snu/ds/admin";
import { translate, translateTaskStatus } from "snu-lib";

const MAPPING_STATUS_COLOR: { [key: string]: TBadgeStatus } = {
  PENDING: "none",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "VALIDATED",
  FAILED: "REFUSED",
};

export default function StatusCell(simulation) {
  return (
    <Tooltip id={simulation.id} title={`${translate(simulation.error?.code)} ${simulation.error?.description || ""}`} disabled={!simulation.error?.code}>
      <Badge title={translateTaskStatus(simulation.status)} status={MAPPING_STATUS_COLOR[simulation.status]} />
    </Tooltip>
  );
}
