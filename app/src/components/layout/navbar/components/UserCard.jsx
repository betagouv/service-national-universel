import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ChevronDown from "../../../../assets/icons/ChevronDown";
import { setYoung } from "../../../../redux/auth/actions";
import API from "../../../../services/api";
import { permissionPhase2 } from "../../../../utils";

export default function User() {
  const user = useSelector((state) => state.Auth.young);
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
          <p className="flex h-9 w-9 items-center justify-center rounded-full bg-[#344264] text-center capitalize text-[#768BAC]">{user.firstName[0] + user.lastName[0]}</p>
          <div>
            <p className="font-semibold hover:text-[#D2DAEF]">{user.firstName}</p>
            <p className="text-xs text-[#768BAC]">Volontaire</p>
          </div>
        </Link>
        <button
          ref={buttonRef}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-center text-[#768BAC] transition-all duration-200 hover:bg-[#344264] ${!open && "rotate-180"}`}
          onClick={handleClick}>
          <ChevronDown />
        </button>
      </div>
      <Menu open={open} menuRef={menuRef} user={user} onClose={onClose} />
    </>
  );
}

function Menu({ open, menuRef, user, onClose }) {
  const dispatch = useDispatch();

  async function logout() {
    await API.post(`/young/logout`);
    dispatch(setYoung(null));
  }

  return (
    <nav
      className={`absolute left-4 bottom-20 z-10 flex w-56 flex-col justify-around overflow-hidden rounded-lg bg-white shadow transition-all duration-200 ease-in-out ${
        open ? (permissionPhase2(user) ? "h-28" : "h-20") : "h-0"
      }`}
      ref={menuRef}>
      <Link to="/account" onClick={onClose} className="flex items-center gap-3 p-2 px-3 text-sm leading-5 text-gray-900 hover:bg-gray-100 hover:text-gray-900">
        Mon profil
      </Link>
      {permissionPhase2(user) && (
        <Link to="/preferences" onClick={onClose} className="flex items-center gap-3 p-2 px-3 text-sm leading-5 text-gray-900 hover:bg-gray-100 hover:text-gray-900">
          Mes préférences de mission
        </Link>
      )}
      <button onClick={logout} type="button" className="flex items-center gap-3 p-2 px-3 text-sm leading-5 text-gray-900 hover:bg-gray-100 hover:text-gray-900">
        Se déconnecter
      </button>
    </nav>
  );
}
