import React, { useEffect, useState } from "react";
import API from "../../../services/api";

import Loader from "../../../components/Loader";
import HistoricComponent from "../../../components/views/Historic2";
import YoungHeader from "../../phase0/components/YoungHeader";
import { useSelector } from "react-redux";
import { ROLES } from "snu-lib";

export default function History({ young, onChange }) {
  const userData = useSelector((state) => state.Auth.user);

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

  function formatValue(path, value) {
    if (!value) return "Vide";

    if (typeof value === "object") {
      if (path.includes("cniFiles")) return value.name;
      if (path.includes("correctionRequests")) return value[value.length - 1].message;
      if (path.includes("location")) return `Latitude: ${value.lat}, Longitude: ${value.lon}`;
      if (path.includes("notes")) return value.note?.substring(0, 100);
      return JSON.stringify(value);
    }

    return value;
  }

  function formatUser(user) {
    if (!user || !user?.firstName) return { firstName: "Acteur inconnu", role: "Donnée indisponible" };
    if (user.firstName?.includes("/Users/")) user.firstName = "Modification automatique";
    if (!user.role) {
      if (user.email) user.role = "Volontaire";
      if (!user.email && userData.role !== ROLES.ADMIN) {
        user.firstName = "Modification automatique";
      }
    }
    return user;
  }

  function formatHistory(data) {
    let history = [];
    const hiddenFields = [
      "parent1InscriptionToken",
      "parent2InscriptionToken",
      "parent1Inscription2023Token",
      "parent2InscriptionToken",
      "missionsInMail",
      "history",
      "uploadedAt",
      "sessionPhase1Id",
      "correctedAt",
    ];
    const ignoredValues = [null, undefined, "", [], {}, "Vide"];
    for (const hit of data) {
      for (const e of hit.ops) {
        try {
          e.path = formatField(e.path.substring(1));
          if (hiddenFields.some((f) => e.path.includes(f))) continue;
          if ((!e.value || ignoredValues.includes(e.value)) && (!e.originalValue || ignoredValues.includes(e.value))) continue;
          e.date = hit.date;
          e.user = formatUser(hit.user);
          e.author = e.user.firstName + e.user.lastName && ` ${e.user.lastName}`;
          e.value = formatValue(e.path, e.value);
          e.originalValue = formatValue(e.path, e.originalValue);
          e.ref = hit.ref;
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
      <div className="p-[30px]">{!data?.length ? <Loader /> : <HistoricComponent model="young" data={data} customFilterOptions={filters} />}</div>
    </>
  );
}
