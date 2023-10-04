import React, { useState, useEffect } from "react";

import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { translate } from "snu-lib";
import { capture } from "@/sentry";
import api from "@/services/api";
import DashboardContainer from "../../../components/DashboardContainer";
import Todos from "../../../components/Todos";
import KeyNumbers from "../../../components/KeyNumbers";
import InfoMessage from "../../../components/ui/InfoMessage";

export default function Index() {
  const user = useSelector((state) => state.Auth.user);
  const [stats, setStats] = useState({});
  const [message, setMessage] = useState([]);

  useEffect(() => {
    const updateStats = async (id) => {
      const response = await api.post("/elasticsearch/dashboard/general/todo", { filters: { meetingPointIds: [id], cohort: [] } });
      const s = response.data;
      setStats(s);
    };
    updateStats();
  }, []);

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

  return (
    <DashboardContainer active="general" availableTab={["general", "engagement"]}>
      <div className="flex flex-col gap-8 mb-4">
        {message?.length ? message.map((hit) => <InfoMessage key={hit._id} data={hit} />) : null}
        <h1 className="text-[28px] font-bold leading-8 text-gray-900">En ce moment</h1>
        <div className="flex w-full gap-4">
          <Todos stats={stats} user={user} />
          <KeyNumbers role={user.role} />
        </div>
      </div>
    </DashboardContainer>
  );
}
