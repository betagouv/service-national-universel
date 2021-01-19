import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { YOUNG_STATUS } from "../utils";

import { DRAWER_TABS } from "./utils";

export default ({ inscription }) => {
  const [open, setOpen] = useState(true);
  const young = useSelector((state) => state.Auth.young);

  const [status1, setStatus1] = useState("À venir");
  const [status2, setStatus2] = useState("À venir");
  const [status3, setStatus3] = useState("À venir");

  const [activeTab, setActiveTab] = useState(DRAWER_TABS.HOME);

  useEffect(() => {
    if (young.status === YOUNG_STATUS.VALIDATED) {
      setStatus1("En attente d'affectation");
    }
  }, [young]);

  if (open) {
    document.body.classList.add("open-drawer");
  } else {
    document.body.classList.remove("open-drawer");
  }

  const getDisabled = (tab) => {
    if (tab === DRAWER_TABS.HOME) return false;
    if (tab === DRAWER_TABS.PHASE1) {
      return [YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young.status);
    }
    if (tab === DRAWER_TABS.PHASE2) {
      return [YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.VALIDATED].includes(young.status);
    }
    if (tab === DRAWER_TABS.PHASE3) {
      return [YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.VALIDATED].includes(young.status);
    }
  };

  const handleClick = (e, tab) => {
    if (getDisabled(tab)) return e.preventDefault();
    setActiveTab(tab);
  };

  return (
    <Sidebar open={open}>
      <MenuBtn onClick={() => setOpen(!open)} src={require("../assets/menu.svg")} />
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
        <li>
          <NavLink to="/phase1" onClick={(event) => handleClick(event, DRAWER_TABS.PHASE1)} className={getDisabled(DRAWER_TABS.PHASE1) ? "disabled" : undefined}>
            <div className="icon">
              <svg fill="none" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
            </div>
            <div>
              séjour de cohésion
              <span>Phase 1 • {status1}</span>
            </div>
          </NavLink>
        </li>
        <li>
          <NavLink to="/phase2" onClick={(event) => handleClick(event, DRAWER_TABS.PHASE2)} className={getDisabled(DRAWER_TABS.PHASE2) ? "disabled" : undefined}>
            <div className="icon">
              <svg fill="none" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
            <div>
              mission d'intérêt général
              <span>Phase 2 • {status2}</span>
            </div>
          </NavLink>
        </li>
        <li>
          <NavLink exact to="/phase3" onClick={(event) => handleClick(event, DRAWER_TABS.PHASE3)} className={getDisabled(DRAWER_TABS.PHASE3) ? "disabled" : undefined}>
            <div className="icon">
              <svg fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div>
              poursuivre mon snu
              <span>Phase 3 • {status3}</span>
            </div>
          </NavLink>
          {activeTab === DRAWER_TABS.PHASE3 && (
            <ul className="subNav">
              <li>
                <NavLink to="/phase3/les-programmes">Les programmes d'engagement</NavLink>
              </li>
              <li>
                <NavLink to="/phase3/une-mission">Trouver une mission</NavLink>
              </li>
              <li>
                <NavLink to="/phase3/valider">Valider ma phase 3</NavLink>
              </li>
            </ul>
          )}
        </li>
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
        {/* <li>
          <NavLink to="/preferences">
            <div className="icon">
              <svg fill="none" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                ></path>
              </svg>
            </div>
            Mes préférences
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
  @media (max-width: 768px) {
    display: none;
  }
  background-color: #362f78;
  width: 320px;
  position: sticky;
  top: 68px;
  bottom: 0;
  left: 0;
  z-index: 1;
  padding-top: 3rem;
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
    text-transform: uppercase;
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

const HomeLink = styled(NavLink)`
  padding-left: 40px;
  height: 70px;
`;

const MainNav = styled.ul`
  > li {
    margin-bottom: 5px;
    background-size: 20px;
    padding-left: 0;
    margin-bottom: 15px;
    .icon {
      height: 32px;
      width: 32px;
      border-radius: 50%;
      background-color: #8da2fb;
      display: flex;
      align-items: center;
      justify-content: center;
      svg {
        stroke: #42389d;
        height: 20px;
      }
    }
    > a {
      text-transform: uppercase;
      color: #fff;
      display: block;
      font-size: 12px;
      padding: 15px 10px 15px 35px;
      height: 70px;
      font-weight: 700;
      position: relative;
      display: flex;
      align-items: center;
    }
    span {
      display: block;
      color: #b4c6fc;
      font-size: 12px;
      font-weight: 400;
      text-transform: capitalize;
    }
    /* vertical line between */
    :not(:last-child) {
      position: relative;
      ::after {
        content: "";
        display: block;
        height: 100%;
        width: 2px;
        background-color: #8da2fb;
        position: absolute;
        left: 50px;
        top: 40px;
        z-index: -1;
      }
    }
  }
  li {
    a.done {
      .icon {
        background-color: #31c48d;
        svg {
          stroke: #fff;
        }
      }
    }
  }
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
