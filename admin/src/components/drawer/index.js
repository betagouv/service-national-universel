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
  <div onClick={onClick} class=" hover:bg-snu-purple-800 hover:shadow-lg block">
    <NavLink to={to} class="block py-3 px-3 text-base no-underline decoration-white hover:!text-white" activeClassName="block bg-snu-purple-300 py-2 px-2 font-bold" >
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
    class="justify-center flex mb-4 hover:bg-snu-purple-800 hover:shadow-lg"
    onClick={() => {
      plausibleEvent("Menu/CTA - Besoin Aide");
      onClick();
    }}>
    <NavLink  class=" items-center border rounded flex p-2 "  activeClassName="flex bg-snu-purple-300 p-2" to={to}>
        <QuestionMark class="h-6 w-6 flex mr-2" />
        <div class=" font-normal text-base text-center ">Besoin d&apos;aide ?</div>
        <div class="font-light text-xs float-right text-center">Tutoriels, contacts</div>
    </NavLink>
  </div>
);

const DrawerTabWithIcons = ({ title, children, to, onClick }) => {
  return (
    <div onClick={onClick} class="hover:bg-snu-purple-800 hover:shadow-lg block" >
      <NavLink to={to}  class=" py-3 px-3 text-base block" activeClassName=" bg-snu-purple-300 py-2 px-2 font-bold">
        <div >
          <div  >{title}</div>
          <div class="flex content-center" >{children}</div>
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
      <DrawerTab to="/mission" title="Missions" onClick={onClick} />
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
            <div class="flex justify-center content-center rounded-lg w-14 mr-2.5 px-2  bg-rose-500" >
              <MailCloseIcon />
              <div >{newTickets}</div>
            </div>
            <div class="flex justify-center content-center rounded-lg w-14 mr-2.5 px-2  bg-amber-400" >
              <MailOpenIcon />
              <div  >{openedTickets}</div>
            </div>
            <div class="flex justify-center content-center rounded-lg w-14 mr-2.5 px-2  bg-green-500">
              <SuccessIcon />
              <div >{closedTickets}</div>
            </div>
          </>
        )}
      </DrawerTabWithIcons>
      <BlankSeparator />
      <HelpButton to="/besoin-d-aide" title="Besoin d'aide" onClick={onClick}  />
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
            <div class="flex justify-center content-center rounded-lg w-14 mr-2.5 px-2  bg-rose-500" >
              <MailCloseIcon />
              <div >{newTickets}</div>
            </div>
            <div class="flex justify-center content-center rounded-lg w-14 mr-2.5 px-2  bg-amber-400" >
              <MailOpenIcon />
              <div  >{openedTickets}</div>
            </div>
            <div class="flex justify-center content-center rounded-lg w-14 mr-2.5 px-2  bg-green-500">
              <SuccessIcon />
              <div >{closedTickets}</div>
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
    <nav open={open} id="drawer" class="bg-snu-purple-900 text-white text-base font-normal no-underline w-64">
      <h1 class="h-16">
        <Link to="/" class="flex items-center py-2">
          <img src={require("../../assets/logo-snu.png")} class="h-12 w-18 px-3 " />
            <span class="" class="uppercase font-medium text-sm text-center"> {getName() } </span>
          <img onClick={handleClick} src={require("../../assets/burger.svg")} class="hidden" />
        </Link>
      </h1>
      {environment !== "production" && environmentBannerVisible ? (
        <div onClick={() => setEnvironmentBannerVisible(false)} class="py-1 bg-orange-600 font-italic items-center text-center">{getTextEnvironmentBanner()}</div>
      ) : null}
      <ul class="divide-y divide-slate-700">
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




