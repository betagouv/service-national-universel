import React from "react";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";

export default function NotEligible() {
  const [data, setData] = React.useContext(PreInscriptionContext);
  React.useEffect(() => {
    console.log(data);
  }, []);
  return <div>StepSejour</div>;
}
