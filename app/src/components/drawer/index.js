import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";

import { setYoung } from "../../redux/auth/actions";
import { YOUNG_PHASE, YOUNG_STATUS, PHASE_STATUS, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2 } from "../../utils";
import Item from "./item";
import { DRAWER_TABS } from "../utils";
import api from "../../services/api";

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
    if (young.status !== YOUNG_STATUS.VALIDATED) return;

    setStatus1(young.statusPhase1);
    if (young.phase === YOUNG_PHASE.COHESION_STAY || young.phase === YOUNG_PHASE.INSCRIPTION) return;

    setStatus2(young.statusPhase2);
    if (young.phase === YOUNG_PHASE.INTEREST_MISSION) return;
  }, [young]);

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
    if (open) {
      props.onOpen(false);
    }
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
          <NavLink to="/documents">
            <div className="icon">
              <svg fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
              </svg>
            </div>
            Mes documents
          </NavLink>
        </li> */}
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
        <DrawerButton>
          <DeleteAccountButton young={young} />
        </DrawerButton>
      </MyNav>
    </Sidebar>
  );
};

const DeleteAccountButton = ({ young }) => {
  const mandatoryPhasesDone = young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE && young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED;
  const dispatch = useDispatch();

  const getLabel = () => {
    return mandatoryPhasesDone ? "Supprimer mon compte" : "Se désister du SNU";
  };

  const handleDelete = async () => {
    if (!confirm("Attention, vous êtes sur le point de supprimer votre compte. Vous serez immédiatement déconnecté. Souhaitez-vous réellement supprimer votre compte ?")) return;
    // todo : anonymiser data
    const { ok, code } = await api.put("/young", { status: "DELETED" });
    if (!ok) return toastr.error("Une erreur est survenu lors du traitement de votre demande", translate(code));
    logout();
  };

  const handleWithdrawn = async () => {
    if (!confirm("Attention, vous êtes sur le point de vous désister du SNU. Vous serez immédiatement déconnecté. Souhaitez-vous réellement vous désister ?")) return;
    const { ok, code } = await api.put("/young", { status: "WITHDRAWN" });
    if (!ok) return toastr.error("Une erreur est survenu lors du traitement de votre demande", translate(code));
    // todo : send notif to young and referent
    logout();
  };

  async function logout() {
    await api.post(`/young/logout`);
    dispatch(setYoung(null));
  }

  return <div onClick={mandatoryPhasesDone ? handleDelete : handleWithdrawn}>{getLabel()}</div>;
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
  @media (max-width: 767px) {
    padding: 0.5rem 0.5rem;
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
