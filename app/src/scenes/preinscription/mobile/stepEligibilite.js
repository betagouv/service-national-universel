import React from "react";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import { useHistory } from "react-router-dom";
import Select from "../components/select";
import Toggle from "../components/toggle";
import Input from "../components/input";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import DateFilter from "../components/DatePickerList";

export default function StepEligibilite() {
  const [data, setData] = React.useContext(PreInscriptionContext);
  const history = useHistory();
  const optionsScolarite = [
    { value: "NOT_SCOLARISE", label: "Non scolarisé" },
    { value: "THIRD", label: "3ème" },
    { value: "SECOND", label: "2nde" },
    { value: "TERM", label: "1ale" },
  ];

  console.log("🚀 ~ file: stepEligibilite.js ~ line 47 ~ StepEligibilite ~ data", data);

  return (
    <div className="bg-white p-4">
      <div className="w-full flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Vérifiez votre éligibilité au SNU</h1>
        <QuestionMarkBlueCircle />
      </div>
      <hr className="my-4 h-px bg-gray-200 border-0" />
      <div className="flex items-center my-4">
        <input
          type="checkbox"
          className={`w-4 h-4 cursor-pointer`}
          checked={data.frenchNationality === "true"}
          onChange={(e) => setData({ ...data, frenchNationality: e.target.checked ? "true" : "false" })}
        />
        <div className="ml-4">Je suis de nationalité française </div>
      </div>
      <div className="flex flex-col flex-start my-4">
        Niveau de scolarité
        <Select options={optionsScolarite} value={data.scolarity} placeholder="Sélectionner une option" onChange={(e) => setData({ ...data, scolarity: e })} />
      </div>
      <div className="flex flex-col flex-start my-4">
        Date de naissance
        <DateFilter title="" value={data.birthDate} onChange={(e) => setData({ ...data, birthDate: e.target.value })} />
      </div>
      {data.scolarity &&
        (data.scolarity !== "NOT_SCOLARISE" ? (
          <div>Je réside en France</div>
        ) : (
          <div className="flex justify-between">
            <div className="flex">
              <div className="font-bold">Je réside</div> en France
            </div>

            <Toggle onClick={() => setData({ ...data, frenchResidency: !data.frenchResidency })} toggled={data.frenchResidency} />
          </div>
        ))}
    </div>
  );
}
