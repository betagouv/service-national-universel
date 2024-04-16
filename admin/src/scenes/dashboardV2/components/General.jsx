import React, { useEffect } from "react";
import { ROLES } from "snu-lib";
import { capture } from "@/sentry";
import { translate } from "snu-lib";
import { toastr } from "react-redux-toastr";
import api from "@/services/api";
import { useSelector } from "react-redux";
import DashboardContainer from "./DashboardContainer";
import KeyNumbers from "./KeyNumbers";
import InfoMessage from "./ui/InfoMessage";
import Todos from "./Todos";
import Objective from "../moderator-ref/subscenes/general/components/Objective";
import BandeauInfo from "./BandeauInfo";
import { HiOutlineChartSquareBar } from "react-icons/hi";
import { Page, Header } from "@snu/ds/admin";

export default function Index() {
  const user = useSelector((state) => state.Auth.user);
  const [message, setMessage] = React.useState([]);

  const getMessage = async () => {
    try {
      const { ok, code, data: response } = await api.get(`/alerte-message`);

      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération des messages", translate(code));
      }
      setMessage(response.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des messages");
    }
  };

  useEffect(() => {
    getMessage();
  }, []);

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
      {needMoreInfo && <BandeauInfo />}
      <Header title="Tableau de bord" breadcrumb={[{ title: <HiOutlineChartSquareBar size={20} /> }, { title: "Tableau de bord" }]} />
      <DashboardContainer active="general" availableTab={availableTab}>
        <div className="flex flex-col gap-8 mb-4">
          {message?.length ? message?.map((hit) => <InfoMessage key={hit._id} data={hit} />) : null}
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
