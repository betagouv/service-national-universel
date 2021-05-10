import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import api from "../../../services/api";
import SelectStatusMission from "../../../components/selectStatusMission";
import { translate } from "../../../utils";
import TabList from "../../../components/views/TabList";
import Tab from "../../../components/views/Tab";
import PanelActionButton from "../../../components/buttons/PanelActionButton";

export default ({ center, tab, children }) => {
  const history = useHistory();

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr(e) de vouloir supprimer ce centre ?")) return;
    try {
      const { ok, code } = await api.remove(`/cohesion-center/${center._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      // if (!ok && code === "LINKED_OBJECT") return toastr.error("Vous ne pouvez pas supprimer ce centre car des candidatures sont encore liées à cette mission.", { timeOut: 5000 });
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Ce centre a été supprimé.");
      return history.push(`/centre`);
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression du centre :", translate(e.code));
    }
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
            <Tab isActive={tab === "affectation"} onClick={() => history.push(`/centre/${center._id}/affectation`)}>
              Affectation manuelle
            </Tab>
          </TabList>
        </div>
        <Row style={{ minWidth: "20%" }}>
          <Col>
            <BoxPlaces>
              <table>
                <tbody>
                  <tr>
                    <td style={{ fontSize: "2.5rem", paddingRight: "10px" }}>{center.placesLeft || center.placesTotal}</td>
                    <td>
                      <b>Places restantes</b>
                      <br />
                      <span style={{ color: "#999" }}>
                        {center.placesLeft ? center.placesTotal - center.placesLeft : 0} / {center.placesTotal}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </BoxPlaces>
          </Col>
          <Col>
            <Link to={`/centre/${center._id}/edit`}>
              <PanelActionButton title="Modifier" icon="pencil" style={{ margin: 0 }} />
            </Link>
          </Col>
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
