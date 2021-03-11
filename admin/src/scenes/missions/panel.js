import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";

import { translate, formatStringDate } from "../../utils";
import api from "../../services/api";
import SelectStatusMission from "../../components/selectStatusMission";
import PanelActionButton from "../../components/buttons/PanelActionButton";

export default ({ onChange, mission }) => {
  const [tutor, setTutor] = useState();
  const [structure, setStructure] = useState({});
  const history = useHistory();

  useEffect(() => {
    (async () => {
      if (!mission) return;
      if (mission.tutorId) {
        const { ok: ok1, data: dataTutor, code: code1 } = await api.get(`/referent/${mission.tutorId}`);
        if (!ok1) toastr.error("Oups, une erreur est survnue lors de la récuperation du tuteur", translate(code1));
        else setTutor(dataTutor);
      } else {
        setTutor(null);
      }
      const { ok: ok2, data: dataStructure, code: code2 } = await api.get(`/structure/${mission.structureId}`);
      if (!ok2) toastr.error("Oups, une erreur est survnue lors de la récuperation de la structure", translate(code2));
      else setStructure(dataStructure);
      return;
    })();
  }, [mission]);

  const duplicate = async () => {
    mission.name += " (copie)";
    delete mission._id;
    mission.placesLeft = mission.placesTotal;
    const { data, ok, code } = await api.post("/mission", mission);
    if (!ok) toastr.error("Oups, une erreur est survnue lors de la duplication de la mission", translate(code));
    toastr.success("Mission dupliquée !");
    return history.push(`/mission/${data._id}`);
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr(e) de vouloir supprimer cette mission ?")) return;
    try {
      const { ok, code } = await api.remove(`/mission/${mission._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok && code === "LINKED_OBJECT")
        return toastr.error("Vous ne pouvez pas supprimer cette mission car des candidatures sont encore liées à cette mission.", { timeOut: 5000 });
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Cette mission a été supprimée.");
      return history.push(`/mission`);
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression de la mission :", translate(e.code));
    }
  };

  if (!mission) return <div />;
  return (
    <Panel>
      <div style={{ display: "flex", marginBottom: "15px" }}>
        <Subtitle>MISSION</Subtitle>
        <div className="close" onClick={onChange} />
      </div>
      <div className="title">{mission.name}</div>
      <div style={{ display: "flex" }}>
        <Link to={`/mission/${mission._id}`}>
          <PanelActionButton icon="eye" title="Consulter" />
        </Link>
        <Link to={`/mission/${mission._id}/edit`}>
          <PanelActionButton icon="pencil" title="Modifier" />
        </Link>
        <PanelActionButton onClick={duplicate} icon="duplicate" title="Dupliquer" />
      </div>
      <div style={{ display: "flex" }}>
        <PanelActionButton onClick={handleDelete} icon="bin" title="Supprimer" />
      </div>
      <hr />
      <div>
        <div className="title">Statut</div>
        <SelectStatusMission hit={mission} />
        <div className="description">A noter que des notifications emails seront envoyées</div>
      </div>
      <hr />
      <div className="title">{`Volontaire(s) (${mission.placesTotal - mission.placesLeft})`}</div>
      <div className="detail">
        <div className="description">{`Cette mission a reçu ${mission.placesTotal - mission.placesLeft} candidature(s)`}</div>
      </div>
      {/* <Link to={``}>
        <button>Consulter tous les volontaires</button>
      </Link> */}
      <hr />
      <div className="title">
        La structure
        <Link to={`/structure/${structure._id}`}>
          <SubtitleLink>{`${structure.name} >`}</SubtitleLink>
        </Link>
      </div>

      <div className="detail">
        <div className="detail-title">Statut</div>
        <div className="detail-text">{translate(structure.legalStatus)}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Dép.</div>
        <div className="detail-text">{structure.department}</div>
      </div>

      <div className="detail">
        <div className="detail-title">Tuteur</div>
        <div className="detail-text">{tutor ? `${tutor.firstName} ${tutor.lastName}` : ""}</div>
      </div>
      <div className="detail">
        <div className="detail-title">E-mail</div>
        <div className="detail-text">{tutor && tutor.email}</div>
      </div>
      <div className="detail">
        <div className="detail-title">tel.</div>
        <div className="detail-text">{tutor && tutor.phone}</div>
      </div>
      <hr />
      <div className="title">La mission</div>
      <div className="detail">
        <div className="detail-title">Domaines</div>
        <div className="detail-text">{mission.domains.map((d) => translate(d)).join(", ")}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Début</div>
        <div className="detail-text">{formatStringDate(mission.startAt)}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Fin</div>
        <div className="detail-text">{formatStringDate(mission.endAt)}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Adresse</div>
        <div className="detail-text">{mission.address}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Dép.</div>
        <div className="detail-text">{mission.department}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Format</div>
        <div className="detail-text">{translate(mission.format)}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Fréquence</div>
        <div className="detail-text">{mission.frequence}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Périodes</div>
        <div className="detail-text">{mission.period.map((p) => translate(p)).join(", ")}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Objectifs</div>
        <div className="detail-text">{mission.description}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Actions</div>
        <div className="detail-text">{mission.actions}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Contraintes</div>
        <div className="detail-text">{mission.contraintes}</div>
      </div>
      {/* <div>
        {Object.keys(mission).map((e) => {
          return <div>{`${e}:${mission[e]}`}</div>;
        })}
      </div> */}
      {/* <div className="others-title">Volontaires (0)</div>
      <div className="others-text">Aucun volontaire n'a encore été assigné. // TODO</div> */}
    </Panel>
  );
};

const Subtitle = styled.div`
  color: rgb(113, 128, 150);
  font-weight: 400;
  text-transform: uppercase;
  font-size: 0.9rem;
`;

const SubtitleLink = styled(Subtitle)`
  color: #5245cc;
  text-transform: none;
`;

const Panel = styled.div`
  background: #ffffff;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  flex: 1;
  max-width: 420px;
  position: relative;
  min-height: 100vh;
  font-size: 14px;
  align-self: flex-start;
  position: sticky;
  right: 0;
  border: 1px solid rgb(235, 238, 245);
  background-color: #fff;
  position: relative;
  border-radius: 4px;
  padding-bottom: 20px;
  margin-bottom: 40px;
  padding: 20px;
  .close {
    color: #000;
    font-weight: 400;
    width: 45px;
    height: 45px;
    background: url(${require("../../assets/close_icon.png")}) center no-repeat;
    background-size: 12px;
    padding: 15px;
    position: absolute;
    right: 15px;
    top: 15px;
    cursor: pointer;
  }
  .name {
    text-transform: uppercase;
    color: #606266;
    font-size: 12px;
    margin: 50px;
    text-align: center;
    letter-spacing: 0.02em;
  }
  :hover {
    box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 12px 0px;
  }
  img {
    width: 45px;
    height: 45px;
    background-color: #aaa;
    border-radius: 50%;
    object-fit: cover;
    transform: translateY(-50%);
  }
  .title {
    margin-top: -15px;
    margin-bottom: 15px;
    font-weight: 500;
    color: #000;
    font-size: 18px;
  }
  .description {
    font-weight: 400;
    color: #aaa;
    font-size: 0.8rem;
  }
  hr {
    margin: 20px 0 30px;
  }
  .detail {
    display: flex;
    align-items: flex-start;
    font-size: 12px;
    text-align: left;
    margin-top: 1rem;
    &-title {
      min-width: 90px;
      width: 90px;
      color: #798399;
    }
    &-text {
      color: rgba(26, 32, 44);
    }
  }

  .others-title {
    font-size: 20px;
    margin-bottom: 15px;
  }
  .others-text {
    font-size: 12px;
    color: #aeb7d6;
    padding: 15px;
  }
`;
