import React from "react";
import Close from "@/assets/CloseBlue.svg";
import { Link, useLocation, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setYoung } from "../../../redux/auth/actions";
import api from "../../../services/api";
import { toastr } from "react-redux-toastr";
import { HiOutlineClipboard, HiOutlineQuestionMarkCircle, HiOutlineUserCircle } from "react-icons/hi";
import { supportURL } from "@/config";

const ModalMenu = ({ isOpen, setIsOpen }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);

  const logout = async () => {
    await api.post(`/young/logout`);
    dispatch(setYoung(null));
    toastr.info("Vous avez bien été déconnecté.", { timeOut: 10000 });
    return history.push("/auth");
  };

  const { pathname } = useLocation();
  return (
    isOpen && (
      <div className="fixed top-0 z-[100] w-screen text-blue-france-sun-113 shadow-lg">
        <div className="w-full bg-white px-3 py-3">
          <div
            className="mb-8 flex gap-2 w-full items-center justify-end"
            onClick={() => {
              setIsOpen(false);
            }}>
            Fermer
            <img src={Close} className="w-3" />
          </div>

          {pathname.includes("inscription") ? (
            <a href="https://www.snu.gouv.fr/" className="flex items-center py-3 gap-2" target="_blank" rel="noreferrer">
              <HiOutlineClipboard className="text-lg" />
              Le programme
            </a>
          ) : (
            young && (
              <Link to="/" className="flex items-center py-3 gap-2">
                <HiOutlineUserCircle className="text-lg" />
                Mon compte volontaire
              </Link>
            )
          )}

          <a href={supportURL} className="flex items-center py-3 gap-2">
            <HiOutlineQuestionMarkCircle className="text-lg" />
            Besoin d&apos;aide ?
          </a>

          <button
            className="flex items-center py-3 ml-4 gap-2"
            onClick={() => {
              if (!young) {
                history.push("/auth");
              } else {
                logout();
              }
            }}>
            {!young ? "Se connecter" : "Se déconnecter"}
          </button>
        </div>
      </div>
    )
  );
};

export default ModalMenu;
