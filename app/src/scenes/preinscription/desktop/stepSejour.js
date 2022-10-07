import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import api from "../../../services/api";
import Error from "../../../components/error";
import { getDepartmentByZip } from "snu-lib";

export default function StepSejour() {
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState({});
  const [data, setData] = React.useContext(PreInscriptionContext);
  const [cohorts, setCohorts] = useState(false);
  const history = useHistory();

  useEffect(() => {
    (async () => {
      try {
        if (data.frenchNationality === "false") {
          setCohorts([]);
          setLoading(false);
          return;
        }
        const res = await api.post("/cohort-session/eligibility/2023", {
          department: data.school?.departmentName || getDepartmentByZip(data.zip) || null,
          birthDate: data.birthDate,
          schoolLevel: data.scolarity,
          frenchNationality: data.frenchNationality,
        });
        setCohorts(res.data);
      } catch (e) {
        console.error(e);
        setError({ text: "Impossible de vérifier votre éligibilité" });
      }
      setLoading(false);
    })();
  }, []);

  if (Object.keys(error).length > 0) return <Error {...error} onClose={() => history.push("preinscription")} />;
  if (isLoading) return <div className="text-center">Vérification de votre éligibilité</div>;
  if (!cohorts.length) history.push("noneligible");

  return (
    <div className="bg-[#f9f6f2] flex justify-center py-10">
      <div className="bg-white basis-[70%] mx-auto my-0 px-[102px] py-[60px]">
        <div className="w-full flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Choisissez la date du séjour</h1>
          <Link to="/public-besoin-d-aide/">
            <QuestionMarkBlueCircle />
          </Link>
        </div>
        <hr className="my-8 h-px bg-gray-200 border-0" />
        <div className="font-semibold my-2">Séjours de cohésion disponibles</div>
        <div className="text-gray-500 text-sm">Veuillez vous assurer d’être disponible sur l’ensemble de la période.</div>
        <div className="my-4">{cohorts.map((e) => StayButton(e))}</div>
        {cohorts.length < 3 && (
          <>
            <div className="font-semibold py-2 mt-5">Pourquoi je ne vois pas tous les séjours ?</div>
            <div className="text-gray-500 text-sm w-1/2">
              La proposition des séjours dépend de vos caractéristiques personnelles (âge, situation scolaire ou professionnelle, localisation).{" "}
              <Link to="" className="underline underline-offset-4">
                En savoir plus.
              </Link>
            </div>
            <div className="text-[#000091] my-4 underline underline-offset-4">
              <Link to="">Consulter d’autres dispositifs d’engagement</Link>
            </div>
          </>
        )}
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
          Séjour <strong>{cohort.dates} 2023</strong>
        </div>
        <ArrowRightBlueSquare />
      </div>
    );
  }
}
