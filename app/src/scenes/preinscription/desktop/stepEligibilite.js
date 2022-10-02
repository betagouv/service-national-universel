import React from "react";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";

export default function StepEligibilite() {
  const [data, setData] = React.useContext(PreInscriptionContext);
  React.useEffect(() => {
    setData({ ...data, eligibilite: "ok" });
  }, []);

  console.log(data);

  return <div>stepEligibilite</div>;
}
