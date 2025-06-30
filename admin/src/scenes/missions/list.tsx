import React, { useEffect, useState } from "react";
import { HiOutlineLockClosed } from "react-icons/hi";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import cx from "classnames";
import { formatDateFR, getDepartmentNumber, MissionType, StructureType, translateApplication, translateMission, translateSource } from "snu-lib";
import Img4 from "@/assets/JVA_round.png";
import Img3 from "@/assets/logo-snu.png";
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectAction from "@/components/SelectAction";
import { Filters, ResultTable, Save, SelectedFilters, SortOption } from "@/components/filters-system-v2";
import DateFilter from "@/components/filters-system-v2/components/customComponent/DateFilter";
import api from "@/services/api";
import { ROLES, formatStringDateTimezoneUTC, translate, translateVisibilty } from "@/utils";
import SelectStatusMissionV2 from "./components/SelectStatusMissionV2";
import { AuthState } from "@/redux/auth/reducer";
import ExportCandidaturesModal from "./components/ExportCandidaturesModal";
import { Filter } from "@/components/filters-system-v2/components/Filters";
import ExportMissionsModal from "./components/ExportMissionsModal";
import { Tooltip } from "@snu/ds/admin";

interface MissionDto extends MissionType {
  structure: any;
}

export default function List() {
  const [mission, setMission] = useState<MissionType | null>(null);
  const [structure, setStructure] = useState<StructureType>();
  const user = useSelector((state: AuthState) => state.Auth.user);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExportCandidatureOpen, setIsExportCandidatureOpen] = useState(false);
  const history = useHistory();

  const canCreateMission = user.role === ROLES.RESPONSIBLE && user.structureId && structure && structure?.status !== "DRAFT";

  //List state
  const [data, setData] = useState<MissionDto[]>([]);
  const pageId = "missions-list";
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});
  const [paramData, setParamData] = useState<{
    page: number;
    count?: number;
  }>({
    page: 0,
  });
  const [size, setSize] = useState(10);

  useEffect(() => {
    (async () => {
      if (!user.structureId) return;
      const { data } = await api.get(`/structure/${user.structureId}`);
      setStructure(data);
    })();
    return;
  }, []);

  //Filters
  const filterArray: Filter[] = [
    { title: "Région", name: "region", parentGroup: "Général", defaultValue: user.role === ROLES.REFERENT_REGION ? [user.region] : [] },
    {
      title: "Département",
      name: "department",
      parentGroup: "Général",
      missingLabel: "Non renseigné",
      defaultValue: user.role === ROLES.REFERENT_DEPARTMENT ? user.department : [],
      translate: (e) => getDepartmentNumber(e) + " - " + e,
    },
    {
      title: "Statut",
      name: "status",
      parentGroup: "Général",
      translate: (e) => translate(e),
    },
    {
      title: "Source",
      name: "isJvaMission",
      parentGroup: "Général",
      translate: (value) => translateSource(value),
    },
    {
      title: "Visibilité",
      name: "visibility",
      parentGroup: "Général",
      translate: (value) => translateVisibilty(value),
    },
    {
      title: "Domaine d'action principal",
      name: "mainDomain",
      parentGroup: "Modalités",
      translate: (value) => translate(value),
      missingLabel: "Non renseigné",
    },
    {
      title: "Places restantes",
      name: "placesLeft",
      parentGroup: "Modalités",
    },
    {
      title: "Tuteur",
      name: "tutorName",
      parentGroup: "Modalités",
    },
    {
      title: "Préparation Militaire",
      name: "isMilitaryPreparation",
      parentGroup: "Modalités",
      translate: (value) => translate(value),
    },
    {
      title: "Hébergement",
      name: "hebergement",
      parentGroup: "Modalités",
      translate: (value) => translate(value),
      missingLabel: "Non renseigné",
    },
    {
      title: "Hébergement Payant",
      name: "hebergementPayant",
      parentGroup: "Modalités",
      translate: (value) => translate(value),
      missingLabel: "Non renseigné",
    },
    {
      title: "Place occupées",
      name: "placesStatus",
      parentGroup: "Modalités",
      translate: (value) => translateMission(value),
      missingLabel: "Non renseigné",
    },
    {
      title: "Statut de candidature",
      name: "applicationStatus",
      parentGroup: "Modalités",
      missingLabel: "Aucune candidature ni proposition",
      translate: (value) => translateApplication(value),
    },
    {
      title: "Date de début",
      name: "fromDate",
      parentGroup: "Dates",
      customComponent: (setFilter, filter) => <DateFilter setValue={setFilter} value={filter} />,
      translate: formatDateFR,
    },
    {
      title: "Date de fin",
      name: "toDate",
      parentGroup: "Dates",
      customComponent: (setFilter, filter) => <DateFilter setValue={setFilter} value={filter} />,
      translate: formatDateFR,
    },
    ...(user.role === ROLES.SUPERVISOR
      ? [
          {
            title: "Structure",
            name: "structureName",
            parentGroup: "Structure",
          },
        ]
      : []),
  ];

  return (
    <>
      <Breadcrumbs items={[{ title: "Engagement" }, { label: "Missions" }]} />
      <div className="mb-8 flex w-full flex-row" style={{ fontFamily: "Marianne" }}>
        <div className="flex w-full flex-1 flex-col px-8">
          <div className="flex items-center justify-between py-8">
            <div className="text-2xl font-bold leading-7 text-[#242526]">Missions</div>
            <div className="flex flex-row items-center gap-3 text-sm">
              {canCreateMission ? (
                <button className="cursor-pointer rounded-lg bg-blue-600 px-3 py-2 text-white" onClick={() => history.push(`/mission/create/${user.structureId}`)}>
                  Nouvelle mission
                </button>
              ) : null}
              <SelectAction
                title="Exporter"
                alignItems="right"
                buttonClassNames="cursor-pointer text-white bg-blue-600"
                textClassNames="text-sm"
                rightIconClassNames="text-white opacity-70"
                optionsGroup={[
                  {
                    key: "export",
                    items: [
                      {
                        key: "exportMission",
                        // @ts-ignore
                        action: () => {
                          if (paramData?.count) {
                            setIsExportOpen(true);
                          }
                        },
                        render: (
                          <div className={cx("cursor-pointer p-2 px-3 text-sm text-gray-700 hover:bg-gray-50", !paramData?.count ? "opacity-50" : "")}>
                            Informations de missions
                          </div>
                        ),
                      },
                      {
                        key: "exportCandidature",
                        // @ts-ignore
                        action: () => {
                          if (paramData?.count && paramData?.count <= 5000) {
                            setIsExportCandidatureOpen(true);
                          }
                        },
                        render: (
                          <Tooltip
                            title={`Vous ne pouvez pas exporter les candidatures pour plus de 5000 missions à la fois.
                          Modifiez les filtres pour réduire le nombre de missions à exporter.`}
                            disabled={!paramData?.count || paramData?.count <= 5000}>
                            <div className={cx("cursor-pointer p-2 px-3 text-sm text-gray-700 hover:bg-gray-50", !paramData?.count || paramData?.count > 5000 ? "opacity-50" : "")}>
                              Informations de candidatures
                            </div>
                          </Tooltip>
                        ),
                      },
                    ],
                  },
                ]}
              />
            </div>
            <ExportCandidaturesModal user={user} selectedFilters={selectedFilters} onClose={() => setIsExportCandidatureOpen(false)} isOpen={isExportCandidatureOpen} />
            <ExportMissionsModal user={user} selectedFilters={selectedFilters} onClose={() => setIsExportOpen(false)} isOpen={isExportOpen} />
          </div>
          <div className="mb-8 flex flex-col rounded-xl bg-white py-4">
            <div className="flex items-stretch justify-between  bg-white px-4 pt-2">
              <Filters
                pageId={pageId}
                route="/elasticsearch/mission/search"
                setData={(value) => setData(value)}
                filters={filterArray}
                searchPlaceholder="Rechercher par mots clés, ville, code postal..."
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                paramData={paramData}
                setParamData={setParamData}
                size={size}
              />
              <SortOption
                sortOptions={[
                  { label: "Date de création (récent > ancien)", field: "createdAt", order: "desc" },
                  { label: "Date de création (ancien > récent)", field: "createdAt", order: "asc" },
                  { label: "Nombre de place (croissant)", field: "placesLeft", order: "asc" },
                  { label: "Nombre de place (décroissant)", field: "placesLeft", order: "desc" },
                  { label: "Nom de la mission (A > Z)", field: "name.keyword", order: "asc" },
                  { label: "Nom de la mission (Z > A)", field: "name.keyword", order: "desc" },
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
                <div className="mt-6 mb-2 flex w-full flex-col divide-y divide-gray-100 border-y-[1px] border-gray-100">
                  <div className="flex items-center py-3 px-4 text-xs uppercase text-gray-400 ">
                    <div className="w-[40%]">Mission</div>
                    <div className="w-[5%]"></div>
                    <div className="w-[15%]">Places</div>
                    <div className="w-[20%]">Dates</div>
                    <div className="w-[20%]">Statut</div>
                  </div>
                  {data.map((hit) => (
                    <Hit
                      key={hit._id}
                      hit={hit}
                      callback={(e) => {
                        if (e._id === mission?._id) setMission(e);
                      }}
                    />
                  ))}
                </div>
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}

interface HitProps {
  hit: MissionDto;
  callback: (mission: MissionDto) => void;
}

const Hit = ({ hit, callback }: HitProps) => {
  const onChangeStatus = (e: MissionDto) => {
    callback(e);
  };
  return (
    <>
      <div className="flex items-center py-3 px-4 hover:bg-gray-50">
        <Link to={`/mission/${hit._id}`} className="flex w-[40%] cursor-pointer items-center gap-4 ">
          {hit.isJvaMission === "true" ? (
            <img src={Img4} className="mx-auto h-8 w-8 group-hover:scale-105" />
          ) : (
            <img src={Img3} className="mx-auto h-8 w-8 group-hover:scale-105" />
          )}
          <div className="flex w-full flex-col justify-center">
            <div className="m-0 table w-full table-fixed border-collapse">
              <div className="table-cell truncate font-bold text-gray-900">{hit.name}</div>
            </div>
            <div className="m-0 mt-1 table w-full table-fixed border-collapse">
              <div className="table-cel truncate text-sm font-normal leading-4 text-gray-600 ">
                {hit.address} • {hit.city} ({hit.department})
              </div>
            </div>
            <div className="m-0 mt-1 table w-full table-fixed border-collapse">
              <div className="table-cel truncate text-sm leading-4 text-gray-500 font-bold">{hit.structureName}</div>
            </div>
          </div>
        </Link>
        <Link to={`/mission/${hit._id}`} className="w-[5%]">
          {hit?.visibility === "HIDDEN" && (
            <div className="group relative cursor-pointer">
              <HiOutlineLockClosed size={20} className="text-gray-400" />
              <div className="absolute bottom-[calc(100%+15px)] left-[50%] z-10 hidden min-w-[275px] translate-x-[-58%] rounded-xl bg-white px-3 py-2.5 text-center text-xs leading-5 text-gray-600 drop-shadow-xl group-hover:block">
                <div className="absolute left-[50%] bottom-[-5px] h-[15px] w-[15px] translate-x-[-50%] rotate-45 bg-white"></div>
                La mission est <strong>fermée</strong> aux candidatures
              </div>
            </div>
          )}
        </Link>

        <Link to={`/mission/${hit._id}`} className="flex w-[15%] flex-col gap-2">
          <p className="text-sm font-normal leading-none text-gray-900">{hit.placesLeft} places(s)</p>
          <p className="text-sm font-normal leading-none text-gray-500">
            sur <span className="text-gray-900">{hit.placesTotal}</span>
          </p>
        </Link>
        <Link to={`/mission/${hit._id}`} className="flex w-[20%] flex-col gap-2 text-sm font-normal leading-none text-gray-500">
          <p>
            Du <span className="text-gray-900">{formatStringDateTimezoneUTC(hit.startAt)}</span>
          </p>
          <p>
            Au <span className="text-gray-900">{formatStringDateTimezoneUTC(hit.endAt)}</span>
          </p>
        </Link>
        <div className="w-[20%]">
          {/* @ts-ignore */}
          <SelectStatusMissionV2 hit={hit} callback={onChangeStatus} />
        </div>
      </div>
    </>
  );
};
