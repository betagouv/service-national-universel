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
import Navbar from "../components/Navbar";
import { supportURL } from "../../../config";

export default function StepSejour() {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();
  const [sessions, setSessions] = React.useState([]);

  const history = useHistory();

  if (!young) return;

  useEffect(() => {
    const checkEligibilite = async (young) => {
      try {
        const res = await api.post(`/cohort-session/eligibility/2023/${young._id}`);
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

        const sessionsFiltered = res.data.filter((e) => e.goalReached === false); //&& e.isFull === false --> voir si on le rajoute
        if (sessionsFiltered.length === 0) toastr.error("Il n'y a malheureusement plus de place dans votre département.");
        setSessions(sessionsFiltered);
      } catch (e) {
        capture(e);
        toastr.error("Une erreur s'est produite :", translate(e.code));
      }
    };
    checkEligibilite(young);
  }, [young]);

  return (
    <>
      <Navbar />{" "}
      <div className="bg-white p-4">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-semibold">Choisissez la date du séjour</h1>
          <a href="/public-besoin-d-aide/" target="_blank" rel="noreferrer">
            <QuestionMarkBlueCircle />
          </a>
        </div>
        <hr className="my-4 h-px border-0 bg-gray-200" />
        <div className="my-2 font-semibold">Séjours de cohésion disponibles</div>
        <div className="text-sm text-gray-500">Veuillez vous assurer d’être disponible sur l’ensemble de la période.</div>
        <div className="my-4">{sessions?.map((e) => SessionButton(e))}</div>
        {sessions?.length < 3 && (
          <>
            <div className="py-2 font-semibold">Pourquoi je ne vois pas tous les séjours ?</div>
            <div className="text-sm text-gray-500">
              La proposition des séjours dépend de vos caractéristiques personnelles (âge, situation scolaire ou professionnelle, localisation).{" "}
              <a href={`${supportURL}/base-de-connaissance/suis-je-eligible-a-un-sejour-de-cohesion`} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                En savoir plus.
              </a>
            </div>
            <div className="my-4 text-[#000091] underline underline-offset-4">
              <Link to="/public-engagements">Consulter d’autres dispositifs d’engagement</Link>
            </div>
          </>
        )}
      </div>
    </>
  );

  function SessionButton(session) {
    return (
      <div
        key={session.id}
        className="my-3 flex items-center justify-between border p-4 hover:cursor-pointer"
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

          plausibleEvent(session.event.replace("inscription", "reinscription"));
          history.push("/reinscription/documents");
        }}>
        <div>
          Séjour du <strong>{formatStringDate(session.dateStart).slice(0, -5)}</strong> au <strong>{formatStringDate(session.dateEnd).slice(0, -5)}</strong> 2023
        </div>
        <ArrowRightBlueSquare />
      </div>
    );
  }
}
