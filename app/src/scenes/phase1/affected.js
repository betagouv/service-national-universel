import React, { useEffect, useState } from "react";
import { BsArrowUpShort } from "react-icons/bs";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";
import { youngCanChangeSession } from "snu-lib";
import edit from "../../assets/editIcon.svg";
import Iceberg from "../../assets/Iceberg.js";
import { AlertBoxInformation } from "../../components/Content";
import { supportURL } from "../../config";
import api from "../../services/api";
import { translate, translateCohort } from "../../utils";
import ConvocationDetails from "./components/ConvocationDetails";
import StepsAffected from "./components/StepsAffected";
import Files from "./Files";

export default function Affected() {
  const young = useSelector((state) => state.Auth.young);
  const [center, setCenter] = useState();
  const [meetingPoint, setMeetingPoint] = useState();
  const [showInfoMessage, setShowInfoMessage] = useState(false);

  const getMeetingPoint = async () => {
    const { data, ok } = await api.get(`/young/${young._id}/meeting-point`);
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

  if (!center && !meetingPoint) return <div />;
  return (
    <>
      <>
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
                <article className="flex flex-col items-center lg:flex-row lg:items-center">
                  <div className="hidden md:flex flex-col mb-4">
                    <h1 className="text-5xl">Mon séjour de cohésion</h1>
                    <div className="flex flex-row items-center">
                      <h1 className="text-5xl">
                        <strong>{translateCohort(young.cohort)}</strong>
                      </h1>
                      {youngCanChangeSession({ cohort: young.cohort, status: young.statusPhase1 }) ? (
                        <Link to="/changer-de-sejour">
                          <img src={edit} alt="edit icon" className="h-9 w-9 ml-2 hover:w-10 hover:h-10 hover:cursor-pointer" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex md:hidden flex-col mb-4">
                    <h1 className="text-sm text-gray-600 ">Séjour {translateCohort(young.cohort)}</h1>
                  </div>
                  <div className="flex flex-1 flex-row items-start justify-center">
                    <Iceberg className="w-16 h-16 md:w-24 md:h-24 mr-4" />
                    <article>
                      <h1 className="font-bold text-xl leading-7">Votre lieu d'affectation</h1>
                      <p className="text-sm leading-5">
                        {center?.name}, {center?.city}
                      </p>
                      <p className="text-sm leading-5">
                        ({center?.zip}), {center?.department}
                      </p>
                    </article>
                  </div>
                </article>
                <ConvocationDetails young={young} center={center} meetingPoint={meetingPoint} />
              </section>
              <StepsAffected young={young} center={center} meetingPoint={meetingPoint} />

              {/* Good to Know */}
              <div className="flex flex-col items-center gap-4 pb-4 overflow-x-auto ">
                <div className="flex flex-row w-full justify-between items-center gap-4">
                  <a
                    href={`${supportURL}/base-de-connaissance/le-transport`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start border-[1px] border-gray-200 rounded-lg pl-4 mr-4 ">
                    <span className="py-3 font-bold text-base pr-4 whitespace-nowrap">Comment se passe le transport ?</span>
                    <BsArrowUpShort className="rotate-45 text-gray-400 m-1 h-8 w-8" />
                  </a>
                  <a
                    href={`${supportURL}/base-de-connaissance/dans-ma-valise-materiel-trousseau`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex justify-start items-start border-[1px] border-gray-200 rounded-lg pl-4 mr-4">
                    <span className="py-3 font-bold text-base pr-4 whitespace-nowrap">Que prendre dans ma valise ?</span>
                    <BsArrowUpShort className="rotate-45 text-gray-400 m-1 h-8 w-8" />
                  </a>
                  <a
                    href={`${supportURL}/base-de-connaissance/phase-1-le-sejour-de-cohesion`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex justify-start items-start border-[1px] border-gray-200 rounded-lg pl-4">
                    <span className="py-3 font-bold text-base pr-4 whitespace-nowrap">J'ai des questions sur le séjour</span>
                    <BsArrowUpShort className="rotate-45 text-gray-400 m-1 h-8 w-8" />
                  </a>
                  <a
                    className="flex lg:hidden"
                    href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/Note_relative_a_l_utilisation_d_autotest_COVID.pdf"
                    target="_blank"
                    rel="noreferrer">
                    <div className="flex flex-row justify-between items-start  border-[1px] border-gray-200 rounded-lg pl-4 cursor-pointer ml-4 ">
                      <div className="flex flex-row items-center py-3">
                        <HiOutlineShieldCheck className="text-gray-400 h-8 w-8 mr-4" />
                        <div className="flex flex-col">
                          <div className="text-base font-bold whitespace-nowrap">Protocole sanitaire</div>
                          <div className="text-sm text-gray-500 whitespace-nowrap">
                            Il est recommandé de réaliser un test PCR, antigénique ou autotest moins de 24h avant le départ en séjour
                          </div>
                        </div>
                      </div>
                      <BsArrowUpShort className="rotate-45 text-gray-400 m-1 h-8 w-8" />
                    </div>
                  </a>
                </div>
                <a
                  className="w-full"
                  href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/Note_relative_a_l_utilisation_d_autotest_COVID.pdf"
                  target="_blank"
                  rel="noreferrer">
                  <div className="hidden lg:flex flex-row justify-between items-start  border-[1px] border-gray-200 rounded-lg pl-4 cursor-pointer full-width">
                    <div className="flex flex-row items-center py-3">
                      <HiOutlineShieldCheck className="text-gray-400 h-8 w-8 mr-4" />
                      <div className="flex flex-col">
                        <span className="text-base font-bold whitespace-nowrap">Protocole sanitaire</span>
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                          Il est recommandé de réaliser un test PCR, antigénique ou autotest moins de 24h avant le départ en séjour
                        </span>
                      </div>
                    </div>
                    <BsArrowUpShort className="rotate-45 text-gray-400 m-1 h-8 w-8" />
                  </div>
                </a>
              </div>
              {/* Files */}
              <div className="bg-white py-6 -mx-6 px-4 rounded-lg">
                <Files young={young} />
              </div>
            </section>
          </div>
        </div>
      </>
    </>
  );
}
