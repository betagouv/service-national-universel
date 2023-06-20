import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useHistory } from "react-router-dom";

import { FiSettings } from "react-icons/fi";
import { HiLogout, HiUser, HiUserAdd } from "react-icons/hi";
import { setUser } from "../../redux/auth/actions";
import api from "../../services/api";
import plausibleEvent from "../../services/plausible";
import { ROLES } from "../../utils";
import Invite from "./invite";

import Avatar from "../Avatar";
import { toastr } from "react-redux-toastr";

export default function HeaderUser() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const { user } = useSelector((state) => state.Auth);
  const history = useHistory();

  if (!user) return <div />;

  async function logout() {
    await api.post(`/referent/logout`);
    dispatch(setUser(null));
    toastr.info("Vous avez bien été déconnecté.", { timeOut: 10000 });
    return history.push("/auth");
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
          } border-3 absolute top-[calc(100%)] right-0 min-w-[250px] overflow-hidden rounded-lg border-red-600 bg-white shadow transition group-hover:block`}>
          <div className="my-2 px-3 text-xs text-coolGray-600">
            <p>
              {user.firstName} {user.lastName}
            </p>
            <p className="italic">{user.email}</p>
          </div>
          <hr className="m-0 border-t-coolGray-100" />
          <NavLink to="/profil">
            <div className="group flex cursor-pointer items-center gap-2  p-3 text-coolGray-800 hover:bg-coolGray-100  hover:text-coolGray-800">
              <HiUser className="group-hover:scale-110" />
              Profil
            </div>
          </NavLink>
          {[ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) ? (
            <div className="group flex cursor-pointer items-center gap-2 p-3 text-coolGray-800 hover:bg-coolGray-100 hover:text-coolGray-800">
              <HiUserAdd className="group-hover:scale-110" />
              <InviteReferent role={user.role} />
            </div>
          ) : null}
          {[ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role) && user.structureId ? (
            <NavLink to={`/structure/${user.structureId}`}>
              <div className="group flex cursor-pointer items-center gap-2  p-3 text-coolGray-800 hover:bg-coolGray-100  hover:text-coolGray-800">
                <HiUserAdd className="group-hover:scale-110" />
                Inviter&nbsp;un&nbsp;utilisateur
              </div>
            </NavLink>
          ) : null}
          {[ROLES.ADMIN].includes(user.role) && (
            <NavLink to="/settings">
              <div className="group flex cursor-pointer items-center gap-2  p-3 text-coolGray-800 hover:bg-coolGray-100  hover:text-coolGray-800">
                <FiSettings className=" group-hover:scale-110" />
                Paramétrage dynamique
              </div>
            </NavLink>
          )}
          <hr className="m-0 border-t-coolGray-100" />
          <NavLink to="/logout" onClick={logout}>
            <div className="group  flex cursor-pointer items-center  gap-2 p-3 text-red-700 hover:bg-coolGray-100 hover:text-red-700">
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
