import React from "react";
import styled from "styled-components";
import api from "../../../services/api";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import { translate } from "../../../utils";
import Badge from "../../../components/Badge";
import TabList from "../../../components/views/TabList";
import Tab from "../../../components/views/Tab";

export default ({ children, young, tab }) => {
  const history = useHistory();

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
          </TabList>
        </div>
      </Header>
      {children}
    </div>
  );
};

const Title = styled.div`
  display: flex;
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 10px;
  align-items: center;
`;

const Header = styled.div`
  padding: 0 25px 0;
  display: flex;
  margin-bottom: 1rem;
  align-items: flex-start;
`;
