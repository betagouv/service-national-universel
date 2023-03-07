import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ChevronDown from "../../../assets/icons/ChevronDown";
import { setYoung } from "../../../redux/auth/actions";
import API from "../../../services/api";

export default function User() {
  const user = useSelector((state) => state.Auth.young);
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef();
  const buttonRef = React.useRef();
  const dispatch = useDispatch();

  function handleClick() {
    if (open) {
      setOpen(false);
      document.removeEventListener("click", handleClickOutside, true);
    } else {
      setOpen(true);
      document.addEventListener("click", handleClickOutside, true);
    }
  }

  const isOutside = (event) => menuRef.current && !menuRef.current.contains(event.target) && event.target && buttonRef.current && !buttonRef.current.contains(event.target);

  function handleClickOutside(event) {
    if (isOutside(event)) {
      setOpen(false);
      document.removeEventListener("click", handleClickOutside, true);
    }
  }

  async function logout() {
    await API.post(`/young/logout`);
    dispatch(setYoung(null));
  }

  return (
    <div className="relative w-full h-16 flex md:border-t-[1px] border-[#1A243C] px-3 md:p-6 gap-3 items-center cursor-default justify-end md:justify-between">
      <nav
        className={`rounded-lg w-56 bg-white transition-all absolute right-4 shadow overflow-hidden z-10 bottom-20 flex flex-col justify-center ease-in-out duration-200 ${
          open ? "h-28" : "h-0"
        }`}
        ref={menuRef}>
        <Link to="account">
          <p className="group flex items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-100 text-gray-900">Mon profil</p>
        </Link>
        <Link to="preferences">
          <p className="group flex items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-100 text-gray-900">Mes préférences de mission</p>
        </Link>
        <button onClick={logout}>
          <p className="group flex items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-100 text-gray-900">Se déconnecter</p>
        </button>
      </nav>
      <p className="rounded-full bg-[#344264] text-[#768BAC] w-9 h-9 flex text-center items-center justify-center capitalize">{user.firstName[0] + user.lastName[0]}</p>
      <div className="hidden md:block">
        <p className="font-semibold">{user.firstName}</p>
        <p className="text-xs text-[#768BAC]">Volontaire</p>
      </div>
      <button
        ref={buttonRef}
        className={`hidden md:flex ml-auto rounded-full hover:bg-[#344264] text-[#768BAC] w-9 h-9 text-center items-center justify-center transition-all duration-200 ${
          !open && "rotate-180"
        }`}
        onClick={handleClick}>
        <ChevronDown />
      </button>
    </div>
  );
}
