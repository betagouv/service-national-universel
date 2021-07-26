import React, { useState, useEffect } from "react";
import styled from "styled-components";
import api from "../../../services/api";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import { translate, userIsResponsibleFromStructureMilitaryPreparation } from "../../../utils";
import Badge from "../../../components/Badge";
import TabList from "../../../components/views/TabList";
import Tab from "../../../components/views/Tab";
import Title from "../../../components/views/Title";

export default ({ children, young, tab }) => {
  const user = useSelector((state) => state.Auth.user);
  const [showMilitaryPreparationTab, setShowMilitaryPreparationTab] = useState(false);
  useEffect(() => {
    (async () => {
      const r = await userIsResponsibleFromStructureMilitaryPreparation(user);
      setShowMilitaryPreparationTab(r);
    })();
  }, [user]);

  const history = useHistory();
  if (!young) return null;
  return (
    <div style={{ flex: 2, position: "relative", padding: "3rem" }}>
      <Header>
        <div style={{ flex: 1 }}>
          <Title>
            {young.firstName} {young.lastName} <Badge text={`Cohorte ${young.cohort}`} />
          </Title>
          <TabList>
            {tab !== "contract" ? (
              <>
                <Tab isActive={tab === "details"} onClick={() => history.push(`/volontaire/${young._id}`)}>
                  Détails
                </Tab>
                {showMilitaryPreparationTab ? (
                  <Tab
                    disabled={young.statusMilitaryPreparationFiles !== "VALIDATED"}
                    isActive={tab === "militaryPreparation"}
                    onClick={() => young.statusMilitaryPreparationFiles === "VALIDATED" && history.push(`/volontaire/${young._id}/preparation-militaire`)}
                  >
                    Préparation militaire
                  </Tab>
                ) : null}
              </>
            ) : null}
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
