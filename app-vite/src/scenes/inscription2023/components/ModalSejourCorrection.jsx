import React from "react";
import { toastr } from "react-redux-toastr";
import { Modal } from "reactstrap";
import { formatStringDate } from "snu-lib";
import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import Error from "../../../components/error";
import Loader from "../../../components/Loader";
import { supportURL } from "../../../config";
import { capture } from "../../../sentry";
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
      <div className="flex flex-col w-full px-3 py-4">
        <div className="text-[#161616] text-lg font-bold mt-2">Choisissez la date de votre séjour</div>
        <hr className="my-4 h-px bg-gray-200 border-0" />
        {error?.text && <Error {...error} onClose={() => setError({})} />}

        {loading ? (
          <Loader />
        ) : (
          <>
            {data?.sessions?.length !== 0 ? (
              <>
                <div className="font-semibold my-2">Séjours de cohésion disponibles</div>
                <div className="text-gray-500 text-sm">Veuillez vous assurer d’être disponible sur l’ensemble de la période.</div>
                <div className="my-4">{data?.sessions?.map((e) => SessionButton(e))}</div>
              </>
            ) : (
              <div className="text-gray-500 text-sm my-2">Aucun séjour de cohésion n’est disponible pour le moment.</div>
            )}
            {data?.sessions?.length < 3 && (
              <>
                <div className="font-semibold py-2">Pourquoi je ne vois pas tous les séjours ?</div>
                <div className="text-gray-500 text-sm">
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
        className="border p-4 my-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
        onClick={() => {
          plausibleEvent(session.event);
          onSubmit(session.name);
        }}>
        <div>
          Séjour du <strong>{formatStringDate(session.dateStart).slice(0, -5)}</strong> au <strong>{formatStringDate(session.dateEnd).slice(0, -5)}</strong> 2023
        </div>
        <ArrowRightBlueSquare />
      </div>
    );
  }
}
