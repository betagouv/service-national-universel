import React from "react";
import { Link } from "react-router-dom";

import { ROLES, getDepartmentNumber } from "snu-lib";

import { Box, MiniTitle, Badge, BigDigits, Loading } from "../../components/commons";
import { BoxProps } from "./types";
import { User } from "@/types";

import FrenchMap from "@/assets/icons/FrenchMap";
import ChevronRight from "@/assets/icons/ChevronRight";

export default function BoxCentres({ summary, className, loading, isNational, isDepartmental, user }: BoxProps & { isNational?: boolean; isDepartmental?: boolean; user: User }) {
  return (
    <Box className={`overflow-hidden ${className}`}>
      <FrenchMap className="absolute right-[-40px] top-[30px] z-[0]" />
      <MiniTitle className="mb-[10px] flex items-center">
        {isDepartmental ? (
          <>
            <span className="mr-[8px]">Régions d&apos;accueil</span>
            {loading ? <Loading width="w-1/3" /> : <Badge>{summary.centers} CENTRES</Badge>}
          </>
        ) : (
          "Centres"
        )}
      </MiniTitle>
      {!isDepartmental && <>{loading ? <Loading width="w-1/3" /> : <BigDigits>{summary.centers}</BigDigits>}</>}
      {!isNational && loading ? (
        <Loading width="w-1/3" />
      ) : (
        <ul className="mb-6 list-none">
          {summary.toRegions.map((region) => (
            <React.Fragment key={region.name}>
              <li className="mt-[12px] text-[15px] font-bold leading-[18px] text-[#171725]">{region.name}</li>
              {isDepartmental && (
                <li className="text-[12px], mt-[2px] leading-[14px] text-[#1F2937]">
                  {region.departments.map((department) => `${department} (${getDepartmentNumber(department)})`).join(", ")}
                </li>
              )}
            </React.Fragment>
          ))}
        </ul>
      )}
      {user.role !== ROLES.TRANSPORTER && (
        <Link to="/table-repartition" className="absolute right-[20px] bottom-[14px] flex items-center text-[12px] text-[#2563EB] hover:text-[#000000]">
          Table de répartition <ChevronRight className="ml-[5px]" />
        </Link>
      )}
    </Box>
  );
}
