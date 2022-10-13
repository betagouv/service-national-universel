import React from "react";
import { Link, useHistory } from "react-router-dom";
import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import plausibleEvent from "../../../services/plausible";
import { formatStringDate } from "snu-lib";
import Footer from "../../../components/footerV2";
import { useDispatch, useSelector } from "react-redux";
import api from "../../../services/api";
import { capture } from "../../../sentry";
import { setYoung } from "../../../redux/auth/actions";
import { toastr } from "react-redux-toastr";
import { translate } from "../../../utils";

export default function StepSejour() {
  const young = useSelector((state) => state.Auth.young);
  console.log("🚀 ~ file: stepSejour.js ~ line 14 ~ StepSejour ~ young", young);
  const dispatch = useDispatch();

  const history = useHistory();

  if (!young) return;

  return (
    <>
      {" "}
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
        <div className="my-4">{young.sessions?.map((e) => SessionButton(e))}</div>
        {young.sessions?.length < 3 && (
          <>
            <div className="font-semibold py-2">Pourquoi je ne vois pas tous les séjours ?</div>
            <div className="text-gray-500 text-sm">
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
      <Footer marginBottom={"12vh"} />
    </>
  );

  function SessionButton(session) {
    return (
      <div
        key={session.id}
        className="border p-4 my-3 flex justify-between items-center"
        onClick={async () => {
          // setData({ ...data, cohort: session.name });
          // ! Reprendre les call api ici
          const { ok, data, code } = await api.put("/young/reinscription/changeCohort", {
            cohortChangeReason: "Réinscription à un nouveau séjour",
            cohort: session.name,
          });
          if (!ok) {
            capture(code);
            return toastr.error("Oups, une erreur est survenue", translate(code));
          }
          dispatch(setYoung(data));

          plausibleEvent(session.event);
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
