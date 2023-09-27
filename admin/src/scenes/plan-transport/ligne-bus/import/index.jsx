import React, { useState, useEffect } from "react";
import { Title } from "../../components/commons";
import Select from "../../components/Select";
import Download from "./components/Download";
import Import from "./components/Import";
import NavBar from "./components/NavBar";
import Resum from "./components/Resum";
import { getCohortSelectOptions } from "@/services/cohort.service";

export default function Index(props) {
  const [cohortList, setCohortList] = useState([]);
  const cohort = new URLSearchParams(props.location.search).get("cohort");
  const [steps, setSteps] = useState([
    { id: "étape 1", name: "Téléchargez le modèle", status: "current" },
    { id: "étape 2", name: "Import du fichier", status: "upcoming" },
    { id: "étape 3", name: "Résumé de l’import", status: "upcoming" },
  ]);
  const [summary, setSummary] = useState(null);

  const fetchCohorts = async () => {
    const cohortList = await getCohortSelectOptions();
    setCohortList(cohortList);
  };

  useEffect(() => {
    fetchCohorts();
  }, []);

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
