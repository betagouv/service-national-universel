import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
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
      <Dropdown>
        <div>
          <MenuToggle>
            <Avatar onClick={() => setOpen(!open)} name={`${user.firstName} ${user.lastName}`} menuOpened={open} />
          </MenuToggle>
        </div>
        <Menu open={open}>
          <div className="my-2 text-xs px-3 text-coolGray-600">
            <p>
              {user.firstName} {user.lastName}
            </p>
            <p className="italic">{user.email}</p>
          </div>
          <hr className="m-0 border-t-coolGray-100" />
          <div className="group text-coolGray-800 cursor-pointer p-3 hover:bg-coolGray-100 hover:text-coolGray-800 flex items-center gap-2">
            <HiUser className="group-hover:scale-110" />
            <NavLink className="text-coolGray-800 hover:text-coolGray-800" to="/profil">
              Profil
            </NavLink>
          </div>
          {[ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) ? (
            <div className="group text-coolGray-800 cursor-pointer p-3 hover:bg-coolGray-100 hover:text-coolGray-800 flex items-center gap-2">
              <HiUserAdd className="group-hover:scale-110" />
              <InviteReferent role={user.role} />
            </div>
          ) : null}
          {[ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role) && user.structureId ? (
            <div className="group text-coolGray-800 cursor-pointer p-3 hover:bg-coolGray-100 hover:text-coolGray-800 flex items-center gap-2">
              <HiUserAdd className="group-hover:scale-110" />
              <NavLink className="text-coolGray-800 hover:text-coolGray-800" to={`/structure/${user.structureId}`}>
                Inviter&nbsp;un&nbsp;utilisateur
              </NavLink>
            </div>
          ) : null}
          <hr className="m-0 border-t-coolGray-100" />
          <div className="group text-coolGray-800 cursor-pointer p-3 hover:bg-coolGray-100 hover:text-coolGray-800 flex items-center gap-2">
            <HiLogout className="text-red-700 group-hover:scale-110" />
            <NavLink className="text-red-700 hover:text-red-700" to="/logout">
              Se déconnecter
            </NavLink>
          </div>
        </Menu>
      </Dropdown>
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

const Dropdown = styled.div`
  position: relative;
  :hover > div {
    opacity: 1;
    visibility: visible;
  }
`;

const MenuToggle = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  h2 {
    color: #000;
    font-size: 14px;
    font-weight: 400;
    margin-bottom: 5px;
  }
  p {
    text-transform: uppercase;
    color: #606266;
    font-size: 12px;
    margin: 0;
  }
`;

const Menu = styled.div`
  min-width: 230px;
  border-radius: 2px;
  background-color: #fff;
  opacity: ${({ open }) => (open ? 1 : 0)};
  visibility: ${({ open }) => (open ? "visible" : "hidden")};
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  border-radius: 4px;
  z-index: 100;
  border: 1px solid rgb(235, 238, 245);
  box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 12px 0px;

  @media (max-width: 767px) {
    position: fixed;
    top: 0;
    left: 0;
    transform: translateX(${({ open }) => (open ? 0 : "105%")});
    opacity: 1;
    visibility: visible;
    height: 100vh;
    width: 100vw;
    background-color: #fff;
    z-index: 11;
  }
`;
