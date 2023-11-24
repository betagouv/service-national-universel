import React from "react";
import { GrClose } from "react-icons/gr";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Modal } from "reactstrap";
import { getCohortPeriod, GRADES } from "snu-lib";
import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import Error from "../../../components/error";
import Alert from "../../../components/dsfr/ui/Alert";
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
  const { grade } = young;

  React.useEffect(() => {
    (async () => {
      try {
        const res = await api.post(`/cohort-session/eligibility/2023/${young._id}`);
        if (res.data.msg) return setError({ text: res.data.msg });
        const cohorts = res.data;
        if (cohorts.length === 0) {
          setError({ text: "Il n'y a malheureusement plus de place dans votre département." });
        }
        setCohorts(cohorts);
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
      const { ok, code, data: responseData } = await api.put(`/young/inscription2023/changeCohort`, { cohort });
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
      <div className="p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#161616] m-0">Choisissez la date de votre séjour</h2>
          {!loading ? (
            <button className="flex items-center justify-end gap-2 pb-2 text-sm text-[#000091]" onClick={onCancel}>
              <GrClose />
              Fermer
            </button>
          ) : null}
        </div>
        <hr className="my-4 h-px border-0 bg-gray-200" />
        {error?.text && <Error {...error} onClose={() => setError({})} />}

        {loading ? (
          <Loader />
        ) : (
          <>
            {cohorts.length !== 0 ? (
              <>
                <div className="mb-2 font-semibold">Séjours de cohésion disponibles</div>
                <div className="text-sm text-gray-500">Veuillez vous assurer d’être disponible sur l’ensemble de la période.</div>
                {grade == GRADES["1ereGT"] && (
                  <Alert className="my-4">En cas de convocation après le 2 juillet aux épreuves du baccalauréat, vous pourrez rejoindre le centre SNU de votre département.</Alert>
                )}
                <div className="my-4">
                  {cohorts?.map((e) => (
                    <SessionButton key={e.name} session={e} onSubmit={onSubmit} />
                  ))}
                </div>
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
}

function SessionButton({ session, onSubmit }) {
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
