import React from "react";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link, useHistory } from "react-router-dom";
import { setYoung } from "../../redux/auth/actions";
import { capture } from "../../sentry";
import API from "../../services/api";
import { getCohortPeriod, translate } from "../../utils";
import { getCohort } from "@/utils/cohorts";
import useAuth from "@/services/useAuth";
import HomeContainer from "@/components/layout/HomeContainer";
import HomeHeader from "@/components/layout/HomeHeader";
import hero from "../../assets/hero/home-not-done.png";
import { HiArrowRight } from "react-icons/hi";
import JDMA from "@/components/JDMA";
import Notice from "@/components/ui/alerts/Notice";

export default function WaitingValidation() {
  const { young, isCLE } = useAuth();
  const title = `${young.firstName}, bienvenue sur votre compte ${isCLE ? "élève" : "volontaire"}`;
  const cohort = getCohort(young.cohort);
  const history = useHistory();
  const dispatch = useDispatch();
  const isInscriptionModificationOpenForYoungs = new Date() < new Date(cohort.inscriptionModificationEndDate);

  const goToInscription = async () => {
    try {
      const { ok, code, data } = await API.put(`/young/inscription2023/goToInscriptionAgain`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue :", translate(code));
        return;
      }
      dispatch(setYoung(data));
      history.push("/inscription/profil");
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue :", translate(e.code));
    }
  };

  return (
    <HomeContainer>
      <HomeHeader title={title} img={hero}>
        <div className="grid grid-cols-1 gap-8">
          <section id="changer-de-sejour" className="mt-4 border rounded-md px-4 py-3">
            <p>
              Vous êtes positionné(e) sur le séjour <strong>{getCohortPeriod(cohort)}</strong>.
            </p>
            {isInscriptionModificationOpenForYoungs && (
              <Link to="/changer-de-sejour">
                <p className="mt-2 text-sm text-blue-600">
                  Changer de séjour
                  <HiArrowRight className="inline-block ml-1" />
                </p>
              </Link>
            )}
          </section>

          <Notice>
            <p className="font-bold">Votre dossier est en cours de traitement par l’administration.</p>
            <p>Vous recevrez prochainement un e-mail de no_reply@snu.gouv.fr vous informant de l’avancement de votre inscription.</p>
            <button
              className="bg-blue-600 text-white w-full md:w-fit px-6 py-2.5 text-center rounded-md text-sm mt-3 hover:bg-blue-800 transition-colors"
              onClick={goToInscription}>
              Consulter mon dossier d’inscription
            </button>
          </Notice>
        </div>
      </HomeHeader>

      <div className="mt-12 flex justify-end">
        <JDMA id={3154} />
      </div>
    </HomeContainer>
  );
}
