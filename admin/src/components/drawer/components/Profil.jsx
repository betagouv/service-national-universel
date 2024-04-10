import { Popover, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link, useHistory } from "react-router-dom";
import { ROLES, translate } from "snu-lib";
import { setUser, setPreviousSignin } from "@/redux/auth/actions";
import api from "@/services/api";
import AddUser from "../icons/AddUser";
import Logout from "../icons/Logout";
import Message from "../icons/Message";
import Settings from "../icons/Settings";
import Support from "../icons/Support";
import User from "../icons/User";
import VericalDot from "../icons/VerticalDot";
import Separator from "./Separator";

export default function Profil({ sideBarOpen, user, setOpenInvite }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const [from, setFrom] = useState();
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    if (history) {
      return history.listen((location) => {
        setFrom(location.pathname);
      });
    }
  }, [history]);

  const onMouseEnter = () => {
    setPopoverOpen(true);
  };

  const onMouseLeave = () => {
    setPopoverOpen(false);
  };

  const getInitials = (word) =>
    (word || "UK")
      .match(/\b(\w)/g)
      .join("")
      .substring(0, 2)
      .toUpperCase();

  async function logout() {
    try {
      setIsLoggingOut(true);
      await api.post(`/referent/logout`);
      dispatch(setUser(null));
      dispatch(setPreviousSignin(null));
      toastr.info("Vous avez bien été déconnecté.", { timeOut: 10000 });
      return history.push("/auth");
    } catch (e) {
      toastr.error("Oups une erreur est survenue lors de la déconnexion", { timeOut: 10000 });
      setIsLoggingOut(false);
    }
  }

  const getDepRegion = (user) => {
    if (user.role === ROLES.REFERENT_DEPARTMENT) {
      return user?.department.length === 1 ? user.department[0] : "Multi-départementaux";
    } else if (user.role === ROLES.REFERENT_REGION) {
      return user.region;
    } else {
      return null;
    }
  };
  return (
    <div className="shrink-0">
      <Separator open={sideBarOpen} />
      <Popover className="relative focus:outline-none">
        {() => {
          return (
            <>
              <div onMouseLeave={onMouseLeave}>
                <Popover.Button onMouseEnter={onMouseEnter} className="focus:outline-none">
                  <div
                    className={`group flex items-center py-[23px] pl-[20px] h-[80px]
                   ${sideBarOpen ? "!pr-1 w-[250px]" : "w-[88px]"} hover:bg-[#1B1F42]`}>
                    <div className="flex items-center justify-center !w-[40px] !h-[40px] rounded-full bg-[#EEEFF5]">
                      <span className="text-lg font-medium text-[#0C1035] leading-6 align-middle !pb-0.5">{getInitials(user.firstName + " " + user.lastName)}</span>
                    </div>
                    {sideBarOpen && (
                      <div className="!ml-3 flex flex-col">
                        <span className=" text-left text-xs leading-5 font-semibold h-[20px] truncate uppercase text-[#EEEFF5] w-[150px]">{translate(user.role)}</span>
                        {getDepRegion(user) && <span className=" text-left text-xs leading-5 font-normal h-[20px] truncate text-[#EEEFF5]/80 w-[150px]">{getDepRegion(user)}</span>}
                        {user.role === ROLES.ADMINISTRATEUR_CLE && (
                          <span className=" text-left text-xs leading-5 font-normal h-[20px] truncate text-[#EEEFF5]/80 w-[150px]">{translate(user.subRole)}</span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-center !ml-1 w-[20px] h-[20px]">
                      <VericalDot className="text-[#EEEFF5]/50 group-hover:text-[#EEEFF5]/70" />
                    </div>
                  </div>
                </Popover.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                  show={isPopoverOpen}
                  onEnter={() => setPopoverOpen(true)}
                  onExited={() => setPopoverOpen(false)}>
                  <Popover.Panel className="absolute transform left-[100%] bottom-1/2 ">
                    <div className="!ml-2 px-[1px] py-[1px] bg-white shadow-md rounded-lg w-[275px] z-20 flex flex-col">
                      {/* Header */}
                      <Link className="group flex items-center h-[62px] rounded-t-md py-[14px] pl-[15px] pr-[13px] hover:bg-[#EEEFF5]" to={"/profil"}>
                        <div className="flex items-center justify-center w-[26px] h-[26px]">
                          <User className="text-[#30345B]" />
                        </div>
                        <div className="ml-[9px] flex flex-col gap-[2px]">
                          <span className="text-sm leading-5 h-[20px] text-left text-[#1B1F42] align-middle">Mon Profil</span>
                          <span className="text-xs -leading-2 text-left text-[#7F83A7] truncate w-[210px] overflow-visible align-middle">{user.email}</span>
                        </div>
                      </Link>
                      <div className="bg-[#EEEFF5] h-[1px] mx-auto w-[247px] 1mb-1" />
                      {/* Body */}
                      <div className="flex flex-col !py-1 px-[3px]">
                        {[ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) && (
                          <NavItemAction Icon={AddUser} title="Inviter un nouvel utilisateur" onClick={() => setOpenInvite(true)} />
                        )}
                        {[ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role) && user.structureId && (
                          <NavItem Icon={AddUser} title="Inviter un nouveau responsable" link={`/structure/${user.structureId}?prompt=team`} />
                        )}
                        {[ROLES.ADMIN].includes(user.role) && <NavItem Icon={Settings} title="Paramétrages dynamiques" link="/settings" />}
                        {[ROLES.ADMIN].includes(user.role) && <NavItem Icon={Message} title="Messages d'alerte" link={"/alerte"} />}
                        {<NavItem Icon={Support} title="Besoin d'aide ?" link={`/besoin-d-aide?from=${from}`} />}
                        {/* <NavItem />
                    <NavItem />
                    <NavItem /> */}
                      </div>
                      <div className="bg-[#EEEFF5] h-[1px] mx-auto w-[247px] !mt-1" />
                      {/* Footer */}
                      <button className="group flex items-center !h-14 rounded-b-md py-[17px] pl-[17px] pr-[13px] hover:bg-red-50" disabled={isLoggingOut} onClick={logout}>
                        <div className="flex items-center justify-center w-[22px] h-[22px]">
                          <Logout className="text-red-700" />
                        </div>
                        <span className="ml-[11px] text-sm leading-5 h-[20px] text-left text-red-700 align-middle">Se déconnecter</span>
                      </button>
                    </div>
                  </Popover.Panel>
                </Transition>
              </div>
            </>
          );
        }}
      </Popover>
    </div>
  );
}

const NavItem = ({ Icon, title, link }) => {
  return (
    <Link className="group flex items-center h-[42px] rounded-md py-[10px] pl-[14px] pr-[13px] hover:bg-[#EEEFF5]" to={link}>
      <div className="flex items-center justify-center w-[22px] h-[22px]">
        <Icon className="text-[#30345B]" />
      </div>
      <span className="ml-[11px] text-sm leading-5 h-[20px] text-left text-[#1B1F42] align-middle text-ellipsis whitespace-nowrap overflow-hidden">{title}</span>
    </Link>
  );
};

const NavItemAction = ({ Icon, title, onClick }) => {
  return (
    <button className="group flex items-center h-[42px] rounded-md py-[10px] pl-[14px] pr-[13px] hover:bg-[#EEEFF5]" onClick={onClick}>
      <div className="flex items-center justify-center w-[22px] h-[22px]">
        <Icon className="text-[#30345B]" />
      </div>
      <span className="ml-[11px] text-sm leading-5 h-[20px] text-left text-[#1B1F42] align-middle">{title}</span>
    </button>
  );
};
