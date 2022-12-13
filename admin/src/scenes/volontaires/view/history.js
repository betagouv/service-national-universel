import React, { useEffect, useState } from "react";
import API from "../../../services/api";
import { useSelector } from "react-redux";
import { formatHistory } from "../../../utils";

import Loader from "../../../components/Loader";
import HistoricComponent from "../../../components/views/Historic2";
import YoungHeader from "../../phase0/components/YoungHeader";

export default function History({ young, onChange }) {
  const user = useSelector((state) => state.Auth.user);
  const [data, setData] = useState([]);
  console.log("🚀 ~ file: history.js:13 ~ History ~ data", data);
  const formattedData = formatHistory(data, user.role);

  const getPatches = async () => {
    try {
      const { ok, data } = await API.get(`/young/${young._id}/patches`);
      if (!ok) return;
      setData(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (young?._id) getPatches();
  }, [young]);

  const filters = [
    {
      label: "Validations de phase",
      value: { path: ["statusPhase1", "statusPhase2", "statusPhase3"], value: ["DONE", "VALIDATED"] },
    },
    {
      label: "Changements de cohortes",
      value: { path: ["cohort"] },
    },
    {
      label: "Pièces justificatives",
      value: { path: ["files", "files/cniFiles/0", "files/cniFiles/1", "files/cniFiles/2"] },
    },
  ];

  return (
    <>
      <YoungHeader young={young} tab="historique" onChange={onChange} />
      <div className="p-[30px]">{!data?.length ? <Loader /> : <HistoricComponent model="young" data={formattedData} customFilterOptions={filters} />}</div>
    </>
  );
}
