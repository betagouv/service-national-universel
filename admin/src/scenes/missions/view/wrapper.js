import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import api from "../../../services/api";
import SelectStatusMission from "../../../components/selectStatusMission";
import { translate, ROLES, colors } from "../../../utils";
import TabList from "../../../components/views/TabList";
import Tab from "../../../components/views/Tab";
import PanelActionButton from "../../../components/buttons/PanelActionButton";
import Badge from "../../../components/Badge";
import Title from "../../../components/views/Title";
import ModalConfirm from "../../../components/modals/ModalConfirm";

export default ({ mission, tab, children }) => {
  const history = useHistory();
  const user = useSelector((state) => state.Auth.user);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

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
      return history.push(`/mission`);
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
          <Title>
            {mission.name} {mission.isMilitaryPreparation === "true" ? <Badge text="Préparation Militaire" /> : null}
          </Title>
          <TabList>
            <Tab isActive={tab === "details"} onClick={() => history.push(`/mission/${mission._id}`)}>
              Détails
            </Tab>
            <Tab isActive={tab === "youngs"} onClick={() => history.push(`/mission/${mission._id}/youngs`)}>
              Volontaires
            </Tab>
            {user.role === ROLES.ADMIN ? (
              <Tab isActive={tab === "historique"} onClick={() => history.push(`/mission/${mission._id}/historique`)}>
                Historique <i style={{ color: colors.purple, fontWeight: "lighter", fontSize: ".85rem" }}>Bêta</i>
              </Tab>
            ) : null}
          </TabList>
        </div>
        <Row style={{ minWidth: "30%" }}>
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
              <Col md={12} style={{ display: "flex", justifyContent: "flex-end", minHeight: "35px" }}>
                <SelectStatusMission hit={mission} />
              </Col>
            </Row>
            <Row style={{ marginTop: "0.5rem" }}>
              <Link to={`/mission/${mission._id}/edit`}>
                <PanelActionButton title="Modifier" icon="pencil" />
              </Link>
              <PanelActionButton onClick={onClickDuplicate} title="Dupliquer" icon="duplicate" />
              <PanelActionButton onClick={onClickDelete} title="Supprimer" icon="bin" />
            </Row>
          </Col>
        </Row>
      </Header>
      {children}
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
    </div>
  );
};

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
