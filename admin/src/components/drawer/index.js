import React, { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import styled from "styled-components";
import { useSelector } from "react-redux";

const DrawerTab = ({ title, to, onClick }) => (
  <li onClick={onClick}>
    <NavLink to={to}>{title}</NavLink>
  </li>
);

function responsible({ user, onClick }) {
  return (
    <>
      <DrawerTab to={`/structure/${user.structureId}`} title="Ma structure" onClick={onClick} />
      <DrawerTab to="/mission" title="Missions" onClick={onClick} />
      <DrawerTab to="/volontaire" title="Volontaires" onClick={onClick} />
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
    </>
  );
}

function headCenter({ user, onClick }) {
  return (
    <>
      <DrawerTab to="/user" title="Utilisateurs" onClick={onClick} />
      <DrawerTab to="/volontaire" title="Volontaires" onClick={onClick} />
      <DrawerTab to="/contenu" title="Contenus" onClick={onClick} />
    </>
  );
}

export default (props) => {
  const user = useSelector((state) => state.Auth.user);
  const [open, setOpen] = useState();
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
    if (user.role === "admin") return "Espace modérateur";
    if (user.role === "referent_department") return "ESPACE RÉFÉRENT DÉPARTEMENTAL";
    if (user.role === "referent_region") return "ESPACE RÉFÉRENT REGIONAL";
    if (user.role === "responsible") return "Espace responsable";
    if (user.role === "supervisor") return "Espace superviseur";
    if (user.role === "head_center") return "espace chef de centre";
    return "";
  }

  return (
    <Sidebar open={open} id="drawer">
      <Logo>
        <HeaderSideBar to="/">
          <img src={require("../../assets/logo-snu.png")} height={38} />
          {getName()}
        </HeaderSideBar>
      </Logo>
      <ul>
        <DrawerTab to="/dashboard" title="Tableau de bord" onClick={handleClick} />
        {user.role === "head_center" && headCenter({ user, onClick: handleClick })}
        {user.role === "supervisor" && supervisor({ user, onClick: handleClick })}
        {user.role === "responsible" && responsible({ user, onClick: handleClick })}
        {user.role === "admin" && admin({ onClick: handleClick })}
        {["referent_department", "referent_region"].includes(user.role) && referent({ onClick: handleClick })}
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

const Logo = styled.h1`
  background: #372f78;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 0;
  padding: 15px 20px 5px;
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
    margin-right: 25px;
    vertical-align: top;
  }
`;

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
  width: 250px;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 90;
  min-height: 100vh;
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
