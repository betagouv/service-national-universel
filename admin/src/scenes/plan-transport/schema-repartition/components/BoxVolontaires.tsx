import React from "react";
import { Link } from "react-router-dom";

import ExternalLink from "@/assets/icons/ExternalLink";
import People from "@/assets/icons/People";
import { formatRate } from "../../util";
import { Box, MiniTitle, Badge, BigDigits, Loading } from "../../components/commons";

export default function BoxVolontaires({ summary, className = "", loading }) {
  return (
    <Box>
      <div className={cx("mb-[10px] flex items-center",  className)}>
        <MiniTitle>Volontaires</MiniTitle>
        {!loading && summary.intradepartmental > 0 && (
          <>
            <Badge className="mx-[8px]">{formatRate(summary.assigned, summary.total)} affectés</Badge>
            <Link to="">
              <ExternalLink className="hover:text[#000000] text-[#9CA3AF]" />
            </Link>
          </>
        )}
      </div>
      {loading ? (
        <Loading width={"w-full"} />
      ) : (
        <div className="flex items-center">
          <People className="text-[#9CA3AF]" />
          <BigDigits className="mx-[8px]">{summary.total}</BigDigits>
          {summary.intradepartmental > 0 ? (
            <div>dont {summary.intradepartmental} intra-départemental</div>
          ) : (
            <Badge>{formatRate(summary.assigned, summary.total)} affectés</Badge>
          )}
        </div>
      )}
    </Box>
  );
}
