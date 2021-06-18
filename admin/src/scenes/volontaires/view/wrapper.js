import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import api from "../../../services/api";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import { translate, YOUNG_STATUS } from "../../../utils";
import SelectStatus from "../../../components/selectStatus";
import Badge from "../../../components/Badge";
import PanelActionButton from "../../../components/buttons/PanelActionButton";
import TabList from "../../../components/views/TabList";
import Tab from "../../../components/views/Tab";
import Title from "../../../components/views/Title";
import { appURL } from "../../../config";

export default ({ children, young, tab }) => {
  const history = useHistory();
  const user = useSelector((state) => state.Auth.user);

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr(e) de vouloir supprimer ce volontaire ?")) return;
    try {
      const { ok, code } = await api.remove(`/young/${young._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Ce volontaire a été supprimé.");
      return history.push(`/volontaire`);
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression du volontaire :", translate(e.code));
    }
  };
  if (!young) return null;
  return (
    <div style={{ flex: tab === "missions" ? "0%" : 2, position: "relative", padding: "3rem" }}>
      <Header>
        <div style={{ flex: 1 }}>
          <Title>
            {young.firstName} {young.lastName} <Badge text={`Cohorte ${young.cohort}`} />
          </Title>
          <TabList>
            <Tab isActive={tab === "details"} onClick={() => history.push(`/volontaire/${young._id}`)}>
              Détails
            </Tab>
            <Tab isActive={tab === "phase1"} onClick={() => history.push(`/volontaire/${young._id}/phase1`)}>
              Phase 1
            </Tab>
            <Tab isActive={tab === "phase2"} onClick={() => history.push(`/volontaire/${young._id}/phase2`)}>
              Phase 2
            </Tab>
            <Tab isActive={tab === "phase3"} onClick={() => history.push(`/volontaire/${young._id}/phase3`)}>
              Phase 3
            </Tab>
            {user.role === "admin" ? (
              <Tab isActive={tab === "historique"} onClick={() => history.push(`/volontaire/${young._id}/historique`)}>
                Historique <i style={{ color: "#5145cd", fontWeight: "lighter", fontSize: ".85rem" }}>Bêta</i>
              </Tab>
            ) : null}
          </TabList>
        </div>
        <Row style={{ minWidth: "30%" }}>
          <Col md={12}>
            <Row>
              <Col md={12} style={{ display: "flex", justifyContent: "flex-end" }}>
                <SelectStatus hit={young} options={[YOUNG_STATUS.VALIDATED, YOUNG_STATUS.WITHDRAWN]} />
              </Col>
            </Row>
            <Row style={{ marginTop: "0.5rem" }}>
              <a href={`${appURL}/auth/connect?token=${api.getToken()}&young_id=${young._id}`}>
                <PanelActionButton icon="impersonate" title="Prendre&nbsp;sa&nbsp;place" />
              </a>
              <Link to={`/volontaire/${young._id}/edit`}>
                <PanelActionButton icon="pencil" title="Modifier" />
              </Link>
              <PanelActionButton onClick={handleDelete} icon="bin" title="Supprimer" />
            </Row>
          </Col>
        </Row>
      </Header>
      {children}
    </div>
  );
};

const Header = styled.div`
  padding: 0 25px 0;
  display: flex;
  margin-bottom: 1rem;
  align-items: flex-start;
`;
