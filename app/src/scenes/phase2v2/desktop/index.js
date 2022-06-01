import React from "react";
import { HiOutlineAdjustments, HiOutlineSearch } from "react-icons/hi";
import { MdOutlineContentCopy } from "react-icons/md";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";
import ArrowUpRight from "../../../assets/icons/ArrowUpRight";
import Medaille from "../../../assets/icons/Medaille";
import api from "../../../services/api";
import CardMission from "./CardMission";
import { copyToClipboard } from "../../../utils";

export default function IndexDesktop() {
  const young = useSelector((state) => state.Auth.young);
  const [applications, setApplications] = React.useState([]);

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
  }, []);

  return (
    <div className="bg-white mx-4 pb-12 my-3 rounded-lg">
      {/* BEGIN HEADER */}
      <div className="bg-gray-700 rounded-t-lg flex">
        <div className="p-14">
          <div className="text-white font-bold text-3xl">Réalisez votre mission d&apos;intérêt général</div>
          <div className="text-gray-300 text-sm mt-2 mb-4">
            Mettez votre énergie au service d’une société plus solidaire et découvrez {"\n"} votre talent pour l’engagement en réalisant une mission d’intérêt général !
          </div>
          <div className="flex">
            <Link to="/preferences">
              <div className="group flex gap-1 rounded-[10px] border-[1px] py-2.5 px-3 items-center">
                <HiOutlineAdjustments className="text-[#ffffff] group-hover:scale-105" />
                <div className="text-[#ffffff] group-hover:underline text-sm flex-1">Renseignermes préférences </div>
              </div>
            </Link>
            <Link to="/mission">
              <div className="group flex rounded-[10px] py-2.5 px-4 ml-4 bg-blue-600 items-center border-[1px] border-blue-600">
                <HiOutlineSearch className="text-blue-300 mr-1 group-hover:scale-105" />
                <div className="text-blue-100 text-sm group-hover:underline flex-1">Trouver une mission</div>
              </div>
            </Link>
          </div>
        </div>
        <img className="rounded-t-lg" src={require("../../../assets/phase2Header.png")} />
      </div>
      {/* END HEADER */}

      {/* BEGIN CANDIDATURES */}
      {applications.length > 0 ? (
        <>
          <div className="px-14 -translate-y-4">
            <div className="flex gap-8">
              {applications
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) // afficher d'abord les candidatures mis a jour récemment
                .slice(0, 4) // afficher uniquement 4 candidatures
                .map((application) => (
                  <CardMission key={application._id} application={application} />
                ))}
            </div>
          </div>
          {applications.length > 4 ? (
            <div className="flex justify-center">
              <Link to="/candidature">
                <div className="text-gray-700 bg-gray-100 rounded-lg px-4 py-2 text-center hover:underline">Toutes mes candidatures ({applications.length})</div>
              </Link>
            </div>
          ) : null}
        </>
      ) : null}
      {/* END CANDIDATURES */}

      {/* BEGIN LINKS */}
      <div className="mx-10 mt-10">
        <div className="flex gap-2">
          {referentManagerPhase2 ? (
            <div className="w-1/3 border border-gray-200 rounded-lg py-2 px-3 flex flex-col justify-around">
              <div className="flex items-center justify-between">
                <div className="font-bold">Contacter mon référent</div>
                <MdOutlineContentCopy
                  className="text-gray-400 hover:text-blue-600 cursor-pointer"
                  onClick={() => {
                    copyToClipboard(referentManagerPhase2.email);
                    toastr.info("L'email de votre référent a été copié dans le presse-papier");
                    // setCopied(true);
                  }}
                />
              </div>
              <div className="text-sm text-gray-600">
                {referentManagerPhase2.firstName} {referentManagerPhase2.lastName} - {referentManagerPhase2.email}
              </div>
            </div>
          ) : null}
          <div className="group w-1/3 border-[1px] border-gray-200 rounded-lg">
            <a
              href={`https://support.snu.gouv.fr/base-de-connaissance/phase-2-la-mission-dinteret-general-1`}
              target="_blank"
              rel="noreferrer"
              className="flex gap-1 items-start justify-between p-3 hover:text-blue-600">
              <div className="font-bold flex-1">J’ai des questions sur la mission d’intérêt général</div>
              <ArrowUpRight className="text-gray-400 text-2xl group-hover:scale-105 group-hover:text-blue-600" />
            </a>
          </div>
          <div className="group w-1/3 border-[1px] border-gray-200 rounded-lg">
            <a
              href={`https://support.snu.gouv.fr/base-de-connaissance/`}
              target="_blank"
              rel="noreferrer"
              className="flex gap-1 items-start justify-between p-3 hover:text-blue-600">
              <div className="font-bold flex-1">J’ai des questions sur la reconnaissance d’engagement</div>
              <ArrowUpRight className="text-gray-400 text-2xl group-hover:scale-105 group-hover:text-blue-600" />
            </a>
          </div>
        </div>
        <Link to='/mission?MILITARY_PREPARATION=%5B"true"%5D'>
          <div className="group border-[1px] border-gray-200 rounded-lg mt-3 p-3 flex items-center gap-4">
            <Medaille className="text-gray-400" />
            <div className="w-full">
              <div className="flex items-center justify-between">
                <div className="font-bold text-base group-hover:text-blue-600"> Partez en préparation militaire</div>
                <ArrowUpRight className="text-gray-400 text-2xl group-hover:scale-105 group-hover:text-blue-600" />
              </div>
              <div className="text-sm text-gray-500">Partez à la découverte des métiers de la Défense en réalisant une préparation militaire au sein d&apos;un corps d’armée</div>
            </div>
          </div>
        </Link>
        <div className="mt-12 mb-4 text-lg">Vous avez déjà fait preuve de solidarité ?</div>
        <div className="border-0 flex rounded-lg shadow-lg w-1/2 items-center">
          <img src={require("../../../assets/phase2Reconnaissance.png")} className="rounded-lg" />
          <div className="pr-4 ml-3">
            <div className="flex items-end">
              <div className="font-bold text-lg ">Demandez la reconnaissance d’un engagement déjà réalisé</div>
              {/* TODO que fait le i ? */}
              {/* <IoIosInformationCircleOutline className="text-2xl" /> */}
            </div>
            <div className="text-gray-600 text-sm mt-2 mb-3">Faîtes reconnaitre comme mission d’intérêt général un engagement déjà réalisé au service de la société</div>
            <div className="flex justify-start">
              <Link to="phase2/equivalence">
                <div className="rounded-lg text-blue-700 text-center py-1 px-16 border-blue-700 border-[1px] hover:bg-blue-700 hover:text-white transition duration-100 ease-in-out">
                  Faire ma demande
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* END LINKS */}
    </div>
  );
}
