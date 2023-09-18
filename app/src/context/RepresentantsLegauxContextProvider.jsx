import React, { createContext, useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import queryString from "query-string";
import api from "../services/api";
import { capture } from "../sentry";

export const RepresentantsLegauxContext = createContext();

const RepresentantsLegauxContextProvider = ({ children, parentId }) => {
  const [error, setError] = useState(false);
  const params = queryString.parse(location.search);
  const { token } = params;
  const [young, setYoung] = useState(null);

  useEffect(() => {
    async function getYoungFromToken() {
      try {
        if (!token || !parentId) setError(true);
        const { ok, data } = await api.get(`/representants-legaux/young?token=${token}&parent=${parentId}`);
        if (!ok) return setError(true);
        setYoung(data);
      } catch (e) {
        if (e.code === "INVALID_BODY" || e.code === "OPERATION_UNAUTHORIZED") setError(true);
        capture(e);
      }
    }
    getYoungFromToken();
  }, [token, parentId]);

  if (error) return <Redirect to="/representants-legaux/token-invalide" />;
  return <RepresentantsLegauxContext.Provider value={{ young, token }}>{children}</RepresentantsLegauxContext.Provider>;
};

export default RepresentantsLegauxContextProvider;
