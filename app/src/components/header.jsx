import React from "react";
import LogoFr from "../assets/fr.png";
import SNU from "../assets/logo-snu.png";
import Menu from "../assets/icons/Burger";
import Help from "../assets/icons/QuestionMarkBlue";
import File from "../assets/file.svg";
import HeaderMenu from "./headerMenu";
import { Link, useLocation, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setYoung } from "../redux/auth/actions";
import api from "../services/api";
import { toastr } from "react-redux-toastr";

const Header = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);
  const [isOpen, setIsOpen] = React.useState(false);

  const logout = async () => {
    await api.post(`/young/logout`);
    dispatch(setYoung(null));
    toastr.info("Vous avez bien été déconnecté.", { timeOut: 10000 });
    return history.push("/auth");
  };

  const { pathname } = useLocation();
  return (
    <>
      <HeaderMenu isOpen={isOpen} setIsOpen={setIsOpen} />
      <header className="flex h-[7rem] w-full items-center justify-between bg-white px-[1rem] py-3 shadow-[0px_16px_16px_-16px_rgba(0,0,0,0.32)] md:px-[7rem] md:shadow-none">
        <div className="flex items-center space-x-6">
          <img src={LogoFr} alt="Logo de la République française" className="w-18 h-16" />
          <img src={SNU} alt="Logo du SNU" className="w-16" />
          <div className="hidden lg:block">
            <h1 className="text-xl font-bold">Service National Universel</h1>
            {pathname !== "/auth" && !pathname.startsWith("/auth/") ? <div className="text-sm">Inscription du volontaire</div> : null}
          </div>
        </div>
        <div
          className="flex cursor-pointer items-start pb-10 md:hidden"
          onClick={() => {
            setIsOpen(true);
          }}>
          <Menu />
        </div>
        <nav className="hidden h-8 text-sm text-[#000091] md:flex">
          <a
            className="flex cursor-pointer items-center space-x-1 border-r border-r-gray-300 pr-3 hover:font-bold hover:text-[#000091]"
            href="https://www.snu.gouv.fr/"
            target="_blank"
            rel="noreferrer">
            <img src={File} alt="" />
            <div>Programme</div>
          </a>
          <Link className="flex cursor-pointer items-center space-x-1 py-1 px-3 hover:font-bold hover:text-[#000091]" to={`/public-besoin-d-aide?from=${pathname}`}>
            <Help />
            <div>Besoin d&apos;aide</div>{" "}
          </Link>
          <div
            className="cursor-pointer border border-gray-500 py-1 px-2 hover:bg-[#000091] hover:text-white"
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
