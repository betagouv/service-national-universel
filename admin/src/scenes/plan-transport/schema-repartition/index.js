import React from "react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import PlanTransportBreadcrumb from "../components/PlanTransportBreadcrumb";
import { Box, BoxHeader, MiniTitle, Badge, AlertPoint, BigDigits } from "../components/commons";
import { Link } from "react-router-dom";
import ChevronRight from "../../../assets/icons/ChevronRight";
import { PlainButton } from "../components/Buttons";
import { cohortList, formatRate } from "../util";
import ExternalLink from "../../../assets/icons/ExternalLink";
import People from "../../../assets/icons/People";
import ProgressBar from "../components/ProgressBar";
import ProgressArc from "../components/ProgressArc";
import IllustrationFrance from "../../../assets/illustrations/France";
import Select from "../components/Select";

export default function SchemaRepartition() {
  const [cohort, setCohort] = React.useState(cohortList[0].value);

  const summary = {
    capacity: 1000,
    total: 750,
    assigned: 609,
    intradepartmental: 9,
    centers: 538,
  };

  const rows = [
    {
      name: "Auvergne-Rhône-Alpes",
      capacity: 170,
      total: 128,
      assigned: 49,
      intradepartmental: 3,
      intradepartmentalAssigned: 2,
    },
    {
      name: "Normandie",
      capacity: 170,
      total: 128,
      assigned: 49,
      intradepartmental: 0,
      intradepartmentalAssigned: 0,
    },
    {
      name: "Paris",
      capacity: 170,
      total: 200,
      assigned: 170,
      intradepartmental: 3,
      intradepartmentalAssigned: 0,
    },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: "Plan de transport", to: "/plan-de-transport" }, { label: "Schéma de répartition" }]} />
      <div className="p-[30px]">
        <div className="flex items-center justify-between">
          <PlanTransportBreadcrumb region={{ label: "Bourgogne-Franche-Comté" }} department={{ label: "Côte d'Or" }} />
          <Select options={cohortList} value={cohort} onChange={(e) => setCohort(e)} />
        </div>
        <div className="flex my-[40px]">
          <div className="flex flex-col grow">
            <BoxVolontaires className="grow mb-[8px]" summary={summary} />
            <BoxAffectation className="grow mt-[8px]" summary={summary} />
          </div>
          <BoxDisponibilite className="grow mx-[16px]" summary={summary} />
          <BoxCentres className="grow" summary={summary} />
        </div>
        <DetailTable rows={rows} />
      </div>
    </div>
  );
}

function BoxVolontaires({ summary, className= "" }) {
  return (
    <Box>
      <div className={`flex items-center mb-[6px] ${className}`}>
        <MiniTitle>Volontaires</MiniTitle>
        {summary.intradepartmental > 0 && <Badge className="mx-[8px]">{formatRate(summary.assigned, summary.total)} affectés</Badge>}
        <Link to="">
          <ExternalLink className="text-[#9CA3AF] hover:text[#000000]" />
        </Link>
      </div>
      <div className="flex items-center">
        <People className="text-[#9CA3AF]" />
        <BigDigits className="mx-[8px]">{summary.total}</BigDigits>
        {summary.intradepartmental > 0 ? (
          <div className="">dont {summary.intradepartmental} intra-départemental</div>
        ) : (
          <Badge>{formatRate(summary.assigned, summary.total)} affectés</Badge>
        )}
      </div>
    </Box>
  );
}

function BoxAffectation({ summary, className = "" }) {
  return (
    <Box className={className}>
      <MiniTitle>Affectation des volontaires</MiniTitle>
      <ProgressBar total={summary.total} value={summary.assigned} className="my-[10px]" />
      <div className="flex items-center">
        <div className="flex items-center mr-[16px] text-[12px] leading-[14px] text-[#1F2937]">
          <div className="rounded-[100px] w-[7px] h-[7px] bg-[#303958]" />
          <b className="mx-[5px]">{summary.assigned}</b>
          affectés
        </div>
        <div className="flex items-center mr-[16px] text-[12px] leading-[14px] text-[#1F2937]">
          <div className="rounded-[100px] w-[7px] h-[7px] bg-[#E5E7EB]" />
          <b className="mx-[5px]">{summary.total - summary.assigned}</b>
          <span>restants</span>
        </div>
      </div>
    </Box>
  );
}

function BoxDisponibilite({ summary, className = "" }) {
  return (
    <Box className={`flex flex-column justify-between pb-[0px] ${className}`}>
      <div>
        <MiniTitle>Disponibilité des places</MiniTitle>
        <div className="text-[13px] leading-[1.3em] text-[#6B7280] mb-[10px]">Centre-Val de Loire, Bretagne, Occitanie</div>
        <div className="flex">
          <Badge className="">{summary.capacity} places</Badge>
        </div>
      </div>
      <div className="mt-[30px] h-[130px]">
        <ProgressArc total={summary.capacity} value={summary.assigned} legend="Places libres" hilight={summary.capacity - summary.assigned} />
      </div>
    </Box>
  );
}

function BoxCentres({ summary, className = "" }) {
  return (
    <Box className={`overflow-hidden ${className}`}>
      <IllustrationFrance className="absolute right-[-40px] top-[30px] z-[0]" />
      <MiniTitle>Centres</MiniTitle>
      <BigDigits>{summary.centers}</BigDigits>
      <Link to="/plan-de-transport/tableau-repartition" className="flex items-center absolute right-[20px] bottom-[14px] text-[#2563EB] text-[12px] hover:text-[#000000]">
        Table de répartition <ChevronRight className="ml-[5px]" />
      </Link>
    </Box>
  );
}

function DetailTable({ rows, className = "" }) {
  async function exportData() {
    console.log("TODO: export data");
  }

  return (
    <Box className={className}>
      <BoxHeader title="">
        <PlainButton onClick={exportData}>Exporter</PlainButton>
      </BoxHeader>
      <div className="">
        <table className="w-[100%]">
          <thead className="text-[#7E858C] text-[11px] leading-[16px] uppercase">
            <tr className="border-b-[1px] border-b-[#F4F5FA]">
              <th className="font-medium py-[17px] pr-[16px]">Département</th>
              <th className="font-medium py-[17px] pr-[16px]">Volontaires</th>
              <th className="font-medium py-[17px] pr-[16px]">Places restantes</th>
              <th className="font-medium py-[17px] pr-[16px]">Volontaires en intra-départemental</th>
              <th className="font-medium py-[17px]">Places restantes dans le département</th>
            </tr>
          </thead>
          <tbody className="font-medium text-[14px] leading-[16px] text-[#1F2937]">
            {rows.map((row) => (
              <tr key={row.name} className="border-b-[1px] border-b-[#F4F5FA]">
                <td className="py-[17px] pr-[16px] font-bold text-[15px] text-[#242526] whitespace-nowrap">{row.name}</td>
                <td className="py-[17px] pr-[16px]">
                  <div className="flex items-center">
                    <div className="mr-[8px]">{row.total}</div>
                    <Badge className="">{formatRate(row.assigned, row.total)} affectés</Badge>
                  </div>
                </td>
                <td className="py-[17px] pr-[16px]">
                  <div className="flex items-center">
                    <AlertPoint threshold={50} value={row.capacity - row.assigned} />
                    <span>{row.capacity - row.assigned}</span>
                  </div>
                </td>
                <td className="py-[17px] pr-[16px]">
                  <div className="flex items-center">
                    <div className="">{row.intradepartmental}</div>
                    <Badge mode={row.intradepartmentalAssigned === row.intradepartmental ? "green" : "blue"} className="mx-[8px]">
                      {formatRate(row.intradepartmentalAssigned, row.intradepartmental)}
                    </Badge>
                    <Link to="">
                      <ExternalLink className="text-[#9CA3AF]" />
                    </Link>
                  </div>
                </td>
                <td className="py-[17px]">
                  <div className="flex items-center">
                    <AlertPoint threshold={0} value={row.capacity - row.assigned} />
                    {row.capacity - row.assigned}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Box>
  );
}
