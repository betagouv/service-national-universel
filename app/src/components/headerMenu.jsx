import React from "react";
import Close from "../assets/CloseBlue.svg";
import File from "../assets/file.svg";
import Help from "../assets/icons/QuestionMarkBlue";
import Login from "../assets/icons/Login";
import { Link, useLocation, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setYoung } from "../redux/auth/actions";
import api from "../services/api";
import { toastr } from "react-redux-toastr";

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
      <div className={`fixed  top-0 z-[100]  w-screen text-sm font-medium text-[#000091] shadow-lg`}>
        <div className="w-full bg-white px-3 py-3">
          <div
            className="mb-8 flex w-full items-center justify-end space-x-2"
            onClick={() => {
              setIsOpen(false);
            }}>
            <div>Fermer</div>
            <img src={Close} className="w-3" />
          </div>
          <div
            className="flex items-center space-x-2 border-b border-b-[#E5E5E5] py-3"
            onClick={() => {
              if (!young) {
                history.push("/auth");
              } else {
                logout();
              }
            }}>
            <Login />
            {!young ? <div> Se connecter </div> : <div> Se déconnecter </div>}
          </div>

          <a className="flex items-center space-x-2 border-b border-b-[#E5E5E5] py-3" href="https://www.snu.gouv.fr/" target="_blank" rel="noreferrer">
            <img src={File} />
            <div>Le programme</div>
          </a>
          <Link className="flex items-center space-x-2 pt-3" to={`/public-besoin-d-aide?from=${pathname}`}>
            <Help />
            <div>Besoin d&apos;aide ?</div>
          </Link>
        </div>
      </div>
    )
  );
};

export default ModalMenu;
