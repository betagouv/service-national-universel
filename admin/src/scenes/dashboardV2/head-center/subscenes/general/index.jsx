import React, { useEffect } from "react";
import api from "@/services/api";
import DashboardContainer from "../../../components/DashboardContainer";

export default function Index() {
  useEffect(() => {
    const updateStats = async () => {
      const response = await api.post("/elasticsearch/dashboard/general/todo");
      const s = response.data;
      console.log(s);
    };
    updateStats();
  }, []);
  return (
    <DashboardContainer active="general" availableTab={["general", "sejour"]}>
      <div>Général</div>
    </DashboardContainer>
  );
}
