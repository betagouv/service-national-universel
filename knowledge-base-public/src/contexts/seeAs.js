import React, { useState } from "react";

const SeeAsContext = React.createContext({});

// FIXME: find a way to get roles defined for the organisation on admin side
const roles = [
  "admin",
  "referent",
  "structure",
  "head_center",
  "young",
  "young_cle",
  "public",
  "visitor",
  "dsnj",
  "administrateur_cle_coordinateur_cle",
  "administrateur_cle_referent_etablissement",
  "referent_classe",
];

export const SeeAsProvider = ({ children }) => {
  const [seeAs, setSeeAsState] = useState(() => {
    if (typeof window === "undefined") return null;
    return window?.sessionStorage?.getItem("snu-base-de-connaissancesee-as") || null;
  });

  const setSeeAs = (role) => {
    setSeeAsState(role);

    window.sessionStorage.setItem("snu-base-de-connaissancesee-as", role);
  };

  return (
    <SeeAsContext.Provider
      value={{
        seeAs,
        setSeeAs,
        roles,
      }}
    >
      {children}
    </SeeAsContext.Provider>
  );
};

export default SeeAsContext;
