import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link, useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import { translate, formatStringDateTimezoneUTC, MISSION_STATUS_COLORS, MISSION_STATUS } from "../../utils";
import api from "../../services/api";
import PanelActionButton from "../../components/buttons/PanelActionButton";
import Panel, { Info, Details } from "../../components/Panel";
import Badge from "../../components/Badge";
import ModalConfirm from "../../components/modals/ModalConfirm";
import { ROLES } from "snu-lib/roles";
import { useSelector } from "react-redux";

export default function PanelView({ onChange, mission }) {
  const [tutor, setTutor] = useState();
  const [structure, setStructure] = useState({});
  const history = useHistory();
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [applications, setApplications] = useState();
  const domains = mission?.domains?.filter((d) => {
    return d !== mission.mainDomain;
  });
  const user = useSelector((state) => state.Auth.user);

  useEffect(() => {
    (async () => {
      if (!mission) return;
      if (mission.tutorId) {
        const { ok: ok1, data: dataTutor } = await api.get(`/referent/${mission.tutorId}`);
        if (!ok1) setTutor(null);
        else setTutor(dataTutor);
      }
      const { ok: ok2, data: dataStructure, code: code2 } = await api.get(`/structure/${mission.structureId}`);
      if (!ok2) toastr.error("Oups, une erreur est survnue lors de la récupération de la structure", translate(code2));
      else setStructure(dataStructure);
      const responseApplications = await api.get(`/mission/${mission._id}/application`);
      if (!responseApplications.ok) toastr.error("Oups, une erreur est survnue lors de la récupération des candidatures", translate(responseApplications.code));
      else setApplications(responseApplications.data);
      return;
    })();
  }, [mission]);

  const onClickDelete = () => {
    setModal({ isOpen: true, onConfirm: onConfirmDelete, title: "Êtes-vous sûr(e) de vouloir supprimer cette mission ?", message: "Cette action est irréversible." });
  };

  const onConfirmDelete = async () => {
    try {
      const { ok, code } = await api.remove(`/mission/${mission._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok && code === "LINKED_OBJECT")
        return toastr.error("Vous ne pouvez pas supprimer cette mission car des candidatures sont encore liées à cette mission.", { timeOut: 5000 });
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Cette mission a été supprimée.");
      return history.go(0);
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression de la mission :", translate(e.code));
    }
  };

  const onClickDuplicate = () => {
    setModal({ isOpen: true, onConfirm: onConfirmDuplicate, title: "Êtes-vous sûr(e) de vouloir dupliquer cette mission ?" });
  };

  const onConfirmDuplicate = async () => {
    mission.name += " (copie)";
    delete mission._id;
    mission.placesLeft = mission.placesTotal;
    mission.status = MISSION_STATUS.DRAFT;
    const { data, ok, code } = await api.post("/mission", mission);
    if (!ok) toastr.error("Oups, une erreur est survnue lors de la duplication de la mission", translate(code));
    toastr.success("Mission dupliquée !");
    return history.push(`/mission/${data._id}`);
  };

  if (!mission) return <div />;
  return (
    <Panel>
      <div className="info">
        <div style={{ display: "flex", marginBottom: "15px" }}>
          <Subtitle>MISSION</Subtitle>
          <div className="close" onClick={onChange} />
        </div>
        <div className="title">
          {mission.name} <Badge text={translate(mission.status)} color={MISSION_STATUS_COLORS[mission.status]} />
        </div>
        <div style={{ display: "flex" }}>
          <Link to={`/mission/${mission._id}`}>
            <PanelActionButton icon="eye" title="Consulter" />
          </Link>
          <Link to={`/mission/${mission._id}/edit`}>
            <PanelActionButton icon="pencil" title="Modifier" />
          </Link>
          <PanelActionButton onClick={onClickDuplicate} icon="duplicate" title="Dupliquer" />
        </div>
        <div style={{ display: "flex" }}>
          <PanelActionButton onClick={onClickDelete} icon="bin" title="Supprimer" />
        </div>
      </div>
      <Info title="Candidatures">
        <Details title="Volontaire(s) ayant candidaté" value={applications?.filter((e) => e.status !== "WAITING_ACCEPTATION").length} />
        {![ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role) && (
          <Details title="Volontaire(s) ayant reçu une proposition de mission" value={applications?.filter((e) => e.status == "WAITING_ACCEPTATION").length} />
        )}
        <Details title="Place(s) proposée(s)" value={mission.placesTotal} />
        <Details title="Place(s) occupés(s)" value={mission.placesTotal - mission.placesLeft} />
        <Details title="Place(s) disponible(s)" value={mission.placesLeft} />
        <Link to={`/mission/${mission._id}/youngs`}>
          <PanelActionButton icon="eye" title="Consulter tous les volontaires" />
        </Link>
      </Info>
      <Info title="La structure">
        <Link to={`/structure/${structure._id}`}>
          <SubtitleLink>{`${structure.name} >`}</SubtitleLink>
        </Link>
        <Details title="Statut" value={translate(structure.legalStatus)} />
        <Details title="Adresse" value={structure.address} />
        <Details title="Ville" value={structure.city} />
        <Details title="Code postal" value={structure.zip} />
        <Details title="Dép." value={structure.department} />
        <Details title="Région" value={structure.region} />
        {tutor ? (
          <>
            <Details title="Tuteur" value={`${tutor.firstName} ${tutor.lastName}`} />
            <Details title="E-mail" value={tutor.email} />
            <Details title="Tel." value={tutor.phone} />
          </>
        ) : (
          <>
            <Details title="Tuteur" value="Cette mission n'a pas de tuteur" />
            <Link to={`/mission/${mission._id}/edit`}>
              <PanelActionButton icon="pencil" title="Assigner un tuteur" />
            </Link>
          </>
        )}
      </Info>
      <Info title="La mission">
        {mission.mainDomain ? <Details title="Domaine principal" value={translate(mission.mainDomain)} /> : null}
        {mission.domains ? <Details title="Domaine(s)" value={domains.map((d) => translate(d)).join(", ")} /> : null}
        <Details title="Début" value={formatStringDateTimezoneUTC(mission.startAt)} />
        <Details title="Fin" value={formatStringDateTimezoneUTC(mission.endAt)} />
        <Details title="Adresse" value={mission.address} />
        <Details title="Ville" value={mission.city} />
        <Details title="Code postal" value={mission.zip} />
        <Details title="Dép." value={mission.department} />
        <Details title="Région" value={mission.region} />
        <Details title="Format" value={translate(mission.format)} />
        <Details title="Fréquence" value={mission.frequence} />
        <Details title="Périodes" value={mission.period.map((p) => translate(p)).join(", ")} />
        <Details title="Objectifs" value={mission.description} />
        <Details title="Actions" value={mission.actions} />
        <Details title="Contraintes" value={mission.contraintes} />
      </Info>
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

const SubtitleLink = styled(Subtitle)`
  color: #5245cc;
  text-transform: none;
  :hover {
    text-decoration: underline;
  }
`;
