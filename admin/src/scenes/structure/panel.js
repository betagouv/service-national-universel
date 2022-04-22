import React, { useState, useEffect } from "react";
import styled from "styled-components";
import SocialIcons from "../../components/SocialIcons";
import { toastr } from "react-redux-toastr";
import { Link, useHistory } from "react-router-dom";

import api from "../../services/api";
import { translate, ES_NO_LIMIT, MISSION_STATUS_COLORS, htmlCleaner } from "../../utils";
import Badge from "../../components/Badge";
import Team from "./components/Team";
import PanelActionButton from "../../components/buttons/PanelActionButton";
import Panel, { Info, Details } from "../../components/Panel";
import ModalConfirm from "../../components/modals/ModalConfirm";

export default function PanelView({ onChange, value }) {
  const [missions, setMissions] = useState({ count: "-", placesTotal: "-", placesLeft: "-", all: [] });
  const [referents, setReferents] = useState([]);
  const [parentStructure, setParentStructure] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [referentManagerPhase2, setReferentManagerPhase2] = useState();

  const history = useHistory();
  useEffect(() => {
    setMissions({ count: "-", placesTotal: "-", placesLeft: "-", all: [] });
    setReferents([]);

    if (!value) return;
    (async () => {
      const { responses: missionResponses } = await api.esQuery("mission", {
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": value._id } }] } },
        size: ES_NO_LIMIT,
      });
      const { responses: referentResponses } = await api.esQuery("referent", {
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": value._id } }] } },
      });
      if (value.networkId) {
        const { responses: structureResponses } = await api.esQuery("structure", {
          query: { bool: { must: { match_all: {} }, filter: [{ term: { _id: value.networkId } }] } },
        });
        if (structureResponses.length) {
          const structures = structureResponses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
          setParentStructure(structures.length ? structures[0] : null);
        }
      } else {
        setParentStructure(null);
      }
      if (missionResponses.length) {
        setMissions({
          count: missionResponses[0].hits.hits.length,
          placesTotal: missionResponses[0].hits.hits.reduce((acc, e) => acc + e._source.placesTotal, 0),
          placesLeft: missionResponses[0].hits.hits.reduce((acc, e) => acc + e._source.placesLeft, 0),
          all: missionResponses[0].hits.hits.slice(0, 10).map((el) => ({ id: el._id, ...el._source })),
        });
      }
      if (referentResponses.length) {
        setReferents(referentResponses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source })));
      }
    })();
  }, [value]);

  useEffect(() => {
    if (!value) return;
    (async () => {
      const { ok, data } = await api.get(`/referent/manager_phase2/${value.department}`);
      if (ok) return setReferentManagerPhase2(data);
      setReferentManagerPhase2(null);
    })();
    return () => setReferentManagerPhase2();
  }, [value]);

  const onClickDelete = (structure) => {
    setModal({
      isOpen: true,
      onConfirm: () => onConfirmDelete(structure),
      title: "Êtes-vous sûr(e) de vouloir supprimer cette structure ?",
      message: "Cette action est irréversible.",
    });
  };

  const onConfirmDelete = async (structure) => {
    try {
      const { ok, code } = await api.remove(`/structure/${structure._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Cette structure a été supprimée.");
      return history.go(0);
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression de la structure :", translate(e.code));
    }
  };

  if (!value) return <div />;
  return (
    <Panel>
      <div className="info">
        <div style={{ display: "flex" }}>
          <Subtitle>structure</Subtitle>
          <div className="close" onClick={onChange} />
        </div>
        <div className="title">{value.name}</div>
        <div style={{ display: "flex" }}>
          <Link to={`/structure/${value._id}`}>
            <PanelActionButton icon="eye" title="Consulter" />
          </Link>
          <Link to={`/structure/${value._id}/edit`}>
            <PanelActionButton icon="pencil" title="Modifier" />
          </Link>
          <PanelActionButton onClick={() => onClickDelete(value)} icon="bin" title="Supprimer" />
        </div>
      </div>
      <Info title="La structure">
        <div dangerouslySetInnerHTML={{ __html: htmlCleaner(value.description) }} />
        <Details title="Statut juridique" value={translate(value.legalStatus)} />
        <Details title="Type" value={value.types?.map(translate)?.join(", ")} />
        <Details title="Sous-type" value={translate(value.sousType)} />
        {/* {value.legalStatus === "ASSOCIATION" ? <Details title="Agréments" value={value.associationTypes?.length > 0 && value.associationTypes.join(",")} /> : null}
        {value.legalStatus === "PUBLIC" ? (
          <div>
            <Details title="Type" value={value.structurePubliqueType} />
            {["Service de l'Etat", "Etablissement public"].includes(value.structurePubliqueType) ? <Details title="Service" value={value.structurePubliqueEtatType} /> : null}
          </div>
        ) : null}
        {value.legalStatus === "PRIVATE" ? <Details title="Type" value={value.structurePriveeType} /> : null} */}
        <Details title="Région" value={value.region} />
        <Details title="Dép." value={value.department} />
        <Details title="Ville" value={value.city} />
        <Details title="Code postal" value={value.zip} />
        <Details title="Adresse" value={value.address} />
        <Details title="Siret" value={value.siret} />
        <Details title="Vitrine" value={<SocialIcons value={value} />} />
        <Details title="Contact phase 2" value={referentManagerPhase2?.email || (referentManagerPhase2 !== undefined && "Non trouvé") || "Chargement..."} copy />
      </Info>
      <Info title={`Missions (${missions.count})`}>
        <p style={{ color: "#999" }}>Cette structure a {missions.placesLeft} places restantes.</p>
        {missions.all.map((mission) => (
          <div className="detail" key={mission.id} style={{ justifyContent: "space-between", alignItems: "center" }}>
            <MissionName className="detail-title">{mission.name}</MissionName>
            <div style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
              <Badge text={translate(mission.status)} color={MISSION_STATUS_COLORS[mission.status]} />
              <Link to={`/mission/${mission.id}`}>
                <IconLink />
              </Link>
            </div>
          </div>
        ))}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {missions.count > 0 ? (
            <Link to={`/structure/${value._id}/missions`}>
              <Button className="btn-missions">Consulter toutes ses missions</Button>
            </Link>
          ) : null}
        </div>
      </Info>
      <Team referents={referents} />
      {parentStructure ? (
        <Info title={`Réseau national`}>
          <div style={{ marginTop: "1rem" }}>{parentStructure.name}</div>
        </Info>
      ) : null}
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
    </Panel>
  );
}

const Subtitle = styled.div`
  color: rgb(113, 128, 150);
  font-weight: 400;
  text-transform: uppercase;
  font-size: 0.9rem;
`;

const MissionName = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const IconLink = styled.div`
  margin: 0 0.5rem;
  width: 18px;
  height: 18px;
  background: ${`url(${require("../../assets/link.svg")})`};
  background-repeat: no-repeat;
  background-position: center;
  background-size: 15px 15px;
`;

const Button = styled.button`
  margin: 1rem 0.5rem 0 0.5rem;
  align-self: flex-start;
  border-radius: 4px;
  padding: 5px;
  font-size: 12px;
  min-width: 100px;
  font-weight: 400;
  cursor: pointer;
  background-color: #fff;
  &.btn-blue {
    color: #646b7d;
    border: 1px solid #dcdfe6;
    :hover {
      color: rgb(49, 130, 206);
      border-color: rgb(193, 218, 240);
      background-color: rgb(234, 243, 250);
    }
  }
  &.btn-red {
    border: 1px solid #f6cccf;
    color: rgb(206, 90, 90);
    :hover {
      border-color: rgb(240, 218, 218);
      background-color: rgb(250, 230, 230);
    }
  }
  &.btn-missions {
    color: #646b7d;
    border: 1px solid #dcdfe6;
    font-size: 14px;
    padding: 5px 15px;
    :hover {
      color: rgb(49, 130, 206);
      border-color: rgb(193, 218, 240);
      background-color: rgb(234, 243, 250);
    }
  }
`;
