import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../../services/api";
import { formatHistory } from "../../../utils";
import HistoricComponent2 from "../../../components/views/Historic2";
import WrapperHistoryV2 from "./wrapperv2";

export default function History({ ...props }) {
  const user = useSelector((state) => state.Auth.user);
  const [data, setData] = useState([]);
  const formattedData = formatHistory(data, user.role);
  const [structure, setStructure] = useState(null);

  React.useEffect(() => {
    (async () => {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return <div />;
      const { data } = await api.get(`/structure/${id}`);
      setStructure(data);
    })();
  }, [props.match.params.id]);

  const getPatches = async () => {
    try {
      const { ok, data } = await api.get(`/structure/${structure._id}/patches`);
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
    <WrapperHistoryV2 tab="historique" structure={structure}>
      {formattedData?.length ? <HistoricComponent2 model="structure" data={formattedData} /> : <div className="animate-pulse text-center">Chargement des données</div>}
    </WrapperHistoryV2>
  );
}
