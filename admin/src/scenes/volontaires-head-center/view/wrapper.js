import React from "react";
import styled from "styled-components";
import api from "../../../services/api";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import { translate } from "../../../utils";
import Badge from "../../../components/Badge";
import TabList from "../../../components/views/TabList";
import Tab from "../../../components/views/Tab";
import Title from "../../../components/views/Title";

export default ({ children, young, tab }) => {
  const history = useHistory();
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

const Header = styled.div`
  padding: 0 25px 0;
  display: flex;
  margin-bottom: 1rem;
  align-items: flex-start;
`;
