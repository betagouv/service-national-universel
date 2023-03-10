import React, { useState, useEffect } from "react";
import { translateGrade, youngExportFields } from "snu-lib";
import Filters from "./filters/Filters";
import ResultTable from "./filters/ResultTable";

import Chevron from "../../components/Chevron";
import { Filter, FilterRow, Table, ActionBox, Header, Title, MultiLine, Help, LockIcon, HelpText } from "../../components/list";
import api from "../../services/api";
import { apiURL, appURL, supportURL } from "../../config";
import plausibleEvent from "../../services/plausible";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { useSelector } from "react-redux";
import { useHistory, Link } from "react-router-dom";

import IconChangementCohorte from "../../assets/IconChangementCohorte.js";

import Badge from "../../components/Badge";

import {
  translate,
  translatePhase1,
  isInRuralArea,
  formatLongDateFR,
  ES_NO_LIMIT,
  formatDateFRTimezoneUTC,
  formatDateFR,
  getLabelWithdrawnReason,
  departmentLookUp,
  translatePhase2,
  translateFileStatusPhase1,
  YOUNG_STATUS_COLORS,
  getAge,
  ROLES,
  colors,
  YOUNG_STATUS,
} from "../../utils";

export default function test_volontaire() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const size = 20;

  // filtre non obligatoire
  const [selectedSort, setSelectedSort] = React.useState({});

  const [volontaire, setVolontaire] = useState(null);

  const searchBarObject = {
    placeholder: "Rechercher par prénom, nom, email, ville...",
    datafield: ["lastName.keyword", "firstName.keyword", "email.keyword", "city.keyword"],
  };
  const filterArray = [
    { title: "Cohorte", name: "cohort", datafield: "cohort.keyword", parentGroup: "Général", missingLabel: "Non renseignée" },
    { title: "Région", name: "region", datafield: "region.keyword", parentGroup: "Général", missingLabel: "Non renseignée" },
    { title: "Département", name: "department", datafield: "department.keyword", parentGroup: "Général", missingLabel: "Non renseignée" },
    { title: "Classe", name: "grade", datafield: "grade.keyword", parentGroup: "Dossier", translate: translateGrade, missingLabel: "Non renseignée" },
  ];

  const sortOptions = [
    { label: "Nom (A > Z)", dataField: "lastName.keyword", sortBy: "asc" },
    { label: "Nom (Z > A)", dataField: "lastName.keyword", sortBy: "desc" },
    { label: "Prénom (A > Z)", dataField: "firstName.keyword", sortBy: "asc" },
    { label: "Prénom (Z > A)", dataField: "firstName.keyword", sortBy: "desc" },
    { label: "Date de création (récent > ancien)", dataField: "createdAt", sortBy: "desc" },
    { label: "Date de création (ancien > récent)", dataField: "createdAt", sortBy: "asc" },
    { label: "Dernière connexion (récent > ancien)", dataField: "lastLoginAt", sortBy: "desc" },
    { label: "Dernière connexion (ancien > récent)", dataField: "lastLoginAt", sortBy: "asc" },
  ];

  const getDefaultQuery = () => {
    return {
      query: { bool: { must: [{ match_all: {} }] } },
    };
  };
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

    const response = await api.get("/ligne-de-bus/all");
    const meetingPoints = response ? response.data.meetingPoints : [];
    const ligneBus = response ? response.data.ligneBus : [];

    return all.map((data) => {
      let center = {};
      /*
      if (data.cohesionCenterId && centers && sessionsPhase1) {
        center = centers.find((c) => c._id === data.cohesionCenterId);
        if (!center) center = {};
      }
      */
      let meetingPoint = {};
      let bus = {};
      if (data.meetingPointId && meetingPoints) {
        meetingPoint = meetingPoints.find((mp) => mp._id === data.meetingPointId);
        bus = ligneBus.find((lb) => lb._id === data.ligneId);
      }

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
          "Informations de transport sont transmises par les services locaux": translate(data.transportInfoGivenByLocal),
          "Bus n˚": bus?.busId,
          "Adresse point de rassemblement": meetingPoint?.address,
          "Date aller": formatDateFR(bus?.departuredDate),
          "Date retour": formatDateFR(bus?.returnDate),
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
    <div className="bg-white h-full">
      <div className="flex flex-col  m-4">
        <div>{count} résultats aa</div>
        {/* display filtter button + currentfilters + searchbar */}
        <div className="p-[15px]">
          <Filters
            pageId="young"
            esId="young"
            defaultQuery={getDefaultQuery()}
            filters={filterArray}
            setCount={setCount}
            count={count}
            setData={(value) => setData(value)}
            searchBarObject={searchBarObject}
            page={page}
            setPage={setPage}
            size={size}
            sortOptions={sortOptions}
            transform={transformVolontaires}
            exportFields={youngExportFields}
          />
        </div>

        <ResultTable
          setPage={setPage}
          count={count}
          currentEntryOnPage={data?.length}
          size={size}
          page={page}
          render={
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
          }
        />
      </div>
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
