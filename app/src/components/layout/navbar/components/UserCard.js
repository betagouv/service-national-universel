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

  function handleClick() {
    if (open) {
      setOpen(false);
      document.removeEventListener("click", handleClickOutside, true);
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
      setOpen(false);
      document.removeEventListener("click", handleClickOutside, true);
    }
  }

  return (
    <>
      <div className="relative w-full h-16 flex border-t-[1px] border-[#1A243C] px-3 md:p-6 items-center cursor-default justify-between ">
        <Link to="/account" className="flex gap-3">
          <p className="rounded-full bg-[#344264] text-[#768BAC] w-9 h-9 flex text-center items-center justify-center capitalize">{user.firstName[0] + user.lastName[0]}</p>
          <div>
            <p className="font-semibold hover:text-[#D2DAEF]">{user.firstName}</p>
            <p className="text-xs text-[#768BAC]">Volontaire</p>
          </div>
        </Link>
        <button
          ref={buttonRef}
          className={`flex rounded-full hover:bg-[#344264] text-[#768BAC] w-9 h-9 text-center items-center justify-center transition-all duration-200 ${!open && "rotate-180"}`}
          onClick={handleClick}>
          <ChevronDown />
        </button>
      </div>
      <Menu open={open} menuRef={menuRef} user={user} />
    </>
  );
}

function Menu({ open, menuRef, user }) {
  const dispatch = useDispatch();

  async function logout() {
    await API.post(`/young/logout`);
    dispatch(setYoung(null));
  }

  return (
    <nav
      className={`rounded-lg w-56 bg-white transition-all absolute left-4 shadow overflow-hidden z-10 bottom-20 flex flex-col justify-around ease-in-out duration-200 ${
        open ? `h-${permissionPhase2(user) ? "28" : "20"}` : "h-0"
      }`}
      ref={menuRef}>
      <Link to="/account" className="flex items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-100 text-gray-900 hover:text-gray-900">
        Mon profil
      </Link>
      {permissionPhase2(user) && (
        <Link to="/preferences" className="flex items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-100 text-gray-900 hover:text-gray-900">
          Mes préférences de mission
        </Link>
      )}
      <button onClick={logout} type="button" className="flex items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-100 text-gray-900 hover:text-gray-900">
        Se déconnecter
      </button>
    </nav>
  );
}
