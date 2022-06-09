import React from "react";
import { HiOutlineAdjustments, HiOutlineSearch } from "react-icons/hi";
import { MdOutlineContentCopy } from "react-icons/md";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";

import ArrowUpRight from "../../../assets/icons/ArrowUpRight";
import Medaille from "../../../assets/icons/Medaille";
import Loader from "../../../components/Loader";
import api from "../../../services/api";
import { copyToClipboard } from "../../../utils";
import CardMission from "./components/CardMission";
import CardEquivalence from "./components/CardEquivalence";

export default function IndexPhase2Mobile() {
  const young = useSelector((state) => state.Auth.young);
  const [applications, setApplications] = React.useState();
  const [equivalences, setEquivalences] = React.useState();

  const [referentManagerPhase2, setReferentManagerPhase2] = React.useState();
  React.useEffect(() => {
    (async () => {
      const { ok, data } = await api.get(`/referent/manager_phase2/${young.department}`);
      if (ok) return setReferentManagerPhase2(data);
    })();
  }, []);
  React.useEffect(() => {
    (async () => {
      const { ok, data } = await api.get(`/young/${young._id.toString()}/application`);
      if (ok) return setApplications(data);
    })();
    (async () => {
      const { ok, data } = await api.get(`/young/${young._id.toString()}/phase2/equivalences`);
      if (ok) return setEquivalences(data);
    })();
  }, []);

  if (!applications) return <Loader />;

  return (
    <div className="bg-white pb-5">
      {/* BEGIN HEADER */}
      <div className="bg-gray-700">
        <div className="px-4 pt-4 pb-3">
          <div className="text-white font-bold text-3xl">Réalisez votre mission d&apos;intérêt général</div>
          <div className="text-gray-300 text-sm mt-2 mb-2 font-normal">
            Mettez votre énergie au service d’une société plus solidaire et découvrez votre talent pour l’engagement en réalisant une mission d’intérêt général !
          </div>
          <div className="flex items-center mb-4">
            <HiOutlineAdjustments className="text-gray-400 mr-1" />
            <div className="text-gray-200 text-sm underline">Renseigner mes préférences mission </div>
          </div>
          {applications.length > 0 ? (
            <Link to="/mission">
              <div className="group flex gap-1 rounded-[10px] border-[1px] py-2.5 px-3 items-center justify-center hover:bg-white hover:text-gray-800">
                <HiOutlineSearch className="text-[#ffffff] group-hover:text-gray-800" />
                <div className="text-[#ffffff] group-hover:text-gray-800 text-sm">Trouver une mission</div>
              </div>
            </Link>
          ) : (
            <Link to="/mission">
              <div className="group flex gap-1 rounded-[10px] border-[1px] py-2.5 px-3 items-center justify-center border-blue-600 bg-blue-600">
                <HiOutlineSearch className="text-blue-300" />
                <div className="text-blue-100 text-sm">Trouver une mission</div>
              </div>
            </Link>
          )}
        </div>
        <img className="rounded-t-lg w-full " src={require("../../../assets/phase2MobileHeader.png")} />
      </div>
      {/* END HEADER */}

      {equivalences.map((equivalence, index) => (
        <CardEquivalence key={index} equivalence={equivalence} young={young} />
      ))}
      {/* BEGIN CANDIDATURES */}
      {applications.length > 0 ? (
        <>
          <div className="-translate-y-4 w-screen">
            <div className="px-3 pb-4 flex overflow-x-auto space-x-8 w-full">
              {applications
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) // afficher d'abord les candidatures mis a jour récemment
                .slice(0, 4) // afficher uniquement 4 candidatures
                .map((application) => (
                  <CardMission key={application._id} application={application} />
                ))}
            </div>
          </div>
          {applications.length >= 0 ? (
            <div className="flex w-full justify-center">
              <Link to="/candidature" className="flex-1 px-3">
                <div className="text-gray-700 bg-gray-100 rounded-lg px-4 py-2 text-center hover:underline">
                  {applications.length <= 4 ? "Gérer mes candidatures" : `Toutes mes candidatures (${applications.length})`}
                </div>
              </Link>
            </div>
          ) : null}
        </>
      ) : null}
      {/* END CANDIDATURES */}

      {/* BEGIN LINKS */}
      <div className="mx-3 mt-10 space-y-4">
        {referentManagerPhase2 ? (
          <div
            className="border border-gray-200 rounded-lg py-2 px-3 flex flex-col justify-around w-full"
            onClick={() => {
              copyToClipboard(referentManagerPhase2.email);
              toastr.info("L'email de votre référent a été copié dans le presse-papier");
              // setCopied(true);
            }}>
            <div className="flex items-center justify-between">
              <div className="font-bold">Contacter mon référent</div>
              <MdOutlineContentCopy className="text-gray-400 cursor-pointer" />
            </div>
            <div className="text-sm text-gray-600">
              {referentManagerPhase2.firstName} {referentManagerPhase2.lastName} - {referentManagerPhase2.email}
            </div>
          </div>
        ) : null}
        <div className="flex border-[1px] border-gray-200 rounded-lg cursor-pointer">
          <a
            href={`https://support.snu.gouv.fr/base-de-connaissance/phase-2-la-mission-dinteret-general-1`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 gap-1 items-start justify-between p-3">
            <div className="font-bold flex-1 text-gray-800">J’ai des questions sur la mission d’intérêt général</div>
            <ArrowUpRight className="text-gray-400 text-2xl" />
          </a>
        </div>
        <div className="border-[1px] border-gray-200 rounded-lg">
          <a href={`https://support.snu.gouv.fr/base-de-connaissance/`} target="_blank" rel="noreferrer" className="flex gap-1 items-start justify-between p-3">
            <div className="font-bold flex-1 text-gray-800">J’ai des questions sur la reconnaissance d’engagement</div>
            <ArrowUpRight className="text-gray-400 text-2xl" />
          </a>
        </div>
        <Link to='/mission?MILITARY_PREPARATION=%5B"true"%5D'>
          <div className="group border-[1px] border-gray-200 hover:border-gray-300 rounded-lg mt-3 p-3 flex items-center gap-4">
            <Medaille className="text-gray-400" />
            <div className="w-full">
              <div className="flex items-center justify-between">
                <div className="font-bold text-base text-gray-800"> Partez en préparation militaire</div>
                <ArrowUpRight className="text-gray-400 text-2xl group-hover:scale-105" />
              </div>
              <div className="text-sm text-gray-500">Partez à la découverte des métiers de la Défense en réalisant une préparation militaire au sein d&apos;un corps d’armée</div>
            </div>
          </div>
        </Link>
        {/* TODO activer si plusieurs cartes 👇 */}
        {/* <div className="mt-4 mb-2 text-base">Vous avez déjà fait preuve de solidarité ?</div> */}
        {equivalences.length < 3 && equivalences.filter((equivalence) => equivalence.status !== "REFUSED").length === 0 ? (
          <div className="border-0 rounded-lg shadow-lg items-center">
            <img src={require("../../../assets/phase2MobileReconnaissance.png")} className="rounded-lg w-full" />
            <div className="px-3 pb-4">
              <div className="font-bold text-lg text-gray-900 ">Demandez la reconnaissance d’un engagement déjà réalisé</div>
              <div className="text-gray-600 text-sm mt-2 mb-3">Faîtes reconnaitre comme mission d’intérêt général un engagement déjà réalisé au service de la société</div>
              <Link to="phase2/equivalence">
                <div className="rounded-lg text-blue-600 text-center text-sm py-1 border-[1px] border-blue-600">Faire ma demande</div>
              </Link>
            </div>
          </div>
        ) : null}
      </div>
      {/* END LINKS */}
    </div>
  );
}
