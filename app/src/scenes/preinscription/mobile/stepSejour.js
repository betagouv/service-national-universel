import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import { getZoneByDepartment } from "snu-lib/academy";

function getAvailableStays(data) {
  let cohorts = [];

  const zone = getZoneByDepartment(data?.department);

  switch (zone) {
    case "A":
      if (data.birthdateAt > new Date("04/22/2005") && data.birthdateAt < new Date("04/09/2008")) {
        cohorts.push({
          cohort: "Avril 2023 - A",
          date: "du 9 au 21 avril",
        });
      }
      break;
    case "B":
      if (data.birthdateAt > new Date("04/28/2005") && data.birthdateAt < new Date("04/16/2008")) {
        cohorts.push({
          cohort: "Avril 2023 - B",
          date: "du 16 au 28 avril",
        });
      }
      break;
    case "C":
    case "Corse":
      if (data.birthdateAt > new Date("02/19/2005") && data.birthdateAt < new Date("03/03/2008")) {
        cohorts.push({
          cohort: "Février 2023 - C",
          date: "du 19 février au 3 mars",
        });
      }
      break;
    default:
      break;
  }

  if (data.birthdateAt > new Date("06/24/2005") && data.birthdateAt < new Date("06/11/2008")) {
    cohorts.push({
      cohort: "Juin 2023",
      date: "du 11 au 23 juin",
    });
  }

  if (data.birthdateAt > new Date("07/13/2005") && data.birthdateAt < new Date("07/01/2008")) {
    cohorts.push({
      cohort: "Juillet 2023",
      date: "du 1er au 12 juillet",
    });
  }

  return cohorts;
}

function isEligible(data) {
  // check grade
  if (data.grade !== "2de") return false;
  // for each cohesion stay, check both location and dates
  if (!getAvailableStays(data).length) return false;
  return true;
}

export default function StepSejour() {
  const [data, setData] = React.useContext(PreInscriptionContext);

  useEffect(() => {
    setData({ ...data, department: "Ain", birthdateAt: new Date("07/14/2006") }); // Pour tester
  }, []);

  if (isEligible(data)) {
    setData({ ...data, isEligible: "true" });
    return <StayChoice data={data} setData={setData} />;
  } else {
    setData({ ...data, isEligible: "false" });
    return <NotEligible />;
  }
}
function StayChoice({ data, setData }) {
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
      <div className="text-blue-600 my-4 underline underline-offset-4">
        <Link to="">Consulter d’autres dispositifs d’engagement</Link>
      </div>
    </div>
  );
}

function NotEligible() {
  return (
    <div className="bg-white p-4">
      <h1 className="text-2xl font-semibold">Vous n’êtes malheureusement pas éligible au SNU.</h1>
      <div className="font-semibold my-4">Découvrez d’autres formes d’engagement</div>
      <div className="overflow-x-auto">
        <div className="flex w-96 gap-4">
          <div className="w-64 border">
            <div className="font-semibold m-4">Service civique</div>
            <div className="m-4">Blabla</div>
          </div>
          <div className="w-64 border">
            <div className="font-semibold m-4">JeVeuxAider.org</div>
            <div className="m-4">Blabla</div>
            <div className="text-right">{`->`}</div>
          </div>
        </div>
      </div>
      <div className="text-blue-600 text-center border my-4 p-2">Voir plus de formes d’engagement</div>
    </div>
  );
}

function StayButton(data, setData, cohort) {
  return (
    <div
      key={cohort.cohort}
      className="border px-3 py-4 my-3 flex justify-between items-center"
      onClick={() => {
        setData({ ...data, cohort: cohort.cohort });
        // history.push("/preinscription/profil");
        console.log(data);
      }}>
      <div>
        Séjour du <strong>{cohort.date}</strong>
      </div>
      <ArrowRightBlueSquare />
    </div>
  );
}
