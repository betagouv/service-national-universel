import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Invite from "./invite";
import { setUser } from "../../redux/auth/actions";
import api from "../../services/api";
import { ROLES } from "../../utils";
import plausibleEvent from "../../services/pausible";
import { HiLogout, HiUser, HiUserAdd } from "react-icons/hi";

import Avatar from "../Avatar";

export default function HeaderUser() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const { user } = useSelector((state) => state.Auth);

  if (!user) return <div />;

  async function logout() {
    await api.post(`/referent/logout`);
    dispatch(setUser(null));
  }

  return (
    <div>
      <div className="group py-2 pl-3">
        <div>
          <Avatar onClick={() => setOpen(!open)} name={`${user.firstName} ${user.lastName}`} menuOpened={open} />
        </div>
        <div
          className={`${
            open ? "block" : "hidden"
          } group-hover:block min-w-[250px] rounded-lg bg-white transition absolute top-[calc(100%)] right-0 border-3 border-red-600 shadow overflow-hidden`}>
          <div className="my-2 text-xs px-3 text-coolGray-600">
            <p>
              {user.firstName} {user.lastName}
            </p>
            <p className="italic">{user.email}</p>
          </div>
          <hr className="m-0 border-t-coolGray-100" />
          <NavLink to="/profil">
            <div className="group text-coolGray-800 cursor-pointer p-3 hover:bg-coolGray-100 hover:text-coolGray-800 flex items-center gap-2 text-coolGray-800 hover:text-coolGray-800">
              <HiUser className="group-hover:scale-110" />
              Profil
            </div>
          </NavLink>
          {[ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) ? (
            <div className="group text-coolGray-800 cursor-pointer p-3 hover:bg-coolGray-100 hover:text-coolGray-800 flex items-center gap-2">
              <HiUserAdd className="group-hover:scale-110" />
              <InviteReferent role={user.role} />
            </div>
          ) : null}
          {[ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role) && user.structureId ? (
            <NavLink to={`/structure/${user.structureId}`}>
              <div className="group text-coolGray-800 cursor-pointer p-3 hover:bg-coolGray-100 hover:text-coolGray-800 flex items-center gap-2 text-coolGray-800 hover:text-coolGray-800">
                <HiUserAdd className="group-hover:scale-110" />
                Inviter&nbsp;un&nbsp;utilisateur
              </div>
            </NavLink>
          ) : null}
          <hr className="m-0 border-t-coolGray-100" />
          <NavLink to="/logout" onClick={logout}>
            <div className="group text-coolGray-800 cursor-pointer p-3 hover:bg-coolGray-100 hover:text-coolGray-800 flex items-center gap-2 text-red-700 hover:text-red-700">
              <HiLogout className="text-red-700 group-hover:scale-110" />
              Se déconnecter
            </div>
          </NavLink>
        </div>
      </div>
    </div>
  );
}

const InviteReferent = ({ role }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => {
        plausibleEvent("Profil CTA - Inviter nouvel utilisateur");
        setOpen(true);
      }}>
      <div>Inviter&nbsp;un&nbsp;nouvel&nbsp;utilisateur</div>
      <Invite role={role} label="Inviter un nouvel utilisateur" open={open} setOpen={() => setOpen(false)} />
    </div>
  );
};
