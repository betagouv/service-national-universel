import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import Iceberg from "../../assets/Iceberg.js";
import { AlertBoxInformation } from "../../components/Content";
import api from "../../services/api";
import { translate, translateCohort, youngCanChangeSession } from "snu-lib";
import { RiErrorWarningLine } from "react-icons/ri";

import ChangeStayLink from "./components/ChangeStayLink.js";
import FaqAffected from "./components/FaqAffected.js";
import Loader from "../../components/Loader";
import StepsAffected from "./components/StepsAffected";

export default function Affected() {
  const young = useSelector((state) => state.Auth.young);
  const [center, setCenter] = useState();
  const [meetingPoint, setMeetingPoint] = useState();
  const [showInfoMessage, setShowInfoMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const areStepsDone =
    young && young.meetingPointId && young.youngPhase1Agreement === "true" && young.convocationFileDownload === "true" && young.cohesionStayMedicalFileDownload === "true";
  console.log("🚀 ~ file: affected.js:22 ~ Affected ~ areStepsDone:", areStepsDone);

  const getMeetingPoint = async () => {
    const { data, ok } = await api.get(`/young/${young._id}/point-de-rassemblement`);
    if (!ok) setMeetingPoint(null);
    setMeetingPoint(data);
  };

  useEffect(() => {
    if (!young.sessionPhase1Id) return;
    (async () => {
      setLoading(true);
      const { data, code, ok } = await api.get(`/session-phase1/${young.sessionPhase1Id}/cohesion-center`);
      if (!ok) return toastr.error("error", translate(code));
      setCenter(data);
      getMeetingPoint();
      setLoading(false);
    })();
  }, [young]);

  if (loading) {
    return (
      <div className="my-12 mx-10 w-full">
        <Loader />
      </div>
    );
  }

  if (!center && !meetingPoint) {
    return <Problem young={young} />;
  }

  return (
    <div className="md:m-10">
      <div className="max-w-[80rem] rounded-xl shadow my-0 md:mx-auto px-4 md:!px-8 lg:!px-16 py-8 relative overflow-hidden justify-between bg-gray-50 md:bg-white mb-4">
        {showInfoMessage ? (
          <AlertBoxInformation
            title="Information"
            message="Suite au séjour de cohésion, les espaces volontaires vont s'actualiser dans les prochaines semaines, les attestations seront disponibles directement en ligne."
            onClose={() => setShowInfoMessage(false)}
          />
        ) : null}
        <div>
          <section>
            <article className="flex flex-col items-between lg:justify-between lg:flex-row">
              <div>
                <h1 className="text-2xl md:text-5xl space-y-4">
                  Mon séjour de cohésion
                  <br />
                  <strong className="flex items-center">{translateCohort(young.cohort)}</strong>
                </h1>
                {youngCanChangeSession(young) ? <ChangeStayLink className="my-8 md:mb-[18px]" /> : null}
              </div>

              <LieuAffectation center={center} />
              <ResumeDuVoyage open={areStepsDone} />
            </article>
            {/* <ConvocationDetails young={young} center={center} meetingPoint={meetingPoint} /> */}
          </section>
          <StepsAffected young={young} center={center} meetingPoint={meetingPoint} />

          {/* FAQ */}
          <FaqAffected />
          {/* Files */}
          {/* <div className="bg-white py-6 -mx-6 px-4 rounded-lg">
                <Files young={young} />
              </div>*/}
        </div>
      </div>
      <div className="flex justify-end pt-4 pb-8 pr-8">
        <a href="https://jedonnemonavis.numerique.gouv.fr/Demarches/3504?&view-mode=formulaire-avis&nd_source=button&key=060c41afff346d1b228c2c02d891931f">
          <img src="https://jedonnemonavis.numerique.gouv.fr/static/bouton-bleu.svg" alt="Je donne mon avis" className="h-[60px]" />
        </a>
      </div>
    </div>
  );
}

function Problem({ young }) {
  return (
    <div className="my-12 mx-10 w-full">
      <div className="max-w-[80rem] rounded-xl shadow my-0 md:mx-auto px-4 md:!px-8 lg:!px-16 py-8 relative overflow-hidden justify-between bg-gray-50 md:bg-white mb-4">
        <section className="content">
          <section>
            <article className="flex flex-col items-center lg:flex-row lg:items-center">
              <div className="hidden md:flex flex-col mb-4 mr-8">
                <h1 className="text-5xl">Mon séjour de cohésion</h1>
                <div className="flex flex-row items-center">
                  <h1 className="text-5xl">
                    <strong>{translateCohort(young.cohort)}</strong>
                  </h1>
                </div>
              </div>
              <div className="flex md:hidden flex-col mb-4">
                <h1 className="text-sm text-gray-600 ">Séjour {translateCohort(young.cohort)}</h1>
              </div>
            </article>
          </section>
          <div className="flex flex-col md:flex-row items-center space-x-3 bg-yellow-50 rounded-xl p-4 mt-6">
            <RiErrorWarningLine className="text-yellow-400 text-3xl" />
            <div className="text-center md:!text-left">
              Il y a un problème avec votre affectation.
              <br />
              Nous sommes en train de le résoudre. Revenez plus tard dans l&apos;après-midi, avec nos excuses pour la gêne occasionnée.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function LieuAffectation({ center }) {
  return (
    <div className="bg-gray-100 md:bg-gray-50 rounded-2xl flex p-4 gap-4 md:w-auto justify-between items-center h-fit">
      <article className="md:order-last">
        <h1 className="font-semibold text-xl leading-7">Votre lieu d&apos;affectation</h1>
        <p className="text-sm leading-5 text-gray-700">
          {center?.name}, {center?.city}
          <br />({center?.zip}), {center?.department}
        </p>
      </article>
      <Iceberg className="w-10 h-10 md:w-16 md:h-16" />
    </div>
  );
}

function ResumeDuVoyage({ open }) {
  return <div className={`${open ? "h-auto" : "h-0"}`}>Wesh</div>;
}
