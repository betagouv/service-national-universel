import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";

import { YOUNG_PHASE, YOUNG_STATUS, PHASE_STATUS, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2, permissionPhase1, permissionPhase2, permissionPhase3, translate } from "../../utils";
import Item from "./item";
import { DRAWER_TABS } from "../utils";
import SubMenuPhase2 from "./SubMenuPhase2";
import SubMenuPhase3 from "./SubMenuPhase3";
import { environment } from "../../config";
import ModalConfirm from "../../components/modals/ModalConfirm";
import ModalConfirmWithMessage from "../../components/modals/ModalConfirmWithMessage";
import api from "../../services/api";
import { setYoung } from "../../redux/auth/actions";
import HelpButton from "../buttons/HelpButton";

export default function Drawer(props) {
  const [open, setOpen] = useState();
  const [status1, setStatus1] = useState(PHASE_STATUS.IN_COMING);
  const [status2, setStatus2] = useState(PHASE_STATUS.IN_COMING);
  const [status3, setStatus3] = useState(PHASE_STATUS.IN_COMING);
  const [activeTab, setActiveTab] = useState(DRAWER_TABS.HOME);
  const young = useSelector((state) => state.Auth.young);

  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname === "/") return setActiveTab(DRAWER_TABS.HOME);
    if (pathname.indexOf("/phase1") !== -1) return setActiveTab(DRAWER_TABS.PHASE1);
    if (pathname.indexOf("/phase2") !== -1) return setActiveTab(DRAWER_TABS.PHASE2);
    if (pathname.indexOf("/phase3") !== -1) return setActiveTab(DRAWER_TABS.PHASE3);
  }, [pathname]);

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
                d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10M9 21h6"></path>
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
            open={activeTab === DRAWER_TABS.PHASE1}>
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
            open={activeTab === DRAWER_TABS.PHASE2}>
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
            open={activeTab === DRAWER_TABS.PHASE3}>
            <SubMenuPhase3 young={young} handleClick={handleClick} />
          </Item>
        </MainNav>
        <MyNav>
          <div>
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
            <HelpButton to="/besoin-d-aide" />
            {/* {young.statusPhase1 === "DONE" && young.statusPhase2 === "VALIDATED" ? (
            <DrawerButton>
              <DownloadAttestationButton young={young} uri="snu">
                Télécharger mon attestation SNU
              </DownloadAttestationButton>
            </DrawerButton>
          ) : null} */}
            {[YOUNG_STATUS.VALIDATED, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_VALIDATION].includes(young.status) ? (
              <DrawerButton>
                <DeleteAccountButton young={young} />
              </DrawerButton>
            ) : null}
          </div>
          <div>
            {isDiagorienteReady() && (
              <DiagorienteButton>
                <NavLink to="/diagoriente" onClick={(event) => handleClick(event, DRAWER_TABS.HOME)}>
                  <img src={require("../../assets/logo-diagoriente-white.png")} />
                  Outil d&apos;aide à l&apos;orientation
                </NavLink>
              </DiagorienteButton>
            )}
            <SocialMedia />
          </div>
        </MyNav>
      </Sidebar>
    </>
  );
}

const DeleteAccountButton = ({ young }) => {
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [modalConfirmWithMessage, setModalConfirmWithMessage] = useState({ isOpen: false, onConfirm: null });
  const mandatoryPhasesDone = young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE && young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED;
  const getLabel = () => (mandatoryPhasesDone ? "Supprimer mon compte" : "Se désister du SNU");
  const dispatch = useDispatch();

  const onConfirm = async (status, note) => {
    young.historic.push({ phase: young.phase, userName: `${young.firstName} ${young.lastName}`, userId: young._id, status, note });
    young.status = status;
    if (note) young.withdrawnMessage = note;
    young.lastStatusAt = Date.now();
    try {
      const { ok, code } = await api.put(`/young`, young);
      if (!ok) return toastr.error("Une erreur est survenu lors du traitement de votre demande :", translate(code));
      logout();
    } catch (e) {
      console.log(e);
      toastr.error("Oups, une erreur est survenue :", translate(e.code));
    }
  };

  async function logout() {
    await api.post(`/young/logout`);
    dispatch(setYoung(null));
  }

  return (
    <>
      <div onClick={mandatoryPhasesDone ? () => setModal({ isOpen: true }) : () => setModalConfirmWithMessage({ isOpen: true })}>{getLabel()}</div>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title="Suppression du compte SNU"
        message="Vous êtes sur le point de supprimer votre compte. Vous serez immédiatement déconnecté(e). Souhaitez-vous réellement supprimer votre compte ?"
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          onConfirm(YOUNG_STATUS.DELETED);
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
      <ModalConfirmWithMessage
        isOpen={modalConfirmWithMessage.isOpen}
        title="Désistement du SNU"
        message="Veuillez précisez le motif de votre désistement ci-dessous avant de valider."
        onChange={() => setModalConfirmWithMessage({ isOpen: false, data: null })}
        onConfirm={(msg) => {
          onConfirm(YOUNG_STATUS.WITHDRAWN, msg);
          setModalConfirmWithMessage({ isOpen: false, onConfirm: null });
        }}
      />
    </>
  );
};

const SocialMedia = () => {
  const medias = [
    {
      link: "https://www.facebook.com/snu.jemengage/",
      svg: "M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z",
    },
    {
      link: "https://twitter.com/snujemengage",
      svg: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z",
    },
    {
      link: "https://www.instagram.com/snujemengage/",
      svg: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
    },
  ];
  return (
    <IconsBar>
      {medias.map((el, index) => (
        <a key={index} href={el.link} target="_blank" style={{ decoration: "none", borderRadius: "100%", padding: "0" }} rel="noreferrer">
          <IconContainer>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d={el.svg}></path>
            </svg>
          </IconContainer>
        </a>
      ))}
    </IconsBar>
  );
};

const IconsBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem 0;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 99999px;
  cursor: pointer;
  > svg {
    fill: white;
  }
  :hover {
    background-color: white;
    > svg {
      fill: #362f78;
    }
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
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
    color: #f5f5f5;
    display: flex;
    align-items: center;
    font-weight: 700;
    &.active,
    :hover {
      color: #fff;
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
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
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
