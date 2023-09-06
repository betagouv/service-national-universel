import React from "react";
import LogoFr from "@/assets/fr.png";
import SNU from "@/assets/logo-snu.png";
import Burger from "@/assets/icons/Burger";
import Menu from "../nav/Menu";
import { Link, useLocation, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setYoung } from "../../../redux/auth/actions";
import api from "../../../services/api";
import { toastr } from "react-redux-toastr";
import { supportURL } from "@/config";
import { HiOutlineClipboard, HiOutlineQuestionMarkCircle, HiOutlineUserCircle } from "react-icons/hi";

const Header = ({ title }) => {
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
      <Menu isOpen={isOpen} setIsOpen={setIsOpen} />
      <header className="flex h-[7rem] w-full items-center justify-between bg-white px-[1rem] py-3 shadow-[0px_16px_16px_-16px_rgba(0,0,0,0.32)] md:px-[7rem] md:shadow-none">
        <div className="flex items-center space-x-6">
          <img src={LogoFr} alt="Logo de la République française" className="w-18 h-16" />
          <img src={SNU} alt="Logo du SNU" className="w-16" />
          <div className="hidden lg:block">
            <h1 className="text-xl font-bold">Service National Universel</h1>
            <div className="text-sm">{title}</div>
          </div>
        </div>
        <div
          className="flex cursor-pointer items-start pb-10 md:hidden"
          onClick={() => {
            setIsOpen(true);
          }}>
          <Burger />
        </div>

        <nav className="hidden h-8 md:flex gap-4 text-sm text-blue-france-sun-113">
          {location.pathname.includes("inscription") ? (
            <a href="https://www.snu.gouv.fr/" target="_blank" rel="noreferrer" className="flex items-center py-1 px-2 gap-2 hover:bg-gray-100 hover:text-blue-france-sun-113">
              <HiOutlineClipboard className="text-base" />
              Programme
            </a>
          ) : (
            young && (
              <Link to="/" className="flex items-center py-1 px-2 gap-2 hover:bg-gray-100 hover:text-blue-france-sun-113">
                <HiOutlineUserCircle className="text-base" />
                Mon compte volontaire
              </Link>
            )
          )}

          <a href={supportURL} target="_blank" rel="noreferrer" className="flex items-center py-1 px-2 gap-2 hover:bg-gray-100 hover:text-blue-france-sun-113">
            <HiOutlineQuestionMarkCircle className="text-base" />
            Besoin d&apos;aide
          </a>

          <button
            className="border border-gray-500 py-1 px-2 hover:bg-gray-100"
            onClick={() => {
              if (!young) history.push("/auth?redirect=" + pathname);
              else logout();
            }}>
            {!young ? "Se connecter" : "Se déconnecter"}
          </button>
        </nav>
      </header>
    </>
  );
};

export default Header;
