import React, { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { environment } from "../../config";
import { ROLES, colors } from "../../utils";
import MailOpenIcon from "../MailOpenIcon";
import MailCloseIcon from "../MailCloseIcon";
import QuestionMark from "../../assets/QuestionMark";

const DrawerTab = ({ title, to, onClick }) => (
  <li onClick={onClick}>
    <NavLink to={to}>{title}</NavLink>
  </li>
);

const BlankSeparator = () => (
  <li
    style={{
      height: "1.5rem",
    }}
  />
);

const HelpButton = ({ onClick, to }) => (
  <div className="help-button-container" onClick={onClick}>
    <NavLink className="help-button" to={to}>
      <QuestionMark className="icon" />
      <div className="help-button-text">
        <div className="help-button-text-primary">Besoin d'aide ?</div>
        <div className="help-button-text-secondary">Tutoriels, contacts</div>
      </div>
    </NavLink>
  </div>
);

const DrawerTabWithIcons = ({ title, children, to, onClick }) => {
  return (
    <li onClick={onClick}>
      <NavLink to={to}>
        <div style={{ display: "flex", alignContent: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div>{title}</div>
          <div style={{ display: "flex" }}>{children}</div>
        </div>
      </NavLink>
    </li>
  );
};

function responsible({ user, onClick }) {
  return (
    <>
      <DrawerTab to={`/structure/${user.structureId}`} title="Ma structure" onClick={onClick} />
      <DrawerTab to="/mission" title="Missions" onClick={onClick} />
      <DrawerTab to="/volontaire" title="Volontaires" onClick={onClick} />
      <BlankSeparator />
      <HelpButton to="/besoin-d-aide" title="Besoin d'aide" onClick={onClick} />
    </>
  );
}

function supervisor({ user, onClick }) {
  return (
    <>
      <DrawerTab to="/structure" title="Structures" onClick={onClick} />
      <DrawerTab to="/mission" title="Missions" onClick={onClick} />
      <DrawerTab to="/user" title="Utilisateurs" onClick={onClick} />
      <DrawerTab to="/volontaire" title="Volontaires" onClick={onClick} />
      <BlankSeparator />
      <HelpButton to="/besoin-d-aide" title="Besoin d'aide" onClick={onClick} />
    </>
  );
}

function admin({ onClick }) {
  return (
    <>
      <DrawerTab to="/structure" title="Structures" onClick={onClick} />
      <DrawerTab to="/mission" title="Missions" onClick={onClick} />
      <DrawerTab to="/user" title="Utilisateurs" onClick={onClick} />
      <DrawerTab to="/volontaire" title="Volontaires" onClick={onClick} />
      <DrawerTab to="/inscription" title="Inscriptions" onClick={onClick} />
      <DrawerTab to="/centre" title="Centres" onClick={onClick} />
      <DrawerTab to="/point-de-rassemblement" title="Points de rassemblement" onClick={onClick} />
      <DrawerTab to="/contenu" title="Contenus" onClick={onClick} />
      <DrawerTab to="/objectifs" title="Objectifs" onClick={onClick} />
      <DrawerTabWithIcons to="/boite-de-reception" title="Boîte de reception" onClick={onClick}>
        {/* <div
          style={{
            display: "flex",
            alignContent: "center",
            justifyContent: "center",
            background: "#F1545B",
            borderRadius: "0.5rem",
            marginRight: "10px",
            paddingRight: "8px",
            paddingLeft: "8px",
            width: "60px",
          }}
        >
          <MailCloseIcon />
          <div style={{ marginLeft: "4px" }}>2</div>
        </div>
        <div
          style={{
            display: "flex",
            alignContent: "center",
            justifyContent: "center",
            background: "#FEB951",
            borderRadius: "0.5rem",
            marginRight: "10px",
            paddingRight: "8px",
            paddingLeft: "8px",
            width: "60px",
          }}
        >
          <MailOpenIcon />
          <div style={{ marginLeft: "4px" }}>3</div>
        </div> */}
      </DrawerTabWithIcons>
      <BlankSeparator />
      <HelpButton to="/besoin-d-aide" title="Besoin d'aide" onClick={onClick} />
    </>
  );
}

function referent({ onClick }) {
  return (
    <>
      <DrawerTab to="/structure" title="Structures" onClick={onClick} />
      <DrawerTab to="/mission" title="Missions" onClick={onClick} />
      <DrawerTab to="/user" title="Utilisateurs" onClick={onClick} />
      <DrawerTab to="/volontaire" title="Volontaires" onClick={onClick} />
      <DrawerTab to="/inscription" title="Inscriptions" onClick={onClick} />
      <DrawerTab to="/centre" title="Centres" onClick={onClick} />
      <DrawerTab to="/contenu" title="Contenus" onClick={onClick} />
      <DrawerTabWithIcons to="/boite-de-reception" title="Boîte de reception" onClick={onClick}>
        {/* <div
          style={{
            display: "flex",
            alignContent: "center",
            justifyContent: "center",
            background: "#F1545B",
            borderRadius: "0.5rem",
            marginRight: "10px",
            paddingRight: "8px",
            paddingLeft: "8px",
            width: "60px",
          }}
        >
          <MailCloseIcon />
          <div style={{ marginLeft: "4px" }}>2</div>
        </div>
        <div
          style={{
            display: "flex",
            alignContent: "center",
            justifyContent: "center",
            background: "#FEB951",
            borderRadius: "0.5rem",
            marginRight: "10px",
            paddingRight: "8px",
            paddingLeft: "8px",
            width: "60px",
          }}
        >
          <MailOpenIcon />
          <div style={{ marginLeft: "4px" }}>3</div>
        </div> */}
      </DrawerTabWithIcons>
      <BlankSeparator />
      <HelpButton to="/besoin-d-aide" title="Besoin d'aide" onClick={onClick} />
    </>
  );
}

function headCenter({ user, onClick }) {
  return (
    <>
      <DrawerTab to="/user" title="Utilisateurs" onClick={onClick} />
      <DrawerTab to="/volontaire" title="Volontaires" onClick={onClick} />
      <DrawerTab to="/contenu" title="Contenus" onClick={onClick} />
      <BlankSeparator />
      <HelpButton to="/besoin-d-aide" title="Besoin d'aide" onClick={onClick} />
    </>
  );
}

export default (props) => {
  const user = useSelector((state) => state.Auth.user);
  const [open, setOpen] = useState();
  const [environmentBannerVisible, setEnvironmentBannerVisible] = useState(true);
  useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  const handleClick = () => {
    if (open) {
      props.onOpen(false);
    }
  };

  if (!user) return <div />;

  function getName() {
    if (user.role === ROLES.ADMIN) return "Espace modérateur";
    if (user.role === ROLES.REFERENT_DEPARTMENT) return "ESPACE RÉFÉRENT DÉPARTEMENTAL";
    if (user.role === ROLES.REFERENT_REGION) return "ESPACE RÉFÉRENT REGIONAL";
    if (user.role === ROLES.RESPONSIBLE) return "Espace responsable";
    if (user.role === ROLES.SUPERVISOR) return "Espace superviseur";
    if (user.role === ROLES.HEAD_CENTER) return "espace chef de centre";
    return "";
  }

  function getTextEnvironmentBanner() {
    if (environment === "staging") return "Espace de Test";
    if (environment === "development") return "Développement";
    return "";
  }

  return (
    <Sidebar open={open} id="drawer">
      <Logo>
        <HeaderSideBar to="/">
          <img src={require("../../assets/logo-snu.png")} height={38} />
          {getName()}
          <Burger onClick={handleClick} src={require("../../assets/burger.svg")} />
        </HeaderSideBar>
      </Logo>
      {environment !== "production" && environmentBannerVisible ? (
        <EnvironmentBanner onClick={() => setEnvironmentBannerVisible(false)}>{getTextEnvironmentBanner()}</EnvironmentBanner>
      ) : null}
      <ul>
        <DrawerTab to="/dashboard" title="Tableau de bord" onClick={handleClick} />
        {user.role === ROLES.HEAD_CENTER && headCenter({ user, onClick: handleClick })}
        {user.role === ROLES.SUPERVISOR && supervisor({ user, onClick: handleClick })}
        {user.role === ROLES.RESPONSIBLE && responsible({ user, onClick: handleClick })}
        {user.role === ROLES.ADMIN && admin({ onClick: handleClick })}
        {[ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) && referent({ onClick: handleClick })}
      </ul>
    </Sidebar>
  );
};

const HeaderSideBar = styled(Link)`
  display: flex;
  @media (max-width: 1550px) {
    flex-direction: column;
  }
`;

const EnvironmentBanner = styled.div`
  background: ${colors.red};
  color: white;
  font-style: italic;
  font-weight: 500;
  text-align: center;
  padding: 5px;
  cursor: pointer;

  :hover {
    opacity: 0.5;
  }
`;
const Burger = styled.img`
  display: none;
  @media (max-width: 1000px) {
    margin-left: auto;
    margin-right: 0 !important;
    display: block;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    object-fit: contain;
    cursor: pointer;
  }
`;

const Logo = styled.h1`
  background: ${colors.darkPurple};
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 0;
  padding: 15px 20px 15px;

  a {
    display: flex;
    flex-direction: row;
    align-items: center;
    color: #161e2e;
    font-size: 13px;
    font-weight: 500;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    text-decoration: none;
  }

  img {
    margin-right: 1rem;
    vertical-align: top;
  }
`;

const Sidebar = styled.div`
  ::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 1000px) {
    transform: translateX(${({ open }) => (open ? 0 : "-105%")});
    opacity: 1;
    visibility: visible;
    height: 100vh;
    width: 60vw;
    z-index: 11;
    position: fixed;
  }
  background-color: ${colors.darkPurple};
  width: 15%;
  position: sticky;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  height: 100vh;
  min-width: 250px;
  overflow-y: auto;
  transition: 0.2s;

  ul {
    list-style: none;

    a {
      text-decoration: none;
      padding: 15px 20px;
      display: block;
      color: #fff;
      font-weight: 400;
      font-size: 16px;
      border-bottom: 1px solid ${colors.transPurple};
      transition: 0.2s;

      i {
        font-size: 0.7rem;
      }
    }

    a:hover {
      background: ${colors.transPurple};
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);
    }

    a.active {
      font-weight: 700;
      background: ${colors.purple};
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);
    }
    .help-button-container {
      justify-content: center;
      display: flex;
      margin-bottom: 1rem;
      .help-button {
        border: 1px solid #7786cf;
        border-radius: 0.3rem;
        padding: 0.5rem;
        align-items: center;
        display: flex;
        .icon {
          height: 1.5rem;
          width: 1.5rem;
          color: #7786cf;
          margin-right: 0.5rem;
        }
        .help-button-text {
          color: white;
          text-align: center;
          .help-button-text-primary {
            font-weight: 400;
            font-size: 0.9rem;
          }
          .help-button-text-secondary {
            font-weight: 300;
            font-size: 0.6rem;
          }
        }
        :hover {
          background: #7786cf;
          cursor: pointer;
          .icon {
            color: #fff;
          }
        }
      }
    }
  }

  .has-child ul {
    display: none;

    a {
      padding-left: 40px;
    }
  }

  .has-child.open ul {
    display: block;
  }
`;
