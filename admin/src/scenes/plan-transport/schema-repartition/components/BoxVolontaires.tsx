import React from "react";
import { Link } from "react-router-dom";
import cx from "classnames";

import ExternalLink from "@/assets/icons/ExternalLink";
import People from "@/assets/icons/People";
import { formatRate } from "../../util";
import { Box, MiniTitle, Badge, BigDigits, Loading } from "../../components/commons";
import { BoxProps } from "./types";

export default function BoxVolontaires({ summary, className, loading }: BoxProps) {
  return (
    <Box className="flex flex-row justify-between">
      <div className="flex items-start flex-col">
        <div className={cx("mb-[10px] flex items-center", className)}>
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
      </div>
      {!loading && (
        <div className={cx("flex flex-col items-end justify-between")}>
          <MiniTitle>Objectifs:</MiniTitle>
          <BigDigits className="mx-[8px]">{summary.goal}</BigDigits>
        </div>
      )}
    </Box>
  );
}
