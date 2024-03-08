import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { Title } from "../../components/commons";
import Select from "../../components/Select";
import Download from "./components/Download";
import Import from "./components/Import";
import NavBar from "./components/NavBar";
import Resum from "./components/Resum";
import { getCohortSelectOptions } from "@/services/cohort.service";
import { add } from "date-fns";

export default function Index(props) {
  const cohorts = useSelector((state) => state.Cohorts);
  const [cohortList, setCohortList] = useState([]);
  const cohort = new URLSearchParams(props.location.search).get("cohort");
  const addLigne = new URLSearchParams(props.location.search).get("add");
  const [steps, setSteps] = useState([
    { id: "étape 1", name: "Le modèle vierge", status: "current" },
    { id: "étape 2", name: "Mon plan de transport", status: "upcoming" },
    { id: "étape 3", name: "Résumé", status: "upcoming" },
  ]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const cohortList = getCohortSelectOptions(cohorts);
    setCohortList(cohortList);
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
        <Title>{addLigne ? "Importer des lignes supplémentaires" : "Importer mon plan de transport"}</Title>
        <Select options={cohortList} value={cohort} disabled={true} />
      </div>
      <div className="mt-4 flex w-full flex-col">
        <NavBar steps={steps} />
        {steps[0].status === "current" && <Download nextStep={nextStep} addLigne={addLigne} cohort={cohort} />}
        {steps[1].status === "current" && <Import cohort={cohort} onFileVerified={fileVerified} addLigne={addLigne} />}
        {steps[2].status === "current" && <Resum cohort={cohort} summary={summary} addLigne={addLigne} />}
      </div>
    </div>
  );
}
