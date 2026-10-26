import React, { useState } from "react";

const SeeAsContext = React.createContext({});

// FIXME: find a way to get roles defined for the organisation on admin side
// Sans les rôles décommissionnés (DECOMMISSIONED_ROLES de snu-lib) : chef de centre et adjoint,
// référent sanitaire, visiteur, administrateurs CLE et référent classe.
const roles = ["admin", "referent", "structure", "young", "young_cle", "public", "dsnj"];

export const SeeAsProvider = ({ children }) => {
  const [seeAs, setSeeAsState] = useState(() => {
    if (typeof window === "undefined") return null;
    const storedSeeAs = window?.sessionStorage?.getItem("snu-base-de-connaissancesee-as");
    // Une vue mémorisée sur un rôle retiré de la liste retombe sur la vue par défaut.
    return roles.includes(storedSeeAs) ? storedSeeAs : null;
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
