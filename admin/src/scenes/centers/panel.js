import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";

import { translate, ROLES } from "../../utils";
import PanelActionButton from "../../components/buttons/PanelActionButton";
import Panel, { Info, Details } from "../../components/Panel";
import api from "../../services/api";
import ModalConfirm from "../../components/modals/ModalConfirm";

export default ({ onChange, center }) => {
  const history = useHistory();
  const [headCenter, setHeadCenter] = useState();
  const user = useSelector((state) => state.Auth.user);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  useEffect(() => {
    (async () => {
      if (!center) return;
      const { ok, data, code } = await api.get(`/cohesion-center/${center._id}/head`);
      if (!ok) {
        setHeadCenter(null);
        toastr.error("Oups, une erreur est survenue lors de la récupération du chef de centre", translate(code));
      } else setHeadCenter(data);
    })();
  }, [center]);

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
          <Subtitle>CENTRE</Subtitle>
          <div className="close" onClick={onChange} />
        </div>
        <div className="title">{center.name}</div>
        <div style={{ display: "flex" }}>
          <Link to={`/centre/${center._id}`}>
            <PanelActionButton icon="eye" title="Consulter" />
          </Link>
          {user.role === ROLES.ADMIN ? (
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
      <Info title={`${center.placesTotal - center.placesLeft} volontaire(s) affecté(s)`}>
        {center.placesTotal - center.placesLeft > 0 ? (
          <Link to={`/centre/${center._id}/volontaires`}>
            <PanelActionButton style={{ marginBottom: "1rem" }} icon="eye" title="Consulter tous les volontaires affectés" />
          </Link>
        ) : null}
        <Row>
          <Col md={6}>
            <div>
              <DetailCardTitle>Taux d'occupation</DetailCardTitle>
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
      </Info>
      <Info title="À propos du centre">
        <Details title="Code" value={center.code} copy />
        <Details title="Adresse" value={center.address} />
        <Details title="Ville" value={center.city} />
        <Details title="Code postal" value={center.zip} />
        <Details title="Dép." value={center.department} />
        <Details title="Région" value={center.region} />
        {headCenter ? (
          <>
            {/* <Link to={`/user/${headCenter._id}`}>{`${headCenter.firstName} ${headCenter.lastName}`}</Link> */}
            <Details title="Chef" value={`${headCenter.firstName} ${headCenter.lastName}`} />
            <Details title="E-mail" value={headCenter.email} copy />
            <Details title="Tel. fixe" value={headCenter.phone} copy />
            <Details title="Tel. mobile" value={headCenter.mobile} copy />
          </>
        ) : null}
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
};

const Subtitle = styled.div`
  color: rgb(113, 128, 150);
  font-weight: 400;
  text-transform: uppercase;
  font-size: 0.9rem;
`;

const DetailCardTitle = styled.div`
  color: #7c7c7c;
`;
const DetailCardContent = styled.div`
  color: #000;
  font-size: 1.5rem;
  font-weight: 600;
`;
