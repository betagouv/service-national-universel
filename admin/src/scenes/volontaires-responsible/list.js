import React, { useState, useEffect } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import { SelectStatusApplicationPhase2 } from "../volontaires/view/phase2bis/components/SelectStatusApplicationPhase2";
import api from "../../services/api";
import { apiURL } from "../../config";
import Panel from "./panel";
import Loader from "../../components/Loader";
import { Table, MultiLine } from "../../components/list";
import {
  translate,
  translateApplication,
  getFilterLabel,
  getAge,
  ES_NO_LIMIT,
  ROLES,
  formatLongDateUTCWithoutTime,
  department2region,
  region2department,
  formatLongDateUTC,
  formatDateFRTimezoneUTC,
  APPLICATION_STATUS,
  translateApplicationFileType,
} from "../../utils";
import ReactiveListComponent from "../../components/ReactiveListComponent";

import { applicationExportFields } from "snu-lib/excelExports";

import ModalConfirm from "../../components/modals/ModalConfirm";
import SelectAction from "../../components/SelectAction";
import CursorClick from "../../assets/icons/CursorClick";
import ModalExport from "../../components/modals/ModalExport";
import { DepartmentFilter, RegionFilter } from "../../components/filters";
import DeleteFilters from "../../components/buttons/DeleteFilters";
import ExclamationCircle from "../../assets/icons/ExclamationCircle";

const FILTERS = ["SEARCH", "MISSION_NAME", "STATUS", "TUTOR", "DEPARTMENT", "REGION", "FILES_TYPE"];

export default function List() {
  const user = useSelector((state) => state.Auth.user);
  const [missions, setMissions] = useState();
  const [filterVisible, setFilterVisible] = useState(false);
  const [panel, setPanel] = useState(null);

  const [countPending, setCountPending] = useState(0);
  const [countFollow, setCountFollow] = useState(0);
  const [countAll, setCountAll] = useState(0);

  const [modalMultiAction, setModalMultiAction] = useState({ isOpen: false });
  const [optionsFilteredRole, setOptionsFilteredRole] = useState([]);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [youngSelected, setYoungSelected] = useState([]);
  const [youngsInPage, setYoungsInPage] = useState([]);
  const checkboxRef = React.useRef();

  const history = useHistory();

  //currenTab is the tab selected in the url
  // tab is the tab selected in the component --> to avoid refresh
  const { currentTab } = useParams();
  const [tab, setTab] = useState("all");

  useEffect(() => {
    const listTab = ["all", "pending", "follow"];
    if (!listTab.includes(currentTab)) return history.push(`/volontaire/list/all`);
    setTab(currentTab);
  }, [currentTab]);

  useEffect(() => {
    if (!missions) return;
    getApplicationCount();
  }, [missions]);

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

  const getDefaultQuery = () => {
    const body = {
      query: { bool: { must: { match_all: {} }, filter: [{ terms: { "missionId.keyword": missions.map((e) => e._id) } }] } },
      sort: [{ "youngLastName.keyword": "asc" }],
      size: ES_NO_LIMIT,
    };
    if (tab === "pending") {
      body.query.bool.filter.push({ terms: { "status.keyword": ["WAITING_VALIDATION"] } });
    } else if (tab === "follow") {
      body.query.bool.filter.push({ terms: { "status.keyword": ["IN_PROGRESS", "VALIDATED"] } });
    }
    return body;
  };
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  const getApplicationCount = async () => {
    try {
      const body = {
        query: { bool: { must: { match_all: {} }, filter: [{ terms: { "missionId.keyword": missions.map((e) => e._id) } }] } },
        sort: [{ "youngLastName.keyword": "asc" }],
        size: ES_NO_LIMIT,
      };
      const { responses } = await api.esQuery("application", body);
      const applicationList = responses[0].hits.hits.map((e) => e._source);
      setCountAll(applicationList.length);
      setCountFollow(applicationList.filter((e) => ["IN_PROGRESS", "VALIDATED"].includes(e.status)).length);
      setCountPending(applicationList.filter((e) => e.status === "WAITING_VALIDATION").length);
    } catch (error) {
      toastr.error("Oups, une erreur est survenue lors de la récupération des candidatures");
      console.log(error);
    }
  };

  async function appendMissions(structure) {
    const missionsResponse = await api.get(`/structure/${structure}/mission`);
    if (!missionsResponse.ok) {
      toastr.error("Oups, une erreur est survenue lors de la récupération des missions", translate(missionsResponse.code));
      return history.push("/");
    }
    return missionsResponse.data;
  }

  async function initMissions(structure) {
    const m = await appendMissions(structure);
    if (user.role === ROLES.SUPERVISOR) {
      const subStructures = await api.get(`/structure/${structure}/children`);
      if (!subStructures.ok) {
        toastr.error("Oups, une erreur est survenue lors de la récupération des missions des antennes", translate(subStructures.code));
        return history.push("/");
      }
      for (let i = 0; i < subStructures.data.length; i++) {
        const subStructure = subStructures.data[i];
        const tempMissions = await appendMissions(subStructure._id);
        m.push(...tempMissions);
      }
    }
    setMissions(m);
  }

  // Get all missions from structure then get all applications int order to display the volontaires' list.
  useEffect(() => {
    initMissions(user.structureId);
  }, []);
  const RenderText = (text) => {
    return (
      <div key={text} className="group flex items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50 cursor-pointer">
        <div className="font-normal">
          Marquer en <span className="font-bold">{text}</span>
          {youngSelected.length > 0 ? ` (${youngSelected.length})` : ""}
        </div>
      </div>
    );
  };
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
  const optionsActions = [
    {
      id: APPLICATION_STATUS.VALIDATED,
      action: async () => {
        updateApplicationStatus(APPLICATION_STATUS.VALIDATED);
      },
      render: RenderText("Candidature approuvée"),
    },
    {
      id: APPLICATION_STATUS.REFUSED,
      action: async () => {
        updateApplicationStatus(APPLICATION_STATUS.REFUSED);
      },
      render: RenderText("Candidature non retenue"),
    },
    {
      id: APPLICATION_STATUS.IN_PROGRESS,
      action: async () => {
        updateApplicationStatus(APPLICATION_STATUS.IN_PROGRESS);
      },
      render: RenderText("Mission en cours"),
    },
    {
      id: APPLICATION_STATUS.ABANDON,
      action: async () => {
        updateApplicationStatus(APPLICATION_STATUS.ABANDON);
      },
      render: RenderText("Mission abandonnée"),
    },
    {
      id: APPLICATION_STATUS.DONE,
      action: async () => {
        updateApplicationStatus(APPLICATION_STATUS.DONE);
      },
      render: RenderText("Mission effectuée"),
    },
  ];
  const filteredRoleActions = () => {
    if (tab === "pending") return setOptionsFilteredRole(optionsActions.filter((e) => [APPLICATION_STATUS.VALIDATED, APPLICATION_STATUS.REFUSED].includes(e.id)));
    else return setOptionsFilteredRole(optionsActions.filter((e) => [APPLICATION_STATUS.IN_PROGRESS, APPLICATION_STATUS.DONE, APPLICATION_STATUS.ABANDON].includes(e.id)));
  };

  const handleClick = async (application) => {
    const { ok, data } = await api.get(`/referent/young/${application.youngId}`);
    if (ok) setPanel({ application, young: data });
    console.log(data);
  };

  function getExportFields() {
    const filtered = applicationExportFields.filter((e) => !["choices", "missionInfo", "missionTutor", "missionLocation", "structureInfo", "structureLocation"].includes(e.id));
    // remove Issu de QPV field for responsible and supervisor
    const filterAdress = filtered.find((e) => e.id === "address");
    filterAdress.desc = filterAdress.desc.filter((e) => e !== "Issu de QPV");
    return filtered.map((e) => (e.id !== "address" ? e : filterAdress));
  }

  async function transform(data, values) {
    let all = data;
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
    const optionsType = ["contractAvenantFiles", "justificatifsFiles", "feedBackExperienceFiles", "othersFiles"];

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
          "Adresse postale du volontaire": data.young.address,
          "Code postal du volontaire": data.young.zip,
          "Ville du volontaire": data.young.city,
          "Pays du volontaire": data.young.country,
        },
        location: {
          "Département du volontaire": data.young.department,
          "Académie du volontaire": data.young.academy,
          "Région du volontaire": data.young.region,
        },
        application: {
          "Statut de la candidature": translate(data.status),
          "Choix - Ordre de la candidature": data.priority,
          "Candidature créée le": formatLongDateUTC(data.createdAt),
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
      delete allFields.address["Issu de QPV"];
      let fields = { "ID de la candidature": data._id, "ID du volontaire": data.youngId };
      for (const element of values) {
        let key;
        for (key in allFields[element]) {
          fields[key] = allFields[element][key];
        }
      }
      return fields;
    });
  }
  useEffect(() => {
    if (currentTab === "all") return;
    setYoungSelected([]);
    filteredRoleActions();
  }, [tab]);
  useEffect(() => {
    if (youngSelected.length === 0) return;
    filteredRoleActions();
  }, [youngSelected]);

  if (!missions) return <Loader />;
  return (
    <div className="px-8 flex w-full">
      <div className="flex flex-col w-full">
        <div className="text-2xl font-bold mt-8 mb-4">Mes candidatures</div>

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
        <div className="flex">
          <TabItem
            count={countAll}
            onClick={() => {
              setTab("all");
              window.history.replaceState(null, null, "/volontaire/list/all");
            }}
            title="Toutes les candidatures"
            active={tab === "all"}
          />
          <TabItem
            onClick={() => {
              setTab("pending");
              window.history.replaceState(null, null, "/volontaire/list/pending");
            }}
            count={countPending}
            icon={
              missions.some((mission) => mission.pendingApplications > 0 && mission.pendingApplications >= mission.placesLeft * 5) ? (
                <ExclamationCircle className="text-white" fill="red" />
              ) : missions.some((mission) => mission.pendingApplications > 0) ? (
                <ExclamationCircle className="text-white" fill="orange" />
              ) : null
            }
            title="À traiter"
            active={tab === "pending"}
          />
          <TabItem
            onClick={() => {
              setTab("follow");
              window.history.replaceState(null, null, "/volontaire/list/follow");
            }}
            count={countFollow}
            title="À suivre"
            active={tab === "follow"}
          />
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
                {tab !== "all" ? (
                  <SelectAction Icon={<CursorClick className="text-gray-400" />} title="Actions" alignItems="right" optionsGroup={[{ items: optionsFilteredRole }]} />
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
                  componentId="MISSION_NAME"
                  dataField="missionName.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "MISSION_NAME") }}
                  renderItem={(e, count) => {
                    return `${e} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Mission")}
                />

                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="TUTOR"
                  dataField="tutorName.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "TUTOR") }}
                  renderItem={(e, count) => {
                    return `${e} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Tuteur")}
                />
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
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="FILES_TYPE"
                  dataField="filesType.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "FILES_TYPE") }}
                  renderItem={(e, count) => {
                    return `${translateApplicationFileType(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Pièces jointes", "Pièces jointes")}
                  showMissing={true}
                  missingLabel="Aucune pièce jointe"
                />
                <DepartmentFilter defaultQuery={getDefaultQuery} filters={FILTERS} dataField="youngDepartment.keyword" placeholder="Département du volontaire" />
                <RegionFilter
                  customQuery={function (value, props) {
                    let departmentArray = [];
                    if (Array.isArray(value)) {
                      value?.map((e) => {
                        departmentArray = departmentArray.concat(region2department[e]);
                      });
                    }
                    const body = getDefaultQuery();
                    if (departmentArray.length > 0) body.query.bool.filter.push({ terms: { "youngDepartment.keyword": departmentArray } });
                    return body;
                  }}
                  transformData={(data) => {
                    const newData = [];
                    data.map((d) => {
                      const region = department2region[d.key];
                      const val = newData.find((e) => e.key === region);
                      if (val) {
                        newData[newData.indexOf(val)].doc_count += d.doc_count;
                      } else {
                        newData.push({ key: region, doc_count: d.doc_count });
                      }
                    });
                    return newData;
                  }}
                  defaultQuery={getDefaultQuery}
                  filters={FILTERS}
                  dataField="youngDepartment.keyword"
                  placeholder="Région du volontaire"
                />
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
                          {tab !== "all" && (
                            <th className="w-1/12">
                              <input ref={checkboxRef} className="cursor-pointer" type="checkbox" onChange={onClickMainCheckBox} />
                            </th>
                          )}

                          <th className="w-3/12">Volontaire</th>
                          <th className="w-4/12">Mission</th>
                          {tab !== "pending" && <th className="w-1/12">Contrat et Documents</th>}
                          <th className="w-3/12">Statut candidature</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((hit) => (
                          <Hit
                            key={hit._id}
                            hit={hit}
                            currentTab={tab}
                            mission={missions.find((m) => m._id.toString() === hit.missionId.toString())}
                            onClick={() => handleClick(hit)}
                            opened={panel?.young?._id === hit.youngId}
                            selected={youngSelected.find((e) => e._id.toString() === hit._id.toString())}
                            onChangeApplication={() => history.go(0)}
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
      </div>
      <Panel
        value={panel?.young}
        application={panel?.application}
        onChange={() => {
          setPanel(null);
        }}
      />
    </div>
  );
}

const Hit = ({ hit, onClick, onChangeApplication, selected, onSelect, currentTab, opened, mission }) => {
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
        <div className="flex flex-row gap-4 items-center">
          <div>
            {mission.isJvaMission === "true" ? (
              <img src={require("../../assets/JVA_round.png")} width="36" height="36" className="group-hover:scale-105 mx-auto min-w-[36px]" />
            ) : (
              <img src={require("../../assets/logo-snu.png")} width="36" height="36" className="group-hover:scale-105 mx-auto min-w-[36px]" />
            )}
          </div>
          <div className="flex flex-col items-start">
            <div className="font-bold text-sm">{mission.name}</div>
            <div className={`text-xs ${selected ? "text-white" : "text-[#718096]"}`}>A candidaté le {formatDateFRTimezoneUTC(hit.createdAt)}</div>
          </div>
        </div>
      </td>
      {currentTab !== "pending" && (
        <td className={`${bgColor}`}>
          <div className="flex flex-row gap-2 justify-start items-start">
            <div>{BadgeContract(hit.contractStatus, hit.status)}</div>
            {numberOfFiles > 0 && (
              <div className="flex flex-row justify-center items-center">
                {["VALIDATED", "IN_PROGRESS", "DONE"].includes(hit.status) && <div className="w-[8px] h-[8px] rounded-full bg-orange-500 mr-1.5" />}
                <div className="font-medium text-sm text-gray-700 mr-1">{numberOfFiles}</div>
                <PaperClip />
              </div>
            )}
          </div>
        </td>
      )}

      <td className={`${bgColor}`} onClick={(e) => e.stopPropagation()}>
        <SelectStatusApplicationPhase2 hit={hit} callback={onChangeApplication} />
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
