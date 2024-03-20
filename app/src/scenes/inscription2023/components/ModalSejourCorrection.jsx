import React from "react";
import { Modal } from "reactstrap";
import { formatStringDate, getCohortPeriod } from "snu-lib";
import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import Error from "../../../components/error";
import Loader from "../../../components/Loader";
import { supportURL } from "../../../config";
import plausibleEvent from "../../../services/plausible";

export default function ModalSejourCorrection({ data, isOpen, onValidation }) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState({});

  const onSubmit = async (cohort) => {
    setLoading(true);
    onValidation(data, cohort);
  };

  return (
    <Modal centered isOpen={isOpen} size="lg">
      <div className="flex w-full flex-col px-3 py-4">
        <div className="mt-2 text-lg font-bold text-[#161616]">Choisissez la date de votre séjour</div>
        <hr className="my-4" />
        {error?.text && <Error {...error} onClose={() => setError({})} />}

        {loading ? (
          <Loader />
        ) : (
          <>
            {data?.sessions?.length !== 0 ? (
              <>
                <div className="my-2 font-semibold">Séjours de cohésion disponibles</div>
                <div className="text-sm text-gray-500">Veuillez vous assurer d’être disponible sur l’ensemble de la période.</div>
                <div className="my-4">{data?.sessions?.map((e) => SessionButton(e))}</div>
              </>
            ) : (
              <div className="my-2 text-sm text-gray-500">Aucun séjour de cohésion n’est disponible pour le moment.</div>
            )}
            {data?.sessions?.length < 3 && (
              <>
                <div className="py-2 font-semibold">Pourquoi je ne vois pas tous les séjours ?</div>
                <div className="text-sm text-gray-500">
                  La proposition des séjours dépend de vos caractéristiques personnelles (âge, situation scolaire ou professionnelle, localisation).{" "}
                  <a href={`${supportURL}/base-de-connaissance/suis-je-eligible-a-un-sejour-de-cohesion`} target="_blank" rel="noreferrer" className="underline hover:underline">
                    En savoir plus.
                  </a>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );

  function SessionButton(session) {
    return (
      <div
        key={session.id}
        className="my-3 flex cursor-pointer items-center justify-between border p-4 hover:bg-gray-50"
        onClick={() => {
          plausibleEvent(session.event);
          onSubmit(session.name);
        }}>
        <div>
          Séjour <strong>{getCohortPeriod(session)}</strong>
        </div>
        <ArrowRightBlueSquare />
      </div>
    );
  }
}
