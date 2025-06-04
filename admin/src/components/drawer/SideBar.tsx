import React, { ReactElement, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import cx from "classnames";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { HiOutlineCommandLine } from "react-icons/hi2";
import { useToggle } from "react-use";

import { FEATURES_NAME, ROLES, SUB_ROLE_GOD, isFeatureEnabled, PERMISSION_RESOURCES, isExecuteAuthorized, isReadAuthorized } from "snu-lib";

import api from "@/services/api";
import useDevice from "@/hooks/useDevice";
import useEnvironment from "@/hooks/useEnvironment";
import ticketsAction from "@/redux/tickets/actions";
import { AuthState } from "@/redux/auth/reducer";
import { TicketsState } from "@/redux/tickets/reducer";
import { environment } from "../../config";

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
import HomeIcon from "./icons/Home";

import Header from "./components/Header";
import MultiNavItem from "./components/MultiNavItem";
import SimpleNavItem from "./components/SimpleNavItem";
import SNUpportBox from "./components/SNUpportBox";
import SwitchSession from "./components/SwitchSession";
import Profil from "./components/Profil";
import InviteHeader from "./components/invite";
import { isResponsableDeCentre } from "@/utils";

//Css !important becuse of bootstrap override

const SideBar = ({ sessionsList }) => {
  const dispatch = useDispatch();

  //Location
  const location = useLocation();
  const exactPath = location.pathname;
  const path = location.pathname.split("/")[1];
  const device = useDevice();
  const { isDevelopment, isCustom, isCi, isPrepoduction, isProduction } = useEnvironment();

  //State
  const [open, setOpen] = React.useState(false);
  const [openInvite, setOpenInvite] = React.useState(false);
  const [dropDownOpen, setDropDownOpen] = React.useState("");
  const [isDemo, toggleDemo] = useToggle(false);

  //Redux
  const { user, sessionPhase1 } = useSelector((state: AuthState) => state.Auth);
  const isImpersonate = !!user.impersonateId;
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
    if (isReadAuthorized({ user, resource: PERMISSION_RESOURCES.SUPPORT })) {
      getTickets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  //Special components
  const Tickets = () => <SNUpportBox newTickets={newTickets} openedTickets={openedTickets} sideBarOpen={open} />;
  const Session = () => <SwitchSession sideBarOpen={open} sessionsList={sessionsList} sessionPhase1={sessionPhase1} />;

  //NavLinks
  const Accueil = () => <SimpleNavItem sideBarOpen={open} Icon={HomeIcon} title="Accueil" link="/accueil" active={path === "accueil"} setCurrentOpen={setDropDownOpen} />;
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
  const ExportInjep = () => (
    <SimpleNavItem sideBarOpen={open} Icon={ClipboardIcon} title="Export INJEP" link="/injep-export" active={path === "injep-export"} setCurrentOpen={setDropDownOpen} />
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
  const CentresHeadCenter = () => {
    const buildCentreLink = () => {
      const baseUrl = `/centre/${sessionPhase1?.cohesionCenterId}`;
      if (sessionPhase1?.cohort) {
        return `${baseUrl}?cohorte=${encodeURIComponent(sessionPhase1.cohort)}`;
      }
      return baseUrl;
    };

    return (
      <SimpleNavItem sideBarOpen={open} Icon={SejourIcon} title="Centre" link={buildCentreLink()} active={centerHeadCenterRegex.test(exactPath)} setCurrentOpen={setDropDownOpen} />
    );
  };
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
  const godItems = [Dashboard, Volontaire, Inscriptions, SejoursGod, Engagement, Utilisateurs];
  const adminItems = [Dashboard, Volontaire, Inscriptions, SejoursAdmin, Engagement, Utilisateurs];
  if (isFeatureEnabled(FEATURES_NAME.DEVELOPERS_MODE, user?.role, environment)) {
    godItems.push(Dev);
    adminItems.push(Dev);
  }
  const refItems = [Dashboard, Volontaire, Inscriptions, SejoursRef, Engagement, Admisnistrateur];
  const headCenterItems = [Dashboard, VolontaireHeadCenter, CentresHeadCenter, PlanDeTransport, Contenus, Utilisateurs];
  const transporteurItems = [Point, Centre, Schema, PlanDeTransport];
  const responsableItems = [Dashboard, Candidature, Structure, Missions];
  const supervisorItems = [Dashboard, Candidature, Network, StructureSupervisor, Missions, Utilisateurs];
  const visitorItems = [Dashboard];
  const institutionItems = [Accueil, Institution, Classe, VolontaireCle, Contact];

  const getItems = () => {
    let items: (() => ReactElement)[] = [];
    switch (user?.role) {
      case ROLES.REFERENT_DEPARTMENT:
      case ROLES.REFERENT_REGION:
        items = [...refItems];
        break;
      case ROLES.ADMIN:
        items = [...(user.subRole === SUB_ROLE_GOD ? godItems : adminItems)];
        break;
      case ROLES.HEAD_CENTER:
      case ROLES.HEAD_CENTER_ADJOINT:
      case ROLES.REFERENT_SANITAIRE:
        items = [...headCenterItems];
        break;
      case ROLES.TRANSPORTER:
        items = [...transporteurItems];
        break;
      case ROLES.RESPONSIBLE:
        items = [...responsableItems];
        break;
      case ROLES.SUPERVISOR:
        items = [...supervisorItems];
        break;
      case ROLES.VISITOR:
        items = [...visitorItems];
        break;
      case ROLES.ADMINISTRATEUR_CLE:
      case ROLES.REFERENT_CLASSE:
        items = [...institutionItems];
        break;
    }

    // clean la construction du menu qui est différente en fonction du rôle
    if (!items.includes(SejoursAdmin) && !items.includes(SejoursGod)) {
      if (isExecuteAuthorized({ user, resource: PERMISSION_RESOURCES.EXPORT_INJEP })) {
        items.push(ExportInjep);
      }
      if (isExecuteAuthorized({ user, resource: PERMISSION_RESOURCES.EXPORT_DSNJ })) {
        items.push(ExportDsnj);
      }
    }
    return items;
  };

  return (
    <div
      className={cx(
        "sticky flex flex-col inset-y-0  z-40 print:hidden",
        { "w-[250px]": open },
        { "w-[88px]": !open },
        { "top-[5vh] max-h-[95vh]": isImpersonate },
        { "h-screen max-h-screen": !isImpersonate },
        { "bg-[#25294F]": isProduction || isDemo },
        { "bg-blue-800": isDevelopment && !isDemo },
        { "bg-teal-900": isCustom && !isDemo },
        { "bg-yellow-900": isCi && !isDemo },
        { "bg-black": isPrepoduction && !isDemo },
      )}>
      <div className="flex flex-col justify-between h-full min-h-full">
        <Header open={open} setOpen={setOpen} onDemoChange={toggleDemo} />
        {isReadAuthorized({ user, resource: PERMISSION_RESOURCES.SUPPORT }) && <Tickets />}
        {isResponsableDeCentre(user) && <Session />}
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
