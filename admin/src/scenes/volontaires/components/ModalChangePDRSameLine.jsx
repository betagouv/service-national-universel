import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import { formatDateFR, getZonedDate, translate } from "snu-lib";
import LinearIceBerg from "../../../assets/Linear-IceBerg";
import LinearMap from "../../../assets/Linear-Map";
import ModalTailwind from "../../../components/modals/ModalTailwind";
import api from "../../../services/api";
import RightArrow from "./RightArrow";
import MeetingInfo from "./phase1/MeetingInfo";

export default function ModalChangePDRSameLine({ isOpen, onCancel, young, cohort }) {
  const [step, setStep] = useState(0);
  const [bus, setBus] = useState();
  const [session, setSession] = useState();
  const [loading, setLoading] = useState(false);
  const [selectedPdr, setSelectedPdr] = useState(null);
  const closeModal = () => {
    setStep(0);
    setSelectedPdr(null);
    onCancel();
  };

  useEffect(() => {
    if (!young?.ligneId) return closeModal();
    (async () => {
      try {
        setLoading(true);
        const { data: dataSession, ok: okSession, code: codeSession } = await api.get("/session-phase1/" + young.sessionPhase1Id);
        if (!okSession) return toastr.error("Oups, une erreur est survenue lors de la récupération de la session", translate(codeSession));
        setSession(dataSession);
        const { data, ok, code } = await api.get(`/ligne-de-bus/${young?.ligneId}`);
        if (!ok) return toastr.error("Oups, une erreur est survenue lors de la récupération de la ligne de bus", translate(code));
        setBus(data);
        setLoading(false);
      } catch (e) {
        toastr.error("Oups, une erreur est survenue lors de la récupération de la session", translate(e.code));
        console.log(e);
      }
    })();
  }, []);

  const handleAffectation = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/young/${young._id}/phase1/affectation`, {
        centerId: session.cohesionCenterId,
        sessionId: session._id,
        pdrOption: "ref-select",
        meetingPointId: selectedPdr?._id,
        ligneId: bus?._id,
      });
      if (!response.ok) return toastr.error("Oups, une erreur est survenue lors de l'affectation du jeune", translate(response.code));
      toastr.success(`L'affectation du jeune a bien été effectuée`);
      history.go(`/volontaire/${young._id}/phase1`);
    } catch (error) {
      if (error.code === "OPERATION_NOT_ALLOWED")
        return toastr.error("Oups, une erreur est survenue lors de l'affectation du jeune. Il semblerait que ce centre soit déjà complet", translate(error?.code), {
          timeOut: 5000,
        });
      return toastr.error("Oups, une erreur est survenue lors du traitement de l'affectation du jeune", translate(error?.code));
    }
  };

  return (
    <ModalTailwind centered isOpen={isOpen} onClose={closeModal} className="w-[850px] rounded-lg bg-white py-2 px-8">
      <div className="mb-4">
        <div className="mt-6 flex w-full flex-row justify-between gap-6">
          <div className="w-1/2">
            <div className={`h-1 ${step >= 0 ? "bg-blue-600" : "bg-gray-200"} mb-2 rounded`} />
            <div className={`text-xs uppercase ${step >= 0 ? "text-blue-600" : "text-gray-500"}`}>étape 1</div>
            <div className="text-xs font-medium text-gray-900">Le point de rassemblement</div>
          </div>
          <div className="w-1/2">
            <div className={`h-1 ${step >= 1 ? "bg-blue-600" : "bg-gray-200"} mb-2 rounded`} />
            <div className={`text-xs uppercase ${step >= 1 ? "text-blue-600" : "text-gray-500"}`}>étape 2</div>
            <div className="text-xs font-medium text-gray-900">Résumé</div>
          </div>
        </div>
        {step === 0 && (
          <>
            <div className="my-4 text-center text-xl font-medium text-gray-900">Sélectionnez le nouveau point de rassemblement</div>
            <div className="flex h-[300px] w-full flex-col items-center justify-start gap-2 mt-4">
              {loading ? (
                <div className="mt-2">Chargement ...</div>
              ) : (
                bus?.meetingsPointsDetail?.map((hit) => (
                  <HitPdr
                    key={hit._id}
                    hit={hit}
                    bus={bus}
                    young={young}
                    onSend={() => {
                      setStep(1);
                      setSelectedPdr(hit);
                    }}
                  />
                ))
              )}
            </div>
          </>
        )}
        {step === 1 && (
          <div className="flex flex-col items-center justify-center">
            <div className="mb mt-4 text-center text-xl font-medium text-gray-900">
              Vérifiez l&apos;affectation de {young.firstName} {young.lastName}
            </div>
            <div className="text-sm text-gray-500">Un email sera automatiquement envoyé au volontaire et à ses représentants légaux.</div>
            <div className="my-4 flex flex-row gap-4">
              <div className="mx-2 flex w-1/2 flex-row items-center justify-center gap-2">
                <div>
                  <LinearIceBerg />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">Lieu d&apos;affectation</div>
                  <div className="text-sm">
                    {session.nameCentre}, {session.cityCentre} ({session.zipCentre}), {session.region}
                  </div>
                </div>
              </div>
              <div className="mx-2 flex w-1/2 flex-row items-center justify-center gap-2">
                <div>
                  <LinearMap />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">Lieu de rassemblement</div>

                  <div>
                    {selectedPdr.name}, {selectedPdr.city} ({selectedPdr.zip}), {selectedPdr.region}
                  </div>
                </div>
              </div>
            </div>
            <MeetingInfo young={young} session={session} cohort={cohort} selectedPdr={selectedPdr} />
          </div>
        )}
        <div className="flex w-full flex-row gap-2">
          <button
            onClick={() => {
              if (step === 0) return closeModal();
              if (step === 1) setSelectedPdr(null);
              setStep((step) => step - 1);
            }}
            className=" mt-5 mb-2 flex-1 cursor-pointer rounded border-[1px] border-gray-300 py-2 text-center text-sm font-medium text-gray-700">
            Retour
          </button>

          {step === 1 && (
            <button
              onClick={handleAffectation}
              disabled={loading}
              className="mb-2 mt-5 flex-1 cursor-pointer rounded border-[1px] bg-blue-600 py-2 text-center text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed">
              Confirmer
            </button>
          )}
        </div>
      </div>
    </ModalTailwind>
  );
}

const HitPdr = ({ hit, bus, young, onSend }) => {
  const disabled = hit._id === young.meetingPointId;
  return (
    <>
      <hr />
      <div className="flex w-full flex-row items-center justify-between gap-2 px-2 border-t-[1px] border-[#F4F5FA] pt-3">
        <div className="w-2/3">
          <div className="flex flex-row justify-start align-top">
            <span className="text-[15px] leading-6 font-bold text-gray-900 w-1/2">{hit.name}</span>
            {hit._id === young.meetingPointId ? (
              <div
                className={` flex rounded-full border-[0.5px] border-green-600  bg-green-50 text-[12px] font-medium leading-[22px] w-[130px] h-[25px] justify-center align-middle mt-1`}>
                <span className="text-green-600">Selectionné</span>
              </div>
            ) : hit.department === young.department ? (
              <div
                className={` flex rounded-full border-[0.5px] border-gray-500 bg-gray-50 text-[12px] font-medium leading-[22px] w-[130px] h-[25px] justify-center align-middle mt-1`}>
                <span className="text-gray-600">Proposé au jeune</span>
              </div>
            ) : null}
          </div>
          <div className="text-[12px] leading-[18px]">
            <p>{`${hit.department || ""} • ${hit.address || ""}, ${hit.zip || ""} ${hit.city || ""}`}</p>
            <p>
              N° transport: <span className="text-gray-900">{bus?.busId}</span>
            </p>
          </div>
        </div>
        <div className="flex w-1/3 flex-col text-[12px] leading-[18px]">
          <div className="text-gray-500">
            Départ :{" "}
            <span className=" text-gray-900">
              {formatDateFR(getZonedDate(bus.departuredDate))} {hit.departureHour}
            </span>
          </div>
          <div className=" text-gray-500">
            Retour :{" "}
            <span className=" text-gray-900">
              {formatDateFR(getZonedDate(bus?.returnDate))} {hit.returnHour}
            </span>
          </div>
        </div>

        <button className="disabled:opacity-50 cursor-pointer" onClick={onSend} disabled={disabled}>
          <RightArrow />
        </button>
      </div>
    </>
  );
};
