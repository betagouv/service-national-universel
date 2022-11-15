import React from "react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import PlanTransportBreadcrumb from "../components/PlanTransportBreadcrumb";
import {Box, BoxHeader, MiniTitle} from "../components/commons";
import {Link} from "react-router-dom";
import ChevronRight from "../../../assets/icons/ChevronRight";
import {PlainButton} from "../components/Buttons";
import {formatRate} from "../util";
import ExternalLink from "../../../assets/icons/ExternalLink";
import People from "../../../assets/icons/People";
import ProgressBar from "../components/ProgressBar";
import ProgressArc from "../components/ProgressArc";

export default function SchemaRepartition() {
  const summary = {
    capacity: 669,
    total: 482,
    assigned: 506,
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
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: "Plan de transport", to: "/plan-de-transport" }, { label: "Schéma de répartition" }]} />
      <div className="p-[30px]">
        <div className="flex items-center justify-between">
          <PlanTransportBreadcrumb region={{ label: "Bourgogne-Franche-Comté" }} department={{ label: "Côte d'Or" }} />
          <Box>
            Séjour du <b>3 au 15 juillet 2022</b>
          </Box>
        </div>
        <div className="flex my-[40px]">
          <div className="flex flex-col grow">
            <Box className="grow-[1_1_50%] mb-[8px]">
              <div className="">
                <MiniTitle>Volontaires</MiniTitle>
                {summary.intradepartmental > 0 && <span className="">{formatRate(summary.assigned, summary.total)} affectés</span>}
                <Link to="">
                  <ExternalLink className="text-[#9CA3AF]" />
                </Link>
              </div>
              <div className="">
                <People className="text-[#9CA3AF]" />
                <span className="">{summary.total}</span>
                {summary.intradepartmental > 0 ? (
                  <div className="">dont {summary.intradepartmental} intra-départemental</div>
                ) : (
                  <span className="">{formatRate(summary.assigned, summary.total)} affectés</span>
                )}
              </div>
            </Box>
            <Box className="grow-[1_1_50%] mt-[8px]">
              <MiniTitle>Affectation des volontaires</MiniTitle>
              <ProgressBar total={summary.total} value={summary.assigned} />
              <div className="">
                <div className="">
                  <div className="" />
                  {summary.assigned}
                  affectés
                </div>
                <div className="">
                  <div className="" />
                  {summary.total - summary.assigned}
                  restants
                </div>
              </div>
            </Box>
          </div>
          <Box className="grow mx-[16px]">
            <MiniTitle>Disponibilité des places</MiniTitle>
            <div className="">Centre-Val de Loire, Bretagne, Occitanie</div>
            <div className="">{summary.capacity} places</div>
            <ProgressArc total={summary.capacity} value={summary.assigned} legend="Places libres" hilight={summary.capacity - summary.assigned} />
          </Box>
          <Box className="grow">
            <MiniTitle>Centres</MiniTitle>
            <div className="">{summary.centers}</div>
            <Link to="/plan-de-transport/tableau-repartition">
              Table de répartition <ChevronRight />
            </Link>
          </Box>
        </div>
        <Box>
          <BoxHeader title="">
            <PlainButton>Exporter</PlainButton>
          </BoxHeader>
          <div className="">
            <table>
              <thead>
                <tr>
                  <th className="">Département</th>
                  <th className="">Volontaires</th>
                  <th className="">Places restantes</th>
                  <th className="">Volontaires en intra-départemental</th>
                  <th className="">Places restantes dans le département</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr>
                    <td className="">{row.name}</td>
                    <td className="">
                      <div className="">{row.total}</div>
                      <div className="">{formatRate(row.assigned, row.total)} affectés</div>
                    </td>
                    <td className=""><AlertPoint threshold={50} value={row.capacity - row.assigned} />{row.capacity - row.assigned}</td>
                    <td className="">
                      <div className="">{row.intradepartmental}</div>
                      <Badge mode={row.intradepartmentalAssigned === row.intradepartmental ? "green" : "blue"}>
                        {formatRate(row.intradepartmentalAssigned, row.intradepartmental)}
                      </Badge>
                      <Link to="">
                        <ExternalLink className="text-[#9CA3AF]" />
                      </Link>
                    </td>
                    <td className=""><AlertPoint threshold={0} value={row.capacity - row.assigned} />{row.capacity - row.assigned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Box>
      </div>
    </div>
  );
}
