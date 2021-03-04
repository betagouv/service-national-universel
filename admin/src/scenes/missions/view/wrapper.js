import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import api from "../../../services/api";
import SelectStatusMission from "../../../components/selectStatusMission";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { translate } from "../../../utils";

export default ({ mission, tab, children }) => {
  const history = useHistory();

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr(e) de vouloir supprimer cette mission ?")) return;
    try {
      const { ok, code } = await api.remove(`/mission/${mission._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Cette mission a été supprimée.");
      return history.push(`/mission`);
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression de la mission :", translate(e.code));
    }
  };

  const duplicate = async () => {
    mission.name += " (copie)";
    delete mission._id;
    const { data, ok, code } = await api.post("/mission", mission);
    if (!ok) toastr.error("Oups, une erreur est survnue lors de la duplication de la mission", translate(code));
    toastr.success("Mission dupliquée !");
    return history.push(`/mission/${data._id}`);
  };

  if (!mission) return null;
  return (
    <div style={{ flex: tab === "missions" ? "0%" : 2, position: "relative", padding: "3rem" }}>
      <Header>
        <div style={{ flex: 1 }}>
          <Title>{mission.name}</Title>

          <TabNavigationList>
            <TabItem isActive={tab === "details"} onClick={() => history.push(`/mission/${mission._id}`)}>
              Détails
            </TabItem>
            <TabItem isActive={tab === "youngs"} onClick={() => history.push(`/mission/${mission._id}/youngs`)}>
              Volontaires
            </TabItem>
            <TabItem isActive={tab === "historic"} onClick={() => history.push(`/mission/${mission._id}/historic`)}>
              Historique
            </TabItem>
          </TabNavigationList>
        </div>
        <Row style={{ minWidth: "40%" }}>
          <Col md={4}>
            <BoxPlaces>
              <table>
                <tbody>
                  <tr>
                    <td style={{ fontSize: "2.5rem", paddingRight: "10px" }}>{mission.placesLeft}</td>
                    <td>
                      <b>Places restantes</b>
                      <br />
                      <span style={{ color: "#999" }}>
                        {mission.placesTotal - mission.placesLeft} / {mission.placesTotal}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </BoxPlaces>
          </Col>
          <Col md={8}>
            <Row>
              <Col md={12}>
                <SelectStatusMission hit={mission} />
              </Col>
            </Row>
            <Row style={{ marginTop: "0.5rem" }}>
              <Col md={4}>
                <Link to={`/mission/${mission._id}/edit`}>
                  <Button className="btn-blue">Modifier</Button>
                </Link>
              </Col>
              <Col md={4}>
                <Button onClick={duplicate} className="btn-blue">
                  Dupliquer
                </Button>
              </Col>
              <Col md={4}>
                <Button onClick={handleDelete} className="btn-red">
                  Supprimer
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Header>
      {children}
    </div>
  );
};

const TabNavigationList = styled.ul`
  display: flex;
  list-style-type: none;
`;

const TabItem = styled.li`
  padding: 0.5rem 1rem;
  position: relative;
  font-size: 1rem;
  color: #979797;
  cursor: pointer;
  font-weight: 300;
  border-radius: 0.5rem;
  overflow: hidden;

  ${(props) =>
    props.isActive &&
    `
    color: #222;
    font-weight: 500;
    background-color:#fff;

    &:after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background-color: #5245CC;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }
  `}
`;

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

const Button = styled.button`
  /* margin: 0 0.5rem; */
  align-self: flex-start;
  border-radius: 4px;
  padding: 5px;
  font-size: 12px;
  /* min-width: 100px; */
  width: 100%;
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
`;
