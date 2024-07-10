import API from "@/services/api";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export function MesEngagements() {
  const { young } = useSelector((state) => state.Auth);
  const [equivalences, setEquivalences] = useState([]);

  useEffect(() => {
    (async () => {
      const { ok, data } = await API.get(`/young/${young._id.toString()}/phase2/equivalences`);
      if (ok) return setEquivalences(data);
    })();
  }, [young]);

  return (
    <div className="p-3 bg-gray-50 h-64">
      <section className="max-w-5xl mx-auto">
        <h2 className="font-bold m-0">Mes engagements</h2>
        <p className="mt-2">Todo</p>
      </section>
    </div>
  );
}
