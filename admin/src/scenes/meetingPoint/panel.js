import React, { useState } from "react";
import styled from "styled-components";
import { Link, useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import { translate, ROLES, canCreateOrUpdateCohesionmeetingPoint } from "../../utils";
import PanelActionButton from "../../components/buttons/PanelActionButton";
import Panel, { Info, Details } from "../../components/Panel";
import api from "../../services/api";
import ModalConfirm from "../../components/modals/ModalConfirm";

export default function PanelmeetingPoint({ onChange, meetingPoint }) {
  const history = useHistory();
  const user = useSelector((state) => state.Auth.user);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  const onClickDelete = () => {
    setModal({ isOpen: true, onConfirm: onConfirmDelete, title: "Êtes-vous sûr(e) de vouloir supprimer ce centre de cohésion ?", message: "Cette action est irréversible." });
  };

  const onConfirmDelete = async () => {
    try {
      const { ok, code } = await api.remove(`/meeting-point/${meetingPoint._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Ce point de rassemblement a été supprimé.");
      return history.go(0);
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression du centre :", translate(e.code));
    }
  };
  if (!meetingPoint) return <div />;
  return (
    <Panel>
      <div className="info">
        <div style={{ display: "flex", marginBottom: "15px" }}>
          <Subtitle>MEETING POINT </Subtitle>
          <span style={{ color: "#9C9C9C" }}>&nbsp;#{meetingPoint._id}</span>
          <div className="close" onClick={onChange} />
        </div>
        <div className="title">{meetingPoint.name}</div>
        <div style={{ display: "flex" }}>
          <Link to={`/centre/${meetingPoint._id}`}>
            <PanelActionButton icon="eye" title="Consulter" />
          </Link>
          {canCreateOrUpdateCohesionmeetingPoint(user) ? (
            <Link to={`/centre/${meetingPoint._id}/edit`}>
              <PanelActionButton icon="pencil" title="Modifier" />
            </Link>
          ) : null}
        </div>
        {user.role === ROLES.ADMIN ? (
          <div style={{ display: "flex" }}>
            <PanelActionButton onClick={onClickDelete} icon="bin" title="Supprimer" />
          </div>
        ) : null}
      </div>
      <Info title="À propos du point de rassemblement">
        <Details title="Code" value={meetingPoint.centerCode} copy />
        <Details title="Adresse" value={meetingPoint.departureAddress} />
        <Details title="Dép." value={meetingPoint.departureDepartment} />
        <Details title="Région" value={meetingPoint.departureRegion} />
        {/* <Details title="Accessibilité aux personnes à mobilité réduite" value={translate(meetingPoint.pmr)} /> */}
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
