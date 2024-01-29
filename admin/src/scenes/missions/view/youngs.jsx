import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory, useParams } from "react-router-dom";
import ReactTooltip from "react-tooltip";

import { getDepartmentNumber } from "snu-lib";
import { applicationExportFields } from "snu-lib/excelExports";
import CursorClick from "../../../assets/icons/CursorClick";
import ExclamationCircle from "../../../assets/icons/ExclamationCircle";
import Eye from "../../../assets/icons/Eye";
import SelectAction from "../../../components/SelectAction";
import { Filters, ModalExport, ResultTable, Save, SelectedFilters } from "../../../components/filters-system-v2";
import { MultiLine, Table } from "../../../components/list";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import api from "../../../services/api";
import {
  APPLICATION_STATUS,
  ROLES,
  formatDateFRTimezoneUTC,
  formatLongDateUTC,
  formatLongDateUTCWithoutTime,
  getAge,
  translate,
  translateApplication,
  translateApplicationFileType,
} from "../../../utils";
import Panel from "../../volontaires/panel";
import { SelectStatusApplicationPhase2 } from "../../volontaires/view/phase2bis/components/SelectStatusApplicationPhase2";
import MissionView from "./wrapper";
import { currentFilterAsUrl } from "../../../components/filters-system-v2/components/filters/utils";
import { captureMessage } from "../../../sentry";

const genderTranslation = {
  male: "Masculin",
  female: "Féminin",
};

export default function Youngs({ mission, applications, updateMission }) {
  const user = useSelector((state) => state.Auth.user);
  const history = useHistory();
  const [young, setYoung] = useState();
  const checkboxRef = React.useRef();
  const [youngSelected, setYoungSelected] = useState([]);
  const [youngsInPage, setYoungsInPage] = useState([]);
  const { tab: currentTab } = useParams();
  if (!currentTab || !["all", "pending", "follow"].includes(currentTab)) history.replace(`/mission/${mission._id}/youngs/all`);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const countAll = applications?.length;
  const countPending = applications?.filter((a) => ["WAITING_VALIDATION"].includes(a.status)).length;
  const countFollow = applications?.filter((a) => ["IN_PROGRESS", "VALIDATED"].includes(a.status)).length;
  const [modalMultiAction, setModalMultiAction] = useState({ isOpen: false });

  //List state
  const [data, setData] = useState([]);
  const pageId = "missions-list-applications";
  const [selectedFilters, setSelectedFilters] = useState({});
  const [paramData, setParamData] = useState({
    page: 0,
  });
  const [size, setSize] = useState(10);

  //Filters
  const filterArray = [
    {
      title: "Statut",
      name: "status",
      translate: (e) => translateApplication(e),
    },
    {
      title: "Département",
      name: "youngDepartment",
      missingLabel: "Non renseigné",
      defaultValue: user.role === ROLES.REFERENT_DEPARTMENT ? user.department : [],
      translate: (e) => getDepartmentNumber(e) + " - " + e,
    },
    {
      title: "Statut contrat",
      name: "contractStatus",
      translate: (value) => translate(value),
    },
    {
      title: "Pièces jointes",
      name: "filesType",
      translate: (value) => translateApplicationFileType(value),
    },
  ];

  const onClickMainCheckBox = () => {
    if (youngSelected.length === 0) {
      setYoungSelected(youngsInPage);
    } else {
      setYoungSelected([]);
    }
  };

  if ([ROLES.SUPERVISOR, ROLES.RESPONSIBLE].includes(user.role)) history.push(`/volontaire/list/all?missionName=${mission?.name}`);

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
    if (!application?.youngId) {
      captureMessage("Error with application :", { extra: { application } });
      return;
    }
    const { ok, data } = await api.get(`/referent/young/${application.youngId}`);
    if (ok) setYoung(data);
  };

  async function transform(data, values) {
    let all = data;
    return all.map((data) => {
      if (!data.young) data.young = {};
      if (!data.young.domains) data.young.domains = [];
      if (!data.young.periodRanking) data.young.periodRanking = [];
      const allFields = {
        identity: {
          Cohorte: data.youngCohort,
          Prénom: data.youngFirstName,
          Nom: data.youngLastName,
          Sexe: genderTranslation[data.young.gender] || data.young.gender,
          "Date de naissance": formatLongDateUTCWithoutTime(data.youngBirthdateAt),
        },
        contact: {
          Email: data.youngEmail,
          Téléphone: data.young.phone,
        },
        address: {
          "Issu de QPV": translate(data.young.qpv),
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
          "Statut du contrat d'engagement": translate(data.contractStatus),
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
      if ([ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role)) {
        delete allFields.address["Issu de QPV"];
      }
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

  function getExportFields() {
    if ([ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role)) {
      const filtered = applicationExportFields.filter((e) => !["choices", "missionInfo", "missionTutor", "missionLocation", "structureInfo", "structureLocation"].includes(e.id));
      // remove Issu de QPV field for responsible and supervisor
      const filterAdress = filtered.find((e) => e.id === "address");
      filterAdress.desc = filterAdress.desc.filter((e) => e !== "Issu de QPV");
      return filtered.map((e) => (e.id !== "address" ? e : filterAdress));
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
      <div key={text} className="group flex cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
        <div className="font-normal">
          Marquer en <span className="font-bold">{text}</span>
          {youngSelected.length > 0 ? ` (${youngSelected.length})` : ""}
        </div>
      </div>
    );
  };

  const optionsActions = [
    {
      id: APPLICATION_STATUS.WAITING_ACCEPTATION,
      action: async () => {
        updateApplicationStatus(APPLICATION_STATUS.WAITING_ACCEPTATION);
      },
      render: RenderText("Proposition en attente"),
    },
    {
      id: APPLICATION_STATUS.WAITING_VALIDATION,
      action: async () => {
        updateApplicationStatus(APPLICATION_STATUS.WAITING_VALIDATION);
      },
      render: RenderText("Candidature en attente"),
    },
    {
      id: APPLICATION_STATUS.CANCEL,
      action: async () => {
        updateApplicationStatus(APPLICATION_STATUS.CANCEL);
      },
      render: RenderText("Candidature annulée"),
    },
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

  function filterActionsByRole(actions, role) {
    if ([ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(role)) return actions;
    if (currentTab === "pending") return optionsActions.filter((e) => [APPLICATION_STATUS.VALIDATED, APPLICATION_STATUS.REFUSED].includes(e.id));
    return optionsActions.filter((e) => [APPLICATION_STATUS.IN_PROGRESS, APPLICATION_STATUS.DONE, APPLICATION_STATUS.ABANDON].includes(e.id));
  }

  if (!user || !currentTab) return <div>Chargement...</div>;

  const actionsFilteredByRole = filterActionsByRole(optionsActions, user.role);

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
            <TabItem
              count={countAll}
              title="Toutes les candidatures"
              onClick={() => {
                history.replace(`/mission/${mission._id}/youngs/all?${currentFilterAsUrl(selectedFilters, 0, filterArray)}`);
              }}
              active={currentTab === "all"}
            />
            <TabItem
              count={countPending}
              icon={
                countPending > 0 && countPending >= mission.placesLeft * 5 ? (
                  <ExclamationCircle className="text-white" fill="red" />
                ) : countPending > 0 ? (
                  <ExclamationCircle className="text-white" fill="orange" />
                ) : null
              }
              title="À traiter"
              onClick={() => {
                history.replace(`/mission/${mission._id}/youngs/pending?${currentFilterAsUrl(selectedFilters, 0, filterArray)}`);
              }}
              active={currentTab === "pending"}
            />
            <TabItem
              count={countFollow}
              title="À suivre"
              onClick={() => {
                history.replace(`/mission/${mission._id}/youngs/follow?${currentFilterAsUrl(selectedFilters, 0, filterArray)}`);
              }}
              active={currentTab === "follow"}
            />
          </div>
          <div className={`relative mb-4 items-start`}>
            <div className="mb-8 flex flex-col rounded-tr-xl bg-white py-4">
              <div className="flex items-stretch justify-between  bg-white px-4 pt-2">
                <Filters
                  pageId={pageId}
                  route={`/elasticsearch/application/by-mission/${mission._id}/search?tab=${currentTab}`}
                  setData={(value) => {
                    if (value) setYoungsInPage(value.map((h) => ({ _id: h._id, firstName: h.youngFirstName, lastName: h.youngLastName })));
                    setData(value);
                  }}
                  filters={filterArray}
                  searchPlaceholder="Rechercher par mots clés, ville, code postal..."
                  selectedFilters={selectedFilters}
                  setSelectedFilters={setSelectedFilters}
                  paramData={paramData}
                  setParamData={setParamData}
                  size={size}
                />
                {currentTab !== "all" ? (
                  <SelectAction Icon={<CursorClick className="text-gray-400" />} title="Actions" alignItems="right" optionsGroup={[{ items: actionsFilteredByRole }]} />
                ) : (
                  <button className="rounded-md bg-blue-600 py-2 px-4 text-sm font-semibold text-white hover:bg-blue-600 hover:drop-shadow" onClick={() => setIsExportOpen(true)}>
                    Exporter les candidatures
                  </button>
                )}
                <ModalExport
                  isOpen={isExportOpen}
                  setIsOpen={setIsExportOpen}
                  route={`/elasticsearch/application/by-mission/${mission._id}/export?tab=${currentTab}`}
                  transform={transform}
                  exportFields={getExportFields()}
                  exportTitle="candidatures"
                  selectedFilters={selectedFilters}
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
                  <Table>
                    <thead>
                      <tr className="mt-6 mb-2 border-y-[1px] border-gray-100 text-start text-xs uppercase text-gray-400">
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
                          history={history}
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
                }
              />
            </div>
          </div>
        </MissionView>
        {![ROLES.SUPERVISOR, ROLES.RESPONSIBLE].includes(user.role) && (
          <Panel
            value={young}
            onChange={() => {
              setYoung(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

const Hit = ({ hit, onClick, onChangeApplication, selected, onSelect, currentTab, opened, history }) => {
  const numberOfFiles = hit?.contractAvenantFiles.length + hit?.justificatifsFiles.length + hit?.feedBackExperienceFiles.length + hit?.othersFiles.length;
  const bgColor = selected ? "bg-blue-500" : opened ? "bg-blue-100" : "";
  const mainTextColor = selected ? "text-white" : "text-[#242526]";
  return (
    <tr className={`${!opened && "hover:!bg-gray-100"}`} onClick={onClick}>
      {currentTab !== "all" && (
        <td className={`${bgColor} ml-2 rounded-l-lg pl-4`}>
          <div onClick={(e) => e.stopPropagation()}>
            <input className="cursor-pointer" type="checkbox" checked={selected} onChange={() => onSelect(hit)} />
          </div>
        </td>
      )}

      <td className={`${bgColor} ${mainTextColor}`}>
        <MultiLine>
          <span className={`font-bold ${mainTextColor} text-black`}>
            {hit.youngEmail === `${hit.youngId}@delete.com` ? "Compte supprimé" : `${hit.youngFirstName} ${hit.youngLastName}`}
          </span>
          <p className={`${mainTextColor}`}>
            {hit.youngBirthdateAt ? `${getAge(hit.youngBirthdateAt)} ans` : null} {`• ${hit.youngCity || ""} (${hit.youngDepartment || ""})`}
          </p>
        </MultiLine>
      </td>
      <td className={`${bgColor}`}>
        <div className={`text-xs font-normal ${mainTextColor}`}>{formatDateFRTimezoneUTC(hit.createdAt)}</div>
      </td>
      {currentTab !== "pending" && (
        <>
          <td className={`${bgColor}`}>
            <div>{BadgeContract(hit.contractStatus, hit.status)}</div>
          </td>
          <td className={`${bgColor}`}>
            {numberOfFiles > 0 && (
              <div className="flex flex-row items-center justify-center">
                {["VALIDATED", "IN_PROGRESS", "DONE"].includes(hit.status) && <div className="mr-1.5 h-[8px] w-[8px] rounded-full bg-orange-500" />}
                <div className="mr-1 text-sm font-medium text-gray-700">{numberOfFiles}</div>
                <PaperClip />
              </div>
            )}
          </td>
        </>
      )}

      <td className={`${bgColor}`} onClick={(e) => e.stopPropagation()}>
        <SelectStatusApplicationPhase2 hit={hit} callback={onChangeApplication} />
      </td>
      <td className={`${bgColor} mr-2 rounded-r-lg`}>
        <ReactTooltip id="tooltip-delete" className="bg-white text-black shadow-sm" arrowColor="white" disable={false}>
          <div className="text-[black]">Voir l&apos;espace candidature</div>
        </ReactTooltip>
        <div
          data-tip=""
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-[1px] border-gray-100 bg-gray-100 !text-gray-600 hover:scale-105 hover:border-gray-300"
          onClick={() => history.push(`/volontaire/${hit.youngId}/phase2/application/${hit._id.toString()}`)}
          data-for="tooltip-delete">
          <Eye width={16} height={16} />
        </div>
      </td>
    </tr>
  );
};

const BadgeContract = (status, applicationStatus) => {
  // TODO : a quel moment affiche t on le status du contrat ?
  if (!status || ["WAITING_VALIDATION", "WAITING_ACCEPTATION"].includes(applicationStatus)) return;
  if (status === "DRAFT") return <span className="rounded-3xl border-[0.5px] bg-orange-500 px-2 py-1 text-xs font-medium text-white">Brouillon</span>;
  if (status === "SENT") return <span className="rounded-3xl border-[0.5px] border-[#CECECE] bg-white px-2 py-1 text-xs font-medium text-gray-600">Envoyé</span>;
  if (status === "VALIDATED") return <span className="rounded-3xl border-[0.5px] border-[#CECECE] bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">Signé</span>;
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
    className={`mr-2 cursor-pointer rounded-t-lg px-3 py-2 text-[13px] text-gray-600 hover:text-blue-600 ${
      active ? "border-none bg-white !text-blue-600" : "border-x border-t border-gray-200 bg-gray-100"
    }`}>
    <div className={"flex items-center gap-2"}>
      <div className="flex flex-row items-center gap-2">
        {icon && <div>{icon}</div>}
        <div>{title}</div>
      </div>

      <div className={`rounded-3xl border-[0.5px] px-2 text-xs font-medium ${active ? "border-blue-300 text-blue-600" : "border-gray-400 text-gray-500"}`}>{count}</div>
    </div>
  </div>
);
