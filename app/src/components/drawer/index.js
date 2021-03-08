import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { YOUNG_PHASE, YOUNG_STATUS, PHASE_STATUS, YOUNG_STATUS_PHASE1 } from "../../utils";
import Item from "./item";
import { DRAWER_TABS } from "../utils";

export default ({ inscription }) => {
  const [open, setOpen] = useState(true);
  const young = useSelector((state) => state.Auth.young);

  const [status1, setStatus1] = useState(PHASE_STATUS.IN_COMING);
  const [status2, setStatus2] = useState(PHASE_STATUS.IN_COMING);
  const [status3, setStatus3] = useState(PHASE_STATUS.IN_COMING);

  const [activeTab, setActiveTab] = useState(DRAWER_TABS.HOME);

  useEffect(() => {
    // if the young is not validated yet
    if (young.status !== YOUNG_STATUS.VALIDATED) return;

    setStatus1(young.statusPhase1);
    if (young.phase === YOUNG_PHASE.COHESION_STAY || young.phase === YOUNG_PHASE.INSCRIPTION) return;

    setStatus2(young.statusPhase2);
    if (young.phase === YOUNG_PHASE.INTEREST_MISSION) return;
  }, [young]);

  if (open) {
    document.body.classList.add("open-drawer");
  } else {
    document.body.classList.remove("open-drawer");
  }

  const getDisabled = (tab) => {
    if (tab === DRAWER_TABS.HOME) return false;
    if (young.status === YOUNG_STATUS.REFUSED) return true;
    if (tab === DRAWER_TABS.PHASE1) {
      if (young.cohort && young.cohort !== "2021") return [YOUNG_STATUS_PHASE1.CANCEL, YOUNG_STATUS_PHASE1.DONE].includes(young.statusPhase1);
      return [YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young.status);
    }
    if (tab === DRAWER_TABS.PHASE2) {
      return [YOUNG_PHASE.INSCRIPTION, YOUNG_PHASE.COHESION_STAY].includes(young.phase);
    }
    if (tab === DRAWER_TABS.PHASE3) {
      //todo handle tab phase 3
    }
    return true;
  };

  const handleClick = (e, tab) => {
    if (getDisabled(tab)) return e.preventDefault();
    setActiveTab(tab);
  };

  return (
    <Sidebar open={open}>
      <Header>
        <Logos>
          <a href="https://www.snu.gouv.fr/">
            <img src={require("../../assets/fr.png")} />
          </a>
          <a href="https://www.snu.gouv.fr/">
            <img src={require("../../assets/logo-snu.png")} />
          </a>
        </Logos>
      </Header>
      <MenuBtn onClick={() => setOpen(!open)} src={require("../../assets/menu.svg")} />
      <HomeLink exact to="/" onClick={(e) => handleClick(e, DRAWER_TABS.HOME)}>
        <div className="icon">
          <svg fill="none" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10M9 21h6"
            ></path>
          </svg>
        </div>
        Accueil
      </HomeLink>
      <MainNav>
        <Item
          title="séjour de cohésion"
          subtitle="Phase 1"
          status={status1}
          to="/phase1"
          disabled={getDisabled(DRAWER_TABS.PHASE1)}
          handleClick={(event) => handleClick(event, DRAWER_TABS.PHASE1)}
        />
        <Item
          title="mission d'intérêt général"
          subtitle="Phase 2"
          status={status2}
          to="/phase2"
          disabled={getDisabled(DRAWER_TABS.PHASE2)}
          handleClick={(event) => handleClick(event, DRAWER_TABS.PHASE2)}
          open={activeTab === DRAWER_TABS.PHASE2}
        >
          <ul className="subNav">
            <li>
              <NavLink to="/preferences">Renseigner mes préférences</NavLink>
            </li>
            <li>
              <NavLink to="/mission">Trouver une mission</NavLink>
            </li>
            <li>
              <NavLink to="/candidature">Suivre mes candidatures</NavLink>
            </li>
          </ul>
        </Item>
        <Item
          title="poursuivre mon snu"
          subtitle="Phase 3"
          status={status3}
          to="/phase3"
          disabled={getDisabled(DRAWER_TABS.PHASE3)}
          handleClick={(event) => handleClick(event, DRAWER_TABS.PHASE3)}
          open={activeTab === DRAWER_TABS.PHASE3}
        >
          <ul className="subNav">
            <li>
              <NavLink to="/phase3/les-programmes">Les programmes d'engagement</NavLink>
            </li>
            <li>
              <NavLink to="/une-mission">Trouver une mission</NavLink>
            </li>
            <li>
              <NavLink to="/phase3/valider">Valider ma phase 3</NavLink>
            </li>
          </ul>
        </Item>
      </MainNav>
      <MyNav>
        {/* <li>
          <NavLink to="/mes-missions">
            <div className="icon">
              <svg fill="none" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                ></path>
              </svg>
            </div>
            Mes missions
          </NavLink>
        </li> */}
        {/* <li>
          <NavLink to="/documents">
            <div className="icon">
              <svg fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
              </svg>
            </div>
            Mes documents
          </NavLink>
        </li> */}
        <li>
          <a href="https://www.snu.gouv.fr/foire-aux-questions-11" target="blank">
            <div className="icon">
              <svg fill="none" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            Foire aux questions
          </a>
        </li>
      </MyNav>
    </Sidebar>
  );
};

const Sidebar = styled.div`
  ::-webkit-scrollbar {
    display: none;
  }
  @media (max-width: 768px) {
    display: none;
  }
  background-color: #362f78;
  width: 15%;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  min-height: 100vh;
  overflow-y: auto;
  transition: 0.2s;
  transform: ${({ open }) => (open ? "translateX(0)" : "translateX(-85%)")};
  a {
    font-size: 13px;
    color: #fff;
    display: flex;
    align-items: center;
    font-weight: 700;
    &.active,
    :hover {
      background-color: #5145cd;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    &.disabled {
      cursor: default;
    }
    &.disabled:hover {
      background-color: transparent;
      box-shadow: none;
    }
    .icon {
      height: 24px;
      width: 24px;
      margin-right: 20px;
      svg {
        stroke: #8da2fb;
      }
    }
  }
`;

const Logos = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  a:hover {
    background-color: transparent;
    box-shadow: none;
  }
  img {
    vertical-align: top;
    height: 4rem;
    @media (max-width: 1400px) {
      height: 2.5rem;
    }
  }
`;

const Header = styled.div`
  padding: 1rem 3rem;
  margin-bottom: 2rem;
  background-color: #fff;
`;

const HomeLink = styled(NavLink)`
  padding-left: 40px;
  height: 70px;
`;

const MainNav = styled.ul`
  .subNav {
    padding-left: 70px;
    margin-top: 10px;
    a {
      font-weight: 400;
      padding: 5px 15px;
      display: inline-block;
      border-radius: 6px;
      margin-bottom: 10px;
    }
  }
`;

const MyNav = styled.ul`
  margin-top: 25px;
  padding-top: 3rem;
  border-top: 1px solid #42389d;
  li {
    padding: 2px 20px;
  }
  a {
    font-size: 0.75rem;
    padding: 12px 15px;
    border-radius: 6px;
  }
`;

const MenuBtn = styled.img`
  height: 1.5rem;
  z-index: 1;
  margin: 0.5rem;
  position: absolute;
  z-index: 12;
  top: 0;
  right: 0;
  cursor: pointer;
  /* display: none;
  @media (max-width: 767px) {
    display: block;
  } */
`;
