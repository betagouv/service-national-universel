import React, { useEffect, useState } from "react";
import queryString from "query-string";
import {Redirect } from "react-router-dom";
import api from "../services/api";

const FranceConnectCallback = ({ location }) => {
  const [data, setData] = useState(null);
  useEffect(() => {
    (async () => {
      const { code } = queryString.parse(location.search);
      const response = await api.post("/young/france-connect/user-info", { code });
      setData(response.data);
    })();
  }, []);

  if (data) {
    return (
      <Redirect
        to={{
          pathname: "/inscription/create",
          state: {
            step: "REPRESENTANTS",
            data: {
              email: data["email"],
              firstName: data["given_name"],
              lastName: data["family_name"],
            },
          },
        }}
      />
    );
  }
  return <div>Chargement…</div>;
};

export default FranceConnectCallback;
