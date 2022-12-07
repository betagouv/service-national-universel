import React, { useEffect, useState } from "react";
import Loader from "../../../components/Loader";

import HistoricComponent from "../../../components/views/Historic2";
import API from "../../../services/api";
import YoungHeader from "../../phase0/components/YoungHeader";

export default function History({ young, onChange }) {
  const [data, setData] = useState([]);

  const getPatches = async () => {
    try {
      const { ok, data } = await API.get(`/young/${young._id}/patches`);
      if (!ok) return;
      setData(formatHistory(data));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (young._id) getPatches();
  }, [young]);

  function formatField(field) {
    return JSON.stringify(field)?.replace(/"/g, "");
  }

  function formatValue(value) {
    if (value && value.name?.length) return value.name;
    if (typeof value === "object") return JSON.stringify(value);
    return value;
  }

  function formatUser(user) {
    if (!user) return { name: "Acteur inconnu", role: "" };
    if (user.name?.includes("/Users/")) return { name: "Script", role: "Modification automatique" };
    if (!user.role) {
      user.role = user.email ? "Volontaire" : "Modification automatique";
    }
    return user;
  }

  function formatHistory(data) {
    let history = [];
    for (const hit of data) {
      for (const e of hit.ops) {
        try {
          e.date = hit.date;
          e.user = formatUser(hit.user);
          e.path = formatField(e.path.substring(1));
          e.value = formatValue(e.value);
          e.originalValue = formatValue(e.originalValue, e.path);
          history.push(e);
        } catch (error) {
          console.log("Error while formatting event:", e);
          console.error(error);
        }
      }
    }
    return history;
  }

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
      <div className="p-[30px]">{!data.length ? <Loader /> : <HistoricComponent model="young" data={data} filters={filters} />}</div>
    </>
  );
}
