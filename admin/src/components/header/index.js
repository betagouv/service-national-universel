import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, Link } from "react-router-dom";

import { setSessionPhase1 } from "../../redux/auth/actions";
import { ROLES } from "../../utils";
import { environment } from "../../config";
import User from "./user";
import { RiMenuFill, RiMenuFoldLine } from "react-icons/ri";
import Selector from "../../assets/icons/Selector";
import Check from "../../assets/icons/Check";
import SwitchHorizontal from "../../assets/icons/SwitchHorizontal";

export default function HeaderIndex({ onClickBurger, drawerVisible, sessionsList }) {
  const { user, sessionPhase1 } = useSelector((state) => state.Auth);
  const dispatch = useDispatch();
  const history = useHistory();
  const [environmentBannerVisible, setEnvironmentBannerVisible] = React.useState(true);
  const [selectSessionOpen, setSelectSessionOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!ref) return;
    const handleClickOutside = (event) => {
      if (ref?.current && !ref.current.contains(event.target)) {
        setSelectSessionOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  if (!user) return <div />;
  if (user.role === ROLES.HEAD_CENTER && !sessionPhase1) return <div />;

  function getName() {
    if (user.role === ROLES.ADMIN) return "Espace modérateur";
    if (user.role === ROLES.REFERENT_DEPARTMENT) return `Espace référent départemental • ${user.department.join(", ")}`;
    if (user.role === ROLES.REFERENT_REGION) return `Espace référent régional • ${user.region}`;
    if (user.role === ROLES.RESPONSIBLE) return "Espace responsable";
    if (user.role === ROLES.SUPERVISOR) return "Espace superviseur";
    if (user.role === ROLES.HEAD_CENTER) return "Chef de centre";
    return "";
  }

  function getTextEnvironmentBanner() {
    if (environment === "staging") return "Espace de Test";
    if (environment === "development") return "Développement";
    return "";
  }

  const renderBanner = () => {
    if (user.role === ROLES.HEAD_CENTER && sessionPhase1) {
      return (
        <>
          <div className="flex items-center gap-2 mx-3 ">
            <Link to="/">
              <img src={require("../../assets/logo-snu.png")} className="h-9 w-9 hover:scale-105" />
            </Link>
            <div className="flex items-center group hover:text-black gap-2 mx-3 cursor-pointer" onClick={() => setSelectSessionOpen((e) => !e)}>
              <div>
                <div className="text-gray-500 text-xs uppercase font-medium">{sessionPhase1.cohesionCenter?.name || "Mon espace chef de centre"}</div>
                <div className="text-sm font-normal">{sessionPhase1.cohort}</div>
              </div>
              <div className="ml-4">
                <Selector className="text-gray-500 group-hover:scale-105" />
              </div>
            </div>
          </div>
          <div
            className={`${
              selectSessionOpen ? "block" : "hidden"
            } group-hover:block min-w-[250px] rounded-lg bg-white transition absolute top-[calc(100%+5px)] left-20 border-3 border-red-600 shadow overflow-hidden divide-y divide-gray-100`}>
            {(sessionsList || [])?.map((session) => (
              <div
                key={session.cohort}
                className="flex items-center group hover:text-black gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  dispatch(setSessionPhase1(session));
                  setSelectSessionOpen(false);
                  localStorage.setItem("active_session_chef_de_centre", JSON.stringify(session));
                  // on retourne au dashboard !
                  history.push("/");
                }}>
                <div className="flex-1">
                  <div className="text-gray-500 text-xs uppercase font-medium">{session.cohesionCenter?.name || "Mon espace chef de centre"}</div>
                  <div className="text-sm font-normal">{session.cohort}</div>
                </div>
                <div className="ml-4">
                  {sessionPhase1._id.toString() === session._id.toString() ? <Check className="text-green-500" /> : <SwitchHorizontal className="text-gray-500" />}
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }
    return (
      <Link to="/" className="flex items-center group hover:text-black gap-2 mx-3">
        <img src={require("../../assets/logo-snu.png")} className="h-9 w-9 group-hover:scale-105" />
        <span className="text-base font-bold justify-center group-hover:underline">{getName()}</span>
      </Link>
    );
  };

  return (
    <div className="w-full px-2 bg-white h-14 flex items-center justify-between shadow-sm sticky top-0 left-0 z-20 p-1">
      <h1 className="flex items-center gap-2">
        <div className="flex items-center" ref={ref}>
          <div className="lg:hidden">
            {drawerVisible ? (
              <RiMenuFoldLine className="w-7 h-7 cursor-pointer" onClick={onClickBurger} />
            ) : (
              <RiMenuFill className="w-7 h-7 cursor-pointer" onClick={onClickBurger} />
            )}
          </div>
          {renderBanner()}
        </div>
        {environment !== "production" && environmentBannerVisible ? (
          <span
            onClick={() => setEnvironmentBannerVisible(false)}
            className="p-2 px-3 bg-red-600 text-white text-xs font-italic items-center text-center rounded-full cursor-pointer hover:opacity-50">
            {getTextEnvironmentBanner()}
          </span>
        ) : null}
      </h1>
      <div className="flex items-center">
        <User />
      </div>
    </div>
  );
}
