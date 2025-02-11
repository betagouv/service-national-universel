import React from "react";
import { formatLongDateFR } from "snu-lib";

export interface ImportFileTypeCellProps {
  fileType: string;
  date: string;
}
export default function ImportFileTypeCell({ fileType, date }) {
  return (
    <div>
      <div className="text-lg font-medium leading-5 text-gray-900">{fileType}</div>
      <div>{formatLongDateFR(date)}</div>
    </div>
  );
}
