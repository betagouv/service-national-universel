import React, { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import styled from "styled-components";
import { useSelector, connect } from "react-redux";
import { environment } from "../../config";
import { totalNewTickets, totalOpenedTickets, totalClosedTickets, ROLES, colors } from "../../utils";
import MailOpenIcon from "../MailOpenIcon";
import MailCloseIcon from "../MailCloseIcon";
import SuccessIcon from "../SuccessIcon";
import QuestionMark from "../../assets/QuestionMark";
import api from "../../services/api";
import Badge from "../Badge";
import plausibleEvent from "../../services/pausible";

const DrawerTab = ({ title, to, onClick, beta }) => (
  <div onClick={onClick} class=" hover:bg-snu-purple-800 hover:shadow-lg block active:bg-snu-purple-600 py-2 px-2">
    <NavLink to={to} className={({isActive}) => isActive ? 'bg-snu-purple-600' : 'bg-snu-purple-900'}>
      {title}
      {beta ? <Badge text="bêta" color={colors.yellow} /> : null}
    </NavLink>
  </div>
);

const BlankSeparator = () => (
  <div
    style={{
      height: "1.5rem",
    }}
  />
);

const HelpButton = ({ onClick, to }) => (
  <div
    className="help-button-container"
    onClick={() => {
      plausibleEvent("Menu/CTA - Besoin Aide");
      onClick();
    }}>
    <NavLink className="help-button" to={to}>
      <QuestionMark className="icon" />
      <div className="help-button-text">
        <div className="help-button-text-primary">Besoin d&apos;aide ?</div>
        <div className="help-button-text-secondary">Tutoriels, contacts</div>
      </div>
    </NavLink>
  </div>
);

const DrawerTabWithIcons = ({ title, children, to, onClick }) => {
  return (
    <div onClick={onClick} class="py-2 px-2">
      <NavLink to={to}>
        <div style={{ display: "flex", alignContent: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div>{title}</div>
          <div style={{ display: "flex" }}>{children}</div>
        </div>
      </NavLink>
    </div>
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

function supervisor({ onClick }) {
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

function admin({ onClick, newTickets, openedTickets, closedTickets, tickets }) {
  return (
    <>
      <DrawerTab to="/structure" title="Structures" onClick={onClick} />
      <div onClick={onClick} class=" hover:bg-snu-purple-800 hover:shadow-lg block active:bg-snu-purple-600 py-2 px-2">
    <NavLink to="/mission" className={({ isActive }) =>
    isActive ? 'bg-green-500 font-bold' : 'bg-red-500 font-thin'
  }>
      Missions
    </NavLink>
  </div>
      <DrawerTab to="/user" title="Utilisateurs" onClick={onClick} />
      <DrawerTab to="/volontaire" title="Volontaires" onClick={onClick} />
      <DrawerTab to="/inscription" title="Inscriptions" onClick={onClick} />
      <DrawerTab to="/centre" title="Centres" onClick={onClick} />
      <DrawerTab to="/point-de-rassemblement" title="Points de rassemblement" onClick={onClick} />
      <DrawerTab to="/contenu" title="Contenus" onClick={onClick} />
      <DrawerTab to="/objectifs" title="Objectifs" onClick={onClick} />
      <DrawerTab to="/association" title="Annuaire des associations" onClick={onClick} />
      <DrawerTabWithIcons to="/boite-de-reception" title="Boîte de réception" onClick={onClick}>
        {!tickets ? (
          <div />
        ) : (
          <>
            <div style={{ background: "#F1545B" }}>
              <MailCloseIcon />
              <div style={{ marginLeft: "4px" }}>{newTickets}</div>
            </div>
            <div style={{ background: "#FEB951" }}>
              <MailOpenIcon />
              <div style={{ marginLeft: "4px" }}>{openedTickets}</div>
            </div>
            <div style={{ background: "#6BC762" }}>
              <SuccessIcon color="#FFF" />
              <div style={{ marginLeft: "4px" }}>{closedTickets}</div>
            </div>
          </>
        )}
      </DrawerTabWithIcons>
      <BlankSeparator />
      <HelpButton to="/besoin-d-aide" title="Besoin d'aide" onClick={onClick} />
    </>
  );
}

function referent({ onClick, newTickets, openedTickets, closedTickets, tickets }) {
  return (
    <>
      <DrawerTab to="/structure" title="Structures" onClick={onClick} />
      <DrawerTab to="/mission" title="Missions" onClick={onClick} />
      <DrawerTab to="/user" title="Utilisateurs" onClick={onClick} />
      <DrawerTab to="/volontaire" title="Volontaires" onClick={onClick} />
      <DrawerTab to="/inscription" title="Inscriptions" onClick={onClick} />
      <DrawerTab to="/centre" title="Centres" onClick={onClick} />
      <DrawerTab to="/contenu" title="Contenus" onClick={onClick} />
      <DrawerTab to="/association" title="Annuaire des associations" onClick={onClick} />
      <DrawerTabWithIcons to="/boite-de-reception" title="Boîte de réception" onClick={onClick}>
        {!tickets ? (
          <div />
        ) : (
          <>
            <div style={{ background: "#F1545B" }}>
              <MailCloseIcon />
              <div style={{ marginLeft: "4px" }}>{newTickets}</div>
            </div>
            <div style={{ background: "#FEB951" }}>
              <MailOpenIcon />
              <div style={{ marginLeft: "4px" }}>{openedTickets}</div>
            </div>
            <div style={{ background: "#6BC762" }}>
              <SuccessIcon color="#FFF" />
              <div style={{ marginLeft: "4px" }}>{closedTickets}</div>
            </div>
          </>
        )}
      </DrawerTabWithIcons>
      <BlankSeparator />
      <HelpButton to="/besoin-d-aide" title="Besoin d'aide" onClick={onClick} />
    </>
  );
}

function headCenter({ onClick, user }) {
  return (
    <>
      {user.cohesionCenterId && <DrawerTab to={`/centre/${user.cohesionCenterId}`} title="Mon Centre" onClick={onClick} />}
      <DrawerTab to="/user" title="Utilisateurs" onClick={onClick} />
      <DrawerTab to="/volontaire" title="Volontaires" onClick={onClick} />
      <DrawerTab to="/contenu" title="Contenus" onClick={onClick} />
      <BlankSeparator />
      <HelpButton to="/besoin-d-aide" title="Besoin d'aide" onClick={onClick} />
    </>
  );
}

function visitor({ onClick }) {
  return (
    <>
      <BlankSeparator />
      <HelpButton to="/besoin-d-aide" title="Besoin d'aide" onClick={onClick} />
    </>
  );
}

const Drawer = (props) => {
  const user = useSelector((state) => state.Auth.user);
  const newTickets = useSelector((state) => state.Tickets.new);
  const openedTickets = useSelector((state) => state.Tickets.open);
  const closedTickets = useSelector((state) => state.Tickets.closed);
  const tickets = useSelector((state) => state.Tickets.tickets);
  const [open, setOpen] = useState();
  const [environmentBannerVisible, setEnvironmentBannerVisible] = useState(true);
  useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  useEffect(() => {
    try {
      let tags = [];
      if (user?.role === ROLES.ADMIN) tags.push(["AGENT_Startup_Support"]);
      else if (user?.role === ROLES.REFERENT_DEPARTMENT) tags.push(["AGENT_Référent_Département", `DEPARTEMENT_${user.department}`]);
      else if (user?.role === ROLES.REFERENT_REGION) tags.push(["AGENT_Référent_Région", `REGION_${user.region}`]);

      const getTickets = async (tags) => {
        const { data } = await api.post(`/zammad-support-center/ticket/search-by-tags?withArticles=true`, { tags });
        props.dispatchTickets(data);
      };
      if (tags.length) getTickets(tags);
    } catch (e) {
      console.log("Oups, une erreur s'est produite.");
    }
  }, []);

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
    if (user.role === ROLES.VISITOR) return "Espace visiteur";
    return "";
  }

  function getTextEnvironmentBanner() {
    if (environment === "staging") return "Espace de Test";
    if (environment === "development") return "Développement";
    return "";
  }

  return (
    <nav open={open} id="drawer" class="bg-snu-purple-900 text-white text-xl font-normal no-underline py-2">
      <h1>
        <Link to="/" class="flex items-center space-x-2">
          <img src={require("../../assets/logo-snu.png")} class="h-9 w-9 " />
            <span class=""> {getName() } </span>
          <img onClick={handleClick} src={require("../../assets/burger.svg")} class="hidden" />
        </Link>
      </h1>
      {environment !== "production" && environmentBannerVisible ? (
        <div onClick={() => setEnvironmentBannerVisible(false)} class="py-2 px-2 bg-orange-600">{getTextEnvironmentBanner()}</div>
      ) : null}
      <ul>
        <DrawerTab to="/dashboard" title="Tableau de bord" onClick={handleClick} />
        {user.role === ROLES.HEAD_CENTER && headCenter({ user, onClick: handleClick })}
        {user.role === ROLES.SUPERVISOR && supervisor({ user, onClick: handleClick })}
        {user.role === ROLES.RESPONSIBLE && responsible({ user, onClick: handleClick })}
        {user.role === ROLES.ADMIN && admin({ onClick: handleClick, newTickets, openedTickets, closedTickets, tickets })}
        {[ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) && referent({ onClick: handleClick, newTickets, openedTickets, closedTickets, tickets })}
        {user.role === ROLES.VISITOR && visitor({ user, onClick: handleClick })}
      </ul>
    </nav>
  );
};

const mapDispatchToProps = (dispatch) => ({
  dispatchTickets: (tickets) => {
    dispatch({
      type: "FETCH_TICKETS",
      payload: {
        tickets,
        new: totalNewTickets(tickets),
        open: totalOpenedTickets(tickets),
        closed: totalClosedTickets(tickets),
      },
    });
  },
});

let container = connect(null, mapDispatchToProps)(Drawer);

export default container;




