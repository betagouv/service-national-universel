import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { ROLES } from "../../utils";
import { environment } from "../../config";
import User from "./user";
import { RiMenuFill, RiMenuFoldLine } from "react-icons/ri";

export default function HeaderIndex({ onClickBurger, drawerVisible }) {
  const { user } = useSelector((state) => state.Auth);
  const [environmentBannerVisible, setEnvironmentBannerVisible] = React.useState(true);

  if (!user) return <div />;

  function getName() {
    if (user.role === ROLES.ADMIN) return "Espace modérateur";
    if (user.role === ROLES.REFERENT_DEPARTMENT) return `Espace référent départemental • ${user.department}`;
    if (user.role === ROLES.REFERENT_REGION) return `Espace référent régional • ${user.region}`;
    if (user.role === ROLES.RESPONSIBLE) return "Espace responsable";
    if (user.role === ROLES.SUPERVISOR) return "Espace superviseur";
    return "";
  }

  function getTextEnvironmentBanner() {
    if (environment === "staging") return "Espace de Test";
    if (environment === "development") return "Développement";
    return "";
  }

  return (
    <div className="w-full px-2 bg-white h-14 flex items-center justify-between shadow-sm sticky top-0 left-0 z-20 p-1">
      <h1 className="flex items-center gap-2">
        <div className="flex items-center">
          <div className="lg:hidden">
            {drawerVisible ? (
              <RiMenuFoldLine className="w-7 h-7 cursor-pointer" onClick={onClickBurger} />
            ) : (
              <RiMenuFill className="w-7 h-7 cursor-pointer" onClick={onClickBurger} />
            )}
          </div>
          <Link to="/" className="flex items-center group hover:text-black gap-2 mx-3">
            <img src={require("../../assets/logo-snu.png")} className="h-9 w-9 group-hover:scale-105" />
            <span className="text-base font-bold justify-center group-hover:underline">{getName()}</span>
          </Link>
        </div>
        {environment !== "production" && environmentBannerVisible ? (
          <span
            onClick={() => setEnvironmentBannerVisible(false)}
            className="p-2 px-3 bg-red-600 text-white text-xs font-italic items-center text-center rounded-full cursor-pointer hover:opacity-50">
            {getTextEnvironmentBanner()}
          </span>
        ) : null}
      </h1>
      <div className="flex items-center">
        <User />
      </div>
    </div>
  );
}
