import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { YOUNG_STATUS } from "../../utils";

import { setYoung } from "../../redux/auth/actions";
import api from "../../services/api";

const TABS_USER = {
  PROFILE: "PROFILE",
  PREFERENCES: "PREFERENCES",
  DECONNEXION: "DECONNEXION",
};

export default () => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);

  async function logout() {
    await api.post(`/young/logout`);
    dispatch(setYoung(null));
  }

  const getDisabled = (tab) => {
    if (tab === TABS_USER.PREFERENCES) {
      return [YOUNG_STATUS.WAITING_VALIDATION].includes(young.status);
    }
  };

  return (
    <div className="User">
      <Dropdown>
        <Title>{young.firstName}</Title>
        <Aavatar onClick={() => setOpen(!open)} src={require("../../assets/avatar.jpg")} />
        <Menu open={open}>
          <Close onClick={() => setOpen(false)}>&times;</Close>
          <Item onClick={() => setOpen(false)}>
            <Link to="/account">Mon profil</Link>
          </Item>
          {!getDisabled(TABS_USER.PREFERENCES) && (
            <Item onClick={() => setOpen(false)}>
              <Link to="/preferences">Mes préférences de missions</Link>
            </Item>
          )}
          <Item onClick={logout}>
            <Link to="#">Déconnexion</Link>
          </Item>
        </Menu>
      </Dropdown>
    </div>
  );
};

const Dropdown = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  :hover > div {
    opacity: 1;
    visibility: visible;
  }
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: 700;
  margin-right: 15px;
`;

const Menu = styled.div`
  min-width: 150px;
  border-radius: 0.375rem;
  background-color: #fff;
  opacity: ${({ open }) => (open ? 1 : 0)};
  visibility: ${({ open }) => (open ? "visible" : "hidden")};
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  z-index: 100;
  box-shadow: 0 0 18px 0 rgba(0, 0, 0, 0.12);
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

const Aavatar = styled.img`
  width: 32px;
  height: 32px;
  background-color: #aaa;
  border-radius: 50%;
  object-fit: cover;
  object-fit: contain;
  cursor: pointer;
`;

const Item = styled.div`
  font-size: 15px;
  border-left: solid transparent 4px;
  border-radius: 0;
  text-align: left;
  color: #374151;
  cursor: pointer;
  &:hover {
    background-color: #d3bfc731;
    color: #333;
  }
  a {
    color: inherit;
    text-decoration: none;
    display: block;
    padding: 10px;
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
