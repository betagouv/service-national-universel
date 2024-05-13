import StatusText from "../../moderator-ref/subscenes/sejour/components/StatusText";
import React from "react";
import { LoadingBar } from "./loading";

interface Props {
  statuses?: {
    status: string;
    nb: string;
    percentage: string;
    info: string;
    url: string;
  }[];
  className?: string;
  loading?: boolean;
  nocols?: boolean;
  colWidth?: string;
  onStatusClicked: () => void;
}

export default function StatusTable({ statuses, className = "", onStatusClicked = () => {}, loading = false, nocols = false, colWidth = "w-[45%]" }: Props) {
  const columns = nocols
    ? { left: statuses || [], right: [] }
    : statuses
      ? {
          left: statuses.slice(0, Math.ceil(statuses.length / 2)),
          right: statuses.slice(Math.ceil(statuses.length / 2)),
        }
      : {
          left: [],
          right: [],
        };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className="flex justify-center w-100">
        <div className={`flex ${colWidth} flex-col gap-4`}>
          {loading ? (
            <>
              <LoadingBar width="100%" />
              <LoadingBar width="100%" />
              <LoadingBar width="100%" />
              <LoadingBar width="100%" />
              <LoadingBar width="100%" />
              <LoadingBar width="100%" />
            </>
          ) : (
            columns.left.map((column, i) => (
              <StatusText
                status={column.status}
                nb={column.nb}
                percentage={column.percentage}
                key={column.status + "-" + i}
                infoPanel={column.info}
                url={column.url}
                onClick={onStatusClicked}
              />
            ))
          )}
        </div>
        {!nocols && (
          <>
            <div className="flex w-[10%] items-center justify-center">
              <div className="h-3/5 w-[1px] border-r-[1px] border-gray-300"></div>
            </div>
            <div className="flex w-[45%] flex-col gap-4">
              {loading ? (
                <>
                  <LoadingBar width="100%" />
                  <LoadingBar width="100%" />
                  <LoadingBar width="100%" />
                  <LoadingBar width="100%" />
                  <LoadingBar width="100%" />
                  <LoadingBar width="100%" />
                </>
              ) : (
                columns.right.map((column, i) => (
                  <StatusText
                    status={column.status}
                    nb={column.nb}
                    percentage={column.percentage}
                    key={column.status + "-" + i}
                    infoPanel={column.info}
                    url={column.url}
                    onClick={onStatusClicked}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
