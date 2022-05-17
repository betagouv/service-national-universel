import dayjs from "dayjs";
import * as FileSaver from "file-saver";
import React from "react";
import { toastr } from "react-redux-toastr";
import { NavLink, useHistory, useParams } from "react-router-dom";
import { ES_NO_LIMIT } from "snu-lib";
import * as XLSX from "xlsx";
import Bus from "../../../assets/icons/Bus";
import ClipboardList from "../../../assets/icons/ClipboardList";
import Menu from "../../../assets/icons/Menu";
import PencilAlt from "../../../assets/icons/PencilAlt";
import ShieldCheck from "../../../assets/icons/ShieldCheck";
import SelectAction from "../../../components/SelectAction";
import { environment } from "../../../config";
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
} from "../../../utils";
import ModalExportMail from "../components/modals/ModalExportMail";
import FicheSanitaire from "./fiche-sanitaire";
import General from "./general";
import Pointage from "./pointage";

export default function CenterYoungIndex() {
  if (environment === "production") return null;

  const [modalExportMail, setModalExportMail] = React.useState({ isOpen: false });
  const [filter, setFilter] = React.useState();

  function updateFilter(n) {
    setFilter({ ...filter, ...n });
  }

  const history = useHistory();
  const { id, sessionId, currentTab } = useParams();

  React.useEffect(() => {
    const listTab = ["general", "tableau-de-pointage", "fiche-sanitaire"];
    if (!listTab.includes(currentTab)) history.push(`/centre/${id}/${sessionId}/general`);
  }, [currentTab]);

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

    if (filter?.search) {
      body.query.bool.must.push({
        bool: {
          should: [
            {
              multi_match: {
                query: filter?.search,
                fields: ["email.keyword", "firstName.folded", "lastName.folded", "city.folded", "zip"],
                type: "cross_fields",
                operator: "and",
              },
            },
            {
              multi_match: {
                query: filter?.search,
                fields: ["email.keyword", "firstName.folded", "lastName.folded", "city.folded", "zip"],
                type: "phrase",
                operator: "and",
              },
            },
            {
              multi_match: {
                query: filter?.search,
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
    if (filter?.region?.length) body.query.bool.filter.push({ terms: { "region.keyword": filter.region } });
    if (filter?.department?.length) body.query.bool.filter.push({ terms: { "department.keyword": filter.department } });
    if (filter?.status?.length) body.query.bool.filter.push({ terms: { "status.keyword": filter.status } });
    if (filter?.statusPhase1?.length) body.query.bool.filter.push({ terms: { "statusPhase1.keyword": filter.statusPhase1 } });
    if (filter?.cohesionStayPresence?.length) body.query.bool.filter.push({ terms: { "cohesionStayPresence.keyword": filter.cohesionStayPresence } });

    const data = await getAllResults("young", body);
    const result = await transformData({ data, centerId: id });
    const csv = await toArrayOfArray(result);
    await toXLSX(`young_pointage_${dayjs().format("YYYY-MM-DD_HH[h]mm[m]ss[s]")}.xlsx`, csv);
  };

  return (
    <>
      <div className="m-4">
        <div className="flex items-center justify-between">
          <div className="font-bold text-2xl mb-4">Volontaires</div>
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
        <div className=" flex flex-1 flex-col lg:flex-row">
          <nav className="flex flex-1 gap-1">
            <TabItem icon={<Menu />} title="Général" to={`/centre/${id}/${sessionId}/general`} />
            <TabItem icon={<PencilAlt />} title="Tableau de pointage" to={`/centre/${id}/${sessionId}/tableau-de-pointage`} />
            <TabItem icon={<ShieldCheck />} title="Fiche sanitaire" to={`/centre/${id}/${sessionId}/fiche-sanitaire`} />
          </nav>
        </div>
        <div className="bg-white pt-4">
          {currentTab === "general" && <General filter={filter} updateFilter={updateFilter} />}
          {currentTab === "tableau-de-pointage" && <Pointage />}
          {currentTab === "fiche-sanitaire" && <FicheSanitaire />}
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
  console.log(centerId);
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
