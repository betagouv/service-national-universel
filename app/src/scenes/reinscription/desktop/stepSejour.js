import React, { useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import plausibleEvent from "../../../services/plausible";
import { formatStringDate } from "snu-lib";
import { useDispatch, useSelector } from "react-redux";
import api from "../../../services/api";
import { capture } from "../../../sentry";
import { setYoung } from "../../../redux/auth/actions";
import { toastr } from "react-redux-toastr";
import { translate } from "../../../utils";
import { getDepartmentByZip } from "snu-lib/region-and-departments";
import { supportURL } from "../../../config";
import Navbar from "../components/Navbar";

export default function StepSejour() {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();
  const [sessions, setSessions] = React.useState([]);

  const history = useHistory();

  if (!young) return;

  useEffect(() => {
    const checkEligibilite = async (young) => {
      try {
        const res = await api.post("/cohort-session/eligibility/2023", {
          department: young.schoolDepartment || getDepartmentByZip(young.zip) || null,
          birthDate: new Date(young.birthdateAt),
          schoolLevel: young.grade,
          frenchNationality: young.frenchNationality,
        });
        if (!res.ok) {
          capture(res.code);
        }

        if (!res.data.length) {
          const res = await api.put("/young/reinscription/noneligible");
          if (!res.ok) {
            capture(res.code);
          }
          return history.push("/reinscription/noneligible");
        }

        setSessions(res.data);
      } catch (e) {
        capture(e);
        toastr.error("Une erreur s'est produite :", translate(e.code));
      }
    };
    checkEligibilite(young);
  }, [young]);

  return (
    <>
      <Navbar />
      <div className="bg-[#f9f6f2] flex justify-center py-10">
        <div className="bg-white basis-[70%] mx-auto my-0 px-[102px] py-[60px] drop-shadow-md">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Choisissez la date du séjour</h1>
            <a href="/public-besoin-d-aide/" target="_blank" rel="noreferrer">
              <QuestionMarkBlueCircle />
            </a>
          </div>
          <hr className="my-8 h-px bg-gray-200 border-0" />
          <div className="font-semibold my-2">Séjours de cohésion disponibles</div>
          <div className="text-gray-500 text-sm">Veuillez vous assurer d’être disponible sur l’ensemble de la période.</div>
          <div className="my-4">{sessions?.map((e) => SessionButton(e))}</div>
          {sessions?.length < 3 && (
            <>
              <div className="font-semibold py-2 mt-5">Pourquoi je ne vois pas tous les séjours ?</div>
              <div className="text-gray-500 text-sm w-2/3">
                La proposition des séjours dépend de vos caractéristiques personnelles (âge, situation scolaire ou professionnelle, localisation).{" "}
                <a href={`${supportURL}/base-de-connaissance/suis-je-eligible-a-un-sejour-de-cohesion`} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                  En savoir plus.
                </a>
              </div>
              <div className="text-[#000091] my-4 underline underline-offset-4">
                <Link to="/public-engagements">Consulter d’autres dispositifs d’engagement</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
  function SessionButton(session) {
    return (
      <div
        key={session.id}
        className="border p-4 my-3 flex justify-between items-center hover:cursor-pointer"
        onClick={async () => {
          const { ok, data, code } = await api.put("/young/reinscription/changeCohort", {
            cohortChangeReason: "Réinscription à un nouveau séjour",
            cohort: session.name,
            originalCohort: young.cohort,
          });
          if (!ok) {
            capture(code);
            return toastr.error("Oups, une erreur est survenue", translate(code));
          }
          dispatch(setYoung(data));

          plausibleEvent(session.event);
          history.push("/reinscription/consentement");
        }}>
        <div>
          Séjour du <strong>{formatStringDate(session.dateStart).slice(0, -5)}</strong> au <strong>{formatStringDate(session.dateEnd).slice(0, -5)}</strong> 2023
        </div>
        <ArrowRightBlueSquare />
      </div>
    );
  }
}
