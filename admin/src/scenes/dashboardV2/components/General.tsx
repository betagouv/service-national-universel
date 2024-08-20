import React from "react";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";
import { HiHome } from "react-icons/hi";
import { useQuery } from "@tanstack/react-query";

import { ROLES, translate, AlerteMessageDto } from "snu-lib";
import { Page, Header } from "@snu/ds/admin";

import api from "@/services/api";
import { AuthState } from "@/redux/auth/reducer";

import DashboardContainer from "./DashboardContainer";
import KeyNumbers from "./KeyNumbers";
import InfoMessage from "./ui/InfoMessage";
import Todos from "./Todos";
import Objective from "../moderator-ref/subscenes/general/components/Objective";
import BandeauInfo from "./BandeauInfo";

export default function Index() {
  const user = useSelector((state: AuthState) => state.Auth.user);

  const { data: messages } = useQuery<AlerteMessageDto[]>({
    queryKey: ["alerte-messages", "user"],
    queryFn: async () => {
      const { ok, code, data: response } = await api.get(`/alerte-message`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la récupération des messages", translate(code));
        throw new Error(translate(code));
      }
      return response.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
  });

  const availableTab = (() => {
    switch (user.role) {
      case ROLES.HEAD_CENTER:
        return ["general", "sejour"];
      case ROLES.RESPONSIBLE:
      case ROLES.SUPERVISOR:
        return ["general", "engagement"];
      default:
        return ["general", "engagement", "sejour", "inscription"];
    }
  })();

  const needMoreInfo = [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role);

  return (
    <Page>
      {messages?.map((msg) => <InfoMessage key={msg._id} title={msg.title} message={msg.content} priority={msg.priority} className="mb-6" />)}
      {needMoreInfo && <BandeauInfo />}
      <Header title="Tableau de bord" breadcrumb={[{ title: <HiHome size={20} className="text-gray-400" /> }, { title: "Tableau de bord" }]} classNameDivTitle="h-[38px]" />
      <DashboardContainer active="general" availableTab={availableTab}>
        <div className="flex flex-col gap-8 mb-4">
          <h1 className="text-[28px] font-bold leading-8 text-gray-900">En ce moment</h1>
          <div className="flex w-full gap-4">
            <Todos user={user} />
            {user.role !== ROLES.HEAD_CENTER && <KeyNumbers role={user.role} />}
          </div>
          {[ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role) && <Objective user={user} />}
        </div>
      </DashboardContainer>
    </Page>
  );
}
