import React, { useEffect, useState } from "react";
import { BsArrowUpShort } from "react-icons/bs";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import Iceberg from "../../assets/Iceberg.js";
import edit from "../../assets/editIcon.svg";
import { AlertBoxInformation } from "../../components/Content";
import { supportURL } from "../../config";
import api from "../../services/api";
import { translate, translateCohort, youngCanChangeSession } from "snu-lib";
import StepsAffected from "./components/StepsAffected";
import { RiErrorWarningLine } from "react-icons/ri";
import { Link } from "react-router-dom";

export default function Affected() {
  const young = useSelector((state) => state.Auth.young);
  const [center, setCenter] = useState();
  const [meetingPoint, setMeetingPoint] = useState();
  const [showInfoMessage, setShowInfoMessage] = useState(false);

  const getMeetingPoint = async () => {
    const { data, ok } = await api.get(`/young/${young._id}/point-de-rassemblement`);
    if (!ok) setMeetingPoint(null);
    setMeetingPoint(data);
  };

  useEffect(() => {
    if (!young.sessionPhase1Id) return;
    (async () => {
      const { data, code, ok } = await api.get(`/session-phase1/${young.sessionPhase1Id}/cohesion-center`);
      if (!ok) return toastr.error("error", translate(code));
      setCenter(data);
      getMeetingPoint();
    })();
  }, [young]);

  if (!center && !meetingPoint) {
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

  return (
    <div className="md:my-12 md:mx-10">
      <div className="max-w-[80rem] rounded-xl shadow my-0 md:mx-auto px-4 md:!px-8 lg:!px-16 py-8 relative overflow-hidden justify-between bg-gray-50 md:bg-white mb-4">
        {showInfoMessage ? (
          <AlertBoxInformation
            title="Information"
            message="Suite au séjour de cohésion, les espaces volontaires vont s'actualiser dans les prochaines semaines, les attestations seront disponibles directement en ligne."
            onClose={() => setShowInfoMessage(false)}
          />
        ) : null}
        <div>
          <section className="content">
            <section>
              <article className="flex flex-col items-between lg:flex-row lg:items-center">
                <div className="hidden md:flex flex-col mb-4 mr-8">
                  <h1 className="text-5xl">Mon séjour de cohésion</h1>
                  <div className="flex flex-row items-center">
                    <h1 className="text-5xl">
                      <strong>{translateCohort(young.cohort)}</strong>
                    </h1>
                    {youngCanChangeSession(young) ? (
                      <Link to="/changer-de-sejour">
                        <img src={edit} alt="edit icon" className="h-9 w-9 ml-2 hover:w-10 hover:h-10 hover:cursor-pointer" />
                      </Link>
                    ) : null}
                  </div>
                </div>
                <div className="flex md:hidden flex-col mb-4">
                  <h1 className="text-2xl font-bold text-gray-600">
                    <span className="mr-2 inline">Séjour {translateCohort(young.cohort)}</span>
                    {youngCanChangeSession(young) ? (
                      <Link to="/changer-de-sejour" className="inline-block align-middle">
                        <img src={edit} alt="edit icon" className="h-9 w-9 ml-2 hover:w-10 hover:h-10 hover:cursor-pointer" />
                      </Link>
                    ) : null}
                  </h1>
                </div>
                <div className="flex flex-1 flex-row items-start justify-end">
                  <div className="bg-gray-100 md:bg-gray-50 rounded-2xl flex py-2 px-2 md:px-8 flex-row-reverse md:flex-row w-full md:w-auto justify-between">
                    <Iceberg className="w-10 h-10 md:w-24 md:h-24 mr-4" />
                    <article className="">
                      <h1 className="font-bold text-xl leading-7">Votre lieu d&apos;affectation</h1>
                      <p className="text-sm leading-5">
                        {center?.name}, {center?.city}
                      </p>
                      <p className="text-sm leading-5">
                        ({center?.zip}), {center?.department}
                      </p>
                    </article>
                  </div>
                </div>
              </article>
              {/* <ConvocationDetails young={young} center={center} meetingPoint={meetingPoint} /> */}
            </section>
            <StepsAffected young={young} center={center} meetingPoint={meetingPoint} />

            {/* Good to Know */}
            <div className="flex flex-col items-center gap-4 pb-4 overflow-x-auto ">
              <div className="flex flex-col lg:flex-row w-full justify-between items-stretch gap-4">
                <a
                  href={`${supportURL}/base-de-connaissance/le-transport`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full justify-between items-start border-[1px] border-gray-200 rounded-lg pl-4">
                  <div className="py-3 font-bold text-base pr-4 flex-1">Comment se passe le transport&nbsp;?</div>
                  <div>
                    <BsArrowUpShort className="rotate-45 text-gray-400 m-1 h-8 w-8" />
                  </div>
                </a>
                <a
                  href={`${supportURL}/base-de-connaissance/dans-ma-valise-materiel-trousseau`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full justify-between items-start border-[1px] border-gray-200 rounded-lg pl-4">
                  <div className="py-3 font-bold text-base pr-4 flex-1">Que prendre dans ma valise&nbsp;?</div>
                  <div>
                    <BsArrowUpShort className="rotate-45 text-gray-400 m-1 h-8 w-8" />
                  </div>
                </a>
                <a
                  href={`${supportURL}/base-de-connaissance/phase-1-le-sejour-de-cohesion`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full justify-between items-start border-[1px] border-gray-200 rounded-lg pl-4">
                  <span className="py-3 font-bold text-base pr-4 flex-1">J&apos;ai des questions sur le séjour</span>
                  <div>
                    <BsArrowUpShort className="rotate-45 text-gray-400 m-1 h-8 w-8" />
                  </div>
                </a>
              </div>
              <div className="flex flex-col lg:flex-row w-full justify-between items-stretch gap-4">
                <a
                  href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/snu-reglement-interieur-2022-2023.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full justify-between items-start border-[1px] border-gray-200 rounded-lg pl-4">
                  <span className="py-3 font-bold text-base pr-4 flex-1">Lire le règlement intérieur</span>
                  <div>
                    <BsArrowUpShort className="rotate-45 text-gray-400 m-1 h-8 w-8" />
                  </div>
                </a>
              </div>
            </div>
            {/* Files */}
            {/* <div className="bg-white py-6 -mx-6 px-4 rounded-lg">
                <Files young={young} />
              </div>*/}
          </section>
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
