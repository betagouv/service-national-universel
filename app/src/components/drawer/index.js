import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { useSelector } from "react-redux";

import { YOUNG_PHASE, YOUNG_STATUS, PHASE_STATUS, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2, permissionPhase1, permissionPhase2, permissionPhase3 } from "../../utils";
import Item from "./item";
import { DRAWER_TABS } from "../utils";
import WithdrawnModal from "../WithdrawnModal";
import DownloadAttestationButton from "../buttons/DownloadAttestationButton";
import SubMenuPhase2 from "./SubMenuPhase2";
import SubMenuPhase3 from "./SubMenuPhase3";
import { environment } from "../../config";

export default (props) => {
  const [open, setOpen] = useState();
  const [status1, setStatus1] = useState(PHASE_STATUS.IN_COMING);
  const [status2, setStatus2] = useState(PHASE_STATUS.IN_COMING);
  const [status3, setStatus3] = useState(PHASE_STATUS.IN_COMING);
  const [activeTab, setActiveTab] = useState(DRAWER_TABS.HOME);
  const young = useSelector((state) => state.Auth.young);

  useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  useEffect(() => {
    // if the young is not validated yet

    if (young.status === YOUNG_STATUS.WITHDRAWN) {
      setStatus1(young.status);
      setStatus2(young.status);
      setStatus3(young.status);
    }

    if (young.status !== YOUNG_STATUS.VALIDATED) return;

    young.statusPhase1 && setStatus1(young.statusPhase1);
    if (young.phase === YOUNG_PHASE.COHESION_STAY || young.phase === YOUNG_PHASE.INSCRIPTION) return;

    young.statusPhase2 && setStatus2(young.statusPhase2);
    if (young.statusPhase2 !== YOUNG_STATUS_PHASE2.VALIDATED) return;

    young.statusPhase3 && setStatus3(young.statusPhase3);
  }, [young]);

  const getDisabled = (tab) => {
    // return false;
    if (tab === DRAWER_TABS.HOME) return false;
    if (tab === DRAWER_TABS.PHASE1) return !permissionPhase1(young);
    if (tab === DRAWER_TABS.PHASE2) return !permissionPhase2(young);
    if (tab === DRAWER_TABS.PHASE3) return !permissionPhase3(young);
    return true;
  };

  const handleClick = (e, tab, subTab = null) => {
    const blocked = getDisabled(tab);
    const p = { tab, blocked };
    subTab ? (p.subTab = subTab) : null;
    if (blocked) return e.preventDefault();
    setActiveTab(tab);
    if (open) {
      props.onOpen(false);
    }
  };

  function isDiagorienteReady() {
    return environment !== "production" || new Date() > new Date("2021-06-21");
  }

  return (
    <>
      <Sidebar open={open}>
        <Header>
          <Logos>
            <a href="https://www.snu.gouv.fr/">
              <img src={require("../../assets/fr.png")} />
            </a>
            <a href="https://www.snu.gouv.fr/">
              <img src={require("../../assets/logo-snu.png")} />
            </a>
            <Close onClick={() => props.onOpen(false)}>&times;</Close>
          </Logos>
        </Header>
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
            phase="1"
            subtitle="Phase 1"
            status={status1}
            to="/phase1"
            disabled={getDisabled(DRAWER_TABS.PHASE1)}
            handleClick={(event) => handleClick(event, DRAWER_TABS.PHASE1)}
            open={activeTab === DRAWER_TABS.PHASE1}
          >
            {/* <ul className="subNav">
              {young.statusPhase1 === "DONE" && young.cohesionCenterName ? (
                <li>
                  <DownloadAttestationButton class="subNav-item" young={young} uri="1">
                    Télécharger mon attestation
                  </DownloadAttestationButton>
                </li>
              ) : null}
            </ul> */}
          </Item>
          <Item
            title="mission d'intérêt général"
            phase="2"
            subtitle="Phase 2"
            status={status2}
            to="/phase2"
            disabled={getDisabled(DRAWER_TABS.PHASE2)}
            handleClick={(event) => handleClick(event, DRAWER_TABS.PHASE2)}
            open={activeTab === DRAWER_TABS.PHASE2}
          >
            <SubMenuPhase2 young={young} handleClick={handleClick} />
          </Item>
          <Item
            title="poursuivre mon snu"
            phase="3"
            subtitle="Phase 3"
            status={status3}
            to="/phase3"
            disabled={getDisabled(DRAWER_TABS.PHASE3)}
            handleClick={(event) => handleClick(event, DRAWER_TABS.PHASE3)}
            open={activeTab === DRAWER_TABS.PHASE3}
          >
            <SubMenuPhase3 young={young} handleClick={handleClick} />
          </Item>
        </MainNav>
        <ul className="subNav"></ul>
        <MyNav>
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
          {isDiagorienteReady() && (
            <DiagorienteButton>
              <NavLink to="/diagoriente" onClick={(event) => handleClick(event, DRAWER_TABS.HOME)}>
                <img src={require("../../assets/logo-diagoriente-white.png")} />
                Outil d'aide à l'orientation
              </NavLink>
            </DiagorienteButton>
          )}
          {young.statusPhase1 === "DONE" && young.statusPhase2 === "VALIDATED" ? (
            <DrawerButton>
              <DownloadAttestationButton young={young} uri="snu">
                Télécharger mon attestation SNU
              </DownloadAttestationButton>
            </DrawerButton>
          ) : null}
          <DrawerButton>
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
          </DrawerButton>
          {young.status === YOUNG_STATUS.VALIDATED ? (
            <DrawerButton>
              <DeleteAccountButton young={young} />
            </DrawerButton>
          ) : null}
        </MyNav>
      </Sidebar>
    </>
  );
};

const DeleteAccountButton = ({ young }) => {
  const [modal, setModal] = useState(null);
  const mandatoryPhasesDone = young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE && young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED;
  const getLabel = () => (mandatoryPhasesDone ? "Supprimer mon compte" : "Se désister du SNU");

  return (
    <>
      {modal && <WithdrawnModal status={modal} value={young} onChange={() => setModal(null)} />}
      <div onClick={mandatoryPhasesDone ? () => setModal("DELETED") : () => setModal("WITHDRAWN")}>{getLabel()}</div>
    </>
  );
};

const Sidebar = styled.div`
  ::-webkit-scrollbar {
    display: none;
  }
  @media (max-width: 767px) {
    transform: translateX(${({ open }) => (open ? 0 : "-105%")});
    opacity: 1;
    visibility: visible;
    height: 100vh;
    width: 100vw;
    z-index: 11;
    position: fixed;
  }
  background-color: #362f78;
  width: 15%;
  position: sticky;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  height: 100vh;
  min-width: 250px;
  overflow-y: auto;
  transition: 0.2s;
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
    margin: 0 1rem;
    vertical-align: top;
    height: 4rem;
    @media (max-width: 1400px) {
      height: 2.5rem;
      .mobileHide {
        height: 80px;
      }
    }
  }
`;

const Header = styled.div`
  padding: 1rem;
  margin-bottom: 2rem;
  background-color: #fff;
  @media (max-width: 1400px) {
    padding: 0.5rem;
  }
`;

const HomeLink = styled(NavLink)`
  padding-left: 40px;
  height: 70px;
`;

const MainNav = styled.ul`
  .subNav {
    padding-left: 70px;
    margin-top: 10px;
    a,
    .subNav-item {
      cursor: pointer;
      font-weight: 400;
      padding: 5px 15px;
      display: inline-block;
      border-radius: 6px;
      margin-bottom: 10px;
      font-size: 13px;
      color: #fff;
      align-items: center;
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
  }
`;

const MyNav = styled.ul`
  margin-top: 25px;
  padding-top: 1rem;
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

const Close = styled.div`
  font-size: 32px;
  color: #666;
  padding: 0 15px 20px;
  display: none;
  width: 45px;
  padding: 0 15px;
  @media (max-width: 767px) {
    display: block;
  }
`;

const DrawerButton = styled.li`
  margin-bottom: 0.5rem;
  padding: 2px 20px;
  > * {
    cursor: pointer;
    font-size: 0.75rem;
    padding: 12px 15px;
    border-radius: 6px;
    color: ${({ color }) => (color ? color : "#fff")};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    &.active,
    :hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      background-color: ${({ color }) => (color ? "transparent" : "#5145cd")};
      border: ${({ color }) => (color ? "" : "none")};
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

const DiagorienteButton = styled.li`
  margin-bottom: 0.5rem;
  padding: 2px 20px;
  > * {
    cursor: pointer;
    font-size: 0.75rem;
    padding: 12px 15px;
    border-radius: 6px;
    border: solid;
    border-width: thin;
    flex-direction: column;
    color: ${({ color }) => (color ? color : "#fff")};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    &.active,
    :hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      background-color: ${({ color }) => (color ? "transparent" : "#5145cd")};
    }
    &.disabled {
      cursor: default;
    }
    &.disabled:hover {
      background-color: transparent;
      box-shadow: none;
    }
  }
`;
