import React from "react";

import { Box, MiniTitle, Badge, Loading } from "../../components/commons";
import ProgressArc from "../../components/ProgressArc";
import { BoxProps } from "./types";

export default function BoxDisponibilite({ summary, className, loading, isNational }: BoxProps & { isNational?: boolean }) {
  return (
    <Box className={`flex-column flex justify-between pb-[0px] w-1/3 ${className}`}>
      <div>
        <MiniTitle className="mb-[10px]">Disponibilité des places</MiniTitle>
        {loading ? (
          <Loading width={"w-full"} />
        ) : (
          <>
            {!isNational && summary.toRegions && <div className="mb-[10px] text-[13px] leading-[1.3em] text-[#6B7280]">{summary.toRegions.map((r) => r.name).join(", ")}</div>}
            <div className="flex">
              <Badge className="">{summary.capacity} places</Badge>
            </div>
          </>
        )}
      </div>
      <div className="mt-[30px] h-[130px]">
        {loading ? (
          <Loading width={"w-full"} />
        ) : (
          <ProgressArc total={summary.capacity} value={summary.assigned} legend="Places libres" hilight={Math.max(0, summary.capacity - summary.assigned)} />
        )}
      </div>
    </Box>
  );
}
