import { DataSearch, MultiDropdownList, ReactiveBase } from "@appbaseio/reactivesearch";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { Spinner } from "reactstrap";

import { getFilterLabel, translateApplication, translatePhase2 } from "snu-lib";
import styled from "styled-components";
import PinLocation from "../../../assets/PinLocation";
import { FilterRow, ResultTable } from "../../../components/list";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import ReactiveListComponent from "../../../components/ReactiveListComponent";
import { apiURL } from "../../../config";
import api from "../../../services/api";
import { APPLICATION_STATUS, getResultLabel, isInRuralArea, ROLES, SENDINBLUE_TEMPLATES, translate } from "../../../utils";
import MissionView from "./wrapper";

const FILTERS = ["SEARCH", "COHORT", "STATUS_PHASE_2", "APPLICATION_STATUS"];

export default function ProposeMission({ mission, updateMission }) {
  const user = useSelector((state) => state.Auth.user);

  const [search, setSearch] = useState(undefined);

  const getDefaultQuery = () => {
    let defaultQuery = {
      query: {
        bool: {
          filter: [
            { terms: { "status.keyword": ["VALIDATED"] } },
            { terms: { "statusPhase1.keyword": ["DONE", "EXEMPTED"] } },
            { terms: { "statusPhase2.keyword": ["IN_PROGRESS", "WAITING_REALISATION"] } },
          ],
        },
      },
      track_total_hits: true,
    };
    if (user.role === ROLES.REFERENT_DEPARTMENT) defaultQuery.query.bool.filter.push({ terms: { "department.keyword": user.department } });
    if (user.role === ROLES.REFERENT_REGION) defaultQuery.query.bool.filter.push({ term: { "region.keyword": user.region } });

    if (mission.location?.lat && mission.location?.lon) {
      defaultQuery["sort"] = { _geo_distance: { location: [mission.location?.lon, mission.location?.lat], order: "asc", unit: "km" } };
    }
    return defaultQuery;
  };

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <MissionView mission={mission} tab="propose-mission">
        <div style={{}}>
          {mission.visibility === "HIDDEN" ? (
            <div>
              Cette mission est <strong>fermée</strong> aux candidatures.
            </div>
          ) : (
            <ReactiveBase url={`${apiURL}/es`} app="young" headers={{ Authorization: `JWT ${api.getToken()}` }}>
              <SearchBox getDefaultQuery={getDefaultQuery} setSearch={setSearch} />
              <ResultBox getDefaultQuery={getDefaultQuery} search={search} mission={mission} updateMission={updateMission} />
            </ReactiveBase>
          )}
        </div>
      </MissionView>
    </div>
  );
}

const SearchBox = ({ getDefaultQuery, setSearch }) => {
  return (
    <div className="flex flex-col bg-white px-12 pt-12 pb-4">
      <div className="flex items-center justify-between rounded-lg">
        <div>
          <h3 style={{ color: "#111827", fontWeight: "bold" }}>Suggérez la mission à un volontaire</h3>
          <p style={{ color: "#6B7280" }}>Un e-mail lui sera envoyé avec la présentation de la mission ainsi qu’un lien pour candidater.</p>
        </div>
        <SearchStyle>
          <DataSearch
            defaultQuery={getDefaultQuery}
            showIcon={false}
            placeholder="Rechercher un volontaire..."
            react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
            componentId="SEARCH"
            dataField={["email.keyword", "firstName.folded", "lastName.folded"]}
            style={{ flex: 1, marginRight: "1rem" }}
            innerClass={{ input: "searchbox" }}
            autosuggest={false}
            queryFormat="and"
            onValueChange={setSearch}
          />
          <p>Nom, prénom ou bien e-mail</p>
        </SearchStyle>
      </div>
      <div className="flex rounded-xl mt-4 bg-gray-50 p-4 items-center">
        <FilterRow visible>
          <div className="uppercase text-sm text-gray-500">Filtres :</div>
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
        </FilterRow>
      </div>
    </div>
  );
};

const ResultBox = ({ getDefaultQuery, search, mission, updateMission }) => {
  const [applicationsToTheMission, setApplicationsToTheMission] = useState([]);
  const history = useHistory();

  useEffect(() => {
    getApplicationsToTheMission();
  }, []);

  const getApplicationsToTheMission = async () => {
    try {
      const { ok, data: application } = await api.get(`/mission/${mission._id}/application`);

      if (ok) setApplicationsToTheMission(application.map((e) => e.youngId));
    } catch (e) {
      toastr.error("Erreur", "Une erreur est survenue lors de la récupération des candidatures");
    }
  };

  const handleProposal = async (young) => {
    const application = {
      status: APPLICATION_STATUS.WAITING_ACCEPTATION,
      youngId: young._id,
      youngFirstName: young.firstName,
      youngLastName: young.lastName,
      youngEmail: young.email,
      youngBirthdateAt: young.birthdateAt,
      youngCity: young.city,
      youngDepartment: young.department,
      youngCohort: young.cohort,
      missionId: mission._id,
      missionName: mission.name,
      missionDepartment: mission.department,
      missionRegion: mission.region,
      structureId: mission.structureId,
      tutorId: mission.tutorId,
      tutorName: mission.tutorName,
    };
    const { ok, code } = await api.post(`/application`, application);
    if (!ok) return toastr.error("Oups, une erreur est survenue lors de la candidature", code);

    //send mail
    const { ok: okMail, code: codeMail } = await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.MISSION_PROPOSITION}`, {
      missionName: mission.name,
      structureName: mission.structureName,
    });
    if (!okMail) return toastr.error("Oups, une erreur est survenue lors de l'envoi du mail", codeMail);
    toastr.success("Email envoyé !");
    await getApplicationsToTheMission();

    updateMission();
    // On vérifie qu'il reste des places de candidature, sinon on redirige.
    try {
      const res = await api.get(`/mission/${mission._id}/`);
      if (res.data.pendingApplications >= res.data.placesLeft * 5) {
        history.push(`/mission/${mission._id}`);
      }
    } catch (e) {
      console.error(e);
    }

    return;
  };

  return (
    <ResultStyle>
      {!search ? <p className="suggested">Recommandation de volontaires disponibles autour de la mission :</p> : <p className="suggested">Résultat de la recherche :</p>}
      <ResultTable backgroundColor="#f4f5f7">
        <ReactiveListComponent
          paginationAt="bottom"
          defaultQuery={getDefaultQuery}
          react={{ and: FILTERS }}
          size={12}
          renderResultStats={(e) => <BottomResultStats>{getResultLabel(e, 12)}</BottomResultStats>}
          render={({ data }) => (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridGap: "1rem" }}>
              {data.map((hit) => (
                <Hit key={hit._id} hit={hit} applicationsToTheMission={applicationsToTheMission} mission={mission} onClick={async () => await handleProposal(hit)} />
              ))}
            </div>
          )}
        />
      </ResultTable>
    </ResultStyle>
  );
};

const Hit = ({ hit, mission, applicationsToTheMission, onClick }) => {
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);

  const specificity = useMemo(() => {
    let temp = [];
    if (hit.handicap === "true") temp.push("Handicap");
    if (isInRuralArea(hit) === "true") temp.push("Zone rurale");
    return temp;
  }, [hit.handicap, hit.populationDensity]);

  const proProject = useMemo(() => {
    if (hit.professionnalProject === "UNIFORM") return translate("UNIFORM");
    if (hit.professionnalProject === "OTHER") return hit.professionnalProjectPrecision;
    return "Non renseigné";
  }, [hit.professionnalProject, hit.professionnalProjectPrecision]);

  const isAlreadyApplied = useMemo(() => {
    return applicationsToTheMission.includes(hit._id.toString());
  }, [applicationsToTheMission, hit._id]);

  const handleClick = async () => {
    setModal(false);
    setLoading(true);
    await onClick();
    setLoading(false);
  };

  return (
    <YoungCard
      style={{
        backgroundColor: "#fff",
        borderRadius: "10px",
        alignSelf: "stretch",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}>
      <div style={{ padding: "1.5rem 1.5rem 10px 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <a href={`/volontaire/${hit._id}`} target="_blank" rel="noreferrer" style={{ margin: 0, fontWeight: "bold", cursor: "pointer" }}>
              {hit.firstName} {hit.lastName}
            </a>
            <p style={{ color: "#6B7280" }}>
              {hit.region}&nbsp;{hit.region && hit.department && "›"}&nbsp;{hit.department}
            </p>
          </div>
          <div style={{ flex: "1" }}>
            <p style={{ textAlign: "right", overflow: "hidden", whiteSpace: "nowrap", display: "flex", justifyContent: "flex-end" }}>
              <PinLocation width={15} color="#424242" />
              {`${Math.round(hit.sort[0])} km`}
            </p>
          </div>
        </div>
        <hr />
        <div style={{ fontSize: "0.9rem", color: "#777E90" }}>
          <p>
            <b>Domaines privilégiés:</b> {hit.domains.length > 0 ? hit.domains?.map(translate)?.join(" • ") : "Non renseigné"}
          </p>
          <p>
            <b>Projet pro:</b> {proProject}
          </p>
          <p>{specificity.length > 0 && specificity.join(" • ")}</p>
        </div>
      </div>
      <div
        onClick={() => {
          if (isAlreadyApplied || (!isAlreadyApplied && loading)) return;
          setModal(true);
        }}
        style={{
          backgroundColor: "#EFEEF2",
          borderRadius: "0 0 10px 10px",
          padding: "10px",
          display: "flex",
          justifyContent: "center",
          cursor: isAlreadyApplied || (!isAlreadyApplied && loading) ? "default" : "pointer",
        }}>
        {isAlreadyApplied && <p style={{ margin: "0px", color: "#43994C" }}>Mission proposée</p>}
        {!isAlreadyApplied && loading && <Spinner size="sm" style={{ borderWidth: "0.125em", margin: "0.25rem" }} />}
        {!isAlreadyApplied && !loading && <p style={{ margin: "0px", color: "#5245CC" }}>Proposer la mission</p>}
      </div>
      <ModalConfirm
        isOpen={modal}
        title="Confirmation de la proposition"
        message={`Voulez-vous vraiment proposer la mission ${mission.name} à ${hit.firstName} ${hit.lastName} ?`}
        onCancel={() => setModal(false)}
        onConfirm={handleClick}
      />
    </YoungCard>
  );
};

const SearchStyle = styled.div`
  width: 33%;
  .searchbox {
    background-color: #ffffff;
    border-radius: 10px;
    min-width: 20rem;
  }
  p {
    color: #6b7280;
    font-size: 0.8rem;
    margin-block: 5px 0;
  }
`;

const ResultStyle = styled.div`
  .suggested {
    margin-block: 1rem 0;
    font-size: 1rem;
    font-weight: 500;
    color: #6b7280;
  }
  .pagination {
    background-color: #f4f5f7;
  }

  p {
    margin-block: 5px;
  }
`;

const BottomResultStats = styled.div`
  color: #242526;
  font-size: 12px;
  padding-left: 25px;
  position: absolute;
  top: calc(100% - 50px);
  left: 0;
`;

const YoungCard = styled.div`
  transition: all 0.2s ease-in-out;
  :hover {
    transform: scale(1.02);
  }
`;
