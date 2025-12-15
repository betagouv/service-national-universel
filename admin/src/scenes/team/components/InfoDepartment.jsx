import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import CardRepresentant from "./card/CardRepresentant";

export default function InfoDepartement({ department }) {
  const [servicesDep, setServicesDep] = useState();
  const [representant, setRepresentant] = useState();

  const getService = async () => {
    const { data, ok } = await api.get(`/department-service/${department}`);
    if (!ok) return;
    setServicesDep(data);
    setRepresentant(data.representantEtat || null);
  };

  useEffect(() => {
    getService();
  }, [department]);

  if (!servicesDep) return null;

  return (
    <div className="flex-stretch flex flex-row flex-wrap gap-y-4">
      {department ? <CardRepresentant representant={representant} getService={getService} department={department} idServiceDep={servicesDep._id} /> : null}
    </div>
  );
}
