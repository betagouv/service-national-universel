/* eslint-disable import/no-unused-modules */

import React, { useState } from "react";
import { translate } from "snu-lib";
import { Filters, ResultTable, SelectedFilters, Save } from "..";

import { useHistory } from "react-router-dom";

import ArrowUp from "../../../assets/ArrowUp";
import Comment from "../../../assets/comment";

import { getTransportIcon } from "../../../scenes/plan-transport/util";

export default function test_volontaire() {
  const [data, setData] = useState([]);
  const [paramData, setParamData] = useState({
    size: 20,
    page: 0,
  });

  const [currentTab, setCurrentTab] = React.useState("aller");
  const [selectedFilters, setSelectedFilters] = React.useState({});

  const translateLineFillingRate = (e) => {
    if (e == 0) return "Vide";
    if (e == 100) return "Rempli";
    return `${Math.floor(e / 10) * 10}-${Math.floor(e / 10) * 10 + 10}%`;
  };
  const transformDataTaux = (data) => {
    const newData = [];
    data.map((d) => {
      const dizaine = translateLineFillingRate(parseInt(d.key));
      const val = newData.find((e) => e.key === dizaine);
      if (val) {
        newData[newData.indexOf(val)].doc_count += d.doc_count;
      } else {
        newData.push({ key: dizaine, doc_count: d.doc_count });
      }
    });
    return newData;
  };

  const customQuery = (value) => {
    let rangeArray = [];
    let empty = false;
    let full = false;
    if (Array.isArray(value)) {
      value?.map((e) => {
        if (e === "Vide") empty = true;
        else if (e === "Rempli") full = true;
        else {
          const splitValue = e.split("-");
          const transformedArray = [parseInt(splitValue[0]), parseInt(splitValue[1].replace("%", ""))];
          rangeArray = rangeArray.concat([transformedArray]);
        }
      });
    }
    const body = getDefaultQuery();
    const filter = [];
    if (empty) filter.push({ term: { lineFillingRate: 0 } });
    if (full) filter.push({ term: { lineFillingRate: 100 } });
    if (rangeArray.length > 0) {
      rangeArray.map((e) => {
        filter.push({ range: { lineFillingRate: { gte: e[0] === 0 ? 1 : e[0], lte: e[1] } } });
      });
    }
    if (empty || full || rangeArray.length > 0) {
      body.query.bool.minimum_should_match = 1;
      body.query.bool.should = filter;
    }
    return body;
  };

  const searchBarObject = {
    placeholder: "Rechercher une ligne (numéro, ville, region)",
    datafield: ["busId", "pointDeRassemblements.region", "pointDeRassemblements.city", "centerCode", "centerCity", "centerRegion"],
  };
  const filterArray = [
    { title: "Numéro de la ligne", name: "busId", datafield: "busId.keyword", parentGroup: "Ligne de Bus", missingLabel: "Non renseigné" },
    { title: "Date aller", name: "departureString", datafield: "departureString.keyword", parentGroup: "Ligne de Bus", missingLabel: "Non renseignée" },
    { title: "Date retour", name: "returnString", datafield: "returnString.keyword", parentGroup: "Ligne de Bus", missingLabel: "Non renseignée" },
    {
      title: "Taux de remplissage",
      name: "lineFillingRate",
      datafield: "lineFillingRate",
      parentGroup: "Ligne de Bus",
      missingLabel: "Non renseigné",
      transformData: (value) => transformDataTaux(value),
      customQuery: (value) => customQuery(value),
    },
    {
      title: "Statut de la modification",
      name: "status",
      datafield: "modificationBuses.status.keyword",
      parentGroup: "Modification de Statut",
      missingLabel: "Non renseigné",
      translate: (value) => translate(value),
      defaultValue: ["ACCEPTED", "REJECTED"],
      isSingle: true,
    },
  ];

  const getDefaultQuery = () => {
    return {
      query: {
        bool: {
          should: [],
          must: [{ term: { "cohort.keyword": "Février 2023 - C" } }],
        },
      },
      track_total_hits: true,
    };
  };

  //extract dans utils ou logique du filtre ?

  return (
    <div className="bg-white h-full">
      <div className="flex flex-col gap-8 m-4">
        <div>{paramData?.count} résultats aa</div>
        {/* display filtter button + currentfilters + searchbar */}
        <Filters
          pageId="plandetransport"
          esId="plandetransport"
          defaultQuery={getDefaultQuery()}
          setData={(value) => setData(value)}
          filters={filterArray}
          searchBarObject={searchBarObject}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          paramData={paramData}
          setParamData={setParamData}
        />
        <div className="mt-2 flex flex-row flex-wrap gap-2 items-center">
          <Save selectedFilters={selectedFilters} filterArray={filterArray} page={paramData?.page} pageId="young" />
          <SelectedFilters filterArray={filterArray} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} paramData={paramData} setParamData={setParamData} />
        </div>
        <ResultTable
          paramData={paramData}
          setParamData={setParamData}
          currentEntryOnPage={data?.length}
          render={
            <div className="flex w-full flex-col mt-6 mb-2">
              <hr />
              <div className="flex py-3 items-center text-xs uppercase text-gray-400 px-4 w-full">
                <div className="w-[30%]">Lignes</div>
                <div className="w-[40%]">Points de rassemblements</div>
                <div className="w-[15%]">Centres de destinations</div>
                <div className="w-[10%]">Taux de remplissage</div>
                <div className="w-[5%] h-1"></div>
              </div>
              {data?.map((hit) => {
                return <Line key={hit._id} hit={hit} currentTab={currentTab} />;
              })}
              <hr />
            </div>
          }
        />
      </div>
    </div>
  );
}

const Line = ({ hit, currentTab }) => {
  const history = useHistory();

  const meetingPoints =
    currentTab === "aller"
      ? //sort meetingPoints by meetingHour
        hit.pointDeRassemblements.sort((a, b) => a.meetingHour.replace(":", "") - b.meetingHour.replace(":", ""))
      : hit.pointDeRassemblements.sort((a, b) => a.returnHour.replace(":", "") - b.returnHour.replace(":", ""));

  const hasPendingModification = hit.modificationBuses?.some((modification) => modification.status === "PENDING");

  return (
    <>
      <hr />
      <div className="flex py-6 items-center px-4 hover:bg-gray-50">
        <div className="w-[30%] cursor-pointer" onClick={() => history.push(`/ligne-de-bus/${hit._id.toString()}`)}>
          <div className="flex flex-col">
            <div className="text-sm font-medium">{hit.busId}</div>
            <div className="text-xs text-gray-400">
              {currentTab === "aller" ? `${hit.pointDeRassemblements[0].region} > ${hit.centerRegion}` : `${hit.centerRegion} > ${hit.pointDeRassemblements[0].region}`}
            </div>
          </div>
        </div>
        <div className="w-[40%]">
          <div className="flex gap-2">
            {meetingPoints.map((meetingPoint) => {
              return (
                <TooltipMeetingPoint key={meetingPoint.meetingPointId} meetingPoint={meetingPoint} currentTab={currentTab}>
                  <a
                    href={`/point-de-rassemblement/${meetingPoint.meetingPointId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:scale-105 cursor-pointer gap-2 text-sm font-normal flex justify-center px-2 py-1 items-center bg-gray-100 rounded-3xl">
                    {meetingPoint.city}
                    <ArrowUp />
                  </a>
                </TooltipMeetingPoint>
              );
            })}
          </div>
        </div>
        <div className="w-[15%]">
          <div className="flex gap-2">
            <TooltipCenter key={hit.centerId} name={hit.centerName} region={hit.centerRegion} department={hit.centerDepartment}>
              <a
                href={`/centre/${hit.centerId}`}
                target="_blank"
                rel="noreferrer"
                className="hover:scale-105 cursor-pointer gap-2 text-sm font-normal flex justify-center px-2 py-1 items-center">
                {hit.centerCode}
                <ArrowUp />
              </a>
            </TooltipCenter>
          </div>
        </div>
        <div className="w-[10%] flex gap-4 items-center">
          <div className="text-sm font-normal">{hit.lineFillingRate}%</div>
          <div className="flex flex-col items-center">
            <svg className="-rotate-90 w-9 h-9" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="40" fill="none" stroke="#F0F0F0" strokeDashoffset={`calc(100 - 0)`} strokeWidth="15" />
              <circle
                className="percent fifty"
                strokeDasharray={100}
                strokeDashoffset={`calc(100 - ${Math.round(hit.lineFillingRate)})`}
                cx="60"
                cy="60"
                r="40"
                fill="none"
                stroke="#1E40AF"
                strokeWidth="15"
                pathLength="100"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        <div className="w-[5%] flex justify-center">
          {hit.modificationBuses?.length > 0 ? (
            <div className={`flex p-2 rounded-full cursor-pointer ${hasPendingModification ? "bg-orange-500" : "bg-gray-200"}`}>
              <Comment stroke={hasPendingModification && "white"} />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

const TooltipMeetingPoint = ({ children, meetingPoint, currentTab, ...props }) => {
  if (!meetingPoint) return children;

  return (
    <div className="relative flex flex-col items-center group " {...props}>
      {children}
      <div className="absolute hidden group-hover:flex !top-8 mb-3 items-center left-0">
        <div className="relative p-3 text-xs leading-2 text-[#414458] whitespace-nowrap bg-white shadow-lg z-[500] rounded-lg">
          <div className="flex items-center justify-between w-[524px]">
            <div className="flex items-center">
              <div className="text-sm font-medium flex justify-center px-2 py-1 items-center bg-gray-100 rounded-lg">
                {currentTab === "aller" ? meetingPoint.meetingHour : meetingPoint.returnHour}
              </div>
              <svg id="triangle" viewBox="0 0 100 100" width={10} height={10} className="z-[600]">
                <polygon points="0 0, 100 0, 50 55" transform="rotate(-90 50 50)" fill="#F5F5F5" />
              </svg>
              <div className="flex flex-col ml-1">
                <div className="text-sm font-medium">{meetingPoint.name}</div>
                <div className="text-xs text-gray-400">{`${meetingPoint.region} • ${meetingPoint.department}`}</div>
              </div>
            </div>
            {getTransportIcon(meetingPoint.transportType)}
          </div>
        </div>
      </div>
    </div>
  );
};

const TooltipCenter = ({ children, name, region, department, ...props }) => {
  return (
    <div className="relative flex flex-col items-center group" {...props}>
      {children}
      <div className="absolute flex-col hidden group-hover:flex !top-8 mb-3 items-center left-0">
        <div className="relative py-3 px-3 text-xs leading-2 text-[#414458] whitespace-nowrap bg-white shadow-lg z-[500] rounded-lg">
          <div className="flex flex-col">
            <div className="text-sm font-medium">{`${name}`}</div>
            <div className="text-xs text-gray-400">{`${region} • ${department}`}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
