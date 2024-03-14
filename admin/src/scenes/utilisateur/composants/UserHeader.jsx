import dayjs from "@/utils/dayjs.utils";
import React from "react";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link, useHistory } from "react-router-dom";

import History from "../../../assets/icons/History";
import PanelActionButton from "../../../components/buttons/PanelActionButton";
import { setUser as setUserInRedux } from "../../../redux/auth/actions";
import TabList from "../../../components/views/TabList";
import plausibleEvent from "../../../services/plausible";
import Tab from "../../phase0/components/Tab";
import { ROLES, translate } from "../../../utils";
import { Badge } from "@snu/ds/admin";
import { signinAs } from "@/utils/signinAs";

const getSubtitle = (user) => {
  const createdAt = new Date(user.createdAt);
  const diff = dayjs(createdAt).fromNow();
  return `Inscrit(e) ${diff} - ${createdAt.toLocaleDateString()}`;
};

export default function UserHeader({ user, tab, currentUser }) {
  const history = useHistory();
  const dispatch = useDispatch();

  const handleImpersonate = async () => {
    try {
      plausibleEvent("Utilisateurs/CTA - Prendre sa place");
      const data = await signinAs("referent", user._id);
      dispatch(setUserInRedux(data));
      history.push("/dashboard");
    } catch (e) {
      console.log(e);
      toastr.error("Oops, une erreur est survenu lors de la masquarade !", translate(e.code));
    }
  };

  return (
    <div className="flex items-end justify-end border-b-[1px] border-b-[#E5E7EB] px-[30px] pt-[15px]">
      <div className="flex w-full flex-row flex-wrap-reverse items-end justify-end ">
        <div className="grow self-start text-center">
          <div className="mt-3 flex flex-col justify-between md:flex-row">
            <div className="mb-3 flex items-center md:mb-0">
              <span className="mr-2 text-2xl font-bold">{`${user.firstName} ${user.lastName}`}</span>
              <Badge title={translate(user.role)} status="tertiary" className="border-gray-300 mr-2 mt-1" />
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
            {![ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(currentUser.role) && (
              <>
                <Tab isActive={tab === "notifications"} onClick={() => history.push(`/user/${user._id}/notifications`)}>
                  Notifications
                </Tab>
                <Tab isActive={tab === "historique"} onClick={() => history.push(`/user/${user._id}/historique`)}>
                  <div className="flex items-center">
                    <History className="mr-[4px] block flex-[0_0_18px]" fill={tab === "historique" ? "#3B82F6" : "#9CA3AF"} />
                    Historique
                  </div>
                </Tab>
              </>
            )}
          </TabList>
        </div>
      </div>
    </div>
  );
}
