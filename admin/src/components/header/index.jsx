import Img2 from "../../assets/logo-snu.png";
import Img from "../../assets/logo-snu.png";
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
    if (user.role === ROLES.DSNJ) return "Espace DSNJ";
    if (user.role === ROLES.TRANSPORTER) return "Espace transporteur";
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
          <div className="mx-3 flex items-center gap-2 ">
            <Link to="/">
              <img src={Img2} className="h-9 w-9 hover:scale-105" />
            </Link>
            <div className="group mx-3 flex cursor-pointer items-center gap-2 hover:text-black" onClick={() => setSelectSessionOpen((e) => !e)}>
              <div>
                <div className="text-xs font-medium uppercase text-gray-500">{sessionPhase1.cohesionCenter?.name || "Mon espace chef de centre"}</div>
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
            } border-3 absolute top-[calc(100%+5px)] left-20 min-w-[250px] divide-y divide-gray-100 overflow-hidden rounded-lg border-red-600 bg-white shadow transition group-hover:block`}>
            {(sessionsList || [])?.map((session) => (
              <div
                key={session.cohort}
                className="group flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-gray-100 hover:text-black"
                onClick={() => {
                  dispatch(setSessionPhase1(session));
                  setSelectSessionOpen(false);
                  localStorage?.setItem("active_session_chef_de_centre", JSON.stringify(session));
                  // on retourne au dashboard !
                  history.push("/");
                }}>
                <div className="flex-1">
                  <div className="text-xs font-medium uppercase text-gray-500">{session.cohesionCenter?.name || "Mon espace chef de centre"}</div>
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
      <Link to="/" className="group mx-3 flex items-center gap-2 hover:text-black">
        <img src={Img} className="h-9 w-9 group-hover:scale-105" />
        <span className="justify-center text-base font-bold group-hover:underline">{getName()}</span>
      </Link>
    );
  };

  return (
    <div className="sticky top-0 left-0 z-20 flex h-14 w-full items-center justify-between bg-white p-1 px-2 shadow-sm">
      <h1 className="flex items-center gap-2">
        <div className="flex items-center" ref={ref}>
          <div className="lg:hidden">
            {drawerVisible ? (
              <RiMenuFoldLine className="h-7 w-7 cursor-pointer" onClick={onClickBurger} />
            ) : (
              <RiMenuFill className="h-7 w-7 cursor-pointer" onClick={onClickBurger} />
            )}
          </div>
          {renderBanner()}
        </div>
        {environment !== "production" && environmentBannerVisible ? (
          <span
            onClick={() => setEnvironmentBannerVisible(false)}
            className="font-italic cursor-pointer items-center rounded-full bg-red-600 p-2 px-3 text-center text-xs text-white hover:opacity-50">
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
