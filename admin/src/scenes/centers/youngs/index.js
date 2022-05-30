import dayjs from "dayjs";
import * as FileSaver from "file-saver";
import React from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { NavLink, useHistory, useParams, Link } from "react-router-dom";
import { ES_NO_LIMIT } from "snu-lib";
import * as XLSX from "xlsx";
import Bus from "../../../assets/icons/Bus";
import ClipboardList from "../../../assets/icons/ClipboardList";
import Menu from "../../../assets/icons/Menu";
import PencilAlt from "../../../assets/icons/PencilAlt";
import ShieldCheck from "../../../assets/icons/ShieldCheck";
import SelectAction from "../../../components/SelectAction";
import api from "../../../services/api";
import {
  departmentLookUp,
  formatDateFRTimezoneUTC,
  formatLongDateFR,
  getLabelWithdrawnReason,
  isInRuralArea,
  translate,
  translateFileStatusPhase1,
  translatePhase1,
  canSearchInElasticSearch,
  ROLES,
} from "../../../utils";
import ModalExportMail from "../components/modals/ModalExportMail";
import FicheSanitaire from "./fiche-sanitaire";
import General from "./general";
import Pointage from "./pointage";
import ChevronRight from "../../../assets/icons/ChevronRight.js";
import Template from "../../../assets/icons/Template.js";
import downloadPDF from "../../../utils/download-pdf";

export default function CenterYoungIndex() {
  const [modalExportMail, setModalExportMail] = React.useState({ isOpen: false });
  const [filter, setFilter] = React.useState();
  const [urlParams, setUrlParams] = React.useState("");
  const user = useSelector((state) => state.Auth.user);
  const [loading, setLoading] = React.useState();

  function updateFilter(n) {
    setFilter({ ...filter, ...n });
  }
  const history = useHistory();
  const { id, sessionId, currentTab } = useParams();

  React.useEffect(() => {
    const listTab = ["general", "tableau-de-pointage", "fiche-sanitaire"];
    if (!listTab.includes(currentTab)) history.push(`/centre/${id}/${sessionId}/general`);
  }, [currentTab]);

  React.useEffect(() => {
    if (filter) {
      const params = Object.keys(filter).reduce((acc, key) => {
        if (filter[key] && !["SEARCH", "SESSION"].includes(key)) {
          return `${acc}&${key}=%5B${filter[key].map((c) => `"${c}"`)?.join("%2C")}%5D`;
        }
        return acc;
      }, "");
      setUrlParams(params.substring(1));
    }
  }, [filter]);

  const viewAttestation = async () => {
    setLoading(true);
    await downloadPDF({
      url: `/session-phase1/${sessionId}/certificate`,
      body: { options: { landscape: true } },
      fileName: `attestations.pdf`,
    });
    setLoading(false);
  };

  const exportData = async () => {
    let body = {
      query: {
        bool: {
          must: [],
          filter: [{ terms: { "status.keyword": ["VALIDATED", "WITHDRAWN", "WAITING_LIST"] } }, { term: { "sessionPhase1Id.keyword": sessionId } }],
        },
      },
      sort: [
        {
          "lastName.keyword": "asc",
        },
      ],
      track_total_hits: true,
      size: ES_NO_LIMIT,
    };

    if (filter?.SEARCH) {
      body.query.bool.must.push({
        bool: {
          should: [
            {
              multi_match: {
                query: filter?.SEARCH,
                fields: ["email.keyword", "firstName.folded", "lastName.folded", "city.folded", "zip"],
                type: "cross_fields",
                operator: "and",
              },
            },
            {
              multi_match: {
                query: filter?.SEARCH,
                fields: ["email.keyword", "firstName.folded", "lastName.folded", "city.folded", "zip"],
                type: "phrase",
                operator: "and",
              },
            },
            {
              multi_match: {
                query: filter?.SEARCH,
                fields: ["firstName.folded", "lastName.folded", "city.folded", "zip"],
                type: "phrase_prefix",
                operator: "and",
              },
            },
          ],
          minimum_should_match: "1",
        },
      });
    }

    if (filter?.STATUS?.length) body.query.bool.filter.push({ terms: { "status.keyword": filter.STATUS } });
    if (filter?.STATUS_PHASE_1?.length) body.query.bool.filter.push({ terms: { "statusPhase1.keyword": filter.STATUS_PHASE_1 } });
    if (filter?.REGION?.length) body.query.bool.filter.push({ terms: { "region.keyword": filter.REGION } });
    if (filter?.DEPARTMENT?.length) body.query.bool.filter.push({ terms: { "department.keyword": filter.DEPARTMENT } });
    if (filter?.GRADE?.length) body.query.bool.filter.push({ terms: { "grade.keyword": filter.GRADE } });
    if (filter?.HANDICAP?.length) body.query.bool.filter.push({ terms: { "handicap.keyword": filter.HANDICAP } });
    if (filter?.PPS?.length) body.query.bool.filter.push({ terms: { "ppsBeneficiary.keyword": filter.PPS } });
    if (filter?.PAI?.length) body.query.bool.filter.push({ terms: { "paiBeneficiary.keyword": filter.PAI } });
    if (filter?.SPECIFIC_AMENAGEMENT?.length) body.query.bool.filter.push({ terms: { "specificAmenagment.keyword": filter.SPECIFIC_AMENAGEMENT } });
    if (filter?.PMR?.length) body.query.bool.filter.push({ terms: { "reducedMobilityAccess.keyword": filter.PMR } });
    if (filter?.SEXE?.length) body.query.bool.filter.push({ terms: { "gender.keyword": filter.SEXE } });

    //Field with non renseigné value
    if (filter?.ALLERGIES?.length) {
      if (filter.ALLERGIES.includes("Non renseigné")) {
        const filterWithoutNR = filter.ALLERGIES.filter((f) => f !== "Non renseigné");
        body.query.bool.filter.push({
          bool: {
            should: [{ bool: { must_not: { exists: { field: "allergies.keyword" } } } }, { terms: { "allergies.keyword": filterWithoutNR } }],
          },
        });
      } else {
        body.query.bool.filter.push({ terms: { "allergies.keyword": filter.ALLERGIES } });
      }
    }
    if (filter?.MEDICAL_FILE_RECEIVED?.length) {
      if (filter.MEDICAL_FILE_RECEIVED.includes("Non renseigné")) {
        const filterWithoutNR = filter.MEDICAL_FILE_RECEIVED.filter((f) => f !== "Non renseigné");
        body.query.bool.filter.push({
          bool: {
            should: [
              { bool: { must_not: { exists: { field: "cohesionStayMedicalFileReceived.keyword" } } } },
              { terms: { "cohesionStayMedicalFileReceived.keyword": filterWithoutNR } },
            ],
          },
        });
      } else {
        body.query.bool.filter.push({ terms: { "cohesionStayMedicalFileReceived.keyword": filter.MEDICAL_FILE_RECEIVED } });
      }
    }
    if (filter?.QPV?.length) {
      if (filter.QPV.includes("Non renseigné")) {
        const filterWithoutNR = filter.QPV.filter((f) => f !== "Non renseigné");
        body.query.bool.filter.push({
          bool: {
            should: [{ bool: { must_not: { exists: { field: "qpv.keyword" } } } }, { terms: { "qpv.keyword": filterWithoutNR } }],
          },
        });
      } else {
        body.query.bool.filter.push({ terms: { "qpv.keyword": filter.QPV } });
      }
    }
    if (filter?.COHESION_JDM?.length) {
      if (filter.COHESION_JDM.includes("Non renseigné")) {
        const filterWithoutNR = filter.COHESION_JDM.filter((f) => f !== "Non renseigné");
        body.query.bool.filter.push({
          bool: {
            should: [{ bool: { must_not: { exists: { field: "presenceJDM.keyword" } } } }, { terms: { "presenceJDM.keyword": filterWithoutNR } }],
          },
        });
      } else {
        body.query.bool.filter.push({ terms: { "presenceJDM.keyword": filter.COHESION_JDM } });
      }
    }
    if (filter?.COHESION_PRESENCE?.length) {
      if (filter.COHESION_PRESENCE.includes("Non renseigné")) {
        const filterWithoutNR = filter.COHESION_PRESENCE.filter((f) => f !== "Non renseigné");
        body.query.bool.filter.push({
          bool: {
            should: [{ bool: { must_not: { exists: { field: "cohesionStayPresence.keyword" } } } }, { terms: { "cohesionStayPresence.keyword": filterWithoutNR } }],
          },
        });
      } else {
        body.query.bool.filter.push({ terms: { "cohesionStayPresence.keyword": filter.COHESION_PRESENCE } });
      }
    }
    if (filter?.DEPART?.length) {
      if (filter.DEPART.includes("Non renseigné")) {
        const filterWithoutNR = filter.DEPART.filter((f) => f !== "Non renseigné");
        body.query.bool.filter.push({
          bool: {
            should: [{ bool: { must_not: { exists: { field: "departInform.keyword" } } } }, { terms: { "departInform.keyword": filterWithoutNR } }],
          },
        });
      } else {
        body.query.bool.filter.push({ terms: { "departInform.keyword": filter.DEPART } });
      }
    }
    if (filter?.DEPART_MOTIF?.length) {
      if (filter.DEPART_MOTIF.includes("Non renseigné")) {
        const filterWithoutNR = filter.DEPART_MOTIF.filter((f) => f !== "Non renseigné");
        body.query.bool.filter.push({
          bool: {
            should: [{ bool: { must_not: { exists: { field: "departSejourMotif.keyword" } } } }, { terms: { "departSejourMotif.keyword": filterWithoutNR } }],
          },
        });
      } else {
        body.query.bool.filter.push({ terms: { "departSejourMotif.keyword": filter.DEPART_MOTIF } });
      }
    }
    if (filter?.IMAGE_RIGHT?.length) {
      if (filter.IMAGE_RIGHT.includes("Non renseigné")) {
        const filterWithoutNR = filter.IMAGE_RIGHT.filter((f) => f !== "Non renseigné");
        body.query.bool.filter.push({
          bool: {
            should: [{ bool: { must_not: { exists: { field: "imageRight.keyword" } } } }, { terms: { "imageRight.keyword": filterWithoutNR } }],
          },
        });
      } else {
        body.query.bool.filter.push({ terms: { "imageRight.keyword": filter.IMAGE_RIGHT } });
      }
    }
    if (filter?.AUTOTEST?.length) {
      if (filter.AUTOTEST.includes("Non renseigné")) {
        const filterWithoutNR = filter.AUTOTEST.filter((f) => f !== "Non renseigné");
        body.query.bool.filter.push({
          bool: {
            should: [{ bool: { must_not: { exists: { field: "autoTestPCR.keyword" } } } }, { terms: { "autoTestPCR.keyword": filterWithoutNR } }],
          },
        });
      } else {
        body.query.bool.filter.push({ terms: { "autoTestPCR.keyword": filter.AUTOTEST } });
      }
    }

    const data = await getAllResults(`sessionphase1young/${filter.SESSION}`, body);
    const result = await transformData({ data, centerId: id });
    const csv = await toArrayOfArray(result);
    await toXLSX(`volontaires_pointage_${dayjs().format("YYYY-MM-DD_HH[h]mm[m]ss[s]")}.xlsx`, csv);
  };

  return (
    <>
      {user.role !== ROLES.HEAD_CENTER ? (
        <div className="flex gap-3 text-gray-400 items-center ml-12 mt-8">
          <Template className="" />
          <ChevronRight className="" />
          {canSearchInElasticSearch(user, "cohesioncenter") ? (
            <Link className="text-xs hover:underline hover:text-snu-purple-300" to="/centre">
              Centres
            </Link>
          ) : (
            <div className="text-xs">Centres</div>
          )}
          <ChevronRight className="" />
          <Link className="text-xs hover:underline hover:text-snu-purple-300" to={`/centre/${id}`}>
            Fiche du centre
          </Link>
          <ChevronRight className="" />
          <div className="text-xs">Liste des volontaires</div>
        </div>
      ) : null}
      <div className="m-4">
        <div className="flex items-center justify-between">
          <div className="font-bold text-2xl mb-4">Volontaires</div>
          <div className="flex items-center gap-2">
            <button
              disabled={loading}
              onClick={() => viewAttestation()}
              className="flex justify-between items-center gap-3 px-3 py-2 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-wait bg-blue-600 text-white font-medium text-sm">
              Exporter les attestations
            </button>
            <SelectAction
              title="Exporter les volontaires"
              alignItems="right"
              buttonClassNames="bg-blue-600"
              textClassNames="text-white font-medium text-sm"
              rightIconClassNames="text-blue-300"
              optionsGroup={[
                {
                  title: "Télécharger",
                  items: [
                    {
                      action: async () => {
                        await exportData();
                      },
                      render: (
                        <div className="group flex items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50 cursor-pointer">
                          <ClipboardList className="text-gray-400 group-hover:scale-105 group-hover:text-green-500" />
                          <div style={{ fontFamily: "Marianne" }} className="text-sm text-gray-700">
                            Informations complètes
                          </div>
                        </div>
                      ),
                    },
                  ],
                },
                {
                  title: "Envoyer par mail",
                  items: [
                    {
                      action: async () => {
                        setModalExportMail({
                          isOpen: true,
                          onSubmit: async (emails) => {
                            const { ok } = await api.post(`/session-phase1/${sessionId}/share`, { emails });
                            if (!ok) toastr.error("Oups, une erreur s'est produite");
                            toastr.success("Un mail a été envoyé à tous les destinataires renseignés");
                            setModalExportMail({ isOpen: false });
                          },
                        });
                      },
                      render: (
                        <div className="group flex items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50 cursor-pointer">
                          <Bus className="text-gray-400 group-hover:scale-105 group-hover:text-green-500" />
                          <div className="text-sm text-gray-700">Informations transports</div>
                        </div>
                      ),
                    },
                  ],
                },
              ]}
            />
          </div>
        </div>
        <div className=" flex flex-1 flex-col lg:flex-row">
          <nav className="flex flex-1 gap-1">
            <TabItem icon={<Menu />} title="Général" to={`/centre/${id}/${sessionId}/general${urlParams && "?" + urlParams}`} />
            <TabItem icon={<PencilAlt />} title="Tableau de pointage" to={`/centre/${id}/${sessionId}/tableau-de-pointage${urlParams && "?" + urlParams}`} />
            <TabItem icon={<ShieldCheck />} title="Fiche sanitaire" to={`/centre/${id}/${sessionId}/fiche-sanitaire${urlParams && "?" + urlParams}`} />
          </nav>
        </div>
        <div className="bg-white pt-4">
          {currentTab === "general" && <General filter={filter} updateFilter={updateFilter} />}
          {currentTab === "tableau-de-pointage" && <Pointage updateFilter={updateFilter} />}
          {currentTab === "fiche-sanitaire" && <FicheSanitaire updateFilter={updateFilter} />}
        </div>
      </div>
      <ModalExportMail isOpen={modalExportMail?.isOpen} onCancel={() => setModalExportMail({ isOpen: false, value: null })} onSubmit={modalExportMail?.onSubmit} />
    </>
  );
}

const TabItem = ({ to, title, icon }) => (
  <NavLink
    to={to}
    activeClassName="!text-snu-purple-800 bg-white border-none"
    className="text-[13px] px-3 py-2 cursor-pointer text-gray-600 rounded-t-lg bg-gray-50 border-t-[1px] border-r-[1px] border-l-[1px] border-gray-200 hover:text-snu-purple-800">
    <div className="flex items-center gap-2">
      {icon} {title}
    </div>
  </NavLink>
);

const transformData = async ({ data, centerId }) => {
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

  let resultCenter = await api.get(`/cohesion-center/${centerId}`);
  const center = resultCenter ? resultCenter.data : {};
  let resultMeetingPoints = await api.get(`/meeting-point/center/${centerId}`);
  const meetingPoints = resultMeetingPoints ? resultMeetingPoints.data : [];

  return all.map((data) => {
    let meetingPoint = {};
    if (data.meetingPointId && meetingPoints) {
      meetingPoint = meetingPoints.find((mp) => mp._id === data.meetingPointId);
      if (!meetingPoint) meetingPoint = {};
    }
    return {
      _id: data._id,
      Cohorte: data.cohort,
      Prénom: data.firstName,
      Nom: data.lastName,
      "Date de naissance": formatDateFRTimezoneUTC(data.birthdateAt),
      Sexe: translate(data.gender),
      Email: data.email,
      Téléphone: data.phone,
      "Adresse postale": data.address,
      "Code postal": data.zip,
      Ville: data.city,
      Département: data.department,
      Région: data.region,
      Académie: data.academy,
      Pays: data.country,
      "Nom de l'hébergeur": data.hostLastName,
      "Prénom de l'hébergeur": data.hostFirstName,
      "Lien avec l'hébergeur": data.hostRelationship,
      "Adresse - étranger": data.foreignAddress,
      "Code postal - étranger": data.foreignZip,
      "Ville - étranger": data.foreignCity,
      "Pays - étranger": data.foreignCountry,
      Situation: translate(data.situation),
      Niveau: translate(data.grade),
      "Type d'établissement": translate(data.esSchool?.type || data.schoolType),
      "Nom de l'établissement": data.esSchool?.fullName || data.schoolName,
      "Code postal de l'établissement": data.esSchool?.postcode || data.schoolZip,
      "Ville de l'établissement": data.esSchool?.city || data.schoolCity,
      "Département de l'établissement": departmentLookUp[data.esSchool?.department] || data.schoolDepartment,
      "UAI de l'établissement": data.esSchool?.uai,
      "Quartier Prioritaire de la ville": translate(data.qpv),
      "Zone Rurale": translate(isInRuralArea(data)),
      Handicap: translate(data.handicap),
      "Bénéficiaire d'un PPS": translate(data.ppsBeneficiary),
      "Bénéficiaire d'un PAI": translate(data.paiBeneficiary),
      "Structure médico-sociale": translate(data.medicosocialStructure),
      "Nom de la structure médico-sociale": data.medicosocialStructureName,
      "Adresse de la structure médico-sociale": data.medicosocialStructureAddress,
      "Code postal de la structure médico-sociale": data.medicosocialStructureZip,
      "Ville de la structure médico-sociale": data.medicosocialStructureCity,
      "Aménagement spécifique": translate(data.specificAmenagment),
      "Nature de l'aménagement spécifique": translate(data.specificAmenagmentType),
      "Aménagement pour mobilité réduite": translate(data.reducedMobilityAccess),
      "Besoin d'être affecté(e) dans le département de résidence": translate(data.handicapInSameDepartment),
      "Allergies ou intolérances alimentaires": translate(data.allergies),
      "Activité de haut-niveau": translate(data.highSkilledActivity),
      "Nature de l'activité de haut-niveau": data.highSkilledActivityType,
      "Activités de haut niveau nécessitant d'être affecté dans le département de résidence": translate(data.highSkilledActivityInSameDepartment),
      "Document activité de haut-niveau ": data.highSkilledActivityProofFiles,
      "Consentement des représentants légaux": translate(data.parentConsentment),
      "Droit à l'image - Accord": translate(data.imageRight),
      "Droit à l'image - Statut": translateFileStatusPhase1(data.imageRightFilesStatus) || "Non Renseigné",
      "Autotest PCR - Accord": translate(data.autoTestPCR),
      "Autotest PCR - Statut": translateFileStatusPhase1(data.autoTestPCRFilesStatus) || "Non Renseigné",
      "Règlement intérieur": translate(data.rulesYoung),
      "Fiche Sanitaire": !data.cohesionStayMedicalFileReceived ? "Non renseignée" : data.cohesionStayMedicalFileReceived === "true" ? "Réceptionnée" : "Non réceptionnée",
      "Présence à l'arrivée": !data.cohesionStayPresence ? "Non renseignée" : data.cohesionStayPresence === "true" ? "Présent" : "Absent",
      "Présence à la JDM": !data.presenceJDM ? "Non renseignée" : data.presenceJDM === "true" ? "Présent" : "Absent",
      "Date de départ": !data.departSejourAt ? "Non renseignée" : formatDateFRTimezoneUTC(data.departSejourAt),
      "Motif du départ": data?.departSejourMotif,
      "Commentaire du départ": data?.departSejourMotifComment,
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
      "Dernière connexion le": formatLongDateFR(data.lastLoginAt),
      Statut: translate(data.status),
      "Statut Phase 1": translatePhase1(data.statusPhase1),
      "Raison du desistement": getLabelWithdrawnReason(data.withdrawnReason),
      "Message de desistement": data.withdrawnMessage,
      "ID centre": center._id || "",
      "Code centre (2021)": center.code || "",
      "Code centre (2022)": center.code2022 || "",
      "Nom du centre": center.name || "",
      "Ville du centre": center.city || "",
      "Département du centre": center.department || "",
      "Région du centre": center.region || "",
      "Confirmation point de rassemblement": data.meetingPointId || data.deplacementPhase1Autonomous === "true" ? "Oui" : "Non",
      "Se rend au centre par ses propres moyens": translate(data.deplacementPhase1Autonomous),
      "Bus n˚": meetingPoint?.busExcelId,
      "Adresse point de rassemblement": meetingPoint?.departureAddress,
      "Date aller": meetingPoint?.departureAtString,
      "Date retour": meetingPoint?.returnAtString,
    };
  });
};

async function toArrayOfArray(data) {
  let columns = Object.keys(data[0] ?? []);
  return [columns, ...data.map((item) => Object.values(item))];
}

async function getAllResults(index, query) {
  const result = await api.post(`/es/${index}/export`, query);
  if (!result.data.length) return [];
  return result.data;
}

async function toXLSX(fileName, csv) {
  const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";
  const ws = XLSX.utils.aoa_to_sheet(csv);
  const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const resultData = new Blob([excelBuffer], { type: fileType });
  FileSaver.saveAs(resultData, fileName + fileExtension);
}
