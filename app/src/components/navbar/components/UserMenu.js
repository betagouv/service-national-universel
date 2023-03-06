import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setYoung } from "../../../redux/auth/actions";
import API from "../../../services/api";
import MenuItem from "./MenuItem";

export default function UserMenu({ setIsOpen }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.young);

  async function logout() {
    await API.post(`/young/logout`);
    dispatch(setYoung(null));
  }

  return (
    <nav className="p-6 bg-[#212B44] w-full transition-all">
      <div className="flex mb-6 gap-3">
        <p className="rounded-full bg-[#344264] text-[#768BAC] w-9 h-9 flex text-center items-center justify-center capitalize">{user.firstName[0] + user.lastName[0]}</p>
        <div className="">
          <p className="font-semibold">{user.firstName}</p>
          <p className="text-xs text-[#768BAC]">Volontaire</p>
        </div>
      </div>
      <ul>
        <MenuItem setOpen={setIsOpen} to="account" text="Mon Profil" />
        <MenuItem setOpen={setIsOpen} to="preferences" text="Mes préférences de mission" />
        <div onClick={logout}>
          <MenuItem setOpen={setIsOpen} to="logout" text="Déconnexion" />
        </div>
      </ul>
    </nav>
  );
}
