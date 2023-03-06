import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ChevronDown from "../../../assets/icons/ChevronDown";
import { setYoung } from "../../../redux/auth/actions";
import API from "../../../services/api";

export default function User() {
  const user = useSelector((state) => state.Auth.young);
  const initials = user.firstName[0] + user.lastName[0];
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative w-full h-16 flex md:border-t-[1px] border-[#1A243C] px-3 md:p-6 gap-3 items-center cursor-default justify-end md:justify-between">
      <Menu open={open} />
      <p className="rounded-full bg-[#344264] text-[#768BAC] w-9 h-9 flex text-center items-center justify-center capitalize">{initials}</p>
      <div className="hidden md:block">
        <p className="font-semibold">{user.firstName}</p>
        <p className="text-xs text-[#768BAC]">Volontaire</p>
      </div>
      <button
        className={`hidden md:flex ml-auto rounded-full hover:bg-[#344264] text-[#768BAC] w-9 h-9 text-center items-center justify-center transition-all duration-200 ${
          !open && "rotate-180"
        }`}
        onClick={() => setOpen(!open)}>
        <ChevronDown />
      </button>
    </div>
  );
}

function Menu({ open }) {
  const dispatch = useDispatch();

  async function logout() {
    await API.post(`/young/logout`);
    dispatch(setYoung(null));
  }

  return (
    <nav className={`${open ? "block" : "hidden"} py-2 rounded-lg w-56 bg-white transition absolute right-4 shadow overflow-hidden z-50 bottom-20`}>
      <Link to="account">
        <p className="group flex items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50 text-gray-900">Mon profil</p>
      </Link>
      <Link to="preferences">
        <p className="group flex items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50 text-gray-900">Mes préférences de mission</p>
      </Link>
      <Link to="#" onClick={logout}>
        <p className="group flex items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50 text-gray-900">Se déconnecter</p>
      </Link>
    </nav>
  );
}
