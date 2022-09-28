import React, { useEffect, useState } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  YOUNG_STATUS,
  PHASE_STATUS,
  YOUNG_STATUS_PHASE1,
  YOUNG_STATUS_PHASE2,
  YOUNG_STATUS_PHASE3,
  permissionPhase1,
  permissionPhase2,
  permissionPhase3,
  urlWithScheme,
  translate,
  translatePhase1,
  translatePhase2,
} from "../../utils";
import { DRAWER_TABS } from "../utils";
import SubMenuPhase3 from "./SubMenuPhase3";
import { environment } from "../../config";
import plausibleEvent from "../../services/plausible";
import Help from "../../assets/help.svg";
import SNU from "../../assets/logo-snu.png";

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
    if (young.status === YOUNG_STATUS.WITHDRAWN) {
      setStatus1(young.statusPhase1);
      setStatus2(young.statusPhase2);
      setStatus3(young.statusPhase3);
    }

    // si le jeune a abandonné son inscription, on lui affiche pas ses status
    // on affiche tout à "desisté"
    if (young.status === YOUNG_STATUS.ABANDONED) {
      setStatus1(YOUNG_STATUS.WITHDRAWN);
      setStatus2(YOUNG_STATUS.WITHDRAWN);
      setStatus3(YOUNG_STATUS.WITHDRAWN);
    }

    // si le jeune n'est pas validé, ni désisté
    // -> on ne le considère pas encore dans le snu et on affiche donc les status "IN_COMING"
    // ou les status lié au moment de son désistement
    if (young.status !== YOUNG_STATUS.VALIDATED) return;

    young.statusPhase1 && setStatus1(young.statusPhase1);
    if (young.statusPhase2 === YOUNG_STATUS_PHASE2.WITHDRAWN) {
      setStatus2(YOUNG_STATUS_PHASE2.WITHDRAWN);
      setStatus3(YOUNG_STATUS_PHASE3.WITHDRAWN);
      return;
    }
    if (![YOUNG_STATUS_PHASE1.DONE, YOUNG_STATUS_PHASE1.EXEMPTED].includes(young.statusPhase1)) return;

    young.statusPhase2 && setStatus2(young.statusPhase2);
    if (young.statusPhase2 === YOUNG_STATUS_PHASE2.WITHDRAWN) return setStatus3(YOUNG_STATUS_PHASE3.WITHDRAWN);
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
      <div
        open={open}
        className={`bg-[#212B44] flex flex-col w-1/6 min-w-[250px] h-screen sticky top-0 bottom-0 left-0 z-[1] overflow-y-auto duration-200 m:opacity-[1] m:visible m:h-screen m:w-screen m:z-[11] m:fixed ${
          open ? "m:translate-x-0" : "m:translate-x-[-105%]"
        }`}>
        {/* Header--- */}
        <div className="p-4 mb-8 l:p-2 bg-[#212B44] border-b border-b-[#2A3655]">
          <div className=" flex cursor-pointer items-center justify-between">
            <a href="https://www.snu.gouv.fr/" className="flex items-center">
              <img src={SNU} className="h-14 mr-4 l:h-10" />
              <div className=" text-[#D2DAEF] font-medium text-[11px] uppercase">
                <div>Service</div>
                <div>National </div>
                <div>Universel</div>
              </div>
            </a>
            <div className={`hidden text-[32px] text-[#666] px-4 m:block`} onClick={() => props.onOpen(false)}>
              &times;
            </div>
          </div>
        </div>
        {/* Menu--- */}
        <div className="flex flex-col justify-between h-full">
          <div className="flex flex-col text-[#BCC6DF] text-sm p-2 basis-[50%]">
            <NavLink
              exact
              to="/"
              onClick={(e) => handleClick(e, DRAWER_TABS.HOME)}
              className="flex space-x-4 items-center rounded-md p-2 hover:text-[#67A4FF] hover:bg-[#344264] focus:bg-[#344264] focus:text-[#67A4FF] ">
              <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                <path
                  stroke="#7A90C3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.3"
                  d="M1.5 9l1.667-1.667m0 0L9 1.5l5.833 5.833m-11.666 0v8.334c0 .46.373.833.833.833h2.5m8.333-9.167L16.5 9m-1.667-1.667v8.334c0 .46-.373.833-.833.833h-2.5m-5 0c.46 0 .833-.373.833-.833v-3.334c0-.46.373-.833.834-.833h1.666c.46 0 .834.373.834.833v3.334c0 .46.373.833.833.833m-5 0h5"></path>
              </svg>
              <div>Accueil</div>
            </NavLink>
            {/* A finir / retravailler => Phases 1/2/3 */}
            <div className="list-none">
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
                {/* <SubMenuPhase2 young={young} handleClick={handleClick} /> */}
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
            </div>
            <NavLink
              className="p-2 flex space-x-4 mt-6 cursor-pointer hover:text-[#67A4FF] hover:bg-[#344264] focus:bg-[#344264] focus:text-[#67A4FF] rounded-md items-center"
              to={`/besoin-d-aide?from=${window.location.pathname}`}
              onClick={() => {
                plausibleEvent("Compte/CTA - Aide", { url: decodeURIComponent(window.location.search).split("?from=")[1] });
              }}>
              <img src={Help} className="w-4" />
              <div>Besoin d&apos;aide ?</div>
            </NavLink>
          </div>

          <div className="list-none flex flex-col justify-between text-[#BCC6DF] p-4 basis-[50%]">
            <div className="flex flex-col items-center">
              {[YOUNG_STATUS.VALIDATED, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_LIST].includes(young.status) ? (
                <div className="text-xs cursor-pointer w-full p-2 mb-4 rounded-lg flex justify-center">
                  <DeleteAccountButton young={young} />
                </div>
              ) : null}

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

              {/* {young.statusPhase1 === "DONE" && young.statusPhase2 === "VALIDATED" ? (
              <DrawerButton>
              <DownloadAttestationButton young={young} uri="snu">
                Télécharger mon attestation SNU
              </DownloadAttestationButton>
            </DrawerButton>
            ) : null} */}

              {isDiagorienteReady() && (
                <NavLink
                  className="cursor-pointer text-sm py-2 px-[15px] flex items-center flex-col justify-center text-center text-[#4E6295] hover:text-[#67A4FF] hover:bg-[#344264] focus:bg-[#344264] focus:text-[#67A4FF] border border-[#4E6295] rounded-lg"
                  to="/diagoriente"
                  onClick={(event) => handleClick(event, DRAWER_TABS.HOME)}>
                  <img src={require("../../assets/logo-diagoriente-white.png")} />
                  <div className="text-xs">Outil d&apos;aide à l&apos;orientation</div>
                </NavLink>
              )}
            </div>
            <div className="flex justify-end">
              <SocialMedia />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const DeleteAccountButton = ({ young }) => {
  const mandatoryPhasesDone = young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE && young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED;
  const inscriptionStatus = [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young.status);
  const getLabel = () => (mandatoryPhasesDone ? "Supprimer mon compte" : inscriptionStatus ? "Abandonner mon inscription" : "Se désister du SNU");

  return (
    <Link className="hover:text-[#67A4FF]" to="/desistement">
      {getLabel()}
    </Link>
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
    <div className="flex items-center justify-center space-x-2">
      {medias.map((el, index) => (
        <a key={index} href={urlWithScheme(el.link)} target="_blank" style={{ decoration: "none", borderRadius: "100%", padding: "0" }} rel="noreferrer">
          <div className="flex items-center justify-center p-2 rounded-full hover:bg-[#344264]">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d={el.svg} fill="#7A90C3"></path>
            </svg>
          </div>
        </a>
      ))}
    </div>
  );
};

// A finir / retravailler
const Item = ({ subtitle, to, status, handleClick, disabled, children, open, phase }) => {
  const [icon, setIcon] = useState();
  const translator = (el) => {
    if (to === "/phase1") {
      return translatePhase1(el);
    } else if (to === "/phase2") {
      return translatePhase2(el);
    } else {
      return translate(el);
    }
  };

  useEffect(() => {
    if (phase === "1")
      setIcon(
        "M8.167 3.902v11.131a1.467 1.467 0 0 1-2.848.494L3.53 10.402M14 9.833a2.5 2.5 0 0 0 0-5m-10.47 5.57A3.334 3.334 0 0 1 4.833 4H6.36C9.777 4 12.714 2.972 14 1.5v11.667c-1.286-1.472-4.223-2.5-7.64-2.5H4.833c-.462 0-.902-.095-1.303-.265Z",
      );
    if (phase === "2")
      setIcon(
        "M3.8335 8.58333V10.6667M3.8335 8.58333V3.58333C3.8335 2.89298 4.39314 2.33333 5.0835 2.33333C5.77385 2.33333 6.3335 2.89298 6.3335 3.58333M3.8335 8.58333C3.8335 7.89298 3.27385 7.33333 2.5835 7.33333C1.89314 7.33333 1.3335 7.89298 1.3335 8.58333V10.25C1.3335 13.7018 4.13172 16.5 7.5835 16.5C11.0353 16.5 13.8335 13.7018 13.8335 10.25V6.08333C13.8335 5.39298 13.2739 4.83333 12.5835 4.83333C11.8931 4.83333 11.3335 5.39298 11.3335 6.08333M6.3335 3.58333V8.16667M6.3335 3.58333V2.75C6.3335 2.05964 6.89314 1.5 7.5835 1.5C8.27385 1.5 8.8335 2.05964 8.8335 2.75V3.58333M8.8335 3.58333V8.16667M8.8335 3.58333C8.8335 2.89298 9.39314 2.33333 10.0835 2.33333C10.7739 2.33333 11.3335 2.89298 11.3335 3.58333V6.08333M11.3335 6.08333V8.16667",
      );
    if (phase === "3")
      setIcon(
        "M6.50018 9.00018L8.16685 10.6668L11.5002 7.33352M5.52913 2.91439C6.12708 2.86667 6.69473 2.63154 7.15128 2.24247C8.21669 1.33454 9.78368 1.33454 10.8491 2.24247C11.3056 2.63154 11.8733 2.86667 12.4712 2.91439C13.8666 3.02574 14.9746 4.13377 15.086 5.52913C15.1337 6.12708 15.3688 6.69473 15.7579 7.15128C16.6658 8.21669 16.6658 9.78368 15.7579 10.8491C15.3688 11.3056 15.1337 11.8733 15.086 12.4712C14.9746 13.8666 13.8666 14.9746 12.4712 15.086C11.8733 15.1337 11.3056 15.3688 10.8491 15.7579C9.78368 16.6658 8.21669 16.6658 7.15128 15.7579C6.69473 15.3688 6.12708 15.1337 5.52913 15.086C4.13377 14.9746 3.02574 13.8666 2.91439 12.4712C2.86667 11.8733 2.63154 11.3056 2.24247 10.8491C1.33454 9.78368 1.33454 8.21669 2.24247 7.15128C2.63154 6.69473 2.86667 6.12708 2.91439 5.52913C3.02574 4.13377 4.13377 3.02574 5.52913 2.91439Z",
      );
  }, [status]);

  return (
    <div>
      <NavLink
        to={to}
        onClick={handleClick}
        className={`${
          disabled ? " cursor-default text-[#526187] hover:text-[#526187]" : "hover:text-[#67A4FF] hover:bg-[#344264] focus:bg-[#344264] focus:text-[#67A4FF]"
        } flex space-x-2 p-2 items-center rounded-md`}>
        <svg fill="none" viewBox="0 0 24 24" className="w-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" stroke={disabled ? "#526187" : "#7A90C3"} d={icon}></path>
        </svg>
        <div
          className={`${
            translator(status) !== "Actif" && translator(status) !== "En attente d'affectation" && translator(status) !== "Affectée"
              ? "flex flex-col items-start"
              : "flex space-x-2 items-center"
          } `}>
          <div>
            {subtitle} - {subtitle === "Phase 1" ? <span>Séjour</span> : subtitle === "Phase 2" ? <span>MIG</span> : subtitle === "Phase 3" && <span>Engagement</span>}
          </div>
          {/* display status */}
          {phase === "2" || (phase === "1" && status !== "DONE" && status !== "EXEMPTED") ? (
            <div className="bg-blue-600 rounded-full px-2 py-0.5">En cours</div>
          ) : (
            <div className="text-xs italic">{translator(status)}</div>
          )}
        </div>
      </NavLink>
      {open ? children : null}
    </div>
  );
};
