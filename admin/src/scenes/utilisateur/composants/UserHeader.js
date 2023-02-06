import dayjs from "dayjs";
import "dayjs/locale/fr";
import relativeTime from "dayjs/plugin/relativeTime";
import React from "react";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link, useHistory } from "react-router-dom";

import History from "../../../assets/icons/History";
import PanelActionButton from "../../../components/buttons/PanelActionButton";
import { setUser as setUserInRedux } from "../../../redux/auth/actions";
import TabList from "../../../components/views/TabList";
import API from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import Tab from "../../phase0/components/Tab";
import { ROLES, translate } from "../../../utils";

const getSubtitle = (user) => {
  const createdAt = new Date(user.createdAt);
  dayjs.extend(relativeTime).locale("fr");
  const diff = dayjs(createdAt).fromNow();
  return `Inscrit(e) ${diff} - ${createdAt.toLocaleDateString()}`;
};

export default function UserHeader({ user, tab, currentUser }) {
  const history = useHistory();
  const dispatch = useDispatch();

  const handleImpersonate = async () => {
    try {
      plausibleEvent("Utilisateurs/CTA - Prendre sa place");
      const { ok, data, token } = await API.post(`/referent/signin_as/referent/${user._id}`);
      if (!ok) return toastr.error("Oops, une erreur est survenu lors de la masquarade !", "");
      history.push("/dashboard");
      if (token) API.setToken(token);
      if (data) dispatch(setUserInRedux(data));
    } catch (e) {
      console.log(e);
      toastr.error("Oops, une erreur est survenu lors de la masquarade !", translate(e.code));
    }
  };

  return (
    <div className="px-[30px] pt-[15px] flex justify-end items-end border-b-[#E5E7EB] border-b-[1px]">
      <div className="flex flex-row flex-wrap-reverse w-full items-end justify-end ">
        <div className="grow self-start text-center">
          <div className="flex flex-col justify-between mt-3 md:flex-row">
            <div className="flex items-center mb-3 md:mb-0">
              <span className="font-bold text-2xl mr-2">{`${user.firstName} ${user.lastName}`}</span>
              <span className="text-xs">{getSubtitle(user)}</span>
            </div>
            <div className="flex items-center">
              {user.structureId ? (
                <Link to={`/structure/${user.structureId}`} onClick={() => plausibleEvent("Utilisateurs/Profil CTA - Voir structure")}>
                  <PanelActionButton icon="eye" title="Voir la structure" className="m-0 mr-2" />
                </Link>
              ) : null}
              {currentUser.role === ROLES.ADMIN ? <PanelActionButton className="m-0" onClick={handleImpersonate} icon="impersonate" title="Prendre&nbsp;sa&nbsp;place" /> : null}
            </div>
          </div>

          <TabList className="mt-[30px]">
            <Tab isActive={tab === "profile"} onClick={() => history.push(`/user/${user._id}`)}>
              <div className="flex items-center">Profil</div>
            </Tab>
            <Tab isActive={tab === "notifications"} onClick={() => history.push(`/user/${user._id}/notifications`)}>
              Notifications
            </Tab>
            <Tab isActive={tab === "historique"} onClick={() => history.push(`/user/${user._id}/historique`)}>
              <div className="flex items-center">
                <History className="block flex-[0_0_18px] mr-[4px]" fill={tab === "historique" ? "#3B82F6" : "#9CA3AF"} />
                Historique
              </div>
            </Tab>
          </TabList>
        </div>
      </div>
    </div>
  );
}
