import React, { useEffect, useState } from "react";
import { DropdownItem, DropdownMenu, DropdownToggle, Modal, UncontrolledDropdown } from "reactstrap";
import { ReactiveBase, MultiDropdownList, DataSearch, SelectedFilters, StateProvider } from "@appbaseio/reactivesearch";
import { useSelector } from "react-redux";
import { useHistory, Link } from "react-router-dom";

import ReactiveListComponent from "../../components/ReactiveListComponent";
import ExportComponent from "../../components/ExportXlsx";
import { HiAdjustments } from "react-icons/hi";
import { Formik } from "formik";

import LockedSvg from "../../assets/lock.svg";
import UnlockedSvg from "../../assets/lock-open.svg";
import IconChangementCohorte from "../../assets/IconChangementCohorte.js";
import api from "../../services/api";
import { apiURL, appURL, supportURL } from "../../config";
import Panel from "./panel";
import Badge from "../../components/Badge";
import {
  translate,
  translatePhase1,
  getFilterLabel,
  getSelectedFilterLabel,
  YOUNG_STATUS_COLORS,
  isInRuralArea,
  formatLongDateFR,
  getAge,
  ES_NO_LIMIT,
  ROLES,
  formatDateFRTimezoneUTC,
  colors,
  getLabelWithdrawnReason,
  departmentLookUp,
  YOUNG_STATUS,
  translatePhase2,
  translateApplication,
  translateEngagement,
  translateEquivalenceStatus,
  department2region,
  translateFileStatusPhase1,
  translateStatusMilitaryPreparationFiles,
  translateFilter,
} from "../../utils";
import { RegionFilter, DepartmentFilter } from "../../components/filters";
import Chevron from "../../components/Chevron";
import { Filter, FilterRow, ResultTable, Table, ActionBox, Header, Title, MultiLine, Help, LockIcon, HelpText } from "../../components/list";
import plausibleEvent from "../../services/pausible";
import DeletedVolontairePanel from "./deletedPanel";
import DeleteFilters from "../../components/buttons/DeleteFilters";
import Breadcrumbs from "../../components/Breadcrumbs";
import LoadingButton from "../../components/buttons/LoadingButton";
import { ModalContainer } from "../../components/modals/Modal";
import ModalButton from "../../components/buttons/ModalButton";
import ExportFieldCard from "./components/ExportFieldCard";

const FILTERS = [
  "SEARCH",
  "STATUS",
  "COHORT",
  "ORIGINAL_COHORT",
  "DEPARTMENT",
  "REGION",
  "STATUS_PHASE_1",
  "STATUS_PHASE_2",
  "STATUS_PHASE_3",
  "APPLICATION_STATUS",
  "LOCATION",
  "CONTRACT_STATUS",
  "MEDICAL_FILE_RECEIVED",
  "COHESION_PRESENCE",
  "MILITARY_PREPARATION_FILES_STATUS",
  "EQUIVALENCE_STATUS",
  "PPS",
  "PAI",
  "QPV",
  "HANDICAP",
  "ZRR",
  "GRADE",
  "PMR",
  "IMAGE_RIGHT",
  "IMAGE_RIGHT_STATUS",
  "RULES",
  "AUTOTEST",
  "AUTOTEST_STATUS",
  "SPECIFIC_AMENAGEMENT",
  "SAME_DEPARTMENT",
  "ALLERGIES",
  "COHESION_PARTICIPATION",
  "COHESION_JDM",
  "DEPART",
  "DEPART_MOTIF",
  "SAME_DEPARTMENT_SPORT",
];

export default function VolontaireList() {
  const user = useSelector((state) => state.Auth.user);

  const [volontaire, setVolontaire] = useState(null);
  const [centers, setCenters] = useState(null);
  const [sessionsPhase1, setSessionsPhase1] = useState(null);
  const [meetingPoints, setMeetingPoints] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);

  const [infosHover, setInfosHover] = useState(false);
  const [infosClick, setInfosClick] = useState(false);
  const toggleInfos = () => {
    setInfosClick(!infosClick);
  };

  const [columnModalOpen, setColumnModalOpen] = useState(false);

  const handleShowFilter = () => setFilterVisible(!filterVisible);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/cohesion-center");
      setCenters(data);
    })();
    (async () => {
      const { data } = await api.get("/meeting-point/all");
      setMeetingPoints(data);
    })();
    (async () => {
      const { data } = await api.get("/session-phase1/");
      setSessionsPhase1(data);
    })();
  }, []);
  const getDefaultQuery = () => ({
    query: { bool: { filter: { terms: { "status.keyword": ["VALIDATED", "WITHDRAWN", "WAITING_LIST", "DELETED"] } } } },
    sort: [{ "lastName.keyword": "asc" }],
    track_total_hits: true,
  });
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  async function transform(data, values) {
    let all = data;
    console.log("🚀 ~ file: list.js ~ line 137 ~ transform ~ data", data);
    if (values.includes("schoolSituation")) {
      const schoolsId = [...new Set(data.map((item) => item.schoolId).filter((e) => e))];
      if (schoolsId?.length) {
        const { responses } = await api.esQuery("school", {
          query: { bool: { must: { ids: { values: schoolsId } } } },
          size: ES_NO_LIMIT,
        });
        if (responses.length) {
          const schools = responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
          all = data.map((item) => ({ ...item, esSchool: schools?.find((e) => e._id === item.schoolId) }));
        }
      }
    }
    return all.map((data) => {
      let center = {};
      if (data.sessionPhase1Id && centers && sessionsPhase1) {
        center = centers.find((c) => sessionsPhase1.find((sessionPhase1) => sessionPhase1._id === data.sessionPhase1Id)?.cohesionCenterId === c._id);
        if (!center) center = {};
      }
      let meetingPoint = {};
      if (data.meetingPointId && meetingPoints) {
        meetingPoint = meetingPoints.find((mp) => mp._id === data.meetingPointId);
        if (!meetingPoint) meetingPoint = {};
      }
      const allFields = {
        identity: {
          Prénom: data.firstName,
          Nom: data.lastName,
          Sexe: translate(data.gender),
          Cohorte: data.cohort,
          "Cohorte d'origine": data.originalCohort,
        },
        contact: {
          Email: data.email,
          Téléphone: data.phone,
        },
        birth: {
          "Date de naissance": formatDateFRTimezoneUTC(data.birthdateAt),
          "Pays de naissance": data.birthCountry || "France",
          "Ville de naissance": data.birthCity,
          "Code postal de naissance": data.birthCityZip,
        },
        address: {
          "Adresse postale": data.address,
          "Code postal": data.zip,
          Ville: data.city,
          Pays: data.country,
          "Nom de l'hébergeur": data.hostLastName,
          "Prénom de l'hébergeur": data.hostFirstName,
          "Lien avec l'hébergeur": data.hostRelationship,
          "Adresse - étranger": data.foreignAddress,
          "Code postal - étranger": data.foreignZip,
          "Ville - étranger": data.foreignCity,
          "Pays - étranger": data.foreignCountry,
        },
        location: {
          Département: data.department,
          Académie: data.academy,
          Région: data.region,
        },
        schoolSituation: {
          Situation: translate(data.situation),
          Niveau: translate(data.grade),
          "Type d'établissement": translate(data.esSchool?.type || data.schoolType),
          "Nom de l'établissement": data.esSchool?.fullName || data.schoolName,
          "Code postal de l'établissement": data.esSchool?.postcode || data.schoolZip,
          "Ville de l'établissement": data.esSchool?.city || data.schoolCity,
          "Département de l'établissement": departmentLookUp[data.esSchool?.department] || data.schoolDepartment,
          "UAI de l'établissement": data.esSchool?.uai,
        },
        situation: {
          "Quartier Prioritaire de la ville": translate(data.qpv),
          "Zone Rurale": translate(isInRuralArea(data)),
          Handicap: translate(data.handicap),
          "Bénéficiaire d'un PPS": translate(data.ppsBeneficiary),
          "Bénéficiaire d'un PAI": translate(data.paiBeneficiary),
          "Aménagement spécifique": translate(data.specificAmenagment),
          "Nature de l'aménagement spécifique": translate(data.specificAmenagmentType),
          "Aménagement pour mobilité réduite": translate(data.reducedMobilityAccess),
          "Besoin d'être affecté(e) dans le département de résidence": translate(data.handicapInSameDepartment),
          "Allergies ou intolérances alimentaires": translate(data.allergies),
          "Activité de haut-niveau": translate(data.highSkilledActivity),
          "Nature de l'activité de haut-niveau": data.highSkilledActivityType,
          "Activités de haut niveau nécessitant d'être affecté dans le département de résidence": translate(data.highSkilledActivityInSameDepartment),
          "Document activité de haut-niveau ": data.highSkilledActivityProofFiles,
          "Structure médico-sociale": translate(data.medicosocialStructure),
          "Nom de la structure médico-sociale": data.medicosocialStructureName, // différence avec au-dessus ?
          "Adresse de la structure médico-sociale": data.medicosocialStructureAddress,
          "Code postal de la structure médico-sociale": data.medicosocialStructureZip,
          "Ville de la structure médico-sociale": data.medicosocialStructureCity,
        },
        representative1: {
          "Statut représentant légal 1": translate(data.parent1Status),
          "Prénom représentant légal 1": data.parent1FirstName,
          "Nom représentant légal 1": data.parent1LastName,
          "Email représentant légal 1": data.parent1Email,
          "Téléphone représentant légal 1": data.parent1Phone,
          "Adresse représentant légal 1": data.parent1Address,
          "Code postal représentant légal 1": data.parent1Zip,
          "Ville représentant légal 1": data.parent1City,
          "Département représentant légal 1": data.parent1Department,
          "Région représentant légal 1": data.parent1Region,
        },
        representative2: {
          "Statut représentant légal 2": translate(data.parent2Status),
          "Prénom représentant légal 2": data.parent2FirstName,
          "Nom représentant légal 2": data.parent2LastName,
          "Email représentant légal 2": data.parent2Email,
          "Téléphone représentant légal 2": data.parent2Phone,
          "Adresse représentant légal 2": data.parent2Address,
          "Code postal représentant légal 2": data.parent2Zip,
          "Ville représentant légal 2": data.parent2City,
          "Département représentant légal 2": data.parent2Department,
          "Région représentant légal 2": data.parent2Region,
        },
        consent: {
          "Consentement des représentants légaux": translate(data.parentConsentment),
        },
        status: {
          "Statut général": translate(data.status),
          Phase: translate(data.phase),
          "Statut Phase 1": translatePhase1(data.statusPhase1),
          "Statut Phase 2": translatePhase2(data.statusPhase2),
          "Statut Phase 3": translate(data.statusPhase3),
          "Dernier statut le": formatLongDateFR(data.lastStatusAt),
        },
        phase1Affectation: {
          "ID centre": center._id || "",
          "Code centre (2021)": center.code || "",
          "Code centre (2022)": center.code2022 || "",
          "Nom du centre": center.name || "",
          "Ville du centre": center.city || "",
          "Département du centre": center.department || "",
          "Région du centre": center.region || "",
        },
        phase1Transport: {
          "Se rend au centre par ses propres moyens": translate(data.deplacementPhase1Autonomous),
          // "Transport géré hors plateforme": // Doublon?
          "Bus n˚": meetingPoint?.busExcelId,
          "Adresse point de rassemblement": meetingPoint?.departureAddress,
          "Date aller": meetingPoint?.departureAtString,
          "Date retour": meetingPoint?.returnAtString,
        },
        phase1DocumentStatus: {
          "Droit à l'image - Statut": translateFileStatusPhase1(data.imageRightFilesStatus) || "Non Renseigné",
          "Autotest PCR - Statut": translateFileStatusPhase1(data.autoTestPCRFilesStatus) || "Non Renseigné",
          "Règlement intérieur": translate(data.rulesYoung),
          "Fiche sanitaire réceptionnée": translate(data.cohesionStayMedicalFileReceived) || "Non Renseigné",
        },
        phase1DocumentAgreement: {
          "Droit à l'image - Accord": translate(data.imageRight),
          "Autotest PCR - Accord": translate(data.autoTestPCR),
        },
        phase1Attendance: {
          "Présence à l'arrivée": !data.cohesionStayPresence ? "Non renseignée" : data.cohesionStayPresence === "true" ? "Présent" : "Absent",
          "Présence à la JDM": !data.presenceJDM ? "Non renseignée" : data.presenceJDM === "true" ? "Présent" : "Absent",
          "Date de départ": !data.departSejourAt ? "Non renseignée" : formatDateFRTimezoneUTC(data.departSejourAt),
          "Motif du départ": data?.departSejourMotif,
        },
        // phase2: {
        //   "Domaine de MIG 1": data.domains[0],
        //   "Domaine de MIG 2": data.domains[1],
        //   "Domaine de MIG 3": data.domains[2],
        //   "Projet professionnel": translate(data.professionnalProject),
        //   "Information supplémentaire sur le projet professionnel": data.professionnalProjectPrecision,
        //   "Période privilégiée pour réaliser des missions": data.period,
        //   "Choix 1 période": translate(data.periodRanking[0]),
        //   "Choix 2 période": translate(data.periodRanking[1]),
        //   "Choix 3 période": translate(data.periodRanking[2]),
        //   "Choix 4 période": translate(data.periodRanking[3]),
        //   "Choix 5 période": translate(data.periodRanking[4]),
        //   "Mobilité aux alentours de son établissement": translate(data.mobilityNearSchool),
        //   "Mobilité aux alentours de son domicile": translate(data.mobilityNearHome),
        //   "Mobilité aux alentours d'un de ses proches": translate(data.mobilityNearRelative),
        //   "Informations du proche":
        //     data.mobilityNearRelative &&
        //     [data.mobilityNearRelativeName, data.mobilityNearRelativeAddress, data.mobilityNearRelativeZip, data.mobilityNearRelativeCity].filter((e) => e)?.join(", "),
        //   "Mode de transport": data.mobilityTransport?.map((t) => translate(t)).join(", "),
        //   "Autre mode de transport": data.mobilityTransportOther,
        //   "Format de mission": translate(data.missionFormat),
        //   "Engagement dans une structure en dehors du SNU": translate(data.engaged),
        //   "Description engagement ": data.engagedDescription,
        //   "Souhait MIG": data.desiredLocation,
        // },
        accountDetails: {
          "Créé lé": formatLongDateFR(data.createdAt),
          "Mis à jour le": formatLongDateFR(data.updatedAt),
          "Dernière connexion le": formatLongDateFR(data.lastLoginAt),
        },
        desistement: {
          "Raison du désistement": getLabelWithdrawnReason(data.withdrawnReason),
          "Message de désistement": data.withdrawnMessage,
          // Date du désistement: // not found in db
        },
      };

      let fields = { ID: data._id };
      for (const element of values) {
        let key;
        for (key in allFields[element]) fields[key] = allFields[element][key];
      }
      return fields;
    });
  }

  const fieldCategories = [
    {
      id: "identity",
      title: "Identité du volontaire",
      desc: ["Prénom", "Nom", "Sexe", "Cohorte", "Cohorte d'origine"],
      fields: ["firstName", "lastName", "gender", "cohort", "originalCohort"],
    },
    {
      id: "contact",
      title: "Contact du volontaire",
      desc: ["Email", "Téléphone"],
      fields: ["email", "phone"],
    },
  ];

  //   {
  //     title: "Date et lieu de naissance du volontaire",
  //     desc: ["Date de naissance", "Pays de naissance", "Ville de naissance", "Code postal de naissance"],
  //     value: "birth",
  //   },
  //   {
  //     title: "Lieu de résidence du volontaire",
  //     desc: [
  //       "Adresse postale",
  //       "Code postal",
  //       "Ville, pays, nom et prénom de l'hébergeur",
  //       "Lien avec l'hébergeur",
  //       "Adresse - étranger",
  //       "Code postal - étranger",
  //       "Ville - étranger",
  //       "Pays - étranger",
  //     ],
  //     value: "address",
  //   },
  //   {
  //     title: "Localisation du volontaire",
  //     desc: ["Département", "Académie", "Région"],
  //     value: "location",
  //   },
  //   {
  //     title: "Situation scolaire",
  //     desc: [
  //       "Niveau",
  //       "Type d'établissement",
  //       "Nom de l'établissement",
  //       "Code postal de l'établissement",
  //       "Ville de l'établissement",
  //       "Département de l'établissement",
  //       "UAI de l'établissement",
  //     ],
  //     value: "schoolSituation",
  //   },
  //   {
  //     title: "Situation particulière",
  //     desc: [
  //       "Quartier Prioritaire de la ville",
  //       "Zone Rurale",
  //       "Handicap",
  //       "PPS",
  //       "PAI",
  //       "Aménagement spécifique",
  //       "Nature de l'aménagement spécifique",
  //       "Aménagement pour mobilité réduite",
  //       "Besoin d'être affecté(e) dans le département de résidence",
  //       "Allergies ou intolérances alimentaires",
  //       "Activité de haut-niveau",
  //       "Nature de l'activité de haut-niveau",
  //       "Activités de haut niveau nécessitant d'être affecté dans le département de résidence",
  //       "Document activité de haut-niveau",
  //       "Structure médico-sociale",
  //       "Nom de la structure médico-sociale",
  //       "Adresse de la structure médico-sociale",
  //       "Code postal de la structure médico-sociale",
  //       "Ville de la structure médico-sociale",
  //     ],
  //     value: "situation",
  //   },
  //   {
  //     title: "Représentant légal 1",
  //     desc: ["Statut", "Nom", "Prénom", "Email", "Téléphone", "Adresse", "Code postal", "Ville", "Département et région du représentant légal"],
  //     value: "representative1",
  //   },
  //   {
  //     title: "Représentant légal 2",
  //     desc: ["Statut", "Nom", "Prénom", "Email", "Téléphone", "Adresse", "Code postal", "Ville", "Département et région du représentant légal"],
  //     value: "representative2",
  //   },
  //   {
  //     title: "Consentement",
  //     desc: ["Consentement des représentants légaux."],
  //     value: "consent",
  //   },
  //   {
  //     title: "Statut",
  //     desc: ["Statut général", "Statut phase 1", "Statut phase 2", "Statut phase 3", "Date du dernier statut"],
  //     value: "status",
  //   },
  //   {
  //     title: "Phase 1 - Affectation ",
  //     desc: ["ID", "Code", "Nom", "Ville", "Département et région du centre"],
  //     value: "phase1Affectation",
  //   },
  //   {
  //     title: "Phase 1 - Transport",
  //     desc: ["Autonomie", "Numéro de bus", "Point de rassemblement", "Dates d'aller et de retour"],
  //     value: "phase1Transport",
  //   },
  //   {
  //     title: "Phase 1 - Statut des documents",
  //     desc: ["Droit à l'image", "Autotest PCR", "Règlement intérieur", "Fiche sanitaire"],
  //     value: "phase1DocumentStatus",
  //   },
  //   {
  //     title: "Phase 1 - Accords",
  //     desc: ["Accords pour droit à l'image et autotests PCR."],
  //     value: "phase1DocumentAgreement",
  //   },
  //   {
  //     title: "Phase 1 - Présence",
  //     desc: ["Présence à l'arrivé", "Présence à la JDM", "Date de départ", "Motif de départ"],
  //     value: "phase1Attendance",
  //   },
  //   {
  //     title: "Phase 2",
  //     desc: [
  //       "Domaines MIG 1, MIG 2 et MIG 3",
  //       "Projet professionnel",
  //       "Période privilégiée",
  //       "Choix de périodes",
  //       "Mobilité",
  //       "Mobilité autour d'un proche",
  //       "Information du proche",
  //       "Mode de transport",
  //       "Format de mission",
  //       "Engagement hors SNU",
  //       "Souhait MIG",
  //     ],
  //     value: "phase2",
  //   },
  //   {
  //     title: "Compte",
  //     desc: ["Dates de création, d'édition et de dernière connexion."],
  //     value: "accountDetails",
  //   },
  //   {
  //     title: "Désistement",
  //     desc: ["Raison du désistement", "Message de désistement"],
  //     value: "desistement",
  //   },
  // ];\
  function getFieldsToExport(selectedCategoryIds) {
    let fieldsToExport = ["._id"];
    for (const category in fieldCategories) {
      if (selectedCategoryIds.includes(category.id)) {
        fieldsToExport = [...fieldsToExport, ...category.fields];
      }
    }
    return fieldsToExport;
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: "Volontaires" }]} />
      <ReactiveBase url={`${apiURL}/es`} app="young" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Header>
              <div>
                <Title>Volontaires</Title>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: ".25rem", justifyContent: "flex-end" }}>
                {/* Column selection modal */}

                <LoadingButton onClick={() => setColumnModalOpen(true)}>Exporter les volontaires</LoadingButton>
                <Modal toggle={() => setColumnModalOpen(false)} isOpen={columnModalOpen} onCancel={() => setColumnModalOpen(false)} size="xl" centered>
                  <ModalContainer>
                    <Formik
                      initialValues={{
                        checked: fieldCategories.map((e) => e.id),
                      }}>
                      {({ values, setFieldValue }) => (
                        <>
                          <div className="w-full px-4">
                            <div className="text-2xl text-center mb-4">Sélectionnez les données à exporter</div>

                            <SelectedFilters
                              showClearAll={false}
                              render={(props) => {
                                const { selectedValues } = props;
                                let areAllFiltersEmpty = true;
                                for (const item of Object.keys(selectedValues)) {
                                  if (selectedValues[item].value.length > 0) areAllFiltersEmpty = false;
                                }
                                if (!areAllFiltersEmpty) {
                                  return (
                                    <div className="rounded-xl bg-gray-50 py-3">
                                      <div className="text-center text-base text-gray-400">Rappel des filtres appliqués</div>
                                      <div className="mt-2 mx-auto text-center text-base text-gray-600">
                                        {Object.values(selectedValues)
                                          .filter((e) => e.value.length > 0)
                                          .map((e) => getSelectedFilterLabel(e.value[0], translateFilter(e.label)))
                                          .join(" • ")}
                                      </div>
                                    </div>
                                  );
                                } else {
                                  return <div></div>;
                                }
                              }}
                            />

                            <div className="flex pt-4 pb-1">
                              <div className="w-1/2 text-left">Sélectionnez pour choisir des sous-catégories</div>
                              <div className="w-1/2 text-right flex flex-row-reverse">
                                {values.checked == "" ? (
                                  <div
                                    className="text-snu-purple-300 cursor-pointer"
                                    onClick={() =>
                                      setFieldValue(
                                        "checked",
                                        fieldCategories.map((e) => e.id),
                                      )
                                    }>
                                    Tout sélectionner
                                  </div>
                                ) : (
                                  <div className="text-snu-purple-300 cursor-pointer" onClick={() => setFieldValue("checked", [])}>
                                    Tout déselectionner
                                  </div>
                                )}
                                <StateProvider
                                  render={({ searchState }) => {
                                    return <div className="mr-2">{searchState.result.hits?.total} résultats</div>;
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="h-[60vh] overflow-auto grid grid-cols-2 gap-4 w-full p-3">
                            {fieldCategories.map((category) => (
                              <ExportFieldCard key={category.id} category={category} values={values} setFieldValue={setFieldValue} />
                            ))}
                          </div>
                          <div className="flex gap-2 justify-center mb-3">
                            <div className="w-1/2 p-0.5">
                              <ModalButton onClick={() => setColumnModalOpen(false)}>Annuler</ModalButton>
                            </div>
                            <div className="flex mt-2 w-1/2 h-10">
                              <ExportComponent
                                handleClick={() => plausibleEvent("Volontaires/CTA - Exporter volontaires")}
                                title="Exporter les volontaires"
                                defaultQuery={getExportQuery}
                                exportTitle="Volontaires"
                                index="young"
                                react={{ and: FILTERS }}
                                transform={(data) => transform(data, values.checked)}
                                // fieldsToExport={["firstName", "lastName", "gender", "cohort", "originalCohort", "email", "phone"]}
                                fieldsToExport={(values) => getFieldsToExport(values)}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </Formik>
                  </ModalContainer>
                </Modal>
                {/* End column selection modal */}

                {user.role === ROLES.REFERENT_DEPARTMENT && (
                  <ExportComponent
                    title="Exporter les volontaires scolarisés dans le département"
                    defaultQuery={getExportQuery}
                    exportTitle="Volontaires"
                    index="young-having-school-in-department/volontaires"
                    react={{ and: FILTERS }}
                    transform={async (data) => {
                      let all = data;
                      const schoolsId = [...new Set(data.map((item) => item.schoolId).filter((e) => e))];
                      if (schoolsId?.length) {
                        const { responses } = await api.esQuery("school", {
                          query: { bool: { must: { ids: { values: schoolsId } } } },
                          size: ES_NO_LIMIT,
                        });
                        if (responses.length) {
                          const schools = responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
                          all = data.map((item) => ({ ...item, esSchool: schools?.find((e) => e._id === item.schoolId) }));
                        }
                      }
                      return all.map((data) => {
                        return {
                          _id: data._id,
                          Cohorte: data.cohort,
                          Prénom: data.firstName,
                          Nom: data.lastName,
                          Département: data.department,
                          Situation: translate(data.situation),
                          Niveau: translate(data.grade),
                          "Type d'établissement": translate(data.esSchool?.type || data.schoolType),
                          "Nom de l'établissement": data.esSchool?.fullName || data.schoolName,
                          "Code postal de l'établissement": data.esSchool?.postcode || data.schoolZip,
                          "Ville de l'établissement": data.esSchool?.city || data.schoolCity,
                          "Département de l'établissement": departmentLookUp[data.esSchool?.department] || data.schoolDepartment,
                          "UAI de l'établissement": data.esSchool?.uai,
                          "Statut général": translate(data.status),
                          "Statut Phase 1": translate(data.statusPhase1),
                        };
                      });
                    }}
                  />
                )}
                {user.role === ROLES.REFERENT_REGION && (
                  <ExportComponent
                    title="Exporter les volontaires scolarisés dans la région"
                    defaultQuery={getExportQuery}
                    exportTitle="Volontaires"
                    index="young-having-school-in-region/volontaires"
                    react={{ and: FILTERS }}
                    transform={async (data) => {
                      let all = data;
                      const schoolsId = [...new Set(data.map((item) => item.schoolId).filter((e) => e))];
                      if (schoolsId?.length) {
                        const { responses } = await api.esQuery("school", {
                          query: { bool: { must: { ids: { values: schoolsId } } } },
                          size: ES_NO_LIMIT,
                        });
                        if (responses.length) {
                          const schools = responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
                          all = data.map((item) => ({ ...item, esSchool: schools?.find((e) => e._id === item.schoolId) }));
                        }
                      }
                      return all.map((data) => {
                        return {
                          _id: data._id,
                          Cohorte: data.cohort,
                          Prénom: data.firstName,
                          Nom: data.lastName,
                          Département: data.department,
                          Situation: translate(data.situation),
                          Niveau: translate(data.grade),
                          "Type d'établissement": translate(data.esSchool?.type || data.schoolType),
                          "Nom de l'établissement": data.esSchool?.fullName || data.schoolName,
                          "Code postal de l'établissement": data.esSchool?.postcode || data.schoolZip,
                          "Ville de l'établissement": data.esSchool?.city || data.schoolCity,
                          "Région de l'établissement": department2region[departmentLookUp[data.esSchool?.region]] || department2region[data.schoolDepartment],
                          "Département de l'établissement": departmentLookUp[data.esSchool?.department] || data.schoolDepartment,
                          "UAI de l'établissement": data.esSchool?.uai,
                          "Statut général": translate(data.status),
                          "Statut Phase 1": translate(data.statusPhase1),
                        };
                      });
                    }}
                  />
                )}
              </div>
            </Header>
            <Filter>
              <FilterRow visible>
                <DataSearch
                  defaultQuery={getDefaultQuery}
                  showIcon={false}
                  placeholder="Rechercher par prénom, nom, email, ville, code postal..."
                  componentId="SEARCH"
                  dataField={["email.keyword", "firstName.folded", "lastName.folded", "city.folded", "zip"]}
                  react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                  // fuzziness={2}
                  style={{ flex: 1, marginRight: "1rem" }}
                  innerClass={{ input: "searchbox" }}
                  autosuggest={false}
                  URLParams={true}
                  queryFormat="and"
                />
                <HiAdjustments onClick={handleShowFilter} className="text-xl text-coolGray-700 cursor-pointer hover:scale-105" />
              </FilterRow>
              <FilterRow visible={filterVisible}>
                <div className="uppercase text-xs text-snu-purple-800">Général</div>
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Cohorte"
                  componentId="COHORT"
                  dataField="cohort.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "COHORT") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Cohorte", "Cohorte")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Cohorte d’origine"
                  componentId="ORIGINAL_COHORT"
                  dataField="originalCohort.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "ORIGINAL_COHORT") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Cohorte d’origine", "Cohorte d’origine")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="STATUS"
                  dataField="status.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "STATUS") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Statut", "Statut")}
                  defaultValue={[YOUNG_STATUS.VALIDATED]}
                />

                <RegionFilter defaultQuery={getDefaultQuery} filters={FILTERS} renderLabel={(items) => getFilterLabel(items, "Région", "Région")} />
                <DepartmentFilter defaultQuery={getDefaultQuery} filters={FILTERS} renderLabel={(items) => getFilterLabel(items, "Département", "Département")} />
              </FilterRow>
              <FilterRow visible={filterVisible}>
                <div className="uppercase text-xs text-snu-purple-800">Dossier</div>
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Classe"
                  componentId="GRADE"
                  dataField="grade.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "GRADE") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Classe", "Classe")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="PPS"
                  componentId="PPS"
                  dataField="ppsBeneficiary.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "PPS") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "PPS", "PPS")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="PAI"
                  componentId="PAI"
                  dataField="paiBeneficiary.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "PAI") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "PAI", "PAI")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="QPV"
                  componentId="QPV"
                  dataField="qpv.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "QPV") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "QPV", "QPV")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="HANDICAP"
                  componentId="HANDICAP"
                  dataField="handicap.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "HANDICAP") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "Handicap", "Handicap")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Aménagement spécifique"
                  componentId="SPECIFIC_AMENAGEMENT"
                  dataField="specificAmenagment.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "SPECIFIC_AMENAGEMENT") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "Aménagement spécifique", "Aménagement spécifique")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="PMR"
                  componentId="PMR"
                  dataField="reducedMobilityAccess.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "PMR") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "Aménagement PMR", "Aménagement PMR")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Droit à l'image"
                  componentId="IMAGE_RIGHT"
                  dataField="imageRight.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "IMAGE_RIGHT") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "Droit à l'image", "Droit à l'image")}
                  showMissing
                  missingLabel="Non renseigné"
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Droit à l'image - Statut"
                  componentId="IMAGE_RIGHT_STATUS"
                  dataField="imageRightFilesStatus.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "IMAGE_RIGHT_STATUS") }}
                  renderItem={(e, count) => {
                    return `${translateFileStatusPhase1(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "Droit à l'image - Statut", "Statut fichier phase 1")}
                  showMissing
                  missingLabel="Non renseigné"
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Règlement intérieur"
                  componentId="RULES"
                  dataField="rulesYoung.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "RULES") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "Règlement intérieur", "Règlement intérieur")}
                  showMissing
                  missingLabel="Non renseigné"
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Utilisation d’autotest"
                  componentId="AUTOTEST"
                  dataField="autoTestPCR.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "AUTOTEST") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "Utilisation d’autotest", "Utilisation d’autotest")}
                  showMissing
                  missingLabel="Non renseigné"
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Utilisation d’autotest - Statut"
                  componentId="AUTOTEST_STATUS"
                  dataField="autoTestPCRFilesStatus.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "AUTOTEST_STATUS") }}
                  renderItem={(e, count) => {
                    return `${translateFileStatusPhase1(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "Utilisation d’autotest - Statut", "Statut fichier phase 1")}
                  showMissing
                  missingLabel="Non renseigné"
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder=""
                  componentId="ALLERGIES"
                  dataField="allergies.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "ALLERGIES") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "Allergies ou intolérances", "Allergies ou intolérances")}
                  showMissing
                  missingLabel="Non renseigné"
                />
              </FilterRow>
              <FilterRow visible={filterVisible}>
                <div className="uppercase text-xs text-snu-purple-800">Phase 1</div>
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="STATUS_PHASE_1"
                  dataField="statusPhase1.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "STATUS_PHASE_1") }}
                  renderItem={(e, count) => {
                    return `${translatePhase1(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Statut phase 1", "Statut phase 1")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Affectation dans son département (handicap)"
                  componentId="SAME_DEPARTMENT"
                  dataField="handicapInSameDepartment.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "SAME_DEPARTMENT") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "Affectation dans son département (handicap)", "Affectation dans son département (handicap)")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Affectation dans son département (sport)"
                  componentId="SAME_DEPARTMENT_SPORT"
                  dataField="highSkilledActivityInSameDepartment.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "SAME_DEPARTMENT_SPORT") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "Affectation dans son département (sport)", "Affectation dans son département (sport)")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="COHESION_PARTICIPATION"
                  dataField="youngPhase1Agreement.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "COHESION_PARTICIPATION") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Confirmation de participation au séjour de cohésion", "Confirmation de participation au séjour de cohésion")}
                  showMissing
                  missingLabel="Non renseigné"
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="COHESION_PRESENCE"
                  dataField="cohesionStayPresence.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "COHESION_PRESENCE") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Présence à l’arrivée", "Présence à l’arrivée")}
                  showMissing
                  missingLabel="Non renseigné"
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="COHESION_JDM"
                  dataField="presenceJDM.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "COHESION_JDM") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Présence à la JDM")}
                  showMissing
                  missingLabel="Non renseigné"
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="DEPART"
                  dataField="departInform.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "DEPART") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Départ renseigné")}
                  showMissing
                  missingLabel="Non renseigné"
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="DEPART_MOTIF"
                  dataField="departSejourMotif.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "DEPART_MOTIF") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Motif du départ")}
                  showMissing
                  missingLabel="Non renseigné"
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="MEDICAL_FILE_RECEIVED"
                  dataField="cohesionStayMedicalFileReceived.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "MEDICAL_FILE_RECEIVED") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Fiches sanitaires", "Fiches sanitaires")}
                  showMissing
                  missingLabel="Non renseigné"
                />
              </FilterRow>
              <FilterRow visible={filterVisible}>
                <div className="uppercase text-xs text-snu-purple-800">Phase 2</div>
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="STATUS_PHASE_2"
                  dataField="statusPhase2.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "STATUS_PHASE_2") }}
                  renderItem={(e, count) => {
                    return `${translatePhase2(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Statut phase 2", "Statut phase 2")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="APPLICATION_STATUS"
                  dataField="phase2ApplicationStatus.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "APPLICATION_STATUS") }}
                  renderItem={(e, count) => {
                    return `${translateApplication(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Statut mission (candidature)", "Statut mission (candidature)")}
                  showMissing={true}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="CONTRACT_STATUS"
                  dataField="statusPhase2Contract.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "CONTRACT_STATUS") }}
                  renderItem={(e, count) => {
                    return `${translateEngagement(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Statut contrats", "Statut contrats")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="MILITARY_PREPARATION_FILES_STATUS"
                  dataField="statusMilitaryPreparationFiles.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "MILITARY_PREPARATION_FILES_STATUS") }}
                  renderItem={(e, count) => {
                    return `${translateStatusMilitaryPreparationFiles(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Dossier d’éligibilité aux Préparations Militaires", "Dossier d’éligibilité aux Préparations Militaires")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="EQUIVALENCE_STATUS"
                  dataField="status_equivalence.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "EQUIVALENCE_STATUS") }}
                  renderItem={(e, count) => {
                    return `${translateEquivalenceStatus(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Equivalence de MIG", "Equivalence de MIG")}
                />
              </FilterRow>
              <FilterRow visible={filterVisible}>
                <div className="uppercase text-xs text-snu-purple-800">Phase 3</div>
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="STATUS_PHASE_3"
                  dataField="statusPhase3.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "STATUS_PHASE_3") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Statut phase 3", "Statut phase 3")}
                />
                <Help onClick={toggleInfos} onMouseEnter={() => setInfosHover(true)} onMouseLeave={() => setInfosHover(false)}>
                  {infosClick ? <LockIcon src={LockedSvg} /> : <LockIcon src={UnlockedSvg} />}
                  Aide
                </Help>
              </FilterRow>
              <FilterRow className="flex justify-center" visible={filterVisible}>
                <DeleteFilters />
              </FilterRow>
            </Filter>
            {infosHover || infosClick ? (
              <HelpText>
                <div>
                  Pour filtrer les volontaires, cliquez sur les éléments ci-dessus. Pour en savoir plus sur les différents filtres{" "}
                  <a href={`${supportURL}/base-de-connaissance/je-filtre-les-volontaires`} target="_blank" rel="noreferrer">
                    consultez notre article
                  </a>
                  <div style={{ height: "0.5rem" }} />
                  <div>
                    <span className="title">Général :</span>concerne toutes les informations liées au parcours SNU du volontaire. Le statut général Validée est toujours activé.
                  </div>
                  <div>
                    <span className="title">Dossier :</span>concerne toutes les informations et documents transmis au moment de son inscription
                  </div>
                  <div>
                    <span className="title">Phase 1 , Phase 2 , Phase 3 :</span>concernent tous les éléments de suivi des volontaires
                  </div>
                  <div>
                    <span className="title">Filtres sur l’accord (Oui / Non) :</span> Droit à l’image, Utilisation d’autotest
                  </div>
                  <div>
                    <span className="title">Filtres sur le téléversement ou réception du document :</span> Règlement intérieur, Fiches sanitaires, Documents de Préparation
                    Militaire
                  </div>
                </div>
              </HelpText>
            ) : null}
            <ResultTable>
              <ReactiveListComponent
                defaultQuery={getDefaultQuery}
                react={{ and: FILTERS }}
                sortOptions={[
                  { label: "Nom (A > Z)", dataField: "lastName.keyword", sortBy: "asc" },
                  { label: "Nom (Z > A)", dataField: "lastName.keyword", sortBy: "desc" },
                  { label: "Prénom (A > Z)", dataField: "firstName.keyword", sortBy: "asc" },
                  { label: "Prénom (Z > A)", dataField: "firstName.keyword", sortBy: "desc" },
                  { label: "Date de création (récent > ancien)", dataField: "createdAt", sortBy: "desc" },
                  { label: "Date de création (ancien > récent)", dataField: "createdAt", sortBy: "asc" },
                ]}
                defaultSortOption="Nom (A > Z)"
                render={({ data }) => (
                  <Table>
                    <thead>
                      <tr>
                        <th width="25%">Volontaire</th>
                        <th>Cohorte</th>
                        <th>Contextes</th>
                        <th width="10%">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((hit) => (
                        <Hit key={hit._id} hit={hit} onClick={() => setVolontaire(hit)} selected={volontaire?._id === hit._id} />
                      ))}
                    </tbody>
                  </Table>
                )}
              />
            </ResultTable>
          </div>
          {volontaire !== null && volontaire.status === YOUNG_STATUS.DELETED ? (
            <DeletedVolontairePanel
              value={volontaire}
              onChange={() => {
                setVolontaire(null);
              }}
            />
          ) : (
            <Panel
              value={volontaire}
              onChange={() => {
                setVolontaire(null);
              }}
            />
          )}
        </div>
      </ReactiveBase>
    </div>
  );
}

const Hit = ({ hit, onClick, selected }) => {
  const getBackgroundColor = () => {
    if (selected) return colors.lightBlueGrey;
    if (hit.status === "WITHDRAWN" || hit.status === YOUNG_STATUS.DELETED) return colors.extraLightGrey;
  };

  if (hit.status === YOUNG_STATUS.DELETED) {
    return (
      <tr style={{ backgroundColor: getBackgroundColor() }} onClick={onClick}>
        <td>
          <MultiLine>
            <span className="font-bold text-black">Compte supprimé</span>
            <p>{hit.birthdateAt ? `${getAge(hit.birthdateAt)} ans` : null}</p>
          </MultiLine>
        </td>
        <td>
          <Badge
            color="#0C7CFF"
            backgroundColor="#F9FCFF"
            text={hit.cohort}
            tooltipText={hit.originalCohort ? `Anciennement ${hit.originalCohort}` : null}
            style={{ cursor: "default" }}
            icon={hit.originalCohort ? <IconChangementCohorte /> : null}
          />
        </td>
        <td>
          <Badge minify text="Supprimé" color={YOUNG_STATUS_COLORS.DELETED} tooltipText={translate(hit.status)} />

          <BadgePhase text="Phase 1" value={hit.statusPhase1} redirect={`/volontaire/${hit._id}/phase1`} style={"opacity-50"} />
          <BadgePhase text="Phase 2" value={hit.statusPhase2} redirect={`/volontaire/${hit._id}/phase2`} style={"opacity-50"} />
          <BadgePhase text="Phase 3" value={hit.statusPhase3} redirect={`/volontaire/${hit._id}/phase3`} style={"opacity-50"} />
        </td>
        <td onClick={(e) => e.stopPropagation()}>
          <Action hit={hit} />
        </td>
      </tr>
    );
  } else {
    return (
      <tr style={{ backgroundColor: getBackgroundColor() }} onClick={onClick}>
        <td>
          <MultiLine>
            <span className="font-bold text-black">{`${hit.firstName} ${hit.lastName}`}</span>
            <p>
              {hit.birthdateAt ? `${getAge(hit.birthdateAt)} ans` : null} {`• ${hit.city || ""} (${hit.department || ""})`}
            </p>
          </MultiLine>
        </td>
        <td>
          <Badge
            color="#0C7CFF"
            backgroundColor="#F9FCFF"
            text={hit.cohort}
            tooltipText={hit.originalCohort ? `Anciennement ${hit.originalCohort}` : null}
            style={{ cursor: "default" }}
            icon={hit.originalCohort ? <IconChangementCohorte /> : null}
          />
        </td>
        <td>
          {hit.status === "WITHDRAWN" && <Badge minify text="Désisté" color={YOUNG_STATUS_COLORS.WITHDRAWN} tooltipText={translate(hit.status)} />}
          <BadgePhase text="Phase 1" value={hit.statusPhase1} redirect={`/volontaire/${hit._id}/phase1`} />
          <BadgePhase text="Phase 2" value={hit.statusPhase2} redirect={`/volontaire/${hit._id}/phase2`} />
          <BadgePhase text="Phase 3" value={hit.statusPhase3} redirect={`/volontaire/${hit._id}/phase3`} />
        </td>
        <td onClick={(e) => e.stopPropagation()}>
          <Action hit={hit} />
        </td>
      </tr>
    );
  }
};

const BadgePhase = ({ text, value, redirect, style }) => {
  const history = useHistory();
  const translator = () => {
    if (text === "Phase 1") {
      return translatePhase1(value);
    } else if (text === "Phase 2") {
      return translatePhase2(value);
    } else {
      return translate(value);
    }
  };

  return (
    <Badge
      onClick={() => history.push(redirect)}
      minify
      text={text}
      tooltipText={translator()}
      minTooltipText={`${text}: ${translate(value)}`}
      color={YOUNG_STATUS_COLORS[value]}
      className={style}
    />
  );
};

const Action = ({ hit }) => {
  const user = useSelector((state) => state.Auth.user);

  return (
    <ActionBox color={"#444"}>
      <UncontrolledDropdown setActiveFromChild>
        <DropdownToggle tag="button">
          Choisissez&nbsp;une&nbsp;action
          <Chevron color="#444" />
        </DropdownToggle>
        <DropdownMenu>
          <Link to={`/volontaire/${hit._id}`} onClick={() => plausibleEvent("Volontaires/CTA - Consulter profil volontaire")}>
            <DropdownItem className="dropdown-item">Consulter le profil</DropdownItem>
          </Link>
          {hit.status !== YOUNG_STATUS.DELETED ? (
            <Link to={`/volontaire/${hit._id}/edit`} onClick={() => plausibleEvent("Volontaires/CTA - Modifier profil volontaire")}>
              <DropdownItem className="dropdown-item">Modifier le profil</DropdownItem>
            </Link>
          ) : null}
          {[ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) && hit.status !== YOUNG_STATUS.DELETED ? (
            <DropdownItem className="dropdown-item" onClick={() => plausibleEvent("Volontaires/CTA - Prendre sa place")}>
              <a href={`${appURL}/auth/connect?token=${api.getToken()}&young_id=${hit._id}`}>Prendre sa place</a>
            </DropdownItem>
          ) : null}
        </DropdownMenu>
      </UncontrolledDropdown>
    </ActionBox>
  );
};
