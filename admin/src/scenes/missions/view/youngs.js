import React, { useState, useEffect } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import { NavLink } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";
import DeleteFilters from "../../../components/buttons/DeleteFilters";

import { apiURL } from "../../../config";
import { SelectStatusApplicationPhase2 } from "../../volontaires/view/phase2bis/components/SelectStatusApplicationPhase2";
import api from "../../../services/api";
import MissionView from "./wrapper";
import Panel from "../../volontaires/panel";
import {
  formatDateFRTimezoneUTC,
  formatLongDateUTC,
  formatLongDateUTCWithoutTime,
  getFilterLabel,
  translate,
  getAge,
  ES_NO_LIMIT,
  ROLES,
  translateApplication,
  APPLICATION_STATUS,
} from "../../../utils";
import Loader from "../../../components/Loader";
import { DepartmentFilter } from "../../../components/filters";
import { Table, MultiLine } from "../../../components/list";
import ReactiveListComponent from "../../../components/ReactiveListComponent";
import { applicationExportFields } from "snu-lib/excelExports";
import Eye from "../../../assets/icons/Eye";
import ExclamationCircle from "../../../assets/icons/ExclamationCircle";
import ModalExport from "../../../components/modals/ModalExport";
import SelectAction from "../../../components/SelectAction";
import CursorClick from "../../../assets/icons/CursorClick";
import ModalConfirm from "../../../components/modals/ModalConfirm";

const FILTERS = ["SEARCH", "STATUS", "DEPARTMENT"];

export default function Youngs({ mission, applications, updateMission }) {
  const user = useSelector((state) => state.Auth.user);
  const [young, setYoung] = useState();
  const [filterVisible, setFilterVisible] = useState(false);
  const checkboxRef = React.useRef();
  const [youngSelected, setYoungSelected] = useState([]);
  const [youngsInPage, setYoungsInPage] = useState([]);
  const [currentTab, setCurrentTab] = useState("all");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const countAll = applications?.length;
  const countPending = applications?.filter((a) => ["WAITING_VALIDATION"].includes(a.status)).length;
  const countFollow = applications?.filter((a) => ["IN_PROGRESS", "VALIDATED"].includes(a.status)).length;
  const [modalMultiAction, setModalMultiAction] = useState({ isOpen: false });
  const onClickMainCheckBox = () => {
    if (youngSelected.length === 0) {
      setYoungSelected(youngsInPage);
    } else {
      setYoungSelected([]);
    }
  };
  useEffect(() => {
    if (!checkboxRef.current) return;
    if (youngSelected?.length === 0) {
      checkboxRef.current.checked = false;
      checkboxRef.current.indeterminate = false;
    } else if (youngSelected?.length < youngsInPage?.length) {
      checkboxRef.current.checked = false;
      checkboxRef.current.indeterminate = true;
    } else if (youngSelected?.length === youngsInPage?.length) {
      checkboxRef.current.checked = true;
      checkboxRef.current.indeterminate = false;
    }
  }, [youngSelected]);
  const optionsType = ["contractAvenantFiles", "justificatifsFiles", "feedBackExperienceFiles", "othersFiles"];

  const handleClick = async (application) => {
    const { ok, data } = await api.get(`/referent/young/${application.youngId}`);
    console.log(data._id);
    if (ok) setYoung(data);
  };
  const getDefaultQuery = () => {
    const body = { query: { bool: { must: { match_all: {} }, filter: [{ term: { "missionId.keyword": mission._id } }] } }, size: ES_NO_LIMIT };

    if (currentTab === "pending") {
      body.query.bool.filter.push({ terms: { "status.keyword": ["WAITING_VALIDATION"] } });
    } else if (currentTab === "follow") {
      body.query.bool.filter.push({ terms: { "status.keyword": ["IN_PROGRESS", "VALIDATED"] } });
    }
    return body;
  };
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  async function transform(data, values) {
    let all = data;
    console.log(data, values);
    if (values && ["contact", "address", "location", "application", "status", "choices", "representative1", "representative2"].some((e) => values.includes(e))) {
      const youngIds = [...new Set(data.map((item) => item.youngId))];
      if (youngIds?.length) {
        const { responses } = await api.esQuery("young", { size: ES_NO_LIMIT, query: { ids: { type: "_doc", values: youngIds } } });
        if (responses.length) {
          const youngs = responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
          all = data.map((item) => ({ ...item, young: youngs.find((e) => e._id === item.youngId) || {} }));
        }
      }
    }
    return all.map((data) => {
      if (!data.young) data.young = {};
      if (!data.young.domains) data.young.domains = [];
      if (!data.young.periodRanking) data.young.periodRanking = [];
      const allFields = {
        identity: {
          Cohorte: data.youngCohort,
          Prénom: data.youngFirstName,
          Nom: data.youngLastName,
          Sexe: data.gender,
          "Date de naissance": formatLongDateUTCWithoutTime(data.youngBirthdateAt),
        },
        contact: {
          Email: data.youngEmail,
          Téléphone: data.young.phone,
        },
        address: {
          "Issu de QPV": translate(data.young.qpv),
          "Adresse postale": data.young.address,
          "Code postal": data.young.zip,
          Ville: data.young.city,
          Pays: data.young.country,
        },
        location: {
          Département: data.young.department,
          Académie: data.young.academy,
          "Région du volontaire": data.young.region,
        },
        application: {
          "Statut de la candidature": translate(data.status),
          "Choix - Ordre de la candidature": data.priority,
          "Candidature créée lé": formatLongDateUTC(data.createdAt),
          "Candidature mise à jour le": formatLongDateUTC(data.updatedAt),
          "Statut du contrat d'engagement": translate(data.young.statusPhase2Contract),
          "Pièces jointes à l’engagement": translate(`${optionsType.reduce((sum, option) => sum + data[option]?.length, 0) !== 0}`),
          "Statut du dossier d'éligibilité PM": translate(data.young.statusMilitaryPreparationFiles),
        },
        status: {
          "Statut général": translate(data.young.status),
          "Statut phase 2": translate(data.young.statusPhase2),
          "Statut de la candidature": translate(data.status),
          // date du dernier statut
        },
        // pas pour structures :
        choices: {
          "Domaine de MIG 1": data.young.domains[0],
          "Domaine de MIG 2": data.young.domains[1],
          "Domaine de MIG 3": data.young.domains[2],
          "Projet professionnel": translate(data.young.professionnalProject),
          "Information supplémentaire sur le projet professionnel": data.professionnalProjectPrecision,
          "Période privilégiée pour réaliser des missions": data.period,
          "Choix 1 période": translate(data.young.periodRanking[0]),
          "Choix 2 période": translate(data.young.periodRanking[1]),
          "Choix 3 période": translate(data.young.periodRanking[2]),
          "Choix 4 période": translate(data.young.periodRanking[3]),
          "Choix 5 période": translate(data.young.periodRanking[4]),
          "Mobilité aux alentours de son établissement": translate(data.young.mobilityNearSchool),
          "Mobilité aux alentours de son domicile": translate(data.young.mobilityNearHome),
          "Mobilité aux alentours d'un de ses proches": translate(data.young.mobilityNearRelative),
          "Adresse du proche": data.young.mobilityNearRelativeAddress,
          "Mode de transport": data.young.mobilityTransport?.map((t) => translate(t)).join(", "),
          "Format de mission": translate(data.young.missionFormat),
          "Engagement dans une structure en dehors du SNU": translate(data.young.engaged),
          "Description engagement ": data.young.youngengagedDescription,
          "Souhait MIG": data.young.youngdesiredLocation,
        },
        representative1: {
          "Statut représentant légal 1": translate(data.young.parent1Status),
          "Prénom représentant légal 1": data.young.parent1FirstName,
          "Nom représentant légal 1": data.young.parent1LastName,
          "Email représentant légal 1": data.young.parent1Email,
          "Téléphone représentant légal 1": data.young.parent1Phone,
          "Adresse représentant légal 1": data.young.parent1Address,
          "Code postal représentant légal 1": data.young.parent1Zip,
          "Ville représentant légal 1": data.young.parent1City,
          "Département représentant légal 1": data.young.parent1Department,
          "Région représentant légal 1": data.young.parent1Region,
        },
        representative2: {
          "Statut représentant légal 2": translate(data.young.parent2Status),
          "Prénom représentant légal 2": data.young.parent2FirstName,
          "Nom représentant légal 2": data.young.parent2LastName,
          "Email représentant légal 2": data.young.parent2Email,
          "Téléphone représentant légal 2": data.young.parent2Phone,
          "Adresse représentant légal 2": data.young.parent2Address,
          "Code postal représentant légal 2": data.young.parent2Zip,
          "Ville représentant légal 2": data.young.parent2City,
          "Département représentant légal 2": data.young.parent2Department,
          "Région représentant légal 2": data.young.parent2Region,
        },
      };
      let fields = { ID: data._id, youngId: data.youngId };
      for (const element of values) {
        let key;
        for (key in allFields[element]) fields[key] = allFields[element][key];
      }
      return fields;
    });
  }

  function getExportFields() {
    if ([ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role)) {
      return applicationExportFields.filter((e) => !["choices", "missionInfo", "missionTutor", "missionLocation", "structureInfo", "structureLocation"].includes(e.id));
    } else return applicationExportFields.filter((e) => !["missionInfo", "missionTutor", "missionLocation", "structureInfo", "structureLocation"].includes(e.id));
  }

  const updateApplicationStatus = (status) => {
    if (youngSelected.length === 0) return;
    const isPlural = youngSelected.length > 1;
    setModalMultiAction({
      isOpen: true,
      title: "Actions",
      message: `Vous êtes sur le point de changer le statut des candidatures de ${youngSelected?.length} volontaire${isPlural ? "s" : ""}. Un email sera automatiquement envoyé.`,
      onSubmit: async () => {
        try {
          console.log(status);
          const { ok, code } = await api.post(`/application/multiaction/change-status/${status}`, {
            ids: youngSelected.map((y) => y._id),
          });
          if (!ok) {
            toastr.error("Oups, une erreur s'est produite", translate(code));
            return;
          }
          history.go(0);
        } catch (e) {
          console.log(e);
          toastr.error("Oups, une erreur s'est produite", translate(e.code));
          return;
        }
      },
    });
  };
  const RenderText = (text) => {
    return (
      <div className="group flex items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50 cursor-pointer">
        <div className="font-normal">
          Marquer en <span className="font-bold">{text}</span>
          {youngSelected.length > 0 ? ` (${youngSelected.length})` : ""}
        </div>
      </div>
    );
  };
  const optionsActions = [
    {
      items: [
        {
          action: async () => {
            updateApplicationStatus(APPLICATION_STATUS.WAITING_ACCEPTATION);
          },
          render: RenderText("Proposition en attente"),
        },
        {
          action: async () => {
            updateApplicationStatus(APPLICATION_STATUS.WAITING_VALIDATION);
          },
          render: RenderText("Candidature en attente"),
        },
        {
          action: async () => {
            updateApplicationStatus(APPLICATION_STATUS.CANCEL);
          },
          render: RenderText("Candidature annulée"),
        },
        {
          action: async () => {
            updateApplicationStatus(APPLICATION_STATUS.VALIDATED);
          },
          render: RenderText("Candidature approuvée"),
        },
        {
          action: async () => {
            updateApplicationStatus(APPLICATION_STATUS.REFUSED);
          },
          render: RenderText("Candidature non retenue"),
        },
        {
          action: async () => {
            updateApplicationStatus(APPLICATION_STATUS.IN_PROGRESS);
          },
          render: RenderText("Mission en cours"),
        },
        {
          action: async () => {
            updateApplicationStatus(APPLICATION_STATUS.ABANDON);
          },
          render: RenderText("Mission abandonnée"),
        },
        {
          action: async () => {
            updateApplicationStatus(APPLICATION_STATUS.DONE);
          },
          render: RenderText("Mission effectuée"),
        },
      ],
    },
  ];
  if (!applications) return <Loader />;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
        <MissionView mission={mission} tab="youngs">
          <ModalConfirm
            isOpen={modalMultiAction?.isOpen}
            title={modalMultiAction?.title}
            message={modalMultiAction?.message}
            onCancel={() => setModalMultiAction({ isOpen: false, onConfirm: null })}
            onConfirm={() => {
              modalMultiAction?.onSubmit();
              setModalMultiAction({ isOpen: false, onConfirm: null });
            }}
          />
          <div className="flex flex-1">
            <TabItem count={countAll} title="Toutes les candidatures" onClick={() => setCurrentTab("all")} active={currentTab === "all"} />
            <TabItem
              count={countPending}
              icon={
                mission.pendingApplications > 0 && mission.pendingApplications >= mission.placesLeft * 5 ? (
                  <ExclamationCircle className="text-white" fill="red" />
                ) : mission.pendingApplications > 1 ? (
                  <ExclamationCircle className="text-white" fill="orange" />
                ) : null
              }
              title="À traiter"
              onClick={() => setCurrentTab("pending")}
              active={currentTab === "pending"}
            />
            <TabItem count={countFollow} title="À suivre" onClick={() => setCurrentTab("follow")} active={currentTab === "follow"} />
          </div>
          <ReactiveBase url={`${apiURL}/es`} app="application" headers={{ Authorization: `JWT ${api.getToken()}` }}>
            <div className={`relative items-start mb-4`}>
              <div className="flex-1 flex-column bg-white flex-wrap rounded-b-lg rounded-tr-lg">
                <div className="flex flex-row pt-4 justify-between items-center px-8">
                  <div className="flex flex-row">
                    <DataSearch
                      defaultQuery={getDefaultQuery}
                      showIcon={false}
                      placeholder="Rechercher par prénom, nom, email"
                      componentId="SEARCH"
                      dataField={["youngEmail.keyword", "youngFirstName", "youngLastName"]}
                      react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                      style={{ marginRight: "1rem", flex: 1 }}
                      innerClass={{ input: "searchbox" }}
                      className="datasearch-searchfield"
                      URLParams={true}
                      autosuggest={false}
                    />
                    <FilterButton onClick={() => setFilterVisible((filterVisible) => !filterVisible)} />
                  </div>
                  {currentTab !== "all" ? (
                    <SelectAction Icon={<CursorClick className="text-gray-400" />} title="Actions" alignItems="right" optionsGroup={optionsActions} />
                  ) : (
                    <button
                      className="rounded-md py-2 px-4 text-sm text-white bg-snu-purple-300 hover:bg-snu-purple-600 hover:drop-shadow font-semibold"
                      onClick={() => setIsExportOpen(true)}>
                      Exporter les candidatures
                    </button>
                  )}

                  <ModalExport
                    isOpen={isExportOpen}
                    setIsOpen={setIsExportOpen}
                    index="application"
                    transform={transform}
                    exportFields={getExportFields()}
                    filters={FILTERS}
                    getExportQuery={getExportQuery}
                  />
                </div>

                <div className={`mt-3 gap-2 flex flex-wrap mx-8 items-center ${!filterVisible ? "hidden" : ""}`}>
                  <MultiDropdownList
                    defaultQuery={getDefaultQuery}
                    className="dropdown-filter"
                    componentId="STATUS"
                    dataField="status.keyword"
                    react={{ and: FILTERS.filter((e) => e !== "STATUS") }}
                    renderItem={(e, count) => {
                      return `${translateApplication(e)} (${count})`;
                    }}
                    title=""
                    URLParams={true}
                    showSearch={false}
                    renderLabel={(items) => getFilterLabel(items, "Statut")}
                  />
                  <DepartmentFilter defaultQuery={getDefaultQuery} filters={FILTERS} dataField="youngDepartment.keyword" />
                  <DeleteFilters />
                </div>

                <div className="reactive-result mt-2">
                  <ReactiveListComponent
                    defaultQuery={getDefaultQuery}
                    react={{ and: FILTERS }}
                    dataField="youngLastName.keyword"
                    sortBy="asc"
                    size={30}
                    showTopResultStats={false}
                    paginationAt="bottom"
                    onData={async ({ rawData }) => {
                      if (rawData?.hits?.hits) setYoungsInPage(rawData.hits.hits.map((h) => ({ _id: h._id, firstName: h._source.firstName, lastName: h._source.lastName })));
                    }}
                    render={({ data }) => (
                      <Table>
                        <thead>
                          <tr className="text-xs uppercase text-gray-400 border-y-[1px] border-gray-100 mt-6 mb-2 text-start">
                            {currentTab !== "all" && (
                              <th className="w-1/12">
                                <input ref={checkboxRef} className="cursor-pointer" type="checkbox" onChange={onClickMainCheckBox} />
                              </th>
                            )}

                            <th className="w-3/12">Volontaire</th>
                            <th className="w-2/12">A candidaté le</th>
                            {currentTab !== "pending" && (
                              <>
                                <th className="w-1/12">Contrat</th>
                                <th className="w-1/12">Documents</th>
                              </>
                            )}

                            <th className="w-3/12">Statut candidature</th>
                            <th className="w-1/12">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((hit) => (
                            <Hit
                              key={hit._id}
                              hit={hit}
                              currentTab={currentTab}
                              onClick={() => handleClick(hit)}
                              opened={young?._id === hit.youngId}
                              selected={youngSelected.find((e) => e._id.toString() === hit._id.toString())}
                              onChangeApplication={updateMission}
                              onSelect={(newItem) =>
                                setYoungSelected((prev) => {
                                  if (prev.find((e) => e._id.toString() === newItem._id.toString())) {
                                    return prev.filter((e) => e._id.toString() !== newItem._id.toString());
                                  }
                                  return [...prev, { _id: newItem._id, firstName: newItem.firstName, lastName: newItem.lastName }];
                                })
                              }
                            />
                          ))}
                        </tbody>
                      </Table>
                    )}
                  />
                </div>
              </div>
            </div>
          </ReactiveBase>
        </MissionView>
        <Panel
          value={young}
          onChange={() => {
            setYoung(null);
          }}
        />
      </div>
    </div>
  );
}

const Hit = ({ hit, onClick, onChangeApplication, selected, onSelect, currentTab, opened }) => {
  const numberOfFiles = hit?.contractAvenantFiles.length + hit?.justificatifsFiles.length + hit?.feedBackExperienceFiles.length + hit?.othersFiles.length;
  const bgColor = selected ? "bg-blue-500" : opened ? "bg-blue-100" : "";
  const mainTextColor = selected ? "text-white" : "text-[#242526]";
  return (
    <tr className={`${!opened && "hover:!bg-gray-100"}`} onClick={onClick}>
      {currentTab !== "all" && (
        <td className={`${bgColor} pl-4 ml-2 rounded-l-lg`}>
          <div onClick={(e) => e.stopPropagation()}>
            <input className="cursor-pointer" type="checkbox" checked={selected} onChange={() => onSelect(hit)} />
          </div>
        </td>
      )}

      <td className={`${bgColor} ${mainTextColor}`}>
        <MultiLine>
          <span className={`font-bold ${mainTextColor} text-black`}>{`${hit.youngFirstName} ${hit.youngLastName}`}</span>
          <p className={`${mainTextColor}`}>
            {hit.youngBirthdateAt ? `${getAge(hit.youngBirthdateAt)} ans` : null} {`• ${hit.youngCity || ""} (${hit.youngDepartment || ""})`}
          </p>
        </MultiLine>
      </td>
      <td className={`${bgColor}`}>
        <div className={`font-normal text-xs ${mainTextColor}`}>{formatDateFRTimezoneUTC(hit.createdAt)}</div>
      </td>
      {currentTab !== "pending" && (
        <>
          <td className={`${bgColor}`}>
            <div>{BadgeContract(hit.contractStatus, hit.status)}</div>
          </td>
          <td className={`${bgColor}`}>
            {numberOfFiles > 0 && (
              <div className="flex flex-row justify-center items-center">
                {["VALIDATED", "IN_PROGRESS", "DONE"].includes(hit.status) && <div className="w-[8px] h-[8px] rounded-full bg-orange-500 mr-1.5" />}
                <div className="font-medium text-sm text-gray-700 mr-1">{numberOfFiles}</div>
                <PaperClip />
              </div>
            )}
          </td>
        </>
      )}

      <td className={`${bgColor}`} onClick={(e) => e.stopPropagation()}>
        <SelectStatusApplicationPhase2 hit={hit} callback={onChangeApplication} />
      </td>
      <td className={`${bgColor} rounded-r-lg mr-2`}>
        <NavLink
          to={`/volontaire/${hit.youngId}/phase2/application/${hit._id.toString()}`}
          className="flex justify-center items-center h-8 w-8 bg-gray-100 !text-gray-600 rounded-full hover:scale-105 cursor-pointer border-[1px] border-gray-100 hover:border-gray-300">
          <Eye width={16} height={16} />
        </NavLink>
      </td>
    </tr>
  );
};

const BadgeContract = (status, applicationStatus) => {
  // TODO : a quel moment affiche t on le status du contrat ?
  if (!status || ["WAITING_VALIDATION", "WAITING_ACCEPTATION"].includes(applicationStatus)) return;
  if (status === "DRAFT") return <span className="text-xs font-medium border-[0.5px] text-white px-2 rounded-3xl py-1 bg-orange-500">Brouillon</span>;
  if (status === "SENT") return <span className="text-xs border-[0.5px] border-[#CECECE] font-medium text-gray-600 px-2 rounded-3xl py-1 bg-white">Envoyé</span>;
  if (status === "VALIDATED") return <span className="text-xs border-[0.5px] border-[#CECECE] font-medium text-gray-600 px-2 rounded-3xl py-1 bg-gray-100">Signé</span>;
};
const PaperClip = () => {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.48223 3.875L3.36612 7.99112C2.87796 8.47927 2.87796 9.27073 3.36612 9.75888C3.85427 10.247 4.64573 10.247 5.13388 9.75888L9.14277 5.64277C10.1191 4.66646 10.1191 3.08354 9.14277 2.10723C8.16646 1.13092 6.58354 1.13092 5.60723 2.10723L1.59835 6.22335C0.133883 7.68782 0.133883 10.0622 1.59835 11.5267C3.06282 12.9911 5.43718 12.9911 6.90165 11.5267L10.8125 7.625"
        stroke="#9CA3AF"
      />
    </svg>
  );
};
function FilterButton({ onClick }) {
  return (
    <div onClick={onClick} className="cursor-pointer bg-[#F3F4F6] w-24 h-10 rounded-md flex flex-row justify-center items-center">
      <svg width={12} height={11} viewBox="0 0 12 11" fill="#9CA3AF" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1.252a1 1 0 0 1-.293.708l-4.08 4.08a1 1 0 0 0-.294.708v1.171a1 1 0 0 1-.293.707l-.666.667c-.63.63-1.707.184-1.707-.707V7.748a1 1 0 0 0-.293-.708L.293 2.96A1 1 0 0 1 0 2.252V1Z"
          fill="#9CA3AF"
        />
      </svg>
      <div className="ml-2 text-grey-700">Filtres</div>
    </div>
  );
}
const TabItem = ({ active, title, count, onClick, icon }) => (
  <div
    onClick={onClick}
    className={`text-[13px] px-3 py-2 mr-2 cursor-pointer text-gray-600 rounded-t-lg hover:text-blue-600 ${
      active ? "!text-blue-600 bg-white border-none" : "bg-gray-100 border-t border-x border-gray-200"
    }`}>
    <div className={"flex items-center gap-2"}>
      <div className="flex flex-row items-center gap-2">
        {icon && <div>{icon}</div>}
        <div>{title}</div>
      </div>

      <div className={`px-2 border-[0.5px] font-medium text-xs rounded-3xl ${active ? "border-blue-300 text-blue-600" : "border-gray-400 text-gray-500"}`}>{count}</div>
    </div>
  </div>
);
