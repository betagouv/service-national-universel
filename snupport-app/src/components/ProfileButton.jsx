import React, { useEffect, useRef, useState } from "react";
import { HiCog, HiOutlineLogout } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Avatar from "./Avatar";

import { setOrganisation, setUser } from "../redux/auth/actions";
import API from "../services/api";

export default function ProfileButton() {
  const [open, setOpen] = useState(false);
  const user = useSelector((state) => state.Auth.user);
  const dispatch = useDispatch();
  const ref = useRef();

  useEffect(() => {
    document.addEventListener("click", (evt) => {
      if (ref.current && !ref.current.contains(evt.target)) setOpen(false);
    });
  }, []);

  return (
    <div className="relative ml-10" ref={ref}>
      <button className="bg-shamrock-100 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none" onClick={() => setOpen(!open)}>
        <Avatar email={user?.email} />
      </button>
      <div className={`absolute right-0 w-max rounded-lg bg-white py-2 shadow-md ${open ? "block" : "hidden"}`}>
        {user.role === "AGENT" && (
          <Link className="flex items-center p-3 text-sm font-medium hover:bg-gray-100" to="/profil" onClick={() => setOpen(false)}>
            <HiCog />
            <span className="ml-2">Mon compte</span>
          </Link>
        )}
        <div
          className="flex cursor-pointer items-center p-3 text-sm font-medium text-red-600 hover:bg-red-50"
          onClick={async () => {
            await API.post({ path: "/agent/logout" });
            API.setToken("");
            dispatch(setUser(null));
            dispatch(setOrganisation(null));
          }}
        >
          <HiOutlineLogout />
          <span className="ml-2">Se déconnecter</span>
        </div>
      </div>
    </div>
  );
}
