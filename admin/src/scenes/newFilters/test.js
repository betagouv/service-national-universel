import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  departmentLookUp,
  ES_NO_LIMIT,
  formatDateFR,
  formatDateFRTimezoneUTC,
  formatLongDateFR,
  getLabelWithdrawnReason,
  isInRuralArea,
  translate,
  translateFileStatusPhase1,
  translateGrade,
  translatePhase1,
  translatePhase2,
  youngExportFields,
} from "snu-lib";
import api from "../../services/api";
import ModalExportV2 from "./export/ModalExportV2";
import ListFiltersPopOver from "./filters/ListFiltersPopOver";

export default function test() {
  const history = useHistory();
  const [count, setCount] = useState(0);
  const [data, setData] = useState([]);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = React.useState({});

  const searchBarObject = {
    placeholder: "Rechercher par prénom, nom, email, ville...",
    datafield: ["lastName.keyword", "firstName.keyword", "email.keyword", "city.keyword"],
  };
  const filterArray = [
    { title: "Cohorte", name: "cohort", datafield: "cohort.keyword", parentGroup: "Général", missingLabel: "Non renseignée" },
    { title: "Région", name: "region", datafield: "region.keyword", parentGroup: "Général", missingLabel: "Non renseignée" },
    { title: "Département", name: "department", datafield: "department.keyword", parentGroup: "Général", missingLabel: "Non renseignée" },
    { title: "Classe", name: "grade", datafield: "grade.keyword", parentGroup: "Dossier", translate: translateGrade, missingLabel: "Non renseignée" },
    { title: "Custom", name: "example", datafield: "example.keyword", parentGroup: "Dossier", customComponent: "example" },
  ];

  const defaultQuery = { query: { bool: { must: [{ match_all: {} }] } } };
  const getCount = (value) => {
    setCount(value);
  };

  useEffect(() => {
    console.log("data", data);
  }, [data]);
  //extract dans utils ou logique du filtre ?

  async function transformVolontaires(data, values) {
    let all = data;
    if (values.includes("schoolSituation")) {
      const schoolsId = [...new Set(data.map((item) => item.schoolId).filter((e) => e))];
      if (schoolsId?.length) {
        const { responses } = await api.esQuery("schoolramses", {
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

      let meetingPoint = {};
      let bus = {};

      if (!data.domains) data.domains = [];
      if (!data.periodRanking) data.periodRanking = [];
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
          "ID centre": center?._id || "",
          "Code centre (2021)": center?.code || "",
          "Code centre (2022)": center?.code2022 || "",
          "Nom du centre": center?.name || "",
          "Ville du centre": center?.city || "",
          "Département du centre": center?.department || "",
          "Région du centre": center?.region || "",
        },
        phase1Transport: {
          "Se rend au centre par ses propres moyens": translate(data.deplacementPhase1Autonomous),
          "Informations de transport sont transmises par les services locaux": translate(data.transportInfoGivenByLocal),
          "Bus n˚": bus?.busId || "",
          "Adresse point de rassemblement": meetingPoint?.address || "",
          "Date aller": formatDateFR(bus?.departuredDate) || "",
          "Date retour": formatDateFR(bus?.returnDate) || "",
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
        phase2: {
          "Domaine de MIG 1": data.domains[0],
          "Domaine de MIG 2": data.domains[1],
          "Domaine de MIG 3": data.domains[2],
          "Projet professionnel": translate(data.professionnalProject),
          "Information supplémentaire sur le projet professionnel": data.professionnalProjectPrecision,
          "Période privilégiée pour réaliser des missions": data.period,
          "Choix 1 période": translate(data.periodRanking[0]),
          "Choix 2 période": translate(data.periodRanking[1]),
          "Choix 3 période": translate(data.periodRanking[2]),
          "Choix 4 période": translate(data.periodRanking[3]),
          "Choix 5 période": translate(data.periodRanking[4]),
          "Mobilité aux alentours de son établissement": translate(data.mobilityNearSchool),
          "Mobilité aux alentours de son domicile": translate(data.mobilityNearHome),
          "Mobilité aux alentours d'un de ses proches": translate(data.mobilityNearRelative),
          "Informations du proche":
            data.mobilityNearRelative &&
            [data.mobilityNearRelativeName, data.mobilityNearRelativeAddress, data.mobilityNearRelativeZip, data.mobilityNearRelativeCity].filter((e) => e)?.join(", "),
          "Mode de transport": data.mobilityTransport?.map((t) => translate(t)).join(", "),
          "Autre mode de transport": data.mobilityTransportOther,
          "Format de mission": translate(data.missionFormat),
          "Engagement dans une structure en dehors du SNU": translate(data.engaged),
          "Description engagement ": data.engagedDescription,
          "Souhait MIG": data.desiredLocation,
        },
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

  return (
    <>
      <div className="flex flex-row gap-4 items-center">
        <div className="py-2 px-3 bg-blue-600 text-white w-fit cursor-pointer rounded" onClick={() => history.push("/filters/volontaire")}>
          Test Volontaire
        </div>

        <div className="py-2 px-3 bg-blue-600 text-white w-fit cursor-pointer rounded" onClick={() => history.push("/filters/custom")}>
          Test Custom
        </div>
      </div>

      <div className="bg-white h-full">
        <div className="flex flex-col gap-8 m-4">
          <div>{count} résultats</div>
          {/* display filtter button + currentfilters + searchbar */}
          <div className="flex flex-row gap-4 items-center justify-between">
            <ListFiltersPopOver
              pageId="young"
              esId="young"
              defaultQuery={defaultQuery}
              filters={filterArray}
              getCount={getCount}
              setData={(value) => setData(value)}
              searchBarObject={searchBarObject}
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
            />
            <button className="rounded-md py-2 px-4 text-sm text-white bg-blue-600 hover:bg-snu-purple-700 hover:drop-shadow font-semibold" onClick={() => setIsExportOpen(true)}>
              Exporter les volontaires
            </button>
            <ModalExportV2
              defaultQuery={defaultQuery}
              isOpen={isExportOpen}
              setIsOpen={setIsExportOpen}
              index="young"
              transform={transformVolontaires}
              exportFields={youngExportFields}
              selectedFilters={selectedFilters}
              totalHits={count}
              filterArray={filterArray}
              searchBarObject={searchBarObject}
            />
          </div>
        </div>
      </div>
    </>
  );
}
