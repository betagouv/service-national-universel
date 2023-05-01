import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { useParams, useHistory, NavLink } from "react-router-dom";

import Inscription from "./inscription";
import Volontaire from "./volontaire";
import Structure from "./structure";
import Mission from "./missions";
import Center from "./centers";
import VioletButton from "../../components/buttons/VioletButton";
import ExportAll from "./inscription/ExportAll";
import { ROLES } from "../../utils";
import plausibleEvent from "../../services/plausible";

export default function Dashboard() {
  const history = useHistory();
  const { currentTab } = useParams();
  const user = useSelector((state) => state.Auth.user);
  const [filter, setFilter] = useState({});

  useEffect(() => {
    const listTab = ["inscriptions", "volontaires", "structures", "missions", "centres"];
    if (!listTab.includes(currentTab)) history.push(`/dashboard/inscriptions`);
  }, [currentTab]);

  return (
    <>
      <div className=" flex flex-1 flex-col lg:flex-row">
        <nav className="flex flex-1 border-b px-3">
          <TabItem title="Inscriptions" to="/dashboard/inscriptions" />
          <TabItem title="Volontaires" to="/dashboard/volontaires" />
          <TabItem title="Structures" to="/dashboard/structures" />
          <TabItem title="Missions" to="/dashboard/missions" />
          <TabItem title="Centres" to="/dashboard/centres" />
        </nav>
        <div className="m-1 flex justify-end">
          {[ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role) && currentTab === "inscriptions" ? <ExportAll filter={filter} /> : null}
          <VioletButton
            onClick={() => {
              plausibleEvent("Dashboard/CTA - Exporter statistiques");
              print();
            }}>
            <p>Exporter les statistiques</p>
          </VioletButton>
        </div>
      </div>
      <Wrapper className="p-6">
        {currentTab === "inscriptions" && <Inscription onChangeFilter={setFilter} />}
        {currentTab === "volontaires" && <Volontaire />}
        {currentTab === "structures" && <Structure />}
        {currentTab === "missions" && <Mission />}
        {currentTab === "centres" && <Center />}
      </Wrapper>
    </>
  );
}

const TabItem = ({ to, title }) => (
  <NavLink
    to={to}
    activeClassName="text-snu-purple-800 font-bold border-b-[3px] border-snu-purple-800"
    className="cursor-pointer px-3 py-2 text-coolGray-500  hover:border-b-[3px] hover:border-snu-purple-800 hover:text-snu-purple-800">
    {title}
  </NavLink>
);

const Wrapper = styled.div`
  @media print {
    background-color: #fff;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 2rem;
    z-index: 999;
  }
`;
