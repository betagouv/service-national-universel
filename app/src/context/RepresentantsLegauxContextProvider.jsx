import React, { createContext, useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import queryString from "query-string";
import api from "../services/api";
import { capture } from "../sentry";
import Loader from "@/components/Loader";
import { fetchClass } from "@/services/classe.service";
import { fetchCohort } from "@/utils/cohorts";

export const RepresentantsLegauxContext = createContext();

const RepresentantsLegauxContextProvider = ({ children, parentId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const params = queryString.parse(location.search);
  const { token } = params;
  const [young, setYoung] = useState(null);
  const [classe, setClasse] = useState(null);
  const [cohort, setCohort] = useState(null);

  useEffect(() => {
    async function getYoungFromToken() {
      if (!token || !parentId) {
        setError(true);
        return;
      }
      setLoading(true);
      try {
        const { ok, data } = await api.get(`/representants-legaux/young?token=${token}&parent=${parentId}`);
        if (!ok) return setError(true);
        setYoung(data);

        if (data.cohortId) {
          const { ok, data: cohort } = await fetchCohort(data.cohortId);
          if (ok) setCohort(cohort);
        }

        if (data.classeId) {
          const classe = await fetchClass(data.classeId);
          if (ok) setClasse(classe);
        }
      } catch (e) {
        if (e.code === "INVALID_BODY" || e.code === "OPERATION_UNAUTHORIZED") setError(true);
        capture(e);
      }
      setLoading(false);
    }
    getYoungFromToken();
  }, [token, parentId]);

  if (loading) return <Loader />;
  if (error) return <Redirect to="/representants-legaux/token-invalide" />;
  return <RepresentantsLegauxContext.Provider value={{ young, token, classe, cohort }}>{children}</RepresentantsLegauxContext.Provider>;
};

export default RepresentantsLegauxContextProvider;
