import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";

import { translate } from "../../../utils";
import CenterView from "./wrapper";
import api from "../../../services/api";
import PanelActionButton from "../../../components/buttons/PanelActionButton";
import { Box, BoxTitle } from "../../../components/box";

export default ({ center }) => {
  const [headCenter, setHeadCenter] = useState();
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
  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <CenterView center={center} tab="details">
        <Box>
          <Row>
            <Col md={6} style={{ borderRight: "2px solid #f4f5f7" }}>
              <Row style={{ borderBottom: "2px solid #f4f5f7" }}>
                <Wrapper>
                  <BoxTitle>Centre de Cohésion</BoxTitle>
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
                  {/* <div className="detail">
                  <div className="detail-title">Tenue livrées</div>
                  <div className="detail-text">{translate(center.outfitDelivered)}</div>
                </div> */}
                </Wrapper>
              </Row>
              <Wrapper>
                <BoxTitle>{`${center.placesTotal - center.placesLeft} volontaire(s) affecté(s)`}</BoxTitle>
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
              </Wrapper>
            </Col>
            {headCenter ? (
              <Col md={6}>
                <Wrapper>
                  <BoxTitle>Chef de centre </BoxTitle>
                  <div className="detail">
                    <div className="detail-title">Nom</div>
                    <div className="detail-text">
                      <Link to={`/user/${headCenter._id}`}>
                        {headCenter.firstName} {headCenter.lastName}
                      </Link>
                    </div>
                  </div>
                  <div className="detail">
                    <div className="detail-title">email</div>
                    <div className="detail-text">{headCenter.email}</div>
                  </div>
                  <div className="detail">
                    <div className="detail-title">Tel. mobile</div>
                    <div className="detail-text">{headCenter.mobile}</div>
                  </div>
                  <div className="detail">
                    <div className="detail-title">Tel. fixe</div>
                    <div className="detail-text">{headCenter.phone}</div>
                  </div>
                </Wrapper>
              </Col>
            ) : null}
          </Row>
        </Box>
      </CenterView>
    </div>
  );
};

const DetailCardTitle = styled.div`
  color: #7c7c7c;
`;
const DetailCardContent = styled.div`
  color: #000;
  font-size: 1.5rem;
  font-weight: 600;
`;

const Wrapper = styled.div`
  padding: 3rem;
  .detail {
    display: flex;
    align-items: flex-start;
    font-size: 1rem;
    text-align: left;
    margin-top: 1rem;
    &-title {
      min-width: 90px;
      width: 90px;
      margin-right: 1rem;
      color: #798399;
    }
    &-text {
      color: rgba(26, 32, 44);
      a {
        color: #5245cc;
        :hover {
          text-decoration: underline;
        }
      }
    }
  }
`;
