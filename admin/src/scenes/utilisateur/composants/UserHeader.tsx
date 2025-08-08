import dayjs from "@/utils/dayjs.utils";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link, useHistory } from "react-router-dom";

import { canSigninAs, isReadAuthorized, PERMISSION_RESOURCES, translate, UserDto, ReferentType, ReferentStatus, translateReferentStatus, ROLES } from "snu-lib";
import { Badge, Select, Tooltip } from "@snu/ds/admin";
import { signinAs } from "@/utils/signinAs";
import api from "@/services/api";

import History from "../../../assets/icons/History";
import PanelActionButton from "../../../components/buttons/PanelActionButton";
import { setUser as setUserInRedux } from "../../../redux/auth/actions";
import TabList from "../../../components/views/TabList";
import plausibleEvent from "../../../services/plausible";
import Tab from "../../phase0/components/Tab";

interface UserHeaderProps {
  user: ReferentType;
  tab: string;
  currentUser: UserDto;
  onUserUpdate?: (updatedUser: ReferentType) => void;
}

const getSubtitle = (user: ReferentType): string => {
  const createdAt = new Date(user.createdAt);
  const diff = dayjs(createdAt).fromNow();
  return `Inscrit(e) ${diff} - ${createdAt.toLocaleDateString()}`;
};

export default function UserHeader({ user, tab, currentUser, onUserUpdate }: UserHeaderProps): JSX.Element {
  const history = useHistory();
  const dispatch = useDispatch();
  const [handleImpersonateLoading, setHandleImpersonateLoading] = useState<boolean>(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<boolean>(false);
  const handleImpersonate = async (): Promise<void> => {
    try {
      if (handleImpersonateLoading) return;
      setHandleImpersonateLoading(true);
      plausibleEvent("Utilisateurs/CTA - Prendre sa place");
      const data = await signinAs("referent", user._id);
      dispatch(setUserInRedux(data));
      history.push("/dashboard");
      setHandleImpersonateLoading(false);
    } catch (e) {
      console.log(e);
      toastr.error("Oops, une erreur est survenu lors de la masquarade !", translate(e.code));
    }
  };

  const handleStatusChange = async (selectedOption: { value: ReferentStatus; label: string }): Promise<void> => {
    try {
      toastr.clean();
      if (statusUpdateLoading || selectedOption.value === user.status) return;
      setStatusUpdateLoading(true);
      plausibleEvent("Utilisateurs/CTA - Changer statut");

      const { ok, code, data } = await api.put(`/referent/${user._id}`, { status: selectedOption.value });
      if (!ok) {
        toastr.error("Erreur lors de la mise à jour du statut", translate(code));
        return;
      }

      toastr.success("Statut mis à jour", `Statut mis à jour vers "${selectedOption.label}"`);
      if (onUserUpdate) {
        onUserUpdate({ ...user, status: data.status });
      }
    } catch (e) {
      toastr.error("Erreur lors de la mise à jour du statut", translate(e.code));
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  return (
    <div className="flex items-end justify-end border-b-[1px] border-b-[#E5E7EB] px-[30px] pt-[15px]">
      <div className="flex w-full flex-row flex-wrap-reverse items-end justify-end ">
        <div className="grow self-start text-center">
          <div className="mt-3 flex flex-col justify-between md:flex-row">
            <div className="mb-3 flex items-center md:mb-0">
              <span className="mr-2 text-2xl font-bold">{`${user.firstName} ${user.lastName}`}</span>
              <Badge title={translate(user.role)} status="none" className="border-gray-300 mr-2 mt-1" />
              <span className="text-xs">{getSubtitle(user)}</span>
            </div>
            <div className="flex items-center">
              {user.structureId && (
                <Link to={`/structure/${user.structureId}`} onClick={() => plausibleEvent("Utilisateurs/Profil CTA - Voir structure")}>
                  <PanelActionButton icon="eye" title="Voir la structure" className="m-0 mr-2" />
                </Link>
              )}
              <div className="mr-2">
                <Select
                  value={{
                    value: user.status,
                    label: translateReferentStatus(user.status as ReferentStatus),
                  }}
                  options={[
                    { value: ReferentStatus.ACTIVE, label: translateReferentStatus(ReferentStatus.ACTIVE) },
                    { value: ReferentStatus.INACTIVE, label: translateReferentStatus(ReferentStatus.INACTIVE) },
                  ]}
                  onChange={handleStatusChange}
                  disabled={statusUpdateLoading || currentUser.role !== ROLES.ADMIN}
                  placeholder="Statut"
                  className="min-w-[120px]"
                  size="sm"
                  isSearchable={false}
                />
              </div>
              {canSigninAs(currentUser, user, "referent") && (
                <Tooltip title="Vous ne pouvez pas prendre la place d'un utilisateur désactivé" disabled={user.status !== ReferentStatus.INACTIVE}>
                  <PanelActionButton
                    className={"m-0"}
                    onClick={handleImpersonate}
                    icon="impersonate"
                    title="Prendre&nbsp;sa&nbsp;place"
                    disabled={user.status === ReferentStatus.INACTIVE}
                    style={{
                      backgroundColor: user.status === ReferentStatus.INACTIVE ? "gray" : "white",
                      cursor: user.status === ReferentStatus.INACTIVE ? "not-allowed" : "pointer",
                    }}
                  />
                </Tooltip>
              )}
            </div>
          </div>

          <TabList className="mt-[30px]">
            <Tab isActive={tab === "profile"} onClick={() => history.push(`/user/${user._id}`)}>
              <div className="flex items-center">Profil</div>
            </Tab>
            {isReadAuthorized({ user: currentUser, resource: PERMISSION_RESOURCES.USER_NOTIFICATIONS }) && (
              <Tab isActive={tab === "notifications"} onClick={() => history.push(`/user/${user._id}/notifications`)}>
                Notifications
              </Tab>
            )}
            {isReadAuthorized({ user: currentUser, resource: PERMISSION_RESOURCES.USER_HISTORY }) && (
              <Tab isActive={tab === "historique"} onClick={() => history.push(`/user/${user._id}/historique`)}>
                <div className="flex items-center">
                  <History className="mr-[4px] block flex-[0_0_18px]" fill={tab === "historique" ? "#3B82F6" : "#9CA3AF"} />
                  Historique
                </div>
              </Tab>
            )}
          </TabList>
        </div>
      </div>
    </div>
  );
}
