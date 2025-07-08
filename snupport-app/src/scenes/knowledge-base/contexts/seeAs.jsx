import React, { useState } from "react";

const SeeAsContext = React.createContext({});

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
      }}
    >
      {children}
    </SeeAsContext.Provider>
  );
};

export default SeeAsContext;
