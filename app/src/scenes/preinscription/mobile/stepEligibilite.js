import React from "react";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import { useHistory } from "react-router-dom";
import Select from "../components/select";
import Input from "../components/input";

export default function StepEligibilite() {
  const [data, setData] = React.useContext(PreInscriptionContext);
  const history = useHistory();
  const options = [
    { value: "oui", label: "Oui" },
    { value: "non", label: "Non" },
  ];
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
      <div className="mt-4 p-4 bg-white">
        <Select options={options} value={data.exemple} placeholder="Selectionner une option" onChange={(e) => setData({ ...data, exemple: e })} />
      </div>
      <div className="mt-4 p-4 bg-white">
        <Input value={data.exemple2} placeholder="Entrez une valeur" onChange={(e) => setData({ ...data, exemple2: e })} />
      </div>
      <div className="mt-4 p-4 bg-white">
        <Input value={data.exemple3} onChange={(e) => setData({ ...data, exemple3: e })} />
      </div>
    </div>
  );
}
