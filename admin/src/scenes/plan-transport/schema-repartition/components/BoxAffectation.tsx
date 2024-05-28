import React from "react";

import { Box, MiniTitle, Loading } from "../../components/commons";
import ProgressBar from "../../components/ProgressBar";
import { BoxProps } from "./types";

export default function BoxAffectation({ summary, className, loading }: BoxProps) {
  return (
    <Box className={className}>
      <MiniTitle className="mb-[10px]">Affectation des volontaires</MiniTitle>
      {loading ? (
        <Loading width={"w-full"} />
      ) : (
        <>
          <ProgressBar total={summary.total} value={summary.assigned} className="my-[10px]" />
          <div className="flex items-center">
            <div className="mr-[16px] flex items-center text-[12px] leading-[14px] text-[#1F2937]">
              <div className="h-[7px] w-[7px] rounded-[100px] bg-[#303958]" />
              <b className="mx-[5px]">{summary.assigned}</b>
              affectés
            </div>
            <div className="mr-[16px] flex items-center text-[12px] leading-[14px] text-[#1F2937]">
              <div className="h-[7px] w-[7px] rounded-[100px] bg-[#E5E7EB]" />
              <b className="mx-[5px]">{Math.max(0, summary.total - summary.assigned)}</b>
              <span>restants</span>
            </div>
          </div>
        </>
      )}
    </Box>
  );
}
