import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import cx from "classnames";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { HiOutlineCommandLine } from "react-icons/hi2";

import { FEATURES_NAME, ROLES, isFeatureEnabled } from "snu-lib";

import api from "@/services/api";
import useDevice from "@/hooks/useDevice";
import ticketsAction from "@/redux/tickets/actions";
import { AuthState } from "@/redux/auth/reducer";
import { TicketsState } from "@/redux/tickets/reducer";

import { centerHeadCenterRegex, itemsAdministrateur, itemsEngagement, itemsSejourAdmin, itemsSejourGod, itemsSejourRef, itemsDev, volontaireHeadCenterRegex } from "./utils";

import AdminIcon from "./icons/Admin";
import ContenuIcon from "./icons/Contenu";
import DashboardIcon from "./icons/Dashboard";
import EngagementIcon from "./icons/Engagement";
import InscriptionIcon from "./icons/Inscription";
import SejourIcon from "./icons/Sejour";
import VolontaireIcon from "./icons/Volontaire";
import SchemaIcon from "./icons/Schema";
import MapIcon from "./icons/Map";
import FlagIcon from "./icons/Flag";
import GlobeIcon from "./icons/Globe";
import LocationIcon from "./icons/Location";
import ClipboardIcon from "./icons/Clipboard";
import InstitutionIcon from "./icons/Institution";
import StudentIcon from "./icons/Student";

import Header from "./components/Header";
import MultiNavItem from "./components/MultiNavItem";
import SimpleNavItem from "./components/SimpleNavItem";
import SNUpportBox from "./components/SNUpportBox";
import SwitchSession from "./components/SwitchSession";
import Profil from "./components/Profil";
import InviteHeader from "./components/invite";

//Css !important becuse of bootstrap override

const SideBar = ({ sessionsList }) => {
  const dispatch = useDispatch();

  //Location
  const location = useLocation();
  const exactPath = location.pathname;
  const path = location.pathname.split("/")[1];
  const device = useDevice();

  //State
  const [open, setOpen] = React.useState(false);
  const test = useSelector((state: AuthState) => state.Auth.previousSigninToken);
  const [openInvite, setOpenInvite] = React.useState(false);
  const [dropDownOpen, setDropDownOpen] = React.useState("");

  //Redux
  const { user, sessionPhase1 } = useSelector((state: AuthState) => state.Auth);
  const newTickets = useSelector((state: TicketsState) => state.Tickets.new);
  const openedTickets = useSelector((state: TicketsState) => state.Tickets.open);

  //Check if the sidebar is open or not in the local storage
  useEffect(() => {
    if (localStorage?.getItem("sideBarOpen") === "false") setOpen(false);
    else setOpen(true);
  }, []);

  //Close the sidebar if the device becomes mobile
  useEffect(() => {
    setOpen(device !== "mobile");
  }, [device]);

  //Fetch tickets count
  useEffect(() => {
    if (!user || ![ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user?.role)) return;
    const getTickets = async () => {
      try {
        const { data: tickets } = await api.get("/SNUpport/ticketscount");
        if (tickets) {
          dispatch(ticketsAction.updateTickets(tickets));
        }
      } catch (error) {
        console.log(error);
      }
    };
    getTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  //Special components
  const Tickets = () => <SNUpportBox newTickets={newTickets} openedTickets={openedTickets} sideBarOpen={open} />;
  const Session = () => <SwitchSession sideBarOpen={open} sessionsList={sessionsList} sessionPhase1={sessionPhase1} />;

  //NavLinks
  const Dashboard = () => (
    <SimpleNavItem sideBarOpen={open} Icon={DashboardIcon} title="Tableau de bord" link="/dashboard" active={path === "dashboard"} setCurrentOpen={setDropDownOpen} />
  );
  const Volontaire = () => (
    <SimpleNavItem sideBarOpen={open} Icon={VolontaireIcon} title="Volontaires" link="/volontaire" active={path === "volontaire"} setCurrentOpen={setDropDownOpen} />
  );
  const Contenus = () => <SimpleNavItem sideBarOpen={open} Icon={ContenuIcon} title="Contenus" link="/contenu" active={path === "contenu"} setCurrentOpen={setDropDownOpen} />;
  const Inscriptions = () => (
    <SimpleNavItem sideBarOpen={open} Icon={InscriptionIcon} title="Inscriptions" link="/inscription" active={path === "inscription"} setCurrentOpen={setDropDownOpen} />
  );
  const Utilisateurs = () => <SimpleNavItem sideBarOpen={open} Icon={AdminIcon} title="Utilisateurs" link="/user" active={path === "user"} setCurrentOpen={setDropDownOpen} />;
  const Schema = () => (
    <SimpleNavItem
      sideBarOpen={open}
      Icon={SchemaIcon}
      title="Schéma de répartition"
      link="/schema-repartition"
      active={path === "schema-repartition"}
      setCurrentOpen={setDropDownOpen}
    />
  );
  const Candidature = () => (
    <SimpleNavItem sideBarOpen={open} Icon={VolontaireIcon} title="Candidatures" link="/volontaire/list/all" active={path === "volontaire"} setCurrentOpen={setDropDownOpen} />
  );
  const Missions = () => <SimpleNavItem sideBarOpen={open} Icon={EngagementIcon} title="Missions" link="/mission" active={path === "mission"} setCurrentOpen={setDropDownOpen} />;
  const Network = () => (
    <SimpleNavItem
      sideBarOpen={open}
      Icon={FlagIcon}
      title="Tête de réseau"
      link={`/structure/${user?.structureId}`}
      active={new RegExp("/structure/" + user?.structureId).test(exactPath)}
      setCurrentOpen={setDropDownOpen}
    />
  );
  const ExportDsnj = () => (
    <SimpleNavItem sideBarOpen={open} Icon={ClipboardIcon} title="Export DSNJ" link="/dsnj-export" active={path === "dsnj-export"} setCurrentOpen={setDropDownOpen} />
  );
  const Structure = () => (
    <SimpleNavItem
      sideBarOpen={open}
      Icon={SejourIcon}
      title="Structures"
      link={`/structure/${user?.structureId}`}
      active={path === "structure"}
      setCurrentOpen={setDropDownOpen}
    />
  );
  const StructureSupervisor = () => (
    <SimpleNavItem
      sideBarOpen={open}
      Icon={GlobeIcon}
      title="Structures affiliées"
      link={`/structure`}
      active={path === "structure" && !new RegExp("/structure/" + user?.structureId).test(exactPath)}
      setCurrentOpen={setDropDownOpen}
    />
  );
  const Centre = () => <SimpleNavItem sideBarOpen={open} Icon={SejourIcon} title="Centres" link="/centre" active={path === "centre"} setCurrentOpen={setDropDownOpen} />;
  const PlanDeTransport = () => (
    <SimpleNavItem sideBarOpen={open} Icon={MapIcon} title="Plan de transport" link="/ligne-de-bus" active={path === "ligne-de-bus"} setCurrentOpen={setDropDownOpen} />
  );
  const Point = () => (
    <SimpleNavItem
      sideBarOpen={open}
      Icon={LocationIcon}
      title="Points de rassemblement"
      link="/point-de-rassemblement/liste/liste-points"
      active={path === "point-de-rassemblement"}
      setCurrentOpen={setDropDownOpen}
    />
  );
  const VolontaireHeadCenter = () => (
    <SimpleNavItem
      sideBarOpen={open}
      Icon={VolontaireIcon}
      title="Volontaires"
      link={`/centre/${sessionPhase1?.cohesionCenterId}/${sessionPhase1?._id}/general`}
      active={volontaireHeadCenterRegex.test(exactPath)}
      setCurrentOpen={setDropDownOpen}
    />
  );
  const CentresHeadCenter = () => (
    <SimpleNavItem
      sideBarOpen={open}
      Icon={SejourIcon}
      title="Centre"
      link={`/centre/${sessionPhase1?.cohesionCenterId}`}
      active={centerHeadCenterRegex.test(exactPath)}
      setCurrentOpen={setDropDownOpen}
    />
  );
  const Institution = () => (
    <SimpleNavItem
      sideBarOpen={open}
      Icon={InstitutionIcon}
      title="Mon établissement"
      link="/mon-etablissement"
      active={path.includes("mon-etablissement")}
      setCurrentOpen={setDropDownOpen}
    />
  );
  const Classe = () => (
    <SimpleNavItem sideBarOpen={open} Icon={HiOutlineOfficeBuilding} title="Mes classes" link="/classes" active={path.includes("classes")} setCurrentOpen={setDropDownOpen} />
  );

  const VolontaireCle = () => (
    <SimpleNavItem sideBarOpen={open} Icon={StudentIcon} title="Mes élèves" link="/mes-eleves" active={path.includes("mes-eleves")} setCurrentOpen={setDropDownOpen} />
  );
  const Contact = () => (
    <SimpleNavItem sideBarOpen={open} Icon={AdminIcon} title="Mes contacts" link="/user" active={path.includes("mes-contacts")} setCurrentOpen={setDropDownOpen} />
  );

  //MultiNavLinks
  const SejoursGod = () => (
    <MultiNavItem sideBarOpen={open} Icon={SejourIcon} title="Séjours" items={itemsSejourGod} path={path} currentOpen={dropDownOpen} setCurrentOpen={setDropDownOpen} />
  );
  const SejoursAdmin = () => (
    <MultiNavItem sideBarOpen={open} Icon={SejourIcon} title="Séjours" items={itemsSejourAdmin} path={path} currentOpen={dropDownOpen} setCurrentOpen={setDropDownOpen} />
  );
  const SejoursRef = () => (
    <MultiNavItem sideBarOpen={open} Icon={SejourIcon} title="Séjours" items={itemsSejourRef} path={path} currentOpen={dropDownOpen} setCurrentOpen={setDropDownOpen} />
  );
  const Engagement = () => (
    <MultiNavItem sideBarOpen={open} Icon={EngagementIcon} title="Engagement" items={itemsEngagement} path={path} currentOpen={dropDownOpen} setCurrentOpen={setDropDownOpen} />
  );
  const Admisnistrateur = () => (
    <MultiNavItem sideBarOpen={open} Icon={AdminIcon} title="Administrateurs" items={itemsAdministrateur} path={path} currentOpen={dropDownOpen} setCurrentOpen={setDropDownOpen} />
  );
  const Dev = () => (
    <MultiNavItem sideBarOpen={open} Icon={HiOutlineCommandLine} title="Dev" items={itemsDev} path={path} currentOpen={dropDownOpen} setCurrentOpen={setDropDownOpen} />
  );

  //Components to display depending on user role
  const godItems = [Dashboard, Volontaire, Inscriptions, SejoursGod, Engagement, Utilisateurs, Dev];
  const adminItems = [Dashboard, Volontaire, Inscriptions, SejoursAdmin, Engagement, Utilisateurs];
  isFeatureEnabled(FEATURES_NAME.DEVELOPERS_MODE, user?.role) && adminItems.push(Dev);
  const refItems = [Dashboard, Volontaire, Inscriptions, SejoursRef, Engagement, Admisnistrateur];
  const headCenterItems = [Dashboard, VolontaireHeadCenter, CentresHeadCenter, PlanDeTransport, Contenus, Utilisateurs];
  const transporteurItems = [Point, Centre, Schema, PlanDeTransport];
  const responsableItems = [Dashboard, Candidature, Structure, Missions];
  const supervisorItems = [Dashboard, Candidature, Network, StructureSupervisor, Missions, Utilisateurs];
  const visitorItems = [Dashboard];
  const dsnjItems = [ExportDsnj];
  const institutionItems = [Institution, Classe, VolontaireCle, Contact];

  const getItems = () => {
    switch (user?.role) {
      case ROLES.REFERENT_DEPARTMENT:
      case ROLES.REFERENT_REGION:
        return refItems;
      case ROLES.ADMIN:
        return user.subRole === "god" ? godItems : adminItems;
      case ROLES.HEAD_CENTER:
        return headCenterItems;
      case ROLES.TRANSPORTER:
        return transporteurItems;
      case ROLES.RESPONSIBLE:
        return responsableItems;
      case ROLES.SUPERVISOR:
        return supervisorItems;
      case ROLES.VISITOR:
        return visitorItems;
      case ROLES.DSNJ:
        return dsnjItems;
      case ROLES.ADMINISTRATEUR_CLE:
      case ROLES.REFERENT_CLASSE:
        return institutionItems;
      default:
        return [];
    }
  };

  return (
    <div
      className={cx(
        "sticky flex flex-col inset-y-0 bg-[#25294F] z-40 print:hidden",
        { "w-[250px]": open },
        { "w-[88px]": !open },
        { "top-[5vh] max-h-[95vh]": test },
        { "h-screen max-h-screen": !test },
      )}>
      <div className="flex flex-col justify-between h-full min-h-full">
        <Header open={open} setOpen={setOpen} />
        {[ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user?.role) && <Tickets />}
        {[ROLES.HEAD_CENTER].includes(user?.role) && <Session />}
        <div className={cx("flex flex-col flex-[1_1_auto]", { "overflow-y-hidden": open })}>
          <div className={cx("flex-1 max-h-full", { "overflow-y-auto no-scrollbar": open })}>
            <div className="flex flex-col items-center !mt-1">
              {getItems().map((Component, index) => (
                <Component key={"nav-item" + index} />
              ))}
            </div>
          </div>
        </div>
        <Profil sideBarOpen={open} user={user} setOpenInvite={setOpenInvite} />
      </div>
      {[ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) && (
        <InviteHeader label="Inviter un nouvel utilisateur" open={openInvite} setOpen={() => setOpenInvite(false)} />
      )}
    </div>
  );
};

export default SideBar;
