import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import API from "../../../../../admin/src/services/api";
import { toastr } from "react-redux-toastr";

export default function StepSejour() {
  const [isLoading, setLoading] = useState(true);
  // const [data, setData] = React.useContext(PreInscriptionContext);
  const [data, setData] = useState({ grade: "3eme", department: "Hauts-de-Seine", birthdateAt: new Date("07/14/2006") }); // Pour tester
  const [cohorts, setCohorts] = useState(false);
  const history = useHistory();

  useEffect(() => {
    (async () => {
      const res = await API.post("/cohort-session/eligibility/2023", {
        department: data.department,
        birthDate: data.birthdateAt,
        schoolLevel: data.grade,
      });
      if (!res.ok) {
        toastr.error("Impossible de vérifier votre éligibilité");
        history.push("/");
      }
      setCohorts(res.data);
      setLoading(false);
    })();
  }, []);

  if (isLoading) return <div className="text-center">Vérification de votre éligibilité</div>;

  if (!cohorts.length)
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
        <div
          className="text-blue-600 text-center border-2 border-blue-600 my-4 p-2"
          onClick={() => {
            history.push("https://www.jeveuxaider.gouv.fr/");
          }}>
          Voir plus de formes d’engagement
        </div>
      </div>
    );

  return (
    <div className="bg-white p-4">
      <div className="w-full flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Choisissez la date du séjour</h1>
        <Link to="/public-besoin-d-aide/">
          <QuestionMarkBlueCircle />
        </Link>
      </div>
      <hr className="my-4 h-px bg-gray-200 border-0" />
      <div className="font-semibold my-2">Séjours de cohésion disponibles</div>
      <div className="text-gray-500 text-sm">Veuillez vous assurer d’être disponible sur l’ensemble de la période.</div>
      <div className="my-4">{cohorts.map((e) => StayButton(e))}</div>
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

  function StayButton(cohort) {
    return (
      <div
        key={cohort.id}
        className="border p-4 my-3 flex justify-between items-center"
        onClick={() => {
          setData({ ...data, cohort: cohort.id });
          history.push("/preinscription/profil");
        }}>
        <div>
          Séjour <strong>{cohort.dates}</strong>
        </div>
        <ArrowRightBlueSquare />
      </div>
    );
  }
}
