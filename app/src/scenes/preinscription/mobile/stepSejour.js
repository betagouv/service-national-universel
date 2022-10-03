import React from "react";
import { Link } from "react-router-dom";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";

export default function StepSejour() {
  const [data, setData] = React.useContext(PreInscriptionContext);

  function getAvailableStays(data) {
    let cohorts = [
      {
        cohort: "Juin 2023",
        date: "du 11 au 23 juin",
      },
      {
        cohort: "Juillet 2023",
        date: "du 1er au 12 juillet",
      },
    ];

    switch (data.academy) {
      case "A":
        cohorts.push({
          cohort: "Avril 2023 - A",
          date: "du 9 au 21 avril",
        });
        break;
      case "B":
        cohorts.push({
          cohort: "Avril 2023 - B",
          date: "du 16 au 28 avril",
        });
        break;
      case "C":
        cohorts.push({
          cohort: "Février 2023 - C",
          date: "du 19 février au 3 mars",
        });
        break;
    }

    return cohorts;
  }

  React.useEffect(() => {
    console.log(data);
  }, []);

  if (getAvailableStays(data)) {
    return (
      <div className="bg-white p-4">
        <div className="w-full flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Choisissez la date du séjour</h1>
          <QuestionMarkBlueCircle />
        </div>
        <hr className="my-4 h-px bg-gray-200 border-0" />

        <div className="font-semibold my-2">Séjours de cohésion disponibles</div>

        <div className="text-gray-500 text-sm">Veuillez vous assurer d’être disponible sur l’ensemble de la période.</div>
        <div className="my-4">{getAvailableStays(data).map((e) => StayButton(data, setData, e))}</div>
        <div className="font-semibold py-2">Pourquoi je ne vois pas tous les séjours ?</div>
        <div className="text-gray-500 text-sm">
          La proposition des séjours dépend de vos caractéristiques personnelles (âge, situation scolaire ou professionnelle, localisation).{" "}
          <Link to="" className="underline underline-offset-4">
            En savoir plus.
          </Link>
        </div>
        <div className="text-blue-600 my-4 underline underline-offset-8">
          <Link to="">Consulter d’autres dispositifs d’engagement</Link>
        </div>
      </div>
    );
  } else {
    return (
      <div className="bg-white p-4">
        <h1 className="text-2xl font-semibold">Vous n'êtes malheureusement pas éligible au SNU.</h1>;
      </div>
    );
  }

  function StayButton(data, setData, stay) {
    return (
      <div
        key={stay.name}
        className="border px-3 py-4 my-3 flex justify-between items-center"
        onClick={() => {
          setData({ ...data, cohort: stay.cohort });
          // history.push("/preinscription/profil");
          console.log(data);
        }}>
        <div>
          Séjour du <strong>{stay.date}</strong>
        </div>
        <ArrowRightBlueSquare />
      </div>
    );
  }
}
