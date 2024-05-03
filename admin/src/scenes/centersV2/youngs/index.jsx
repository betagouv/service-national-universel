import dayjs from "@/utils/dayjs.utils";
import * as FileSaver from "file-saver";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { NavLink, useHistory, useParams } from "react-router-dom";
import * as XLSX from "xlsx";

import { COHORTS_BEFORE_JULY_2023, download, getDepartmentNumber } from "snu-lib";

import Bus from "@/assets/icons/Bus";
import ClipboardList from "@/assets/icons/ClipboardList";
import Menu from "@/assets/icons/Menu";
import PencilAlt from "@/assets/icons/PencilAlt";
import Profil from "@/assets/icons/Profil";
import ShieldCheck from "@/assets/icons/ShieldCheck";
import Warning from "@/assets/icons/Warning";
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectAction from "@/components/SelectAction";
import { currentFilterAsUrl } from "@/components/filters-system-v2/components/filters/utils";
import { capture } from "@/sentry";
import api from "@/services/api";
import {
  departmentLookUp,
  formatDateFR,
  formatDateFRTimezoneUTC,
  formatLongDateFR,
  getLabelWithdrawnReason,
  isInRuralArea,
  translate,
  translateFileStatusPhase1,
  translatePhase1,
  youngCheckinField,
} from "@/utils";

import ModalExportMail from "../components/modals/ModalExportMail";
import FicheSanitaire from "./fiche-sanitaire";
import General from "./general";
import Pointage from "./pointage";
import ModalExportPdfFile from "../components/modals/ModalExportPdfFile";

export default function CenterYoungIndex() {
  const [modalExportMail, setModalExportMail] = useState({ isOpen: false });
  const [filter, setFilter] = useState({});
  const [urlParams, setUrlParams] = useState("");
  const user = useSelector((state) => state.Auth.user);
  const [isYoungCheckinOpen, setIsYoungCheckinOpen] = useState();
  const [focusedSession, setFocusedSession] = useState(null);
  const [hasYoungValidated, setHasYoungValidated] = useState(false);
  const [modal, setModal] = useState({ isOpen: false });

  const filterArray = [
    {
      title: "Statut",
      name: "status",
      parentGroup: "Général",
      translate: translate,
      defaultValue: ["VALIDATED"],
    },
    {
      title: "Statut phase 1",
      name: "statusPhase1",
      parentGroup: "Général",
      translate: translatePhase1,
    },
    { title: "Région", name: "region", parentGroup: "Général" },
    {
      title: "Département",
      name: "department",
      parentGroup: "Général",
      translate: (e) => getDepartmentNumber(e) + " - " + e,
    },
    {
      title: "Sexe",
      name: "gender",
      parentGroup: "Dossier",
      translate: translate,
    },
    {
      title: "Classe",
      name: "grade",
      parentGroup: "Dossier",
      translate: translate,
    },
    {
      title: "Situation",
      name: "situation",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Handicap",
      name: "handicap",
      parentGroup: "Dossier",
      translate: translate,
    },
    {
      title: "PPS",
      name: "ppsBeneficiary",
      parentGroup: "Dossier",
      translate: translate,
    },
    {
      title: "PAI",
      name: "paiBeneficiary",
      parentGroup: "Dossier",
      translate: translate,
    },
    {
      title: "Région rurale",
      name: "isRegionRural",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "QPV",
      name: "qpv",
      parentGroup: "Dossier",
      translate: translate,
    },
    {
      title: "Allergies ou intolérances",
      name: "allergies",
      parentGroup: "Dossier",
      translate: translate,
      missingLabel: "Non renseigné",
    },
    {
      title: "Aménagement spécifique",
      name: "specificAmenagment",
      parentGroup: "Dossier",
      translate: translate,
    },
    {
      title: "Aménagement PMR",
      name: "reducedMobilityAccess",
      parentGroup: "Dossier",
      translate: translate,
    },
    {
      title: "Fiches sanitaires",
      name: "cohesionStayMedicalFileReceived",
      parentGroup: "Dossier",
      translate: translate,
      missingLabel: "Non renseigné",
    },
    {
      title: "Droit à l'image",
      name: "imageRight",
      parentGroup: "Dossier",
      translate: translate,
      missingLabel: "Non renseigné",
    },
    {
      title: "Utilisation d’autotest",
      name: "autoTestPCR",
      parentGroup: "Dossier",
      translate: translate,
      missingLabel: "Non renseigné",
    },
    {
      title: "Confirmation de participation",
      name: "youngPhase1Agreement",
      parentGroup: "Dossier",
      translate: translate,
    },
    {
      title: "Présence à l'arrivée",
      name: "cohesionStayPresence",
      parentGroup: "Pointage",
      translate: translate,
      missingLabel: "Non renseigné",
    },
    {
      title: "Présence à la JDM",
      name: "presenceJDM",
      parentGroup: "Pointage",
      translate: translate,
      missingLabel: "Non renseigné",
    },
    {
      title: "Départ renseigné",
      name: "departInform",
      parentGroup: "Pointage",
      translate: translate,
      missingLabel: "Non renseigné",
    },
    {
      title: "Motif du départ",
      name: "departSejourMotif",
      parentGroup: "Pointage",
      translate: translate,
      missingLabel: "Non renseigné",
    },
  ];

  const history = useHistory();
  const { id, sessionId, currentTab } = useParams();

  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      const { data } = await api.get(`/session-phase1/${sessionId}`);
      setFocusedSession(data);
    })();
  }, [sessionId]);

  useEffect(() => {
    setUrlParams(currentFilterAsUrl(filter, 0, filterArray));
  }, [filter]);

  function updateFilter(n) {
    setFilter({ ...filter, ...n });
  }

  React.useEffect(() => {
    const listTab = ["general", "tableau-de-pointage", "fiche-sanitaire"];
    if (!listTab.includes(currentTab)) history.push(`/centre/${id}/${sessionId}/general`);
  }, [currentTab]);

  React.useEffect(() => {
    if (!sessionId) return;
    (async function () {
      try {
        const result = await api.get(`/cohort/bysession/${sessionId}`);
        if (result.ok) {
          const cohort = result.data;
          const field = youngCheckinField[user.role];
          if (field) {
            setIsYoungCheckinOpen(cohort[field] ? cohort[field] : false);
          } else {
            setIsYoungCheckinOpen(false);
          }
        } else {
          toastr.error("Impossible de vérifier l'ouverture du pointage. il va être désactivé par défaut.");
          setIsYoungCheckinOpen(false);
        }
      } catch (err) {
        capture(err);
        toastr.error("Impossible de vérifier l'ouverture du pointage. il va être désactivé par défaut.");
        setIsYoungCheckinOpen(false);
      }
    })();
  }, [sessionId]);

  const viewAttestation = async () => {
    setModal({
      isOpen: true,
      title: "Export de document Pdf",
      message: "Veuillez patienter, votre téléchargement est en cours...",
      estimation: "Environ 1 minute ...",
    });
    try {
      const file = await api.openpdf(`/session-phase1/${sessionId}/certificate`, {});
      download(file, "certificates.pdf");
    } catch (e) {
      // We don't capture unauthorized. Just redirect.
      if (e?.message === "unauthorized") {
        return (window.location.href = "/auth/login?disconnected=1");
      }
      // We need more info to understand download issues.
      capture(e);
      toastr.error("Téléchargement impossible", e?.message, { timeOut: 10000 });
    }
    setModal({ isOpen: false });
  };

  const exportData = async () => {
    const data = await api.post(`/elasticsearch/young/by-session/${focusedSession._id}/export?needSchoolInfo=true`, {
      filters: Object.entries(filter).reduce((e, [key, value]) => {
        if (value.filter.length === 1 && value.filter[0] === "") return e;
        return { ...e, [key]: value.filter.map((e) => String(e)) };
      }, {}),
    });
    const result = await transformData({ data: data.data, centerId: id });
    if (!COHORTS_BEFORE_JULY_2023.includes(result[0]?.Cohorte)) {
      result.forEach((item) => {
        delete item["Présence à la JDM"];
      });
    }
    const csv = await toArrayOfArray(result);
    await toXLSX(`volontaires_pointage_${dayjs().format("YYYY-MM-DD_HH[h]mm[m]ss[s]")}`, csv);
  };

  const exportDataTransport = async () => {
    try {
      let result = {
        noMeetingPoint: {
          youngs: [],
          meetingPoint: [],
        },
        transportInfoGivenByLocal: {
          youngs: [],
          meetingPoint: [],
        },
      };

      //exclude some youngs form export ligne
      const data = await api.post(`/elasticsearch/young/by-session/${focusedSession._id}/export`, {
        filters: Object.entries(filter).reduce((e, [key, value]) => {
          if (value.filter.length === 1 && value.filter[0] === "") return e;
          return { ...e, [key]: value.filter.map((e) => String(e)) };
        }, {}),
      });

      const youngs = data.data;

      let response = youngs.length > 0 ? await api.get(`/point-de-rassemblement/center/${id}/cohort/${youngs[0].cohort}`) : null;
      const meetingPoints = response ? response.data.meetingPoints : [];
      const ligneBus = response ? response.data.ligneBus : [];

      for (const young of youngs) {
        const tempYoung = {
          _id: young._id,
          cohort: young.cohort,
          firstName: young.firstName,
          lastName: young.lastName,
          email: young.email,
          phone: young.phone,
          address: young.address,
          zip: young.zip,
          city: young.city,
          department: young.department,
          region: young.region,
          birthdateAt: young.birthdateAt,
          gender: young.gender,
          parent1FirstName: young.parent1FirstName,
          parent1LastName: young.parent1LastName,
          parent1Email: young.parent1Email,
          parent1Phone: young.parent1Phone,
          parent1Status: young.parent1Status,
          parent2FirstName: young.parent2FirstName,
          parent2LastName: young.parent2LastName,
          parent2Email: young.parent2Email,
          parent2Phone: young.parent2Phone,
          parent2Status: young.parent2Status,
          statusPhase1: young.statusPhase1,
          meetingPointId: young.meetingPointId,
          ligneId: young.ligneId,
        };
        if (young.deplacementPhase1Autonomous === "true") {
          result.noMeetingPoint.youngs.push(tempYoung);
        } else if (young.transportInfoGivenByLocal === "true") {
          result.transportInfoGivenByLocal.youngs.push(tempYoung);
        } else {
          const youngMeetingPoint = meetingPoints.find((meetingPoint) => meetingPoint._id.toString() === young.meetingPointId);
          const youngLigneBus = ligneBus.find((ligne) => ligne._id.toString() === young.ligneId);
          if (youngMeetingPoint) {
            if (!result[youngLigneBus.busId]) {
              result[youngLigneBus.busId] = {};
              result[youngLigneBus.busId]["youngs"] = [];
              result[youngLigneBus.busId]["ligneBus"] = [];
              result[youngLigneBus.busId]["meetingPoint"] = [];
            }
            if (!result[youngLigneBus.busId]["meetingPoint"].find((meetingPoint) => meetingPoint._id.toString() === youngMeetingPoint._id.toString())) {
              result[youngLigneBus.busId]["meetingPoint"].push(youngMeetingPoint);
            }
            if (!result[youngLigneBus.busId]["ligneBus"].find((ligne) => ligne._id.toString() === young.ligneId)) {
              result[youngLigneBus.busId]["ligneBus"].push(youngLigneBus);
            }
            result[youngLigneBus.busId]["youngs"].push(tempYoung);
          }
        }
      }
      // Transform data into array of objects before excel converts
      const formatedRep = Object.keys(result).map((key) => {
        let name;
        if (key === "noMeetingPoint") name = "Autonome";
        else if (key === "transportInfoGivenByLocal") name = "Services locaux";
        else name = key;
        console.log(name, result[key]);
        return {
          name: name,
          data: result[key].youngs.map((young) => {
            const meetingPoint = young.meetingPointId && result[key].meetingPoint.find((mp) => mp._id === young.meetingPointId);
            const ligneBus = young.ligneId && result[key].ligneBus.find((lb) => lb._id === young.ligneId);
            console.log(young.ligneId);
            return {
              _id: young._id,
              Cohorte: young.cohort,
              Prénom: young.firstName,
              Nom: young.lastName,
              "Date de naissance": formatDateFRTimezoneUTC(young.birthdateAt),
              Sexe: translate(young.gender),
              Email: young.email,
              Téléphone: young.phone,
              "Adresse postale": young.address,
              "Code postal": young.zip,
              Ville: young.city,
              Département: young.department,
              Région: young.region,
              Statut: translate(young.statusPhase1),
              "Prénom représentant légal 1": young.parent1FirstName,
              "Nom représentant légal 1": young.parent1LastName,
              "Email représentant légal 1": young.parent1Email,
              "Téléphone représentant légal 1": young.parent1Phone,
              "Statut représentant légal 1": translate(young.parent1Status),
              "Prénom représentant légal 2": young.parent2FirstName,
              "Nom représentant légal 2": young.parent2LastName,
              "Email représentant légal 2": young.parent2Email,
              "Téléphone représentant légal 2": young.parent2Phone,
              "Statut représentant légal 2": translate(young.parent2Status),
              "Id du point de rassemblement": young.meetingPointId,
              "Adresse point de rassemblement": meetingPoint?.address,
              "Date aller": formatDateFR(ligneBus?.departuredDate),
              "Date retour": formatDateFR(ligneBus?.returnDate),
            };
          }),
        };
      });
      const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
      const wb = XLSX.utils.book_new();
      formatedRep.forEach((sheet) => {
        let ws = XLSX.utils.json_to_sheet(sheet.data);
        XLSX.utils.book_append_sheet(wb, ws, sheet.name.substring(0, 30));
      });
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const resultData = new Blob([excelBuffer], { type: fileType });
      FileSaver.saveAs(resultData, `transport_information_${dayjs().format("YYYY-MM-DD_HH[h]mm[m]ss[s]")}`);
    } catch (e) {
      console.log(e);
      toastr.error("Erreur !", translate(e.code));
    }
  };

  const exportImageRights = async () => {
    try {
      const file = await api.openpdf(`/session-phase1/${focusedSession._id}/image-rights/export`, {});
      download(file, "droits-a-l-image.pdf");
    } catch (e) {
      // We don't capture unauthorized. Just redirect.
      if (e?.message === "unauthorized") {
        return (window.location.href = "/auth/login?disconnected=1");
      }
      // We need more info to understand download issues.
      capture(e);
      toastr.error("Téléchargement impossible", e?.message, { timeOut: 10000 });
    }
  };

  let exportItems = [
    {
      key: "exportData",
      action: async () => {
        await exportData();
      },
      render: (
        <div className="group flex cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
          <ClipboardList className="text-gray-400 group-hover:scale-105 group-hover:text-green-500" />
          <div className="text-sm text-gray-700">Informations complètes</div>
        </div>
      ),
    },
    {
      key: "exportDataTransport",
      action: async () => {
        await exportDataTransport();
      },
      render: (
        <div className="group flex cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
          <Bus className="text-gray-400 group-hover:scale-105 group-hover:text-green-500" />
          <div className="text-sm text-gray-700">Informations transports</div>
        </div>
      ),
    },
    {
      key: "exportImageRights",
      action: async () => {
        await exportImageRights();
      },
      render: (
        <div className="group flex cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
          <Profil className="text-gray-400 group-hover:scale-105 group-hover:text-green-500 mx-[3px]" />
          <div className="text-sm text-gray-700">Droits à l&apos;image</div>
        </div>
      ),
    },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: "Centres", to: "/centre" }, { label: "Fiche du centre", to: `/centre/${id}` }, { label: "Liste des volontaires" }]} />
      <div className="m-8">
        <div className="flex items-center justify-between">
          <div className="mb-4 text-2xl font-bold">Volontaires</div>
          <div className="flex items-center gap-2">
            {hasYoungValidated && (
              <button
                onClick={() => viewAttestation()}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-wait disabled:opacity-50">
                Exporter les attestations
              </button>
            )}
            <ModalExportPdfFile
              isOpen={modal?.isOpen}
              title={modal?.title}
              message={modal?.message}
              estimation={modal?.estimation}
              onClose={() => setModal({ isOpen: false })}
              className="w-[900px] rounded-xl bg-white"
            />
            <SelectAction
              title="Exporter les volontaires"
              alignItems="right"
              buttonClassNames="bg-blue-600"
              textClassNames="text-white font-medium text-sm"
              rightIconClassNames="text-blue-300"
              optionsGroup={[
                {
                  key: "export",
                  title: "Télécharger",
                  items: exportItems,
                },
                {
                  key: "exportMail",
                  title: "Envoyer par mail",
                  items: [
                    {
                      key: "infoTransport",
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
                        <div className="group flex cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
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
        <div className=" flex flex-1 flex-col pt-4 lg:flex-row">
          <nav className="flex flex-1 gap-1">
            <TabItem icon={<Menu />} title="Général" to={`/centre/${id}/${sessionId}/general${urlParams && "?" + urlParams}`} />
            <TabItem
              icon={<PencilAlt />}
              title="Tableau de pointage"
              to={`/centre/${id}/${sessionId}/tableau-de-pointage${urlParams && "?" + urlParams}`}
              extraIcon={!isYoungCheckinOpen ? <Warning className="cursor-pointer text-red-900" /> : null}
              extraTooltip="Le pointage n'est pas ouvert"
            />
            <TabItem icon={<ShieldCheck />} title="Fiche sanitaire" to={`/centre/${id}/${sessionId}/fiche-sanitaire${urlParams && "?" + urlParams}`} />
          </nav>
        </div>
        <div className="bg-white pt-4">
          {currentTab === "general" && (
            <General filter={filter} updateFilter={updateFilter} focusedSession={focusedSession} filterArray={filterArray} setHasYoungValidated={setHasYoungValidated} />
          )}
          {currentTab === "tableau-de-pointage" && (
            <Pointage
              updateFilter={updateFilter}
              isYoungCheckinOpen={isYoungCheckinOpen}
              focusedSession={focusedSession}
              filterArray={filterArray}
              setHasYoungValidated={setHasYoungValidated}
            />
          )}
          {currentTab === "fiche-sanitaire" && (
            <FicheSanitaire updateFilter={updateFilter} focusedSession={focusedSession} filterArray={filterArray} setHasYoungValidated={setHasYoungValidated} />
          )}
        </div>
      </div>
      <ModalExportMail isOpen={modalExportMail?.isOpen} onCancel={() => setModalExportMail({ isOpen: false, value: null })} onSubmit={modalExportMail?.onSubmit} />
    </>
  );
}

const TabItem = ({ to, title, icon, extraIcon, extraTooltip }) => (
  <NavLink
    to={to}
    activeClassName="!text-snu-purple-800 bg-white border-none"
    className="cursor-pointer rounded-t-lg border-t-[1px] border-r-[1px] border-l-[1px] border-gray-200 bg-gray-50 px-3 py-2 text-[13px] text-gray-600 hover:text-snu-purple-800">
    <div className="flex items-center gap-2">
      {icon} {title}
      {extraIcon && (
        <div className="group relative">
          {extraIcon}
          {extraTooltip && (
            <div className="absolute bottom-[calc(100%+5px)] left-[50%] z-10 hidden min-w-[200px] translate-x-[-50%] rounded-lg bg-gray-200 px-2 py-1 text-center text-black shadow-sm group-hover:block">
              <div className="absolute left-[50%] bottom-[-5px] h-[10px] w-[10px] translate-x-[-50%] rotate-45 bg-gray-200 shadow-sm"></div>
              {extraTooltip}
            </div>
          )}
        </div>
      )}
    </div>
  </NavLink>
);

const transformData = async ({ data: all, centerId }) => {
  let resultCenter = await api.get(`/cohesion-center/${centerId}`);
  const center = resultCenter ? resultCenter.data : {};

  let response = all.length > 0 ? await api.get(`/point-de-rassemblement/center/${centerId}/cohort/${all[0].cohort}`) : null;
  const meetingPoints = response ? response.data.meetingPoints : [];
  const ligneBus = response ? response.data.ligneBus : [];

  return all.map((data) => {
    let meetingPoint = {};
    let bus = {};
    if (data.meetingPointId && meetingPoints) {
      meetingPoint = meetingPoints.find((mp) => mp._id === data.meetingPointId);
      bus = ligneBus.find((lb) => lb._id === data?.ligneId);
      if (!meetingPoint) meetingPoint = {};
    }

    return {
      _id: data._id,
      Cohorte: data.cohort,
      Prénom: data.firstName,
      Nom: data.lastName,
      "Date de naissance": formatDateFRTimezoneUTC(data.birthdateAt),
      "Ville de naissance": data.birthCity,
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
      "Statut général": translate(data.status),
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
      "Participation au séjour": data.youngPhase1Agreement === "true" ? "Oui" : "Non",
      "Confirmation point de rassemblement": data.meetingPointId || data.deplacementPhase1Autonomous === "true" ? "Oui" : "Non",
      "Se rend au centre par ses propres moyens": translate(data.deplacementPhase1Autonomous),
      "Informations de transport sont transmises par les services locaux": translate(data.transportInfoGivenByLocal),
      "Bus n˚": bus?.busId,
      "Adresse point de rassemblement": meetingPoint?.address,
      "Date aller": bus?.departuredDate,
      "Date retour": bus?.returnDate,
    };
  });
};

async function toArrayOfArray(data) {
  let columns = Object.keys(data[0] ?? []);
  return [columns, ...data.map((item) => Object.values(item))];
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
