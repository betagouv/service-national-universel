import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { setYoung } from "../../../../redux/auth/actions";
import API from "../../../../services/api";
import MenuLink from "./MenuLink";
import MenuButton from "./MenuButton";
import { permissionPhase2 } from "../../../../utils";
import { toastr } from "react-redux-toastr";

export default function UserMenu({ onClose }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.young);
  const history = useHistory();

  async function logout() {
    await API.post(`/young/logout`);
    dispatch(setYoung(null));
    toastr.info("Vous avez bien été déconnecté.", { timeOut: 10000 });
    return history.push("/auth");
  }

  return (
    <nav className="w-full bg-[#212B44] p-6 pt-0 transition-all">
      <div className="mb-6 flex gap-3">
        <p className="flex h-9 w-9 items-center justify-center rounded-full bg-[#344264] text-center capitalize text-[#768BAC]">{user.firstName[0] + user.lastName[0]}</p>
        <div>
          <p className="font-semibold">{user.firstName}</p>
          <p className="text-xs text-[#768BAC]">Volontaire</p>
        </div>
      </div>
      <ul>
        <MenuLink onClose={onClose} to="/account" text="Mon Profil" />
        {permissionPhase2(user) && <MenuLink onClose={onClose} to="preferences" text="Mes préférences de mission" />}
        <MenuButton onClick={logout} text="Déconnexion" />
      </ul>
    </nav>
  );
}
