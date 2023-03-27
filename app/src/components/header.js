import React from "react";
import LogoFr from "../assets/fr.png";
import SNU from "../assets/logo-snu.svg";
import Menu from "../assets/icons/Burger";
import Help from "../assets/icons/QuestionMarkBlue";
import File from "../assets/file.svg";
import HeaderMenu from "./headerMenu";
import { Link, useLocation, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setYoung } from "../redux/auth/actions";
import api from "../services/api";

const Header = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);
  const [isOpen, setIsOpen] = React.useState(false);

  const logout = async () => {
    await api.post(`/young/logout`);
    dispatch(setYoung(null));
    history.push("/");
  };

  const { pathname } = useLocation();
  return (
    <>
      <HeaderMenu isOpen={isOpen} setIsOpen={setIsOpen} />
      <header className="px-[1rem] md:px-[7rem] w-full shadow-[0px_16px_16px_-16px_rgba(0,0,0,0.32)] md:shadow-none bg-white h-[7rem] flex justify-between py-3 items-center">
        <div className="flex space-x-6 items-center">
          <img src={LogoFr} alt="Logo de la République française" className="w-18 h-16" />
          <img src={SNU} alt="Logo du SNU" className="w-16" />
          <div className="hidden lg:block">
            <h1 className="font-bold text-xl">Service National Universel</h1>
            <div className="text-sm ">Inscription du volontaire</div>
          </div>
        </div>
        <div
          className="flex md:hidden items-start cursor-pointer pb-10"
          onClick={() => {
            setIsOpen(true);
          }}>
          <Menu />
        </div>
        <nav className="hidden md:flex text-sm text-[#000091] h-8">
          <a
            className="flex items-center space-x-1 border-r border-r-gray-300 pr-3 cursor-pointer hover:font-bold hover:text-[#000091]"
            href="https://www.snu.gouv.fr/"
            target="_blank"
            rel="noreferrer">
            <img src={File} alt="" />
            <div>Programme</div>
          </a>
          <Link className="flex items-center space-x-1 py-1 px-3 cursor-pointer hover:font-bold hover:text-[#000091]" to={`/public-besoin-d-aide?from=${pathname}`}>
            <Help />
            <div>Besoin d&apos;aide</div>{" "}
          </Link>
          <div
            className="border border-gray-500 py-1 px-2 cursor-pointer hover:text-white hover:bg-[#000091]"
            onClick={() => {
              if (!young) history.push("/auth");
              else logout();
            }}>
            {!young ? <div> Se connecter </div> : <div> Se déconnecter </div>}
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
