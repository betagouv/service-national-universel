import React, { useEffect, useMemo, useState } from "react";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { Spinner } from "reactstrap";

import { translateApplication, translatePhase2 } from "snu-lib";
import styled from "styled-components";
import PinLocation from "../../../assets/PinLocation";
import { Filters, ResultTable, Save, SelectedFilters } from "../../../components/filters-system-v2";
import { orderCohort } from "../../../components/filters-system-v2/components/filters/utils";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import api from "../../../services/api";
import { APPLICATION_STATUS, SENDINBLUE_TEMPLATES, isInRuralArea, translate } from "snu-lib";
import MissionView from "./wrapper";

export default function ProposeMission({ mission, updateMission }) {
  const [data, setData] = React.useState([]);
  const pageId = "propose-mission";
  const [selectedFilters, setSelectedFilters] = React.useState({});
  const [paramData, setParamData] = React.useState({ page: 0 });

  //Filters
  const filterArray = [
    { title: "Cohorte", name: "cohort", missingLabel: "Non renseigné", sort: (e) => orderCohort(e) },
    {
      title: "Statut phase 2",
      name: "statusPhase2",
      missingLabel: "Non renseigné",
      translate: translatePhase2,
    },
    {
      title: "Statut mission (candidature)",
      name: "phase2ApplicationStatus",
      missingLabel: "Non renseigné",
      translate: translateApplication,
    },
  ];

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <MissionView mission={mission} tab="propose-mission">
        <div style={{}}>
          {mission.visibility === "HIDDEN" ? (
            <div>
              Cette mission est <strong>fermée</strong> aux candidatures.
            </div>
          ) : (
            <>
              <SearchBox
                pageId={pageId}
                setData={setData}
                filterArray={filterArray}
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                paramData={paramData}
                setParamData={setParamData}
                mission={mission}
              />
              <ResultBox mission={mission} updateMission={updateMission} data={data} paramData={paramData} setParamData={setParamData} selectedFilters={selectedFilters} />
            </>
          )}
        </div>
      </MissionView>
    </div>
  );
}

const SearchBox = ({ pageId, setData, filterArray, selectedFilters, setSelectedFilters, paramData, setParamData, mission }) => {
  return (
    <div className="flex flex-col bg-white px-12 pt-12 pb-4">
      <div className="flex items-center justify-between rounded-lg">
        <Filters
          pageId={pageId}
          route={`/elasticsearch/young/propose-mission/${mission._id.toString()}/search`}
          setData={(value) => setData(value)}
          filters={filterArray}
          searchPlaceholder="Rechercher par prénom, nom, email, ville, code postal..."
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          paramData={paramData}
          setParamData={setParamData}
        />

        <div>
          <h3 style={{ color: "#111827", fontWeight: "bold" }}>Suggérez la mission à un volontaire</h3>
          <p style={{ color: "#6B7280" }}>Un e-mail lui sera envoyé avec la présentation de la mission ainsi qu’un lien pour candidater.</p>
        </div>
      </div>
      <div className="mt-2 flex flex-row flex-wrap items-center">
        <Save selectedFilters={selectedFilters} filterArray={filterArray} page={paramData?.page} pageId={pageId} />
        <SelectedFilters filterArray={filterArray} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} paramData={paramData} setParamData={setParamData} />
      </div>
    </div>
  );
};

const ResultBox = ({ mission, updateMission, data, paramData, setParamData, selectedFilters }) => {
  const [applicationsToTheMission, setApplicationsToTheMission] = useState([]);
  const history = useHistory();

  const hasSearch = selectedFilters?.searchbar?.filter[0]?.trim() === "" || !selectedFilters?.searchbar?.filter?.length;

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
      {data.length ? (
        <>
          {hasSearch ? <p className="suggested">Recommandation de volontaires disponibles autour de la mission :</p> : <p className="suggested">Résultat de la recherche :</p>}
          <div className="bg-[#f4f5f7] mt-4 mb-4">
            <ResultTable
              paramData={paramData}
              setParamData={setParamData}
              currentEntryOnPage={data?.length}
              size={data?.length}
              render={
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridGap: "1rem" }}>
                  {data.map((hit) => (
                    <Hit key={hit._id} hit={hit} applicationsToTheMission={applicationsToTheMission} mission={mission} onClick={async () => await handleProposal(hit)} />
                  ))}
                </div>
              }
            />
          </div>
        </>
      ) : (
        <p className="suggested text-center w-full">Aucun Résultat</p>
      )}
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
        marginTop: "15px",
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

const YoungCard = styled.div`
  transition: all 0.2s ease-in-out;
  :hover {
    transform: scale(1.02);
  }
`;
