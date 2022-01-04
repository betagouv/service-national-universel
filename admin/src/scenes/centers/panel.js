import React, { useState } from "react";
import styled from "styled-components";
import { Link, useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import { translate, ROLES, canCreateOrUpdateCohesionCenter } from "../../utils";
import PanelActionButton from "../../components/buttons/PanelActionButton";
import Panel, { Info, Details } from "../../components/Panel";
import api from "../../services/api";
import ModalConfirm from "../../components/modals/ModalConfirm";

export default function PanelCenter({ onChange, center }) {
  const history = useHistory();
  const user = useSelector((state) => state.Auth.user);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  const onClickDelete = () => {
    setModal({ isOpen: true, onConfirm: onConfirmDelete, title: "Êtes-vous sûr(e) de vouloir supprimer ce centre de cohésion ?", message: "Cette action est irréversible." });
  };

  const onConfirmDelete = async () => {
    try {
      const { ok, code } = await api.remove(`/cohesion-center/${center._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Ce centre a été supprimé.");
      return history.go(0);
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression du centre :", translate(e.code));
    }
  };
  if (!center) return <div />;
  return (
    <Panel>
      <div className="info">
        <div style={{ display: "flex", marginBottom: "15px" }}>
          <Subtitle>CENTRE </Subtitle>
          <span style={{ color: "#9C9C9C" }}> #{center._id}</span>
          <div className="close" onClick={onChange} />
        </div>
        <div className="title">{center.name}</div>
        <div style={{ display: "flex" }}>
          <Link to={`/centre/${center._id}`}>
            <PanelActionButton icon="eye" title="Consulter" />
          </Link>
          {canCreateOrUpdateCohesionCenter(user) ? (
            <Link to={`/centre/${center._id}/edit`}>
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
      {/* TODO : revoir l'ux pour potentiellement afficher les dispos des différents sessionPhase1 ? */}
      {/* <Info title={`${center.placesTotal - center.placesLeft} volontaire(s) affecté(s)`}>
        {center.placesTotal - center.placesLeft > 0 ? (
          <Link to={`/centre/${center._id}/volontaires`}>
            <PanelActionButton style={{ marginBottom: "1rem" }} icon="eye" title="Consulter tous les volontaires affectés" />
          </Link>
        ) : null}
        <Row>
          <Col md={6}>
            <div>
              <DetailCardTitle>Taux d&apos;occupation</DetailCardTitle>
              <DetailCardContent>{`${center.placesTotal ? (((center.placesTotal - center.placesLeft) * 100) / center.placesTotal).toFixed(2) : 0} %`}</DetailCardContent>
            </div>
          </Col>
          <Col md={6}>
            <div>
              <DetailCardTitle>Places disponibles</DetailCardTitle>
              <DetailCardContent>{center.placesLeft}</DetailCardContent>
            </div>
          </Col>
        </Row>
      </Info> */}
      <Info title="À propos du centre">
        <Details title="Capacité d'accueil" value={center.placesTotal} />
        <Details title="Adresse" value={center.address} />
        <Details title="Ville" value={center.city} />
        <Details title="Code postal" value={center.zip} />
        <Details title="Dép." value={center.department} />
        <Details title="Région" value={center.region} />
        <Details title="Accessibilité aux personnes à mobilité réduite" value={translate(center.pmr)} />
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
