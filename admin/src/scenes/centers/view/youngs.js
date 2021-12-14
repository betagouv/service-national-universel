import React, { useState, useEffect } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";

import { apiURL } from "../../../config";
import SelectStatus from "../../../components/selectStatus";
import api from "../../../services/api";
import CenterView from "./wrapper";
import Panel from "../../volontaires/panel";

import { getFilterLabel, YOUNG_STATUS_PHASE1, translate, formatDateFRTimezoneUTC, isInRuralArea, formatLongDateFR, getAge, colors } from "../../../utils";
import Loader from "../../../components/Loader";
import ExportComponent from "../../../components/ExportXlsx";
import { Filter, ResultTable, Table, MultiLine } from "../../../components/list";
import DownloadAllAttestation from "../../../components/buttons/DownloadAllAttestation";
const FILTERS = ["SEARCH", "STATUS", "COHORT", "DEPARTMENT", "REGION", "STATUS_PHASE_1", "STATUS_PHASE_2", "STATUS_PHASE_3", "STATUS_APPLICATION", "LOCATION"];
import ReactiveListComponent from "../../../components/ReactiveListComponent";
import Details from "./details";

export default function Youngs({ center, updateCenter }) {
  const [young, setYoung] = useState();
  const [meetingPoints, setMeetingPoints] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/meeting-point/all");
      setMeetingPoints(data);
    })();
  }, []);

  const handleClick = async (young) => {
    const { ok, data } = await api.get(`/referent/young/${young._id}`);
    if (ok) setYoung(data);
  };

  if (!center) return <Loader />;

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", flex: "1" }}>
        <Details center={center} />
        <CenterView center={center} tab="volontaires">
          <div>
            <ReactiveBase url={`${apiURL}/es`} app={`cohesionyoung/${center._id}`} headers={{ Authorization: `JWT ${api.getToken()}` }}>
              <div style={{ float: "right", marginBottom: "1.5rem", marginRight: "1.5rem" }}>
                <div style={{ display: "flex" }}>
                  <ExportComponent
                    title="Exporter les volontaires"
                    exportTitle="Volontaires_centre"
                    index={`cohesionyoung/${center._id}`}
                    react={{ and: FILTERS }}
                    transform={(all) => {
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
                          "Pays de naissance": data.birthCountry || "France",
                          "Ville de naissance": data.birthCity,
                          "Code postal de naissance": data.birthCityZip,
                          Sexe: translate(data.gender),
                          Email: data.email,
                          Téléphone: data.phone,
                          "Adresse postale": data.address,
                          "Code postal": data.zip,
                          Ville: data.city,
                          Département: data.department,
                          Région: data.region,
                          Académie: data.academy,
                          Situation: translate(data.situation),
                          Niveau: translate(data.grade),
                          "Type d'établissement": translate(data.schoolType),
                          "Nom de l'établissement": data.schoolName,
                          "Code postal de l'établissement": data.schoolZip,
                          "Ville de l'établissement": data.schoolCity,
                          "Département de l'établissement": data.schoolDepartment,
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
                          "Droit à l'image": translate(data.imageRight),
                          "Autotest PCR": translate(data.autoTestPCR),
                          "Fiche sanitaire réceptionnée": translate(data.cohesionStayMedicalFileReceived || "false"),
                          "Présent au séjour de cohésion": translate(data.cohesionStayPresence),
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
                          "Motivations à participer au SNU": data.motivations,
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
                            [data.mobilityNearRelativeName, data.mobilityNearRelativeAddress, data.mobilityNearRelativeZip, data.mobilityNearRelativeCity]
                              .filter((e) => e)
                              ?.join(", "),
                          "Mode de transport": data.mobilityTransport?.map((t) => translate(t)).join(", "),
                          "Autre mode de transport": data.mobilityTransportOther,
                          "Format de mission": translate(data.missionFormat),
                          "Engagement dans une structure en dehors du SNU": translate(data.engaged),
                          "Description engagement ": data.engagedDescription,
                          "Souhait MIG": data.desiredLocation,
                          Phase: translate(data.phase),
                          "Créé lé": formatLongDateFR(data.createdAt),
                          "Mis à jour le": formatLongDateFR(data.updatedAt),
                          "Dernière connexion le": formatLongDateFR(data.lastLoginAt),
                          Statut: translate(data.status),
                          "Statut Phase 1": translate(data.statusPhase1),
                          "Statut Phase 2": translate(data.statusPhase2),
                          "Statut Phase 3": translate(data.statusPhase3),
                          "Dernier statut le": formatLongDateFR(data.lastStatusAt),
                          "Message de desistement": data.withdrawnMessage,
                          "ID centre": center._id || "",
                          "Code centre": center.code || "",
                          "Nom du centre": center.name || "",
                          "Ville du centre": data.cohesionCenterCity || "",
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
                    }}
                  />
                  <DownloadAllAttestation cohesionCenterId={center._id}>
                    <div>Exporter les attestations</div>
                  </DownloadAllAttestation>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <Filter style={{ display: "flex", padding: "0" }}>
                    <DataSearch
                      showIcon={false}
                      placeholder="Rechercher par prénom, nom, email, ville, code postal..."
                      componentId="SEARCH"
                      dataField={["email.keyword", "firstName", "lastName", "city", "zip"]}
                      react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                      // fuzziness={2}
                      style={{ width: "80%", marginRight: "0.5rem" }}
                      innerClass={{ input: "searchbox" }}
                      autosuggest={false}
                      queryFormat="and"
                    />
                    <MultiDropdownList
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
                      renderLabel={(items) => getFilterLabel(items, "Statut de l'affectation")}
                    />
                    {/* <FilterRow>
                    <MultiDropdownList
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
                    <MultiDropdownList
                      className="dropdown-filter"
                      componentId="STATUS_PHASE_1"
                      dataField="statusPhase1.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "STATUS_PHASE_1") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      showSearch={false}
                      renderLabel={(items) => getFilterLabel(items, "Statut phase 1")}
                    />
                  </FilterRow> */}
                  </Filter>
                  <ResultTable style={{ borderRadius: "8px", boxShadow: "0px 3px 2px #edf2f7" }}>
                    <ReactiveListComponent
                      react={{ and: FILTERS }}
                      dataField="lastName.keyword"
                      sortBy="asc"
                      render={({ data }) => (
                        <Table>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th width="70%">Volontaire</th>
                              <th>Affectation</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.map((hit) => (
                              <Hit key={hit._id} hit={hit} onClick={() => handleClick(hit)} selected={young?._id === hit._id} onChangeYoung={updateCenter} />
                            ))}
                          </tbody>
                        </Table>
                      )}
                    />
                  </ResultTable>
                </div>
              </div>
            </ReactiveBase>
          </div>
        </CenterView>
      </div>
      <Panel
        value={young}
        onChange={() => {
          setYoung(null);
        }}
      />
    </div>
  );
}

const Hit = ({ hit, onClick, selected, onChangeYoung }) => {
  return (
    <tr style={{ backgroundColor: (selected && "#e6ebfa") || (hit.status === "WITHDRAWN" && colors.extraLightGrey) }} onClick={onClick}>
      <td>
        <p>{hit._id}</p>
      </td>
      <td>
        <MultiLine>
          <h2>{`${hit.firstName} ${hit.lastName}`}</h2>
          <p>
            {hit.birthdateAt ? `${getAge(hit.birthdateAt)} ans` : null} {`• ${hit.city || ""} (${hit.department || ""})`}
          </p>
        </MultiLine>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <SelectStatus
          disabled
          hit={hit}
          callback={onChangeYoung}
          options={Object.keys(YOUNG_STATUS_PHASE1).filter((e) => e !== "WAITING_LIST")}
          statusName="statusPhase1"
          phase="COHESION_STAY"
        />
      </td>
    </tr>
  );
};
