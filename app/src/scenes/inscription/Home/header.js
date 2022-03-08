import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { colors } from "../../../utils";
import { useSelector, useDispatch } from "react-redux";
import api from "../../../services/api";
import { setYoung } from "../../../redux/auth/actions";
import plausibleEvent from "../../../services/plausible";

export default function HeaderComponent({ location }) {
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);

  const logout = async () => {
    try {
      await api.post(`/young/logout`);
    } catch (error) {
      console.log({ error });
    }
    dispatch(setYoung(null));
  };

  return (
    <nav className="sticky w-full bg-white flex items-center justify-between shadow-2xl top-0 left-0 z-20 p-6">
      {/* Logo */}
      <div className="flex items-center	">
        <div className="hidden md:block">
          <a href="https://www.snu.gouv.fr/">
            <img className="align-top	mr-20	h-20" src={require("../../../assets/fr.png")} />
          </a>
        </div>
        <a href="https://www.snu.gouv.fr/">
          <img className="align-top	mr-20 h-10 sm:h-10 md:h-20" src={require("../../../assets/logo-snu.png")} />
        </a>
      </div>
      <div className="flex flex-col	self-stretch justify-between items-end">
        {young ? (
          <Link className="text-gray-400 uppercase cursor-pointer text-xs md:text-sm hover:text-purple-700" onClick={logout} to={{ pathname: "/", search: location?.search }}>
            Se deconnecter
          </Link>
        ) : (
          <Link
            className="text-gray-400 uppercase cursor-pointer text-xs	md:text-sm hover:text-purple-700"
            onClick={() => plausibleEvent("LP CTA - Connexion")}
            to={{ pathname: "/auth/login", search: location?.search }}>
            Se connecter
          </Link>
        )}
        <Link className="text-gray-400 uppercase cursor-pointer text-xs	md:text-sm hover:text-purple-700" to={{ pathname: "/inscription/profil" }}>
          S&apos;inscrire
        </Link>
      </div>
    </nav>
  );
}
