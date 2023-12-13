import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import ChevronDown from "../../../../assets/icons/ChevronDown";
import { setYoung } from "../../../../redux/auth/actions";
import API from "../../../../services/api";
import { permissionPhase2 } from "../../../../utils";
import { toastr } from "react-redux-toastr";
import useAuth from "@/services/useAuth";

export default function User({ ticketsInfo }) {
  const { young, isCLE } = useAuth();
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef();
  const buttonRef = React.useRef();

  function onClose() {
    setOpen(false);
    document.removeEventListener("click", handleClickOutside, true);
  }

  function handleClick() {
    if (open) {
      onClose();
    } else {
      setOpen(true);
      document.addEventListener("click", handleClickOutside, true);
    }
  }

  const isOutside = (event) => {
    if (!menuRef.current || !buttonRef.current) return false;
    if (menuRef.current.contains(event.target) || buttonRef.current.contains(event.target)) return false;
    return true;
  };

  function handleClickOutside(event) {
    if (isOutside(event)) {
      onClose();
    }
  }

  return (
    <>
      <div className="relative flex h-16 w-full cursor-default items-center justify-between border-t-[1px] border-[#1A243C] px-3 md:p-6 ">
        <Link to="/account" className="flex gap-3">
          <div className="relative">
            <p className="flex h-9 w-9 items-center justify-center rounded-full bg-[#344264] text-center capitalize text-[#768BAC]">{young.firstName[0] + young.lastName[0]}</p>
            {ticketsInfo.newStatusCount > 0 && (
              <span className="absolute top-[0px] right-[1px] w-2.5 h-2.5 bg-blue-600 rounded-full text-white border-[1px] border-[#212B44] text-xs flex items-center justify-center"></span>
            )}
          </div>
          <div>
            <p className="font-semibold hover:text-[#D2DAEF]">{young.firstName}</p>
            <p className="text-xs text-[#768BAC]">{isCLE ? "Élève classe engagée" : "Volontaire"}</p>
          </div>
        </Link>
        <button
          ref={buttonRef}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-center text-[#768BAC] transition-all duration-200 hover:bg-[#344264] ${!open && "rotate-180"}`}
          onClick={handleClick}>
          <ChevronDown />
        </button>
      </div>
      <Menu open={open} menuRef={menuRef} young={young} onClose={onClose} ticketsInfo={ticketsInfo} />
    </>
  );
}

function Menu({ open, menuRef, young, onClose, ticketsInfo }) {
  const dispatch = useDispatch();
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
    <nav
      className={`absolute left-4 bottom-20 z-10 flex w-64 flex-col justify-around overflow-hidden rounded-lg bg-white shadow transition-all duration-200 ease-in-out ${
        open ? permissionPhase2(young) && "h-auto" : "h-0"
      }`}
      ref={menuRef}>
      <Link to="/account" onClick={onClose} className="flex items-center gap-3 p-2 px-3 text-sm leading-5 text-gray-900 hover:bg-gray-100 hover:text-gray-900">
        Mon profil
      </Link>
      {permissionPhase2(young) && (
        <Link to="/preferences" onClick={onClose} className="flex items-center gap-3 p-2 px-3 text-sm leading-5 text-gray-900 hover:bg-gray-100 hover:text-gray-900">
          Mes préférences de mission
        </Link>
      )}
      {ticketsInfo.hasMessage === true && (
        <Link to="/echanges" onClick={onClose} className="flex items-center justify-between gap-3 p-2 px-3 text-sm leading-5 text-gray-900 hover:bg-gray-100 hover:text-gray-900">
          <p>Mes échanges</p>
          {ticketsInfo.newStatusCount > 0 && <p className="text-xs leading-5 text-white bg-blue-600 px-2 py-0 rounded-full font-medium">{ticketsInfo.newStatusCount}</p>}
        </Link>
      )}
      <button
        onClick={logout}
        disabled={isLoggingOut}
        type="button"
        className="flex items-center gap-3 p-2 px-3 text-sm leading-5 text-gray-900 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50">
        Se déconnecter
      </button>
    </nav>
  );
}
