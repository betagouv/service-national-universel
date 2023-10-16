import React, { useState, useEffect } from "react";
import { toastr } from "react-redux-toastr";
import { translate } from "snu-lib";
import { capture } from "@/sentry";
import api from "@/services/api";
import DashboardContainer from "../../../components/DashboardContainer";
import InfoMessage from "../../../components/ui/InfoMessage";
import Todos from "../../../components/Todos";
import { useSelector } from "react-redux";

export default function Index() {
  const user = useSelector((state) => state.Auth.user);
  const [stats, setStats] = useState({});
  const [message, setMessage] = useState([]);

  useEffect(() => {
    const updateStats = async () => {
      const response = await api.post("/elasticsearch/dashboard/general/todo");
      const s = response.data;
      const filteredStats = {};
      Object.entries(s).forEach(([key, value]) => {
        const filteredValue = {};
        Object.entries(value).forEach(([subKey, item]) => {
          if (item !== 0 && (!Array.isArray(item) || item.length > 0)) {
            filteredValue[subKey] = item;
          }
        });
        filteredStats[key] = filteredValue;
      });
      setStats(filteredStats);
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
    <DashboardContainer active="general" availableTab={["general", "sejour"]}>
      <div className="flex flex-col gap-8 mb-4">
        {message?.length ? message.map((hit) => <InfoMessage key={hit._id} data={hit} />) : null}
        <h1 className="text-[28px] font-bold leading-8 text-gray-900">En ce moment</h1>
        <div className="flex w-full gap-4">
          <Todos stats={stats} user={user} />
        </div>
      </div>
    </DashboardContainer>
  );
}
