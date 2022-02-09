import React, { useState, useMemo, useEffect } from "react";
import { ReactiveBase, DataSearch } from "@appbaseio/reactivesearch";
import { Spinner } from "reactstrap";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import api from "../../../services/api";
import { apiURL } from "../../../config";
import MissionView from "./wrapper";
import { ResultTable } from "../../../components/list";
import styled from "styled-components";
import ReactiveListComponent from "../../../components/ReactiveListComponent";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import { getResultLabel, isInRuralArea, translate, getDistanceBetweenTwoPointsInKM, SENDINBLUE_TEMPLATES, APPLICATION_STATUS, ROLES } from "../../../utils";

const FILTERS = ["SEARCH"];

export default function ProposeMission({ mission }) {
  const user = useSelector((state) => state.Auth.user);

  const [search, setSearch] = useState(undefined);

  const getDefaultQuery = () => {
    let query = { bool: { must: { match_all: {} }, filter: [] } };
    if (user.role === ROLES.REFERENT_DEPARTMENT) query.bool.filter.push({ term: { "department.keyword": user.department } });
    if (user.role === ROLES.REFERENT_REGION) query.bool.filter.push({ term: { "region.keyword": user.region } });

    return { query };
  };

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <MissionView mission={mission} tab="propose-mission">
        <div style={{}}>
          <ReactiveBase url={`${apiURL}/es`} app="young" headers={{ Authorization: `JWT ${api.getToken()}` }}>
            <SearchBox getDefaultQuery={getDefaultQuery} setSearch={setSearch} />
            <ResultBox getDefaultQuery={getDefaultQuery} search={search} mission={mission} />
          </ReactiveBase>
        </div>
      </MissionView>
    </div>
  );
}

const SearchBox = ({ getDefaultQuery, setSearch }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FFFFFF", padding: "3rem", borderRadius: "10px" }}>
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
          dataField={["email.keyword", "firstName", "lastName"]}
          style={{ flex: 1, marginRight: "1rem" }}
          innerClass={{ input: "searchbox" }}
          autosuggest={false}
          queryFormat="and"
          onValueChange={setSearch}
        />
        <p>Nom, prénom ou bien e-mail</p>
      </SearchStyle>
    </div>
  );
};

const ResultBox = ({ getDefaultQuery, search, mission }) => {
  const [applicationsToTheMission, setApplicationsToTheMission] = useState([]);

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
          renderResultStats={(e) => <BottomResultStats>{getResultLabel(e)}</BottomResultStats>}
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

  const distanceInKm = useMemo(() => {
    if (!hit.location || !mission.location) return "";
    const distance = getDistanceBetweenTwoPointsInKM({
      departLat: hit.location.lat,
      departLon: hit.location.lon,
      arriveLat: mission.location.lat,
      arriveLon: mission.location.lon,
    });
    return `~ ${Math.round(distance)} km`;
  }, [JSON.stringify(hit.location), JSON.stringify(mission.location)]);

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
    <div
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
            <p style={{ margin: 0, fontWeight: "bold" }}>
              {hit.firstName} {hit.lastName}
            </p>
            <p style={{ color: "#6B7280" }}>
              {hit.region} {hit.region && hit.department && ">"} {hit.department}
            </p>
          </div>
          <div style={{ flex: "1" }}>
            <p style={{ textAlign: "right", overflow: "hidden", whiteSpace: "nowrap" }}>{distanceInKm}</p>
          </div>
        </div>
        <hr />
        <div style={{ fontSize: "0.9rem", color: "#777E90" }}>
          <p>
            <b>Domaines privilégiés:</b> {hit.domains.length > 0 ? hit.domains?.join(" • ") : "Non renseigné"}
          </p>
          <p>
            <b>Projet pro:</b> {proProject}
          </p>
          <p>{specificity.length > 0 && specificity.join(" • ")}</p>
        </div>
      </div>
      <div style={{ backgroundColor: "#EFEEF2", borderRadius: "0 0 10px 10px", padding: "10px", display: "flex", justifyContent: "center" }}>
        {isAlreadyApplied && <p style={{ margin: "0px", color: "#43994C" }}>Mission proposée</p>}
        {!isAlreadyApplied && loading && <Spinner size="sm" style={{ borderWidth: "0.125em", margin: "0.25rem" }} />}
        {!isAlreadyApplied && !loading && (
          <p onClick={() => setModal(true)} style={{ margin: "0px", color: "#5245CC", cursor: "pointer" }}>
            Proposer la mission
          </p>
        )}
      </div>
      <ModalConfirm
        isOpen={modal}
        title="Confirmation de la proposition"
        message={`Voulez-vous vraiment proposer la mission ${mission.name} à ${hit.firstName} ${hit.lastName} ?`}
        onCancel={() => setModal(false)}
        onConfirm={handleClick}
      />
    </div>
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
