import StatusText from "../../moderator-ref/subscenes/sejour/components/StatusText";
import React from "react";

export default function StatusTable({ statuses, className = "", onStatusClicked = () => {} }) {
  const columns = statuses
    ? {
        left: statuses.slice(0, Math.ceil(statuses.length / 2)),
        right: statuses.slice(Math.ceil(statuses.length / 2)),
      }
    : {
        left: [],
        right: [],
      };

  return (
    <div className={`flex ${className}`}>
      <div className="flex w-[45%] flex-col gap-4">
        {columns.left.map((column) => (
          <StatusText status={column.status} nb={column.nb} percentage={column.percentage} key={column.status} infoPanel={column.info} onClick={onStatusClicked} />
        ))}
      </div>
      <div className="flex w-[10%] items-center justify-center">
        <div className="h-3/5 w-[1px] border-r-[1px] border-gray-300"></div>
      </div>
      <div className="flex w-[45%] flex-col gap-4">
        {columns.right.map((column) => (
          <StatusText status={column.status} nb={column.nb} percentage={column.percentage} key={column.status} infoPanel={column.info} onClick={onStatusClicked} />
        ))}
      </div>
    </div>
  );
}
