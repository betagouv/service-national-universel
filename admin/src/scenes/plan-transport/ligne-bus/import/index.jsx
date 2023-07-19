import React from "react";
import { Title } from "../../components/commons";
import Select from "../../components/Select";
import Download from "./components/Download";
import Import from "./components/Import";
import NavBar from "./components/NavBar";
import Resum from "./components/Resum";

const cohortList = [
  { label: "Séjour du <b>19 Février au 3 Mars 2023</b>", value: "Février 2023 - C" },
  { label: "Séjour du <b>9 au 21 Avril 2023</b>", value: "Avril 2023 - A" },
  { label: "Séjour du <b>16 au 28 Avril 2023</b>", value: "Avril 2023 - B" },
  { label: "Séjour du <b>11 au 23 Juin 2023</b>", value: "Juin 2023" },
  { label: "Séjour du <b>4 au 16 Juillet 2023</b>", value: "Juillet 2023" },
  { label: "Séjour du <b>14 au 26 Octobre 2023</b>", value: "Octobre 2023 - NC" },
];

export default function Index(props) {
  const cohort = new URLSearchParams(props.location.search).get("cohort");
  const [steps, setSteps] = React.useState([
    { id: "étape 1", name: "Téléchargez le modèle", status: "current" },
    { id: "étape 2", name: "Import du fichier", status: "upcoming" },
    { id: "étape 3", name: "Résumé de l’import", status: "upcoming" },
  ]);
  const [summary, setSummary] = React.useState(null);

  const nextStep = () => {
    let nextStep = false;
    const newSteps = steps.map((step) => {
      if (step.status === "current") {
        return { ...step, status: "complete" };
      } else if (step.status === "upcoming" && !nextStep) {
        nextStep = true;
        return { ...step, status: "current" };
      }
      return step;
    });
    setSteps(newSteps);
  };

  function fileVerified(data) {
    setSummary(data);
    nextStep();
  }

  return (
    <div className="flex w-full flex-col px-8 pb-8 ">
      <div className="flex items-center justify-between py-8">
        <Title>Importer mon plan de transport</Title>
        <Select options={cohortList} value={cohort} disabled={true} />
      </div>
      <div className="mt-4 flex w-full flex-col">
        <NavBar steps={steps} />
        {steps[0].status === "current" && <Download nextStep={nextStep} />}
        {steps[1].status === "current" && <Import cohort={cohort} onFileVerified={fileVerified} />}
        {steps[2].status === "current" && <Resum cohort={cohort} summary={summary} />}
      </div>
    </div>
  );
}
