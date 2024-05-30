import Img3 from "../../../assets/phase2Header.png";
import Img2 from "../../../assets/phase2Reconnaissance.png";
import React, { useEffect, useState } from "react";
import { HiOutlineAdjustments, HiOutlineSearch } from "react-icons/hi";
import { Link } from "react-router-dom";

import ArrowUpRight from "../../../assets/icons/ArrowUpRight";
import Medaille from "../../../assets/icons/Medaille";
import api from "../../../services/api";
import CardMission from "./components/CardMission";
import CardMissionEmpty from "./components/CardMissionEmpty";
import Loader from "../../../components/Loader";
import CardEquivalence from "./components/CardEquivalence";
import CardPM from "./components/CardPM";
import plausibleEvent from "../../../services/plausible";
import ButtonLinkPrimaryOutline from "../../../components/ui/buttons/ButtonLinkPrimaryOutline";
import AlertPrimary from "../../../components/ui/alerts/AlertPrimary";
import InformationCircle from "../../../assets/icons/InformationCircle";
import { isYoungCanApplyToPhase2Missions } from "../../../utils";

export default function IndexDesktop({ young }) {
  const [applications, setApplications] = useState();
  const [equivalences, setEquivalences] = useState();
  const [hasPM, setHasPM] = useState(false);

  useEffect(() => {
    (async () => {
      const { ok, data } = await api.get(`/young/${young._id.toString()}/application`);
      if (ok) return setApplications(data);
    })();
    (async () => {
      const { ok, data } = await api.get(`/young/${young._id.toString()}/phase2/equivalences`);
      if (ok) return setEquivalences(data);
    })();
  }, []);

  useEffect(() => {
    if (["WAITING_CORRECTION", "REFUSED", "VALIDATED", "WAITING_VERIFICATION"].includes(young.statusMilitaryPreparationFiles)) {
      setHasPM(true);
    } else {
      setHasPM(false);
    }
  }, [young]);

  if (!applications || !equivalences) return <Loader />;

  return (
    <div className="mx-4 my-3 rounded-lg bg-white pb-12">
      {/* BEGIN HEADER */}
      <div className="flex rounded-t-lg bg-gray-700">
        <div className="p-14">
          <div className="text-3xl font-bold text-white">Réalisez votre mission d&apos;intérêt général</div>
          <div className="mt-2 mb-4 text-sm text-gray-300">
            Mettez votre énergie au service d&apos;une société plus solidaire et découvrez {"\n"} votre talent pour l&apos;engagement en réalisant une mission d&apos;intérêt
            général !
          </div>
          <div className="flex gap-4">
            <Link to="/preferences" onClick={() => plausibleEvent("Phase2/CTA - Renseigner mes préférences")}>
              <div className="group flex items-center gap-1 rounded-[10px] border-[1px] py-2.5 px-3 hover:bg-white hover:text-gray-800">
                <HiOutlineAdjustments className="text-[#ffffff] group-hover:text-gray-800" />
                <div className="flex-1 text-sm text-[#ffffff] group-hover:text-gray-800">Renseigner mes préférences</div>
              </div>
            </Link>
            {applications.length > 0 ? (
              <Link to="/mission" onClick={() => plausibleEvent("Phase2/CTA - Trouver une mission")}>
                <div className="group flex items-center gap-1 rounded-[10px] border-[1px] py-2.5 px-3 hover:bg-white hover:text-gray-800">
                  <HiOutlineSearch className="text-[#ffffff] group-hover:text-gray-800" />
                  <div className="flex-1 text-sm text-[#ffffff] group-hover:text-gray-800">Trouver une mission</div>
                </div>
              </Link>
            ) : (
              <Link to="/mission" onClick={() => plausibleEvent("Phase2/CTA - Trouver une mission")}>
                <div className="group flex items-center gap-1 rounded-[10px] border-[1px] border-blue-600 bg-blue-600 py-2.5 px-3 hover:border-[#4881FF] hover:bg-[#4881FF]">
                  <HiOutlineSearch className="text-blue-300" />
                  <div className="flex-1 text-sm text-blue-100 group-hover:text-white">Trouver une mission</div>
                </div>
              </Link>
            )}
          </div>
        </div>
        <img className="rounded-t-lg" src={Img3} />
      </div>
      {/* END HEADER */}

      <div className="flex -translate-y-4 flex-col items-center px-14">
        {/* BEGIN PM */}
        {hasPM ? <CardPM young={young} /> : null}
        {/* BEGIN EQUIVALENCE */}
        {equivalences.map((equivalence, index) => (
          <CardEquivalence key={index} equivalence={equivalence} young={young} />
        ))}
        {/* BEGIN CANDIDATURES */}
        {applications.length > 0 ? (
          <>
            <div className="flex w-full gap-8">
              {applications
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) // afficher d'abord les candidatures mis a jour récemment
                .slice(0, 4) // afficher uniquement 4 candidatures
                .map((application) => (
                  <CardMission key={application._id} application={application} />
                ))}
              {applications.length < 4 ? <CardMissionEmpty /> : null}
            </div>

            {applications.length >= 4 ? (
              <div className="flex justify-center">
                <Link to="/candidature">
                  <div className="mt-4 rounded-lg bg-gray-100 px-4 py-2 text-center text-gray-700 hover:underline">
                    {applications.length === 4 ? "Gérer mes candidatures" : `Toutes mes candidatures (${applications.length})`}
                  </div>
                </Link>
              </div>
            ) : null}
          </>
        ) : null}
        {/* END CANDIDATURES */}
      </div>

      {/* BEGIN LINKS */}
      <div className="mx-10 mt-4">
        <div className="mb-4 flex space-x-5">
          <div className="flex w-1/3 cursor-pointer rounded-lg border-[1px] border-gray-200 hover:border-gray-300">
            <a
              href={`https://support.snu.gouv.fr/base-de-connaissance/phase-2-la-mission-dinteret-general-1`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-start justify-between gap-1 p-3">
              <div className="ml-3 flex-1 font-bold text-gray-800">J’ai des questions sur la mission d’intérêt général</div>
              <ArrowUpRight className="text-2xl text-gray-400 group-hover:scale-105" />
            </a>
          </div>
          <div className="flex w-1/3 cursor-pointer rounded-lg border-[1px] border-gray-200 hover:border-gray-300">
            <a
              href="https://support.snu.gouv.fr/base-de-connaissance/jai-trouve-ma-mission-par-moi-meme-et-elle-nest-pas-encore-sur-la-plateforme"
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-start justify-between gap-1 p-3">
              <div className="ml-3 flex-1 font-bold text-gray-800">J&apos;ai trouvé une mission qui n&apos;est pas sur la plateforme</div>
              <ArrowUpRight className="text-2xl text-gray-400 group-hover:scale-105" />
            </a>
          </div>
          <div className="group w-1/3 rounded-lg border-[1px] border-gray-200 hover:border-gray-300">
            <a
              href={`https://support.snu.gouv.fr/base-de-connaissance/demander-la-reconnaissance-dun-engagement-deja-realise-1`}
              target="_blank"
              rel="noreferrer"
              className="flex items-start justify-between gap-1 p-3">
              <div className="ml-3 flex-1 font-bold text-gray-800">J&apos;ai des questions sur la reconnaissance d&apos;engagement</div>
              <ArrowUpRight className="text-2xl text-gray-400 group-hover:scale-105" />
            </a>
          </div>
        </div>
        <Link to="/ma-preparation-militaire" onClick={() => plausibleEvent("Phase2/CTA - PM - PartezPM")}>
          <div className="group mt-3 flex items-center gap-4 rounded-lg border-[1px] border-gray-200 p-3 hover:border-gray-300">
            <Medaille className="ml-3 text-gray-400" />
            <div className="w-full">
              <div className="flex items-center justify-between">
                <div className="text-base font-bold text-gray-800"> Partez en préparation militaire</div>
                <ArrowUpRight className="text-2xl text-gray-400 group-hover:scale-105" />
              </div>
              <div className="text-sm text-gray-500">Partez à la découverte des métiers de la Défense en réalisant une préparation militaire au sein d&apos;un corps d’armée</div>
            </div>
          </div>
        </Link>
        {/* TODO activer si plusieurs cartes 👇 */}
        {/* <div className="mt-12 mb-4 text-lg">Vous avez déjà fait preuve de solidarité ?</div> */}
        {equivalences.length < 3 && equivalences.filter((equivalence) => equivalence.status !== "REFUSED").length === 0 ? (
          <div className="mt-4 flex max-h-[300px] w-full overflow-hidden rounded-lg border-0 shadow-lg xl:w-1/2">
            <img src={Img2} className="w-[300px] overflow-hidden rounded-lg object-cover object-right-bottom" />
            <div className="pr-8 pt-[20px] pb-6">
              <div className="flex items-end">
                <div className="mb-1 text-lg font-bold leading-6">Demandez la reconnaissance d&apos;un engagement déjà réalisé</div>
                {/* TODO que fait le i ? */}
                {/* <IoIosInformationCircleOutline className="text-2xl" /> */}
              </div>
              <div className="mb-2 text-sm text-gray-600">Faîtes reconnaitre comme mission d&apos;intérêt général un engagement déjà réalisé au service de la société</div>
              {!isYoungCanApplyToPhase2Missions(young) && (
                <AlertPrimary className="mb-4">
                  <div className="my-1 text-blue-400">
                    <InformationCircle />
                  </div>
                  <span>Vous devez avoir terminé votre séjour de cohésion.</span>
                </AlertPrimary>
              )}
              <ButtonLinkPrimaryOutline
                to="equivalence"
                disabled={!isYoungCanApplyToPhase2Missions(young)}
                className="flex w-full justify-center"
                onClick={() => plausibleEvent("Phase 2/ CTA - EquivalenceMIGdemande")}>
                Faire ma demande
              </ButtonLinkPrimaryOutline>
            </div>
          </div>
        ) : null}
      </div>
      {/* END LINKS */}
    </div>
  );
}
