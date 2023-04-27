import React, { useContext, useEffect, useState } from "react";
import { formatHistory } from "../../../utils";
import API from "../../../services/api";
import { StructureContext } from ".";
import { useSelector } from "react-redux";

import WrapperHistoryV2 from "./wrapperv2";
import HistoricComponent2 from "../../../components/views/Historic2";

export default function History() {
  const user = useSelector((state) => state.Auth.user);
  const { structure } = useContext(StructureContext);
  const [data, setData] = useState([]);
  const formattedData = formatHistory(data, user.role);

  const getPatches = async () => {
    try {
      const { ok, data } = await API.get(`/structure/${structure._id}/patches`);
      if (!ok) return;
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (structure) getPatches().then((data) => setData(data));
  }, [structure]);

  return (
    <WrapperHistoryV2 tab="historique">
      {formattedData?.length ? <HistoricComponent2 model="structure" data={formattedData} /> : <div className="animate-pulse text-center">Chargement des données</div>}
    </WrapperHistoryV2>
  );
}
