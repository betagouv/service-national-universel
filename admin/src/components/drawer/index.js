import React from "react";
import { NavLink, Link } from "react-router-dom";
import styled from "styled-components";
import { useSelector } from "react-redux";

function responsible(user) {
  return (
    <>
      <li>
        <NavLink to={`/structure/${user.structureId}`}>Ma structure</NavLink>
      </li>
      <li>
        <NavLink to="/mission">Missions</NavLink>
      </li>
      <li>
        <NavLink to="/volontaire">Volontaires</NavLink>
      </li>
    </>
  );
}
function supervisor(user) {
  return (
    <>
      <li>
        <NavLink to="/structure">Structures</NavLink>
      </li>
      <li>
        <NavLink to="/mission">Missions</NavLink>
      </li>
      <li>
        <NavLink to="/user">Utilisateurs</NavLink>
      </li>
      <li>
        <NavLink to="/volontaire">Volontaires</NavLink>
      </li>
    </>
  );
}

function admin() {
  return (
    <>
      <li>
        <NavLink to="/structure">Structures</NavLink>
      </li>
      <li>
        <NavLink to="/mission">Missions</NavLink>
      </li>
      <li>
        <NavLink to="/user">Utilisateurs</NavLink>
      </li>
      <li>
        <NavLink to="/volontaire">Volontaires</NavLink>
      </li>
      <li>
        <NavLink to="/inscription">Inscriptions</NavLink>
      </li>
      {/* <li>
        <NavLink to="/contenu">Contenus</NavLink>
      </li> */}
    </>
  );
}

function referent() {
  return (
    <>
      <li>
        <NavLink to="/structure">Structures</NavLink>
      </li>
      <li>
        <NavLink to="/mission">Missions</NavLink>
      </li>
      <li>
        <NavLink to="/user">Utilisateurs</NavLink>
      </li>
      <li>
        <NavLink to="/volontaire">Volontaires</NavLink>
      </li>
      <li>
        <NavLink to="/inscription">Inscriptions</NavLink>
      </li>
      {/* <li>
        <NavLink to="/contenu">Contenus</NavLink>
      </li> */}
    </>
  );
}

export default () => {
  const user = useSelector((state) => state.Auth.user);

  if (!user) return <div />;

  function getName() {
    if (user.role === "admin") return "Espace modérateur";
    if (user.role === "referent_department") return "ESPACE RÉFÉRENT DÉPARTEMENTAL";
    if (user.role === "referent_region") return "ESPACE RÉFÉRENT REGIONAL";
    if (user.role === "responsible") return "Espace responsable";
    if (user.role === "supervisor") return "Espace superviseur";
    return "";
  }

  return (
    <Sidebar onClick={() => {}} id="drawer">
      <Logo>
        <Link to="/">
          <img src={require("../../assets/logo-snu.png")} height={38} />
          {getName()}
        </Link>
      </Logo>
      <ul>
        <li>
          <NavLink to="/dashboard">Tableau de bord</NavLink>
        </li>
        {user.role === "supervisor" && supervisor(user)}
        {user.role === "responsible" && responsible(user)}
        {user.role === "admin" && admin()}
        {["referent_department", "referent_region"].includes(user.role) && referent()}
      </ul>
      {/*   <li>
          <NavLink to="/tuteur">Tuteurs</NavLink>
        </li> */}
      {/* <Version>
        <a href="#" className="info help">
          Centre d’aide
        </a>
        <a href="#" className="info new">
          Nouveautés
        </a>
      </Version> */}
    </Sidebar>
  );
};

const Logo = styled.h1`
  background: #372f78;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);
  width: 250px;
  margin-bottom: 0;
  padding: 15px 20px 5px;
  a {
    display: inline-flex;
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
    margin-right: 25px;
    vertical-align: top;
  }
`;

const Sidebar = styled.div`
  background-color: #372f78;
  width: 250px;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  ul {
    list-style: none;
    a {
      text-decoration: none;
      padding: 15px 20px;
      display: block;
      color: #fff;
      font-weight: 400;
      font-size: 16px;
      border-bottom: 1px solid rgba(82, 69, 204, 0.5);
      transition: 0.2s;
      i {
        font-size: 0.7rem;
      }
    }
    a.active {
      font-weight: 700;
      background: #5245cc;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);
    }
    a:hover {
      background: #5245cc;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);
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

const Version = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  padding: 30px 20px 10px;
  width: 100%;
  background: linear-gradient(180deg, #261f5b 0%, #372f78 29.33%);
  box-shadow: 0px -1px 0px #0e308a;
  display: flex;
  flex-direction: column;
  .info {
    color: #fff;
    font-size: 16px;
    padding-left: 40px;
    margin-bottom: 15px;
    text-decoration: none;
    background-position: left center;
    background-size: 20px;
    background-repeat: no-repeat;
  }
  .help {
    background-image: url(${require("../../assets/help.svg")});
  }
  .new {
    background-image: url(${require("../../assets/new.svg")});
  }
`;
