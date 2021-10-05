import React, { useEffect, useState } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import styled from "styled-components";
import { useSelector } from "react-redux";

import api from "../../services/api";
import { apiURL, environment } from "../../config";
import Panel from "./panel";
import DownloadAllAttestation from "../../components/buttons/DownloadAllAttestation";
import ExportComponent from "../../components/ExportXlsx";
import {
  translate,
  getFilterLabel,
  YOUNG_STATUS_COLORS,
  formatDateFRTimezoneUTC,
  formatLongDateFR,
  isInRuralArea,
  getAge,
  confirmMessageChangePhase1Presence,
  ES_NO_LIMIT,
} from "../../utils";
import { RegionFilter, DepartmentFilter } from "../../components/filters";
import Badge from "../../components/Badge";
import { ResultTable, Filter, Table, FilterRow } from "../../components/list";
import ToggleSwitch from "../../components/ToogleSwitch";
import Chevron from "../../components/Chevron";
import Select from "./components/Select";
import { toastr } from "react-redux-toastr";
import ReactiveListComponent from "../../components/ReactiveListComponent";
import ModalConfirm from "../../components/modals/ModalConfirm";

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
];

export default () => {
  const user = useSelector((state) => state.Auth.user);
  const [volontaire, setVolontaire] = useState(null);
  const [meetingPoints, setMeetingPoints] = useState(null);
  const [center, setCenter] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const handleShowFilter = () => setFilterVisible(!filterVisible);
  useEffect(() => {
    (async () => {
      const { data } = await api.get("/meeting-point/all");
      setMeetingPoints(data);
    })();
    (async () => {
      const { data } = await api.get(`/cohesion-center/${user.cohesionCenterId}`);
      setCenter(data);
    })();
  }, []);
  const getDefaultQuery = () => ({
    query: { bool: { filter: [{ term: { "cohesionCenterId.keyword": user.cohesionCenterId } }, { terms: { "status.keyword": ["VALIDATED", "WITHDRAWN"] } }] } },
    sort: [{ "lastName.keyword": "asc" }],
  });
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  return (
    <div>
      <ReactiveBase url={`${apiURL}/es`} app="young" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Header>
              <div>
                <Title>Volontaires</Title>
              </div>
              <div style={{ display: "flex" }}>
                <ExportComponent
                  title="Export pour les cas particuliers"
                  defaultQuery={getExportQuery}
                  exportTitle="volontaires_cas_particuliers"
                  index="young"
                  react={{ and: FILTERS }}
                  transform={(all) => {
                    return all.map((data) => {
                      return {
                        _id: data._id,
                        Prénom: data.firstName,
                        Nom: data.lastName,
                        "Code centre": center.code || "",
                        "Nom du centre": center.name || "",
                        "Présence au séjour de cohésion": data.cohesionStayPresence || "",
                        "Cas particulier qui valide sa JDC malgré son absence au séjour de cohésion (oui/non)": "",
                        "Commentaires (Décrivez pourquoi)": "",
                      };
                    });
                  }}
                />
                <ExportComponent
                  defaultQuery={getExportQuery}
                  title="Exporter les volontaires"
                  exportTitle="Volontaire"
                  index="young"
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
                        Sexe: data.gender,
                        Email: data.email,
                        Téléphone: data.phone,
                        "Adresse postale": data.address,
                        "Code postal": data.zip,
                        Ville: data.city,
                        Département: data.department,
                        Région: data.region,
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
                        "Nature de l'aménagement spécifique": data.specificAmenagmentType,
                        "Activité de haut-niveau": translate(data.highSkilledActivity),
                        "Nature de l'activité de haut-niveau": data.highSkilledActivityType,
                        "Document activité de haut-niveau ": data.highSkilledActivityProofFiles,
                        "Consentement des représentants légaux": data.parentConsentment,
                        "Droit à l'image": translate(data.imageRight),
                        "Autotest PCR": translate(data.autoTestPCR),
                        "fiche sanitaire réceptionnée": translate(data.cohesionStayMedicalFileReceived || "false"),
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
                        Motivation: data.motivations,
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
                        "Confirmation point de rassemblement": data.meetingPointId || data.deplacementPhase1Autonomous === "true" ? "Oui" : "Non",
                        "se rend au centre par ses propres moyens": translate(data.deplacementPhase1Autonomous),
                        "Bus n˚": meetingPoint?.busExcelId,
                        "Adresse point de rassemblement": meetingPoint?.departureAddress,
                        "Date aller": meetingPoint?.departureAtString,
                        "Date retour": meetingPoint?.returnAtString,
                      };
                    });
                  }}
                />
                <DownloadAllAttestation cohesionCenterId={user.cohesionCenterId}>
                  <div>Exporter les attestations</div>
                </DownloadAllAttestation>
              </div>
            </Header>
            <Filter>
              <FilterRow visible>
                <DataSearch
                  showIcon={false}
                  placeholder="Rechercher par prénom, nom, email, ville, code postal..."
                  componentId="SEARCH"
                  dataField={["email.keyword", "firstName", "lastName", "city", "zip"]}
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
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Statut phase 1")}
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
};

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
        <Badge text="Phase 1" tooltipText={translate(value.statusPhase1)} color={YOUNG_STATUS_COLORS[value.statusPhase1]} />
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
          disabled={true}
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
          disabled={true}
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
