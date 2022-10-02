import React from "react";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import { useHistory } from "react-router-dom";

export default function StepEligibilite() {
  const [data, setData] = React.useContext(PreInscriptionContext);
  const history = useHistory();

  return (
    <div>
      stepEligibilite go to{" "}
      <href
        className="text-blue-500"
        onClick={() => {
          setData({ ...data, name: "coucou", id: 2, school: "lalala" });
          history.push("/preinscription/sejour");
        }}>
        step2
      </href>
    </div>
  );
}
