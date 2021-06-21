import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";

import { translate } from "../../utils";
import PanelActionButton from "../../components/buttons/PanelActionButton";
import Panel from "../../components/Panel";
import api from "../../services/api";

export default ({ onChange, center }) => {
  const history = useHistory();
  const [headCenter, setHeadCenter] = useState();
  const user = useSelector((state) => state.Auth.user);

  useEffect(() => {
    (async () => {
      if (!center) return;
      const { ok, data, code } = await api.get(`/cohesion-center/${center._id}/head`);
      if (!ok) {
        setHeadCenter(null);
        toastr.error("Oups, une erreur est survenue lors de la récuperation du chef de centre", translate(code));
      } else setHeadCenter(data);
    })();
  }, [center]);

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr(e) de vouloir supprimer ce centre ?")) return;
    try {
      const { ok, code } = await api.remove(`/cohesion-center/${center._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Ce centre a été supprimé.");
      return history.push(`/centre`);
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
          {user.role === "admin" ? (
            <Link to={`/centre/${center._id}/edit`}>
              <PanelActionButton icon="pencil" title="Modifier" />
            </Link>
          ) : null}
        </div>
        {user.role === "admin" ? (
          <div style={{ display: "flex" }}>
            <PanelActionButton onClick={handleDelete} icon="bin" title="Supprimer" />
          </div>
        ) : null}
      </div>
      <div className="info">
        <div className="title">{`${center.placesTotal - center.placesLeft} volontaire(s) affecté(s)`}</div>
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
      </div>
      <div className="info">
        <div className="title">À propos du centre</div>
        <div className="detail">
          <div className="detail-title">Code</div>
          <div className="detail-text">{center.code}</div>
        </div>
        <div className="detail">
          <div className="detail-title">Adresse</div>
          <div className="detail-text">{center.address}</div>
        </div>
        <div className="detail">
          <div className="detail-title">City</div>
          <div className="detail-text">{center.city}</div>
        </div>
        <div className="detail">
          <div className="detail-title">Code postal</div>
          <div className="detail-text">{center.zip}</div>
        </div>
        <div className="detail">
          <div className="detail-title">Dép.</div>
          <div className="detail-text">{center.department}</div>
        </div>
        <div className="detail">
          <div className="detail-title">Région</div>
          <div className="detail-text">{center.region}</div>
        </div>
        {headCenter ? (
          <>
            <div className="detail">
              <div className="detail-title">Chef</div>
              <div className="detail-text">
                <Link to={`/user/${headCenter._id}`}>{`${headCenter.firstName} ${headCenter.lastName}`}</Link>
              </div>
            </div>
            <div className="detail">
              <div className="detail-title">E-mail</div>
              <a href={`mailto:${headCenter.email}`} style={{ textDecoration: "underline" }}>
                <div className="detail-text">{headCenter.email}</div>
              </a>
            </div>
            <div className="detail">
              <div className="detail-title">Tel fixe</div>
              <div className="detail-text">{headCenter.phone}</div>
            </div>
            <div className="detail">
              <div className="detail-title">Tel Mobile</div>
              <div className="detail-text">{headCenter.mobile}</div>
            </div>
          </>
        ) : null}

        {/* <div className="detail">
        <div className="detail-title">Tenue livrées</div>
        <div className="detail-text">{translate(center.outfitDelivered)}</div>
      </div> */}
      </div>
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
