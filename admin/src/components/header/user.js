import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";

import Invite from "./invite";
import { setUser } from "../../redux/auth/actions";
import api from "../../services/api";

import Avatar from "../Avatar";

export default () => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const { user } = useSelector((state) => state.Auth);

  if (!user) return <div />;

  async function logout() {
    await api.post(`/referent/logout`);
    dispatch(setUser(null));
  }
  return (
    <div className="User">
      <Dropdown>
        <div>
          <MenuToggle>
            <Avatar onClick={() => setOpen(!open)} name={`${user.firstName} ${user.lastName}`} />
          </MenuToggle>
        </div>
        <Menu open={open}>
          <Close onClick={() => setOpen(false)}>&times;</Close>
          <Item>
            <InviteReferent role={user.role} />
          </Item>
          <Item>
            <NavLink to="/profil">Profil</NavLink>
          </Item>
          <hr />
          <Item onClick={logout}>
            <NavLink style={{ color: "rgb(245 105 100)" }} to="/logout">
              Se déconnecter
            </NavLink>
          </Item>
        </Menu>
      </Dropdown>
    </div>
  );
};

const InviteReferent = ({ role }) => {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(true)}>
      <div style={{ padding: "10px 25px 8px" }}>Inviter un nouvel utilisateur</div>
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
  hr {
    margin: 5px 0;
    border-top: 1px solid #ebeef5;
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
  padding: 10px 0 8px;
  min-width: 230px;
  border-radius: 2px;
  background-color: #fff;
  opacity: ${({ open }) => (open ? 1 : 0)};
  visibility: ${({ open }) => (open ? "visible" : "hidden")};
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  border-radius: 4px;
  z-index: 100;
  border: 1px solid rgb(235, 238, 245);
  box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 12px 0px;

  ::after {
    content: "";
    display: block;
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 10px solid #fff;
    position: absolute;
    bottom: 100%;
    right: 10%;
    z-index: -1;
  }

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

const Item = styled.div`
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  :hover {
    background-color: #eaf3fa;
    color: #3182ce;
  }
  a {
    color: inherit;
    text-decoration: none;
    display: block;
    padding: 10px 25px 8px;
    font-weight: 400;
    font-size: 14px;
    color: #606266;
    &.active {
      background-color: #fafafc;
      color: #3182ce;
    }
    :hover {
      background-color: #eaf3fa;
      color: #3182ce;
    }
  }
`;

const Close = styled.div`
  font-size: 32px;
  color: #666;
  padding: 0 15px 20px;
  display: none;
  width: 45px;
  padding: 0 15px;
  margin-left: auto;
  @media (max-width: 767px) {
    display: block;
  }
`;
