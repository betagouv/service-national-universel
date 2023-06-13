import React, { createContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import queryString from "query-string";
import api from "../services/api";
import { capture } from "../sentry";

export const RepresentantsLegauxContext = createContext();

const RepresentantsLegauxContextProvider = ({ children, parentId }) => {
  const history = useHistory();
  const params = queryString.parse(location.search);
  const { token } = params;
  const [young, setYoung] = useState(null);

  useEffect(() => {
    async function getYoungFromToken() {
      const redirectInvalidToken = () => history.push("/representants-legaux/token-invalide");
      try {
        if (!token) redirectInvalidToken();
        const { ok, data } = await api.get(`/representants-legaux/young?token=${token}&parent=${parentId}`);
        console.log("ok", ok, data);
        if (!ok) return redirectInvalidToken();
        setYoung(data);
      } catch (e) {
        if (e.code === "INVALID_BODY" || e.code === "OPERATION_UNAUTHORIZED") return redirectInvalidToken();
        capture(e);
      }
    }
    getYoungFromToken();
  }, []);

  return <RepresentantsLegauxContext.Provider value={{ young, token }}>{children}</RepresentantsLegauxContext.Provider>;
};

export default RepresentantsLegauxContextProvider;
