import React from "react";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";
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
import { isResponsableDeCentre } from "snu-lib";

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
      case ROLES.HEAD_CENTER_ADJOINT:
      case ROLES.REFERENT_SANITAIRE:
        return ["general", "sejour"];
      case ROLES.RESPONSIBLE:
      case ROLES.SUPERVISOR:
        return ["general", "engagement"];
      default:
        return ["general", "engagement", "sejour", "inscription"];
    }
  })();

  return (
    <Page>
      {messages?.map((msg) => <InfoMessage key={msg._id} title={msg.title} message={msg.content} priority={msg.priority} className="mb-6" />)}
      <Header title="Tableau de bord" breadcrumb={[{ title: "Tableau de bord" }]} classNameDivTitle="h-[38px]" />
      <DashboardContainer active="general" availableTab={availableTab}>
        <div className="flex flex-col gap-8 mb-4">
          <h1 className="text-[28px] font-bold leading-8 text-gray-900">En ce moment</h1>
          <div className="flex w-full gap-4">
            <Todos user={user} />
            {!isResponsableDeCentre(user) && <KeyNumbers role={user.role} />}
          </div>
          {[ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role) && <Objective user={user} />}
        </div>
      </DashboardContainer>
    </Page>
  );
}
