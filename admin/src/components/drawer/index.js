import React, { useEffect, useState } from "react";
import { NavLink, useHistory } from "react-router-dom";
import { useSelector, connect } from "react-redux";
import { totalNewTickets, totalOpenedTickets, totalClosedTickets, ROLES, colors } from "../../utils";
import MailOpenIcon from "../MailOpenIcon";
import MailCloseIcon from "../MailCloseIcon";
import SuccessIcon from "../SuccessIcon";
import QuestionMark from "../../assets/QuestionMark";
import api from "../../services/api";
import Badge from "../Badge";
import plausibleEvent from "../../services/plausible";
import { environment } from "../../config";
import ModalInfo from "../modals/ModalInfo";

const DrawerTab = ({ title, to, onClick, beta, exact }) => {
  if (environment === "production" && beta) return null;
  return (
    <div onClick={onClick} className=" hover:bg-snu-purple-800 hover:shadow-lg block">
      <NavLink to={to} exact={exact} className="block py-3 pl-3 text-base hover:!text-white" activeClassName="block bg-snu-purple-300 py-3 pl-3 font-bold">
        {title}
        {beta ? <Badge className="ml-2" text="bêta" color={colors.yellow} /> : null}
      </NavLink>
    </div>
  );
};

const DrawerTabWithoutLink = ({ title, onClick, beta }) => {
  if (environment === "production" && beta) return null;
  return (
    <div onClick={onClick} className=" hover:bg-snu-purple-800 hover:shadow-lg block cursor-pointer">
      <div className="block py-3 pl-3 text-base hover:!text-white">
        {title}
        {beta ? <Badge className="ml-2" text="bêta" color={colors.yellow} /> : null}
      </div>
    </div>
  );
};

const BlankSeparator = () => (
  <div
    style={{
      height: "1.5rem",
    }}
  />
);

const HelpButton = ({ onClick, to }) => (
  <div
    className="justify-center flex mb-4 p-8"
    onClick={() => {
      plausibleEvent("Menu/CTA - Besoin Aide");
      onClick();
    }}>
    <NavLink className=" items-center border rounded flex p-2 hover:!text-white hover:bg-snu-purple-800 hover:shadow-lg" activeClassName="flex bg-snu-purple-300 p-2" to={to}>
      <QuestionMark className="h-6 w-6 flex mr-2" />
      <div>
        <div className=" font-normal text-sm text-center  ">Besoin d&apos;aide&nbsp;?</div>
        <div className="font-light text-xs float-right text-center ">Tutoriels, contacts</div>
      </div>
    </NavLink>
  </div>
);

const DrawerTabWithIcons = ({ title, children, to, onClick }) => {
  return (
    <div onClick={onClick} className="hover:bg-snu-purple-800 hover:shadow-lg block">
      <NavLink to={to} className=" py-3 pl-3 text-base block hover:!text-white" activeClassName=" bg-snu-purple-300 py-3 pl-3 font-bold">
        <div>
          <div>{title}</div>
          <div className="flex content-center">{children}</div>
        </div>
      </NavLink>
    </div>
  );
};

const DrawerConnectToZammood = ({ title, children, history }) => {
  async function connectToZammood() {
    try {
      const { ok, data } = await api.get(`/zammood/signin`);
      if (ok) window.open(data, "_blank", "noopener,noreferrer");
      else history.push("/boite-de-reception");
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div onClick={connectToZammood} className="hover:bg-snu-purple-800 hover:shadow-lg block cursor-pointer">
      <div className=" py-3 pl-3 text-base block hover:!text-white">
        <div>
          <div>{title}</div>
          <div className="flex content-center">{children}</div>
        </div>
      </div>
    </div>
  );
};

function responsible({ user, onClick, from }) {
  return (
    <>
      <DrawerTab to={`/structure/${user.structureId}`} title="Ma structure" onClick={onClick} />
      <DrawerTab to="/mission" title="Missions" onClick={onClick} />
      <DrawerTab to="/volontaire" title="Volontaires" onClick={onClick} />
      <HelpButton to={`/besoin-d-aide?from=${from}`} title="Besoin d'aide" onClick={onClick} />
    </>
  );
}

function supervisor({ onClick, from }) {
  return (
    <>
      <DrawerTab to="/structure" title="Structures" onClick={onClick} />
      <DrawerTab to="/mission" title="Missions" onClick={onClick} />
      <DrawerTab to="/user" title="Utilisateurs" onClick={onClick} />
      <DrawerTab to="/volontaire" title="Volontaires" onClick={onClick} />
      <HelpButton to={`/besoin-d-aide?from=${from}`} title="Besoin d'aide" onClick={onClick} />
    </>
  );
}

function admin({ onClick, newTickets, openedTickets, closedTickets, tickets, from, ssoSupportStorage, history }) {
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
      {ssoSupportStorage === "sso-support" ? (
        <DrawerConnectToZammood title="Boîte de réception" history={history}>
          {!tickets ? (
            <div />
          ) : (
            <>
              <div className="flex justify-evenly content-center rounded-lg w-14 mr-2.5 px-2  bg-rose-500">
                <MailCloseIcon color="#ffffff" style={{ margin: 0, paddingTop: "2px" }} />
                <div>{newTickets}</div>
              </div>
              <div className="flex justify-evenly content-center rounded-lg w-14 mr-2.5 px-2  bg-amber-400">
                <MailOpenIcon color="#ffffff" style={{ margin: 0, paddingTop: "2px" }} />
                <div>{openedTickets}</div>
              </div>
              <div className="flex justify-evenly content-center rounded-lg w-14 mr-2.5 px-2  bg-green-500">
                <SuccessIcon color="#ffffff" style={{ margin: 0, paddingTop: "3px" }} />
                <div>{closedTickets}</div>
              </div>
            </>
          )}
        </DrawerConnectToZammood>
      ) : (
        <DrawerTabWithIcons to="/boite-de-reception" title="Boîte de réception" onClick={onClick}>
          {!tickets ? (
            <div />
          ) : (
            <>
              <div className="flex justify-evenly content-center rounded-lg w-14 mr-2.5 px-2  bg-rose-500">
                <MailCloseIcon color="#ffffff" style={{ margin: 0, paddingTop: "2px" }} />
                <div>{newTickets}</div>
              </div>
              <div className="flex justify-evenly content-center rounded-lg w-14 mr-2.5 px-2  bg-amber-400">
                <MailOpenIcon color="#ffffff" style={{ margin: 0, paddingTop: "2px" }} />
                <div>{openedTickets}</div>
              </div>
              <div className="flex justify-evenly content-center rounded-lg w-14 mr-2.5 px-2  bg-green-500">
                <SuccessIcon color="#ffffff" style={{ margin: 0, paddingTop: "3px" }} />
                <div>{closedTickets}</div>
              </div>
            </>
          )}
        </DrawerTabWithIcons>
      )}
      <HelpButton to={`/besoin-d-aide?from=${from}`} title="Besoin d'aide" onClick={onClick} />
    </>
  );
}

function referent({ onClick, newTickets, openedTickets, closedTickets, tickets, from, history, info, setInfo }) {
  // blocage de l'accès inscription pour les référents avec un message.
  // Pour supprimer ce blocage, supprimer tout ce code et remettre tout simplement la ligne :
  // <DrawerTab to="/inscription" title="Inscriptions" onClick={onClick} />

  function blockInscription(e) {
    e.preventDefault();
    e.stopPropagation();
    setInfo({ ...info, isOpen: true });
  }

  return (
    <>
      <DrawerTab to="/equipe" title="Mon équipe" onClick={onClick} />
      <DrawerTab to="/structure" title="Structures" onClick={onClick} />
      <DrawerTab to="/mission" title="Missions" onClick={onClick} />
      <DrawerTab to="/user" title="Utilisateurs" onClick={onClick} />
      <DrawerTab to="/volontaire" title="Volontaires" onClick={onClick} />
      {environment === "production" ? (
        <DrawerTabWithoutLink to="/inscription" title="Inscriptions" onClick={blockInscription} />
      ) : (
        <DrawerTab to="/inscription" title="Inscriptions" onClick={onClick} />
      )}
      <DrawerTab to="/centre" title="Centres" onClick={onClick} />
      <DrawerTab to="/point-de-rassemblement" title="Points de rassemblement" onClick={onClick} />
      <DrawerTab to="/contenu" title="Contenus" onClick={onClick} />
      <DrawerTab to="/association" title="Annuaire des associations" onClick={onClick} />

      <DrawerConnectToZammood title="Boîte de réception" history={history}>
        {!tickets ? (
          <div />
        ) : (
          <>
            <div className="flex justify-evenly content-center rounded-lg w-14 mr-2.5 px-2  bg-rose-500">
              <MailCloseIcon color="#ffffff" style={{ margin: 0, paddingTop: "2px" }} />
              <div>{newTickets}</div>
            </div>
            <div className="flex justify-evenly content-center rounded-lg w-14 mr-2.5 px-2  bg-amber-400">
              <MailOpenIcon color="#ffffff" style={{ margin: 0, paddingTop: "2px" }} />
              <div>{openedTickets}</div>
            </div>
            <div className="flex justify-evenly content-center rounded-lg w-14 mr-2.5 px-2  bg-green-500">
              <SuccessIcon color="#ffffff" style={{ margin: 0, paddingTop: "3px" }} />
              <div>{closedTickets}</div>
            </div>
          </>
        )}
      </DrawerConnectToZammood>

      <HelpButton to={`/besoin-d-aide?from=${from}`} title="Besoin d'aide" onClick={onClick} />
      <ModalInfo isOpen={info.isOpen} title={info.title} message={info.message} onClose={() => setInfo({ ...info, isOpen: false })} />
    </>
  );
}

function headCenter({ onClick, sessionPhase1, from }) {
  return (
    <>
      {sessionPhase1 && <DrawerTab to={`/centre/${sessionPhase1.cohesionCenterId}`} title="Mon Centre" onClick={onClick} exact />}
      <DrawerTab to="/user" title="Utilisateurs" onClick={onClick} />
      {sessionPhase1 && <DrawerTab to={`/centre/${sessionPhase1.cohesionCenterId}/${sessionPhase1._id}/general`} title="Volontaires" onClick={onClick} />}
      <DrawerTab to="/contenu" title="Contenus" onClick={onClick} />
      <BlankSeparator />
      <HelpButton to={`/besoin-d-aide?from=${from}`} title="Besoin d'aide" onClick={onClick} />
    </>
  );
}

function visitor({ onClick, from }) {
  return (
    <>
      <BlankSeparator />
      <HelpButton to={`/besoin-d-aide?from=${from}`} title="Besoin d'aide" onClick={onClick} />
    </>
  );
}

const Drawer = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, sessionPhase1 } = useSelector((state) => state.Auth);
  const newTickets = useSelector((state) => state.Tickets.new);
  const openedTickets = useSelector((state) => state.Tickets.open);
  const closedTickets = useSelector((state) => state.Tickets.closed);
  const tickets = useSelector((state) => state.Tickets.tickets);
  const [open, setOpen] = useState();
  const [from, setFrom] = useState();
  const history = useHistory();
  const ssoSupportStorage = localStorage?.getItem("sso-support");

  const [info, setInfo] = useState({
    isOpen: false,
    title: "Instruction fermée",
    message: "L'instruction des dossiers sera ouverte à partir de début novembre, merci de votre patience.",
  });

  useEffect(() => {
    setOpen(props.open);
    setIsOpen(props.open);
  }, [props.open]);

  useEffect(() => {
    if (history) {
      return history.listen((location) => {
        setFrom(location.pathname);
      });
    }
  }, [history]);

  useEffect(() => {
    try {
      let query = undefined;
      if (user.role === ROLES.ADMIN) query = {};
      else if (user.role === ROLES.REFERENT_DEPARTMENT) query = { department: user.department, subject: "J'ai une question", role: "young", canal: "PLATFORM" };
      else if (user.role === ROLES.REFERENT_REGION) query = { region: user.region, subject: "J'ai une question", role: "young", canal: "PLATFORM" };

      const getTickets = async (query) => {
        const { data } = await api.post(`/zammood/tickets`, query);
        props.dispatchTickets(data);
      };
      if (query) getTickets(query);
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

  return (
    <div className="min-h-screen max-w-[220px] bg-snu-purple-900 text-white fixed z-10 overflow-y-auto bottom-0 top-[56px] pb-4">
      {!isOpen ? (
        <nav open={open} id="drawer" className="text-white text-base font-normal min-h-full">
          <div className="absolute inset-y-0 left-0 transform -translate-x-full lg:block lg:translate-x-0 lg:relative">
            <ul className="divide-y divide-slate-700">
              <DrawerTab to="/dashboard" title="Tableau de bord" onClick={handleClick} />
              {user.role === ROLES.HEAD_CENTER && headCenter({ user, onClick: handleClick, sessionPhase1, from })}
              {user.role === ROLES.SUPERVISOR && supervisor({ user, onClick: handleClick, from })}
              {user.role === ROLES.RESPONSIBLE && responsible({ user, onClick: handleClick, from })}
              {user.role === ROLES.ADMIN && admin({ onClick: handleClick, newTickets, openedTickets, closedTickets, tickets, from, ssoSupportStorage, history })}
              {[ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) &&
                referent({ onClick: handleClick, newTickets, openedTickets, closedTickets, tickets, from, user, history, info, setInfo })}
              {user.role === ROLES.VISITOR && visitor({ user, onClick: handleClick, from })}
            </ul>
          </div>
        </nav>
      ) : (
        <nav open={open} id="drawer" className="bg-snu-purple-900 text-white text-base font-normal min-h-full">
          <div>
            <ul className="divide-y divide-slate-700">
              <DrawerTab to="/dashboard" title="Tableau de bord" onClick={handleClick} />
              {user.role === ROLES.HEAD_CENTER && headCenter({ user, onClick: handleClick, sessionPhase1, from })}
              {user.role === ROLES.SUPERVISOR && supervisor({ user, onClick: handleClick, from })}
              {user.role === ROLES.RESPONSIBLE && responsible({ user, onClick: handleClick, from })}
              {user.role === ROLES.ADMIN && admin({ onClick: handleClick, newTickets, openedTickets, closedTickets, tickets, from, history })}
              {[ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) &&
                referent({ onClick: handleClick, newTickets, openedTickets, closedTickets, tickets, from, user, history })}
              {user.role === ROLES.VISITOR && visitor({ user, onClick: handleClick, from })}
            </ul>
          </div>
        </nav>
      )}
    </div>
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
