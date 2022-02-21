import React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { ROLES } from "../../utils";

import User from "./user";


export default function HeaderIndex({ onClickBurger }) {
  const { user } = useSelector((state) => state.Auth);
  if (!user) return <div />;

  function getName() {
    if (user.role === ROLES.ADMIN) return "Espace modérateur";
    if (user.role === ROLES.REFERENT_DEPARTMENT) return "ESPACE RÉFÉRENT DÉPARTEMENTAL";
    if (user.role === ROLES.REFERENT_REGION) return "ESPACE RÉFÉRENT REGIONAL";
    if (user.role === ROLES.RESPONSIBLE) return "Espace responsable";
    if (user.role === ROLES.SUPERVISOR) return "Espace superviseur";
    return "";
  }

  return (
    <div className="w-full pr-4 bg-white h-14 flex items-center justify-between lg:justify-end shadow-sm sticky top-0 left-0 z-20 p-1">
      <div className="text-base font-bold justify-center ml-3 lg:hidden">{getName()}</div>
      <div className="flex items-center">
        <User />
      </div>
    </div>
  );
}



