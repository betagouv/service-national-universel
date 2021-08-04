import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import api from "../../../services/api";
import SelectStatusMission from "../../../components/selectStatusMission";
import { translate, canAssignCohesionCenter, ROLES } from "../../../utils";
import TabList from "../../../components/views/TabList";
import Tab from "../../../components/views/Tab";
import PanelActionButton from "../../../components/buttons/PanelActionButton";

export default ({ center: centerDefault, tab, children }) => {
  const history = useHistory();
  const [center, setCenter] = useState(centerDefault);
  const user = useSelector((state) => state.Auth.user);

  const up = async () => {
    if (!center) return;
    const centerResponse = await api.post(`/cohesion-center/refresh/${center._id}`);
    if (!centerResponse.ok) return toastr.error("Oups, une erreur est survenue lors de la mise a jour des places", translate(centerResponse.code));
    setCenter(centerResponse.data);
  };

  if (!center) return null;
  return (
    <div style={{ flex: tab === "missions" ? "0%" : 2, position: "relative", padding: "3rem" }}>
      <Header>
        <div style={{ flex: 1 }}>
          <Title>{center.name}</Title>

          <TabList>
            <Tab isActive={tab === "details"} onClick={() => history.push(`/centre/${center._id}`)}>
              Détails
            </Tab>
            <Tab isActive={tab === "volontaires"} onClick={() => history.push(`/centre/${center._id}/volontaires`)}>
              Volontaires
            </Tab>
            <Tab isActive={tab === "waiting_list"} onClick={() => history.push(`/centre/${center._id}/liste-attente`)}>
              Liste d'attente
            </Tab>
            {canAssignCohesionCenter(user) ? (
              <Tab isActive={tab === "affectation"} onClick={() => history.push(`/centre/${center._id}/affectation`)}>
                Affectation manuelle
              </Tab>
            ) : null}
          </TabList>
        </div>
        <Row style={{ minWidth: "20%" }}>
          <Col>
            <BoxPlaces onClick={up}>
              <table>
                <tbody>
                  <tr>
                    <td style={{ fontSize: "2.5rem", paddingRight: "10px" }}>{Math.max(0, center.placesLeft)}</td>
                    <td>
                      <b>Places restantes</b>
                      <br />
                      <span style={{ color: "#999" }}>
                        {center.placesTotal - center.placesLeft} / {center.placesTotal}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </BoxPlaces>
          </Col>
          {user.role === ROLES.ADMIN ? (
            <Col>
              <Link to={`/centre/${center._id}/edit`}>
                <PanelActionButton title="Modifier" icon="pencil" style={{ margin: 0 }} />
              </Link>
            </Col>
          ) : null}
        </Row>
      </Header>
      {children}
    </div>
  );
};

const Title = styled.div`
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 10px;
`;

const Header = styled.div`
  padding: 0 25px 0;
  display: flex;
  margin: 2rem 0 1rem 0;
  align-items: flex-start;
`;

const Box = styled.div`
  width: ${(props) => props.width || 100}%;
  height: 100%;
  background-color: #fff;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05));
  border-radius: 8px;
`;

const BoxPlaces = styled(Box)`
  padding: 0 1rem;
  display: flex;
  align-items: center;
  min-height: 5rem;
  h1 {
    font-size: 3rem;
    margin: 0;
  }
  p {
    margin-left: 1rem;
    font-size: 0.8rem;
    color: black;
    &.places {
      color: #777;
    }
  }
`;
