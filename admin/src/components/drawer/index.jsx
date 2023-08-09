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
import { department2region } from "snu-lib";

const DrawerTab = ({ title, to, onClick, beta, exact }) => {
  if (environment === "production" && beta) return null;
  return (
    <div onClick={onClick} className=" block hover:bg-snu-purple-800 hover:shadow-lg">
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
    <div onClick={onClick} className=" block cursor-pointer hover:bg-snu-purple-800 hover:shadow-lg">
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
    className="mb-4 flex justify-center p-8"
    onClick={() => {
      plausibleEvent("Menu/CTA - Besoin Aide");
      onClick();
    }}>
    <NavLink className=" flex items-center rounded border p-2 hover:bg-snu-purple-800 hover:!text-white hover:shadow-lg" activeClassName="flex bg-snu-purple-300 p-2" to={to}>
      <QuestionMark className="mr-2 flex h-6 w-6" />
      <div>
        <div className=" text-center text-sm font-normal  ">Besoin d&apos;aide&nbsp;?</div>
        <div className="float-right text-center text-xs font-light ">Tutoriels, contacts</div>
      </div>
    </NavLink>
  </div>
);

const DrawerTabWithIcons = ({ title, children, to, onClick }) => {
  return (
    <div onClick={onClick} className="block hover:bg-snu-purple-800 hover:shadow-lg">
      <NavLink to={to} className=" block py-3 pl-3 text-base hover:!text-white" activeClassName=" bg-snu-purple-300 py-3 pl-3 font-bold">
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
    <div onClick={connectToZammood} className="block cursor-pointer hover:bg-snu-purple-800 hover:shadow-lg">
      <div className=" block py-3 pl-3 text-base hover:!text-white">
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
      <DrawerTab to={"/volontaire/list/all"} title="Mes candidatures" onClick={onClick} />
      <HelpButton to={`/besoin-d-aide?from=${from}`} title="Besoin d'aide" onClick={onClick} />
    </>
  );
}

function supervisor({ user, onClick, from }) {
  return (
    <>
      <DrawerTab to={`/structure/${user.structureId}`} title="Ma tête de réseau" onClick={onClick} />
      <DrawerTab to="/structure" title="Structures affiliées" onClick={onClick} exact={true} />
      <DrawerTab to="/mission" title="Missions" onClick={onClick} />
      <DrawerTab to="/user" title="Utilisateurs" onClick={onClick} />
      <DrawerTab to={"/volontaire/list/all"} title="Mes candidatures" onClick={onClick} />
      <HelpButton to={`/besoin-d-aide?from=${from}`} title="Besoin d'aide" onClick={onClick} />
    </>
  );
}

function admin({ onClick, newTickets, openedTickets, closedTickets, tickets, from, history, subRole }) {
  return (
    <>
      <DrawerTab to="/structure" title="Structures" onClick={onClick} />
      <DrawerTab to="/mission" title="Missions" onClick={onClick} />
      <DrawerTab to="/user" title="Utilisateurs" onClick={onClick} />
      <DrawerTab to="/volontaire" title="Volontaires" onClick={onClick} />
      <DrawerTab to="/inscription" title="Inscriptions" onClick={onClick} />
      <DrawerTab to="/point-de-rassemblement/liste/liste-points" title="Points de rassemblement" onClick={onClick} />
      <DrawerTab to="/centre" title="Centres" onClick={onClick} />
      <DrawerTab to="/table-repartition" title="Table de répartition" onClick={onClick} />
      <DrawerTab to="/schema-repartition" title="Schéma de répartition" onClick={onClick} />
      <DrawerTab to="/ligne-de-bus" title="Plan de transport" onClick={onClick} />
      {subRole === "god" ? <DrawerTab to="/edit-transport" title="Edit Plan de transport" onClick={onClick} /> : null}
      <DrawerTab to="/contenu" title="Contenus" onClick={onClick} />
      <DrawerTab to="/objectifs" title="Objectifs" onClick={onClick} />
      <DrawerTab to="/association" title="Annuaire des associations" onClick={onClick} />
      <DrawerTab to="/dsnj-export" title="Export DSNJ" onClick={onClick} />
      {environment === "development" && <DrawerTab to="/develop-assets" title="🤖 Develop Assets" onClick={onClick} />}

      <DrawerConnectToZammood title="Boîte de réception" history={history}>
        {!tickets ? (
          <div />
        ) : (
          <>
            <div className="mr-2.5 flex w-14 content-center justify-evenly rounded-lg bg-rose-500  px-2">
              <MailCloseIcon color="#ffffff" style={{ margin: 0, paddingTop: "2px" }} />
              <div>{newTickets}</div>
            </div>
            <div className="mr-2.5 flex w-14 content-center justify-evenly rounded-lg bg-amber-400  px-2">
              <MailOpenIcon color="#ffffff" style={{ margin: 0, paddingTop: "2px" }} />
              <div>{openedTickets}</div>
            </div>
            <div className="mr-2.5 flex w-14 content-center justify-evenly rounded-lg bg-green-500  px-2">
              <SuccessIcon color="#ffffff" style={{ margin: 0, paddingTop: "3px" }} />
              <div>{closedTickets}</div>
            </div>
          </>
        )}
      </DrawerConnectToZammood>

      <HelpButton to={`/besoin-d-aide?from=${from}`} title="Besoin d'aide" onClick={onClick} />
    </>
  );
}

function referent({ onClick, newTickets, openedTickets, closedTickets, tickets, from, history, info, setInfo, user }) {
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
      <DrawerTab to="/inscription" title="Inscriptions" onClick={onClick} />
      <DrawerTab to="/point-de-rassemblement/liste/liste-points" title="Points de rassemblement" onClick={onClick} />
      <DrawerTab to="/centre" title="Centres" onClick={onClick} />
      <DrawerTab to="/table-repartition" title="Table de répartition" onClick={onClick} />
      {user.role === ROLES.REFERENT_DEPARTMENT ? (
        <DrawerTab to={`/schema-repartition/${department2region[user.department[0]]}/${user.department[0]}`} title="Schéma de répartition" onClick={onClick} />
      ) : user.role === ROLES.REFERENT_REGION ? (
        <DrawerTab to={`/schema-repartition/${user.region}`} title="Schéma de répartition" onClick={onClick} />
      ) : (
        <DrawerTab to="/schema-repartition" title="Schéma de répartition" onClick={onClick} />
      )}
      <DrawerTab to="/ligne-de-bus" title="Plan de transport" onClick={onClick} />
      <DrawerTab to="/contenu" title="Contenus" onClick={onClick} />
      <DrawerTab to="/association" title="Annuaire des associations" onClick={onClick} />

      <DrawerConnectToZammood title="Boîte de réception" history={history}>
        {!tickets ? (
          <div />
        ) : (
          <>
            <div className="mr-2.5 flex w-14 content-center justify-evenly rounded-lg bg-rose-500  px-2">
              <MailCloseIcon color="#ffffff" style={{ margin: 0, paddingTop: "2px" }} />
              <div>{newTickets}</div>
            </div>
            <div className="mr-2.5 flex w-14 content-center justify-evenly rounded-lg bg-amber-400  px-2">
              <MailOpenIcon color="#ffffff" style={{ margin: 0, paddingTop: "2px" }} />
              <div>{openedTickets}</div>
            </div>
            <div className="mr-2.5 flex w-14 content-center justify-evenly rounded-lg bg-green-500  px-2">
              <SuccessIcon color="#ffffff" style={{ margin: 0, paddingTop: "3px" }} />
              <div>{closedTickets}</div>
            </div>
          </>
        )}
      </DrawerConnectToZammood>

      <HelpButton to={`/besoin-d-aide?from=${from}`} title="Besoin d'aide" onClick={onClick} />
      <ModalInfo
        isOpen={info?.isOpen}
        title={info?.title}
        message={info?.message}
        onClose={() => {
          setInfo({ ...info, isOpen: false });
        }}
      />
    </>
  );
}

function headCenter({ onClick, sessionPhase1, from }) {
  return (
    <>
      {sessionPhase1 && <DrawerTab to={`/centre/${sessionPhase1.cohesionCenterId}`} title="Mon Centre" onClick={onClick} exact />}
      <DrawerTab to="/user" title="Utilisateurs" onClick={onClick} />
      {sessionPhase1 && <DrawerTab to={`/centre/${sessionPhase1.cohesionCenterId}/${sessionPhase1._id}/general`} title="Volontaires" onClick={onClick} />}
      <DrawerTab to="/ligne-de-bus" title="Plan de transport" onClick={onClick} />
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

function dsnj({ onClick }) {
  return <DrawerTab to="/dsnj-export" title="Export DSNJ" onClick={onClick} />;
}

function transporter({ onClick }) {
  return (
    <>
      <DrawerTab to="/point-de-rassemblement/liste/liste-points" title="Points de rassemblement" onClick={onClick} />
      <DrawerTab to="/centre" title="Centres" onClick={onClick} />
      <DrawerTab to="/schema-repartition" title="Schéma de répartition" onClick={onClick} />
      <DrawerTab to="/ligne-de-bus" title="Plan de transport" onClick={onClick} />
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
    if (!user) return;
    const getTickets = async () => {
      try {
        const { data } = await api.get("/zammood/ticketscount");
        props.dispatchTickets(data);
      } catch (error) {
        console.log(error);
      }
    };
    getTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleClick = () => {
    if (open) {
      props.onOpen(false);
    }
  };

  if (!user) return <div />;

  return (
    <div className="fixed bottom-0 top-[56px] z-10 min-h-screen max-w-[220px] overflow-y-auto bg-snu-purple-900 pb-4 text-white">
      {!isOpen ? (
        <nav open={open} id="drawer" className="min-h-full text-base font-normal text-white">
          <div className="absolute inset-y-0 left-0 -translate-x-full transform lg:relative lg:block lg:translate-x-0">
            <ul className="min-w-[220px] divide-y divide-slate-700">
              {![ROLES.DSNJ, ROLES.TRANSPORTER].includes(user.role) && <DrawerTab to="/dashboard" title="Tableau de bord" onClick={handleClick} />}
              {user.role === ROLES.HEAD_CENTER && headCenter({ user, onClick: handleClick, sessionPhase1, from })}
              {user.role === ROLES.SUPERVISOR && supervisor({ user, onClick: handleClick, from })}
              {user.role === ROLES.RESPONSIBLE && responsible({ user, onClick: handleClick, from })}
              {user.role === ROLES.ADMIN && admin({ onClick: handleClick, newTickets, openedTickets, closedTickets, tickets, from, history, subRole: user.subRole })}
              {[ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) &&
                referent({ onClick: handleClick, newTickets, openedTickets, closedTickets, tickets, from, user, history, info, setInfo })}
              {user.role === ROLES.VISITOR && visitor({ user, onClick: handleClick, from })}
              {user.role === ROLES.DSNJ && dsnj({ user, onClick: handleClick, from })}
              {user.role === ROLES.TRANSPORTER && transporter({ user, onClick: handleClick, from })}
            </ul>
          </div>
        </nav>
      ) : (
        <nav open={open} id="drawer" className="min-h-full bg-snu-purple-900 text-base font-normal text-white">
          <div>
            <ul className="divide-y divide-slate-700">
              {![ROLES.DSNJ, ROLES.TRANSPORTER].includes(user.role) && <DrawerTab to="/dashboard" title="Tableau de bord" onClick={handleClick} />}
              {user.role === ROLES.HEAD_CENTER && headCenter({ user, onClick: handleClick, sessionPhase1, from })}
              {user.role === ROLES.SUPERVISOR && supervisor({ user, onClick: handleClick, from })}
              {user.role === ROLES.RESPONSIBLE && responsible({ user, onClick: handleClick, from })}
              {user.role === ROLES.ADMIN && admin({ onClick: handleClick, newTickets, openedTickets, closedTickets, tickets, from, history, subRole: user.subRole })}
              {[ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) &&
                referent({ onClick: handleClick, newTickets, openedTickets, closedTickets, tickets, from, user, history })}
              {user.role === ROLES.VISITOR && visitor({ user, onClick: handleClick, from })}
              {user.role === ROLES.TRANSPORTER && transporter({ user, onClick: handleClick, from })}
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
