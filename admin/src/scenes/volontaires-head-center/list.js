import React, { useEffect, useState } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import styled from "styled-components";
import { useSelector } from "react-redux";
import plausibleEvent from "../../services/pausible";

import api from "../../services/api";
import { apiURL } from "../../config";
import Panel from "./panel";
import DownloadAllAttestation from "../../components/buttons/DownloadAllAttestation";
import ExportComponent from "../../components/ExportXlsx";
import {
  translate,
  translatePhase1,
  translatePhase2,
  getFilterLabel,
  YOUNG_STATUS_COLORS,
  formatDateFRTimezoneUTC,
  formatLongDateFR,
  isInRuralArea,
  getAge,
  confirmMessageChangePhase1Presence,
  ES_NO_LIMIT,
  getLabelWithdrawnReason,
  PHASE1_HEADCENTER_OPEN_ACCESS_CHECK_PRESENCE,
  departmentLookUp,
  translateFileStatusPhase1,
} from "../../utils";
import { RegionFilter, DepartmentFilter } from "../../components/filters";
import Badge from "../../components/Badge";
import { ResultTable, Filter, Table, FilterRow } from "../../components/list";
import Chevron from "../../components/Chevron";
import Select from "./components/Select";
import { toastr } from "react-redux-toastr";
import ReactiveListComponent from "../../components/ReactiveListComponent";
import ModalConfirm from "../../components/modals/ModalConfirm";
import WithTooltip from "../../components/WithTooltip";
import LoadingButton from "../../components/buttons/LoadingButton";
import { ModalContainer, Content } from "../../components/modals/Modal";
import ModalButton from "../../components/buttons/ModalButton";
import { Formik, Field } from "formik";
import { Modal } from "reactstrap";

const FILTERS = [
  "SEARCH",
  "STATUS",
  "COHORT",
  "DEPARTMENT",
  "REGION",
  "STATUS_PHASE_1",
  "STATUS_PHASE_2",
  "STATUS_PHASE_3",
  "STATUS_APPLICATION",
  "LOCATION",
  "CONTRACT_STATUS",
  "MEDICAL_FILE_RECEIVED",
  "COHESION_PRESENCE",
  "QPV",
  "HANDICAP",
  "SEXE",
  "ZRR",
  "GRADE",
];

export default function List() {
  const { user, sessionPhase1 } = useSelector((state) => state.Auth);
  const [volontaire, setVolontaire] = useState(null);
  const [meetingPoints, setMeetingPoints] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const handleShowFilter = () => setFilterVisible(!filterVisible);
  const [columnModalOpen, setColumnModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/meeting-point/all");
      setMeetingPoints(data);
    })();
  }, []);
  const getDefaultQuery = () => ({
    query: { bool: { filter: [{ terms: { "status.keyword": ["VALIDATED", "WITHDRAWN"] } }] } },
    sort: [{ "lastName.keyword": "asc" }],
    track_total_hits: true,
  });
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  async function transform(data, values) {
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
      let meetingPoint = {};
      if (data.meetingPointId && meetingPoints) {
        meetingPoint = meetingPoints.find((mp) => mp._id === data.meetingPointId);
        if (!meetingPoint) meetingPoint = {};
      }
      const COLUMNS = {
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
        },
        address: {
          "Adresse postale": data.address,
          "Code postal": data.zip,
          Ville: data.city,
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
        phase1Transport: {
          "Se rend au centre par ses propres moyens": translate(data.deplacementPhase1Autonomous),
          // "Transport géré hors plateforme": // Doublon?
          "Bus n˚": meetingPoint?.busExcelId,
          "Adresse point de rassemblement": meetingPoint?.departureAddress,
          "Confirmation point de rassemblement": data.meetingPointId || data.deplacementPhase1Autonomous === "true" ? "Oui" : "Non",
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
        accountDetails: {
          "Créé lé": formatLongDateFR(data.createdAt),
          "Mis à jour le": formatLongDateFR(data.updatedAt),
          "Dernière connexion le": formatLongDateFR(data.lastLoginAt),
        },
        desistement: {
          "Raison du desistement": getLabelWithdrawnReason(data.withdrawnReason),
          "Message de désistement": data.withdrawnMessage,
          // Date du désistement: // not found in db
        },
      };

      let columns = { ID: data._id };
      for (const element of values) {
        let key;
        for (key in COLUMNS[element]) columns[key] = COLUMNS[element][key];
      }
      return columns;
    });
  }

  const COLUMNS = [
    {
      title: "Identité du volontaire",
      desc: "Prénom, nom, sexe, cohorte.",
      value: "identity",
    },
    {
      title: "Contact du volontaire",
      desc: "Email, téléphone.",
      value: "contact",
    },
    {
      title: "Date de naissance du volontaire",
      desc: "Date de naissance.",
      value: "birth",
    },
    {
      title: "Lieu de résidence du volontaire",
      desc: "Adresse postale, code postal, ville.",
      value: "address",
    },
    {
      title: "Localisation du volontaire",
      desc: "Département, académie, région.",
      value: "location",
    },
    {
      title: "Situation scolaire",
      desc: "Niveau, type d'établissement, nom de l'établissement, code postal de l'établissement, ville de l'établissement, département de l'établissement, UAI de l'établissement.",
      value: "schoolSituation",
    },
    {
      title: "Situation particulière",
      desc: "Quartier Prioritaire de la ville, Zone Rurale, Handicap, PPS, PAI, Aménagement spécifique, Nature de l'aménagement spécifique, Aménagement pour mobilité réduite, Besoin d'être affecté(e) dans le département de résidence, Allergies ou intolérances alimentaires, Activité de haut-niveau, Nature de l'activité de haut-niveau, Activités de haut niveau nécessitant d'être affecté dans le département de résidence, Document activité de haut-niveau, Structure médico-sociale, Nom de la structure médico-sociale, Adresse de la structure médico-sociale, Code postal de la structure médico-sociale, Ville de la structure médico-sociale",
      value: "situation",
    },
    {
      title: "Représentant légal 1",
      desc: "Statut, nom, prénom, email, téléphone, adresse, code postal, ville, département et région du représentant légal.",
      value: "representative1",
    },
    {
      title: "Représentant légal 2",
      desc: "Statut, nom, prénom, email, téléphone, adresse, code postal, ville, département et région du représentant légal.",
      value: "representative2",
    },
    {
      title: "Consentement",
      desc: "Consentement des représentants légaux.",
      value: "consent",
    },
    {
      title: "Statut",
      desc: "Statut général, statut phase 1, statut phase 2, statut phase 3, date du dernier statut.",
      value: "status",
    },
    {
      title: "Phase 1 - Transport",
      desc: "Autonomie, numéro de bus, point de rassemblement, dates d'aller et de retour.",
      value: "phase1Transport",
    },
    {
      title: "Phase 1 - Statut des documents",
      desc: "Droit à l'image, autotest PCR, règlement intérieur, fiche sanitaire.",
      value: "phase1DocumentStatus",
    },
    {
      title: "Phase 1 - Accords",
      desc: "Accords pour droit à l'image et autotests PCR.",
      value: "phase1DocumentAgreement",
    },
    {
      title: "Compte",
      desc: "Dates de création, d'édition et de dernière connexion.",
      value: "accountDetails",
    },
    {
      title: "Désistement",
      desc: "Raison et message du désistement.",
      value: "desistement",
    },
  ];

  return (
    <div>
      <ReactiveBase url={`${apiURL}/es`} app={`sessionphase1young/${sessionPhase1._id}`} headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Header>
              <div>
                <Title>Volontaires yo</Title>
              </div>
              <div style={{ display: "flex" }}>
                {/* Column selection modal */}

                <LoadingButton onClick={() => setColumnModalOpen(true)}>Exporter les volontaires</LoadingButton>
                <Modal isOpen={columnModalOpen} onCancel={() => setColumnModalOpen(false)} size="xl" centered>
                  <ModalContainer>
                    <Formik
                      initialValues={{
                        checked: [
                          "identity",
                          "contact",
                          "birth",
                          "address",
                          "location",
                          "schoolSituation",
                          "situation",
                          "representative1",
                          "representative2",
                          "consent",
                          "status",
                          "phase1Transport",
                          "phase1DocumentStatus",
                          "phase1DocumentAgreement",
                          "accountDetails",
                          "desistement",
                        ],
                      }}>
                      {({ values, setFieldValue }) => (
                        <>
                          <div className="text-xl">Sélectionnez les données à exporter</div>
                          <Content>
                            <div className="flex w-full py-4">
                              <div className="w-1/2 text-left">Sélectionnez pour choisir des sous-catégories</div>
                              <div className="w-1/2 text-right">
                                {values.checked == "" ? (
                                  <div
                                    className="text-snu-purple-300 cursor-pointer hover:underline"
                                    onClick={() =>
                                      setFieldValue("checked", [
                                        "identity",
                                        "contact",
                                        "birth",
                                        "address",
                                        "location",
                                        "schoolSituation",
                                        "situation",
                                        "representative1",
                                        "representative2",
                                        "consent",
                                        "status",
                                        "phase1Transport",
                                        "phase1DocumentStatus",
                                        "phase1DocumentAgreement",
                                        "accountDetails",
                                        "desistement",
                                      ])
                                    }>
                                    Tout sélectionner
                                  </div>
                                ) : (
                                  <div className="text-snu-purple-300 cursor-pointer hover:underline" onClick={() => setFieldValue("checked", [])}>
                                    Tout déselectionner
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="h-[60vh] overflow-auto">
                              <div className="grid grid-cols-2 gap-4 w-full">
                                {COLUMNS.map((cat) => (
                                  <div
                                    key={cat.value}
                                    className="rounded-xl border-2 border-gray-100 px-3 py-2 cursor-pointer"
                                    onClick={() => {
                                      if (!values.checked.includes(cat.value)) {
                                        const newValues = [...values.checked, cat.value];
                                        setFieldValue("checked", newValues);
                                      } else {
                                        const newValues = values.checked.filter((item) => item !== cat.value);
                                        setFieldValue("checked", newValues);
                                      }
                                    }}>
                                    <div className="flex justify-between w-full">
                                      <div className="text-left text-lg w-3/4">{cat.title}</div>
                                      <div className="h-4">
                                        <Field type="checkbox" name="checked" value={cat.value} />
                                      </div>
                                    </div>
                                    {cat.desc.length > 150 ? (
                                      cat.desc.length > 300 ? (
                                        <div className="transition-[height] ease-in-out w-full text-gray-400 text-left h-10 text-ellipsis overflow-hidden hover:h-64 duration-300">
                                          {cat.desc}
                                        </div>
                                      ) : (
                                        <div className="transition-[height] ease-in-out w-full text-gray-400 text-left h-10 text-ellipsis overflow-hidden hover:h-36 duration-300">
                                          {cat.desc}
                                        </div>
                                      )
                                    ) : (
                                      <div className="w-full text-gray-400 text-left h-10">{cat.desc}</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </Content>
                          <div className="flex gap-2 justify-center mb-4">
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
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </Formik>
                  </ModalContainer>
                </Modal>
                {/* End column selection modal */}

                <WithTooltip tooltipText="Suite au remaniement ministériel du 4 juillet 2022, les nouvelles attestations ne sont pas encore disponibles. Elles le seront très prochainement">
                  {/* <DownloadAllAttestation sessionPhase1={user.sessionPhase1Id}>
                    <div>Exporter les attestations</div>
                  </DownloadAllAttestation> */}
                  <button
                    disabled={true}
                    // onClick={() => viewAttestation()}
                    className="flex justify-between items-center gap-3 px-3 py-2 rounded-lg cursor-pointer disabled:opacity-50 bg-blue-600 text-white font-medium text-sm">
                    Exporter les attestations
                  </button>
                </WithTooltip>
              </div>
            </Header>
            <Filter>
              <FilterRow visible>
                <DataSearch
                  showIcon={false}
                  placeholder="Rechercher par prénom, nom, email, ville, code postal..."
                  componentId="SEARCH"
                  dataField={["email.keyword", "firstName.folded", "lastName.folded", "city.folded", "zip"]}
                  react={{ and: FILTERS }}
                  // fuzziness={2}
                  style={{ flex: 1, marginRight: "1rem" }}
                  innerClass={{ input: "searchbox" }}
                  autosuggest={false}
                  URLParams={true}
                  queryFormat="and"
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
                  renderLabel={(items) => getFilterLabel(items, "Statut")}
                />
                <Chevron color="#444" style={{ cursor: "pointer", transform: filterVisible && "rotate(180deg)" }} onClick={handleShowFilter} />
              </FilterRow>
              <FilterRow visible={filterVisible}>
                <RegionFilter defaultQuery={getDefaultQuery} filters={FILTERS} />
                <DepartmentFilter defaultQuery={getDefaultQuery} filters={FILTERS} />
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
                />
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
                  renderLabel={(items) => getFilterLabel(items, "Statut phase 1", "Statut Phase 1")}
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
                  renderLabel={(items) => getFilterLabel(items, "Participations au séjour de cohésion")}
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
                  renderLabel={(items) => getFilterLabel(items, "Fiches sanitaires")}
                  showMissing
                  missingLabel="Non renseigné"
                />
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
                  placeholder="SEXE"
                  componentId="SEXE"
                  dataField="gender.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "SEXE") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "Sexe")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="ZRR"
                  componentId="ZRR"
                  dataField="populationDensity.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "ZRR") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "ZRR")}
                />
              </FilterRow>
            </Filter>
            <ResultTable>
              <ReactiveListComponent
                defaultQuery={getDefaultQuery}
                react={{ and: FILTERS }}
                dataField="lastName.keyword"
                sortBy="asc"
                render={({ data }) => (
                  <Table>
                    <thead>
                      <tr>
                        <th width="30%">Volontaire</th>
                        <th width="30%">Contextes</th>
                        <th width="20%">Présence au séjour</th>
                        <th width="20%">Fiche sanitaire</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((hit) => (
                        <Hit
                          key={hit._id}
                          hit={hit}
                          callback={(e) => {
                            if (e._id === volontaire?._id) setVolontaire(e);
                          }}
                          onClick={() => setVolontaire(hit)}
                          selected={volontaire?._id === hit._id}
                        />
                      ))}
                    </tbody>
                  </Table>
                )}
              />
            </ResultTable>{" "}
          </div>
          <Panel
            value={volontaire}
            onChange={() => {
              setVolontaire(null);
            }}
          />
        </div>
      </ReactiveBase>
    </div>
  );
}

const Hit = ({ hit, onClick, selected, callback }) => {
  const [value, setValue] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const updateYoung = async (v) => {
    const { data, ok, code } = await api.put(`/referent/young/${value._id}`, v);
    if (!ok) return toastr.error("Oups, une erreur s'est produite", translate(code));
    setValue(data);
    callback(data);
  };

  useEffect(() => {
    setValue(hit);
  }, [hit._id]);

  if (!value) return <></>;

  return (
    <tr style={{ backgroundColor: selected && "#e6ebfa" }}>
      <td onClick={onClick}>
        <div className="name">{`${hit.firstName} ${hit.lastName}`}</div>
        <div className="email">
          {value.birthdateAt ? `${getAge(value.birthdateAt)} ans` : null} {`• ${value.city || ""} (${value.department || ""})`}
        </div>
      </td>
      <td onClick={onClick}>
        <Badge text={`Cohorte ${value.cohort}`} />
        <Badge text="Phase 1" tooltipText={translatePhase1(value.statusPhase1)} color={YOUNG_STATUS_COLORS[value.statusPhase1]} />
        {value.status === "WITHDRAWN" ? <Badge text="Désisté" color={YOUNG_STATUS_COLORS.WITHDRAWN} /> : null}
      </td>
      <td>
        <Select
          placeholder="Non renseigné"
          options={[
            { value: "true", label: "Présent" },
            { value: "false", label: "Absent" },
          ]}
          value={value.cohesionStayPresence}
          name="cohesionStayPresence"
          disabled={PHASE1_HEADCENTER_OPEN_ACCESS_CHECK_PRESENCE[value.cohort].getTime() > Date.now()}
          handleChange={(e) => {
            const value = e.target.value;
            setModal({
              isOpen: true,
              onConfirm: () => {
                updateYoung({ cohesionStayPresence: value });
              },
              title: "Changement de présence",
              message: confirmMessageChangePhase1Presence(value),
            });
          }}
        />
      </td>
      <td>
        <Select
          placeholder="Non renseigné"
          options={[
            { value: "true", label: "Réceptionné" },
            { value: "false", label: "Non réceptionné" },
          ]}
          value={value.cohesionStayMedicalFileReceived}
          name="cohesionStayMedicalFileReceived"
          disabled={PHASE1_HEADCENTER_OPEN_ACCESS_CHECK_PRESENCE[value.cohort].getTime() > Date.now()}
          handleChange={(e) => {
            const value = e.target.value;
            updateYoung({ cohesionStayMedicalFileReceived: value });
          }}
        />
      </td>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
    </tr>
  );
};

const Header = styled.div`
  padding: 0 40px 0;
  display: flex;
  align-items: flex-start;
  margin-top: 20px;
  justify-content: space-between;
`;

const Title = styled.div`
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 30px;
`;
