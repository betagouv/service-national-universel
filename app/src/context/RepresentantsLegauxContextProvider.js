import React, { createContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import queryString from "query-string";
import api from "../services/api";

export const RepresentantsLegauxContext = createContext();

const RepresentantsLegauxContextProvider = ({ children, parentId }) => {
  const history = useHistory();
  const params = queryString.parse(location.search);
  const { token } = params;
  const [young, setYoung] = useState(null);

  useEffect(() => {
    async function getYoungFromToken() {
      // const redirectInvalidToken = () => history.push("/representants-legaux/token-invalide");
      const redirectInvalidToken = () => history.push("/");
      if (!token) redirectInvalidToken();
      const { ok, data } = await api.get(`/representants-legaux/young?token=${token}&parent=${parentId}`);

      if (!ok) return redirectInvalidToken();
      setYoung(data);
    }
    getYoungFromToken();
  }, []);

  return <RepresentantsLegauxContext.Provider value={{ young, token }}>{children}</RepresentantsLegauxContext.Provider>;
};

export default RepresentantsLegauxContextProvider;
