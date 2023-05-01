import React from "react";
import { GrClose } from "react-icons/gr";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Modal } from "reactstrap";
import { formatStringDate } from "snu-lib";
import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import Error from "../../../components/error";
import Loader from "../../../components/Loader";
import { supportURL } from "../../../config";
import { setYoung } from "../../../redux/auth/actions";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import { translate } from "../../../utils";

export default function ModalSejour({ isOpen, onCancel }) {
  const young = useSelector((state) => state.Auth.young);
  const [loading, setLoading] = React.useState(false);
  const [cohorts, setCohorts] = React.useState([]);
  const [error, setError] = React.useState({});
  const dispatch = useDispatch();

  React.useEffect(() => {
    (async () => {
      try {
        const res = await api.post(`/cohort-session/eligibility/2023/${young._id}`);
        if (res.data.msg) return setError({ text: res.data.msg });
        setCohorts(res.data);
      } catch (e) {
        capture(e);
        setCohorts([]);
      }
      setLoading(false);
    })();
  }, []);

  const onSubmit = async (cohort) => {
    setLoading(true);
    try {
      const {
        ok,
        code,
        data: responseData,
      } = await api.put(`/young/reinscription/changeCohort`, { cohortChangeReason: "Réinscription à un nouveau séjour", cohort, originalCohort: young.cohort });
      if (!ok) {
        setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
        setLoading(false);
        return;
      }
      dispatch(setYoung(responseData));
      toastr.success("Votre séjour a bien été enregistré");
      setLoading(false);
      onCancel();
    } catch (e) {
      capture(e);
      setError({ text: `Une erreur s'est produite`, subText: e?.code ? translate(e.code) : "" });
      setLoading(false);
    }
  };

  return (
    <Modal centered isOpen={isOpen} onCancel={onCancel} size="lg">
      <div className="flex w-full flex-col px-3 py-4">
        {!loading ? (
          <div className="flex items-center justify-end gap-2 pb-2 text-sm text-[#000091]" onClick={onCancel}>
            <GrClose />
            Fermer
          </div>
        ) : null}
        <div className="mt-2 text-lg font-bold text-[#161616]">Choisissez la date de votre séjour</div>
        <hr className="my-4 h-px border-0 bg-gray-200" />
        {error?.text && <Error {...error} onClose={() => setError({})} />}

        {loading ? (
          <Loader />
        ) : (
          <>
            {cohorts.length !== 0 ? (
              <>
                <div className="my-2 font-semibold">Séjours de cohésion disponibles</div>
                <div className="text-sm text-gray-500">Veuillez vous assurer d’être disponible sur l’ensemble de la période.</div>
                <div className="my-4">{cohorts?.map((e) => SessionButton(e))}</div>
              </>
            ) : (
              <div className="my-2 text-sm text-gray-500">Aucun séjour de cohésion n’est disponible pour le moment.</div>
            )}
            {cohorts.length < 3 && (
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
        className="my-3 flex items-center justify-between border p-4"
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
