import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiFolderPlus } from "react-icons/fi";
import { GoPlus } from "react-icons/go";

import { Filters, ResultTable, Save, SelectedFilters, SortOption } from "@/components/filters-system-v2";
import { ROLES } from "snu-lib";
import { AuthState } from "@/redux/auth/reducer";
import { Container } from "@snu/ds/admin";
import ArrowUp from "@/assets/ArrowUp";
import Comment from "@/assets/comment";
import { PlainButton } from "../components/Buttons";
import ListPanel from "./modificationPanel/List";
import { getTransportIcon, getFilterArray } from "../util";

interface Props {
  hasValue: boolean;
  cohort: string;
  currentTab: string;
  selectedFilters: any;
  setSelectedFilters: (filters: any) => void;
}

export default function List({ hasValue, cohort, currentTab, selectedFilters, setSelectedFilters }: Props) {
  const history = useHistory();
  const { user } = useSelector((state: AuthState) => state.Auth);
  const [data, setData] = React.useState<any[]>([]);
  const pageId = "plandetransport";
  const [panel, setPanel] = React.useState({ open: false, id: null });
  const [paramData, setParamData] = React.useState({
    page: 0,
  });
  const [size, setSize] = useState(10);

  const filterArray = getFilterArray(user.role);

  const cannotSelectSession = [ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(user.role);

  return (
    <>
      {hasValue ? (
        <Container className="!p-0">
          <div className="mb-8 flex flex-col rounded-xl bg-white py-4">
            <div className="flex items-stretch justify-between  bg-white px-4 pt-2">
              <Filters
                defaultUrlParam={`cohort=${cohort}`}
                pageId={pageId}
                route="/elasticsearch/plandetransport/search"
                setData={(value) => setData(value)}
                // @ts-ignore
                filters={filterArray}
                searchPlaceholder="Rechercher une ligne (numéro, ville, region)"
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                paramData={paramData}
                setParamData={setParamData}
                size={size}
              />
              <SortOption
                sortOptions={[
                  { label: "Nom (A > Z)", field: "busId.keyword", order: "asc" },
                  { label: "Nom (Z > A)", field: "busId.keyword", order: "desc" },
                ]}
                selectedFilters={selectedFilters}
                pagination={paramData}
                onPaginationChange={setParamData}
              />
            </div>

            <div className="mt-2 flex flex-row flex-wrap items-center px-4">
              <Save selectedFilters={selectedFilters} filterArray={filterArray} page={paramData?.page} pageId={pageId} />
              <SelectedFilters
                filterArray={filterArray}
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                paramData={paramData}
                setParamData={setParamData}
              />
            </div>
            <ResultTable
              paramData={paramData}
              setParamData={setParamData}
              currentEntryOnPage={data?.length}
              size={size}
              setSize={setSize}
              render={
                <div className="mt-6 mb-2 flex w-full flex-col">
                  <hr />
                  <div className="flex w-full items-center py-3 px-4 text-xs uppercase text-gray-400">
                    <div className="w-[30%]">Lignes</div>
                    <div className="w-[40%]">Points de rassemblements</div>
                    <div className="w-[15%]">Centres de destinations</div>
                    <div className="w-[10%]">Taux de remplissage</div>
                    <div className="h-1 w-[5%]"></div>
                  </div>
                  {data?.map((hit) => {
                    return <Line key={hit._id} hit={hit} currentTab={currentTab} setPanel={setPanel} />;
                  })}
                  <hr />
                </div>
              }
            />
            <ListPanel busId={panel?.id} open={panel?.open} setOpen={setPanel} />
          </div>
        </Container>
      ) : (
        <Container className="!p-8">
          <div className="m-auto flex w-full flex-col items-center justify-center gap-4 pt-12 bg-gray-50 pb-5">
            <FiFolderPlus size={36} className="text-gray-400" />
            <div className="text-lg leading-6 font-medium">Aucun document importé</div>
            {[ROLES.ADMIN, ROLES.TRANSPORTER].includes(user.role) && (
              <>
                <div className="text-center text-sm leading-5 text-gray-800">Importez votre plan de transport au format .xls (fichier Excel) afin de le voir apparaître ici.</div>
                <PlainButton className="mt-2" onClick={() => history.push(`/ligne-de-bus/import?cohort=${cohort}`)}>
                  <GoPlus size={20} className="mr-2 mt-0.5" />
                  Importer mon fichier
                </PlainButton>
              </>
            )}
          </div>
        </Container>
      )}
    </>
  );
}

const Line = ({ hit, currentTab, setPanel }) => {
  const meetingPoints =
    currentTab === "aller"
      ? //sort meetingPoints by departureHour
        hit.pointDeRassemblements.sort((a, b) => a.departureHour.replace(":", "") - b.departureHour.replace(":", ""))
      : hit.pointDeRassemblements.sort((a, b) => a.returnHour.replace(":", "") - b.returnHour.replace(":", ""));

  const hasPendingModification = hit.modificationBuses?.some((modification) => modification.status === "PENDING");

  return (
    <>
      <hr />
      <div className="flex items-center py-6 px-4 hover:bg-gray-50">
        <Link className="w-[30%] cursor-pointer" to={`/ligne-de-bus/${hit._id.toString()}`} target="_blank" rel="noreferrer">
          <div className="flex flex-col">
            <div className="text-sm font-medium">{hit.busId}</div>
            <div className="text-xs text-gray-400">
              {currentTab === "aller" ? `${hit.pointDeRassemblements[0]?.region} > ${hit.centerRegion}` : `${hit.centerRegion} > ${hit.pointDeRassemblements[0]?.region}`}
            </div>
          </div>
        </Link>
        <div className="w-[40%]">
          <div className="flex gap-2">
            {meetingPoints.map((meetingPoint) => {
              return (
                <TooltipMeetingPoint key={meetingPoint.meetingPointId} meetingPoint={meetingPoint} currentTab={currentTab}>
                  <a
                    href={`/point-de-rassemblement/${meetingPoint.meetingPointId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-3xl bg-gray-100 px-2 py-1 text-sm font-normal hover:scale-105">
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
                className="flex cursor-pointer items-center justify-center gap-2 px-2 py-1 text-sm font-normal hover:scale-105">
                {hit.centerCode}
                <ArrowUp />
              </a>
            </TooltipCenter>
          </div>
        </div>
        <div className="flex w-[10%] items-center gap-4">
          <div className="text-sm font-normal">{hit.lineFillingRate}%</div>
          <div className="flex flex-col items-center">
            <svg className="h-9 w-9 -rotate-90" viewBox="0 0 120 120">
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
        <div className="flex w-[5%] justify-center">
          {hit.modificationBuses?.length > 0 ? (
            <div
              className={`flex cursor-pointer rounded-full p-2 ${hasPendingModification ? "bg-orange-500" : "bg-gray-200"}`}
              onClick={() => setPanel({ open: true, id: hit._id })}>
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
    <div className="group relative flex flex-col items-center " {...props}>
      {children}
      <div className="absolute !top-8 left-0 mb-3 hidden items-center group-hover:flex">
        <div className="leading-2 relative z-[500] whitespace-nowrap rounded-lg bg-white p-3 text-xs text-[#414458] shadow-lg">
          <div className="flex w-[524px] items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center justify-center rounded-lg bg-gray-100 px-2 py-1 text-sm font-medium">
                {currentTab === "aller" ? meetingPoint.departureHour : meetingPoint.returnHour}
              </div>
              <svg id="triangle" viewBox="0 0 100 100" width={10} height={10} className="z-[600]">
                <polygon points="0 0, 100 0, 50 55" transform="rotate(-90 50 50)" fill="#F5F5F5" />
              </svg>
              <div className="ml-1 flex flex-col">
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
    <div className="group relative flex flex-col items-center" {...props}>
      {children}
      <div className="absolute !top-8 left-0 mb-3 hidden flex-col items-center group-hover:flex">
        <div className="leading-2 relative z-[500] whitespace-nowrap rounded-lg bg-white py-3 px-3 text-xs text-[#414458] shadow-lg">
          <div className="flex flex-col">
            <div className="text-sm font-medium">{`${name}`}</div>
            <div className="text-xs text-gray-400">{`${region} • ${department}`}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
