import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { setYoung } from "../../../../redux/auth/actions";
import API from "../../../../services/api";
import MenuLink from "./MenuLink";
import MenuButton from "./MenuButton";
import { permissionPhase2 } from "../../../../utils";
import { toastr } from "react-redux-toastr";

export default function UserMenu({ onClose, ticketsInfo }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function logout() {
    try {
      setIsLoggingOut(true);
      await API.post(`/young/logout`);
      dispatch(setYoung(null));
      toastr.info("Vous avez bien été déconnecté.", { timeOut: 10000 });
      return history.push("/auth");
    } catch (e) {
      toastr.error("Oups une erreur est survenue lors de la déconnexion", { timeOut: 10000 });
      setIsLoggingOut(false);
    }
  }

  return (
    <nav className="w-full bg-[#212B44] p-6 pt-0 transition-all">
      <div className="mb-6 flex gap-3">
        <div className="relative">
          <p className="flex h-9 w-9 items-center justify-center rounded-full bg-[#344264] text-center capitalize text-[#768BAC]">{user.firstName[0] + user.lastName[0]}</p>
          {ticketsInfo.newStatusCount > 0 && (
            <span className="absolute top-[0px] right-[1px] w-2.5 h-2.5 bg-blue-600 rounded-full text-white border-[1px] border-[#212B44] text-xs flex items-center justify-center"></span>
          )}
        </div>
        <div>
          <p className="font-semibold">{user.firstName}</p>
          <p className="text-xs text-[#768BAC]">Volontaire</p>
        </div>
      </div>
      <ul>
        <MenuLink onClose={onClose} to="/account" text="Mon Profil" />
        {ticketsInfo.hasMessage == true && <MenuLink onClose={onClose} ticketCount={ticketsInfo.newStatusCount} to="/echanges" text="Mes échanges" />}
        <MenuButton disabled={isLoggingOut} onClick={logout} text="Déconnexion" />
      </ul>
    </nav>
  );
}
