import Img3 from "../../../assets/phase2MobileHeader.png";
import Img2 from "../../../assets/phase2MobileReconnaissance.png";
import React from "react";
import { HiOutlineAdjustments, HiOutlineSearch } from "react-icons/hi";
import { Link } from "react-router-dom";

import ArrowUpRight from "../../../assets/icons/ArrowUpRight";
import Medaille from "../../../assets/icons/Medaille";
import Loader from "../../../components/Loader";
import api from "../../../services/api";
import CardMission from "./components/CardMission";
import CardEquivalence from "./components/CardEquivalence";
import CardPM from "./components/CardPM";
import plausibleEvent from "../../../services/plausible";
import AlertPrimary from "../../../components/ui/alerts/AlertPrimary";
import InformationCircle from "../../../assets/icons/InformationCircle";
import ButtonLinkPrimaryOutline from "../../../components/ui/buttons/ButtonLinkPrimaryOutline";
import { isYoungCanApplyToPhase2Missions } from "../../../utils";

export default function IndexPhase2Mobile({ young }) {
  const [applications, setApplications] = React.useState();
  const [equivalences, setEquivalences] = React.useState();
  const [hasPM, setHasPM] = React.useState(false);

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

  React.useEffect(() => {
    if (["WAITING_CORRECTION", "REFUSED", "VALIDATED", "WAITING_VERIFICATION"].includes(young.statusMilitaryPreparationFiles)) {
      setHasPM(true);
    } else {
      setHasPM(false);
    }
  }, [young]);

  if (!applications || !equivalences) return <Loader />;

  return (
    <div className="bg-white pb-5">
      {/* BEGIN HEADER */}
      <div className="bg-gray-700">
        <div className="px-4 pt-4 pb-3">
          <div className="text-3xl font-bold text-white">Réalisez votre mission d&apos;intérêt général</div>
          <div className="mt-2 mb-2 text-sm font-normal text-gray-300">
            Mettez votre énergie au service d&apos;une société plus solidaire et découvrez votre talent pour l&apos;engagement en réalisant une mission d&apos;intérêt général !
          </div>
          <Link to="/preferences" onClick={() => plausibleEvent("Phase2/CTA - Renseigner mes préférences")}>
            <div className="mb-4 flex items-center">
              <HiOutlineAdjustments className="mr-1 text-gray-400" />
              <div className="text-sm text-gray-200 underline">Renseigner mes préférences mission </div>
            </div>
          </Link>
          {applications.length > 0 ? (
            <Link to="/mission" onClick={() => plausibleEvent("Phase2/CTA - Trouver une mission")}>
              <div className="group flex items-center justify-center gap-1 rounded-[10px] border-[1px] py-2.5 px-3 hover:bg-white hover:text-gray-800">
                <HiOutlineSearch className="text-[#ffffff] group-hover:text-gray-800" />
                <div className="text-sm text-[#ffffff] group-hover:text-gray-800">Trouver une mission</div>
              </div>
            </Link>
          ) : (
            <Link to="/mission" onClick={() => plausibleEvent("Phase2/CTA - Trouver une mission")}>
              <div className="group flex items-center justify-center gap-1 rounded-[10px] border-[1px] border-blue-600 bg-blue-600 py-2.5 px-3">
                <HiOutlineSearch className="text-blue-300" />
                <div className="text-sm text-blue-100">Trouver une mission</div>
              </div>
            </Link>
          )}
        </div>
        <img className="w-full rounded-t-lg " src={Img3} />
      </div>
      {/* END HEADER */}
      <div className="mx-3">
        {/* BEGIN PM */}
        {hasPM ? <CardPM young={young} /> : null}
        {/* BEGIN EQUIVALENCE */}
        {equivalences.map((equivalence, index) => (
          <CardEquivalence key={index} equivalence={equivalence} young={young} />
        ))}
      </div>
      {/* BEGIN CANDIDATURES */}
      {applications.length > 0 ? (
        <>
          <div className="w-screen -translate-y-4">
            <div className="flex w-full space-x-8 overflow-x-auto px-3 pb-4">
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
                <div className="rounded-lg bg-gray-100 px-4 py-2 text-center text-gray-700 hover:underline">
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
        <div className="flex cursor-pointer rounded-lg border-[1px] border-gray-200">
          <a
            href={`https://support.snu.gouv.fr/base-de-connaissance/phase-2-la-mission-dinteret-general-1`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-start justify-between gap-1 p-3">
            <div className="flex-1 font-bold text-gray-800">J&apos;ai des questions sur la mission d&apos;intérêt général</div>
            <ArrowUpRight className="text-2xl text-gray-400" />
          </a>
        </div>
        <div className="flex cursor-pointer rounded-lg border-[1px] border-gray-200">
          <a
            href="https://support.snu.gouv.fr/base-de-connaissance/jai-trouve-ma-mission-par-moi-meme-et-elle-nest-pas-encore-sur-la-plateforme"
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-start justify-between gap-1 p-3">
            <div className="flex-1 font-bold text-gray-800">J’ai trouvé une mission qui n’est pas sur la plateforme</div>
            <ArrowUpRight className="text-2xl text-gray-400" />
          </a>
        </div>
        <div className="rounded-lg border-[1px] border-gray-200">
          <a
            href={`https://support.snu.gouv.fr/base-de-connaissance/demander-la-reconnaissance-dun-engagement-deja-realise-1`}
            target="_blank"
            rel="noreferrer"
            className="flex items-start justify-between gap-1 p-3">
            <div className="flex-1 font-bold text-gray-800">J&apos;ai des questions sur la reconnaissance d&apos;engagement</div>
            <ArrowUpRight className="text-2xl text-gray-400" />
          </a>
        </div>
        <Link to="/ma-preparation-militaire" onClick={() => plausibleEvent("Phase2/CTA - PM - PartezPM")}>
          <div className="group mt-3 flex items-center gap-4 rounded-lg border-[1px] border-gray-200 p-3 hover:border-gray-300">
            <Medaille className="text-gray-400" />
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
        {/* <div className="mt-4 mb-2 text-base">Vous avez déjà fait preuve de solidarité ?</div> */}
        {equivalences.length < 3 && equivalences.filter((equivalence) => equivalence.status !== "REFUSED").length === 0 ? (
          <div className="items-center rounded-lg border-0 shadow-lg">
            <img src={Img2} className="w-full rounded-lg" />
            <div className="px-3 pb-4">
              <div className="text-lg font-bold text-gray-900 ">Demandez la reconnaissance d&apos;un engagement déjà réalisé</div>
              <div className="mt-2 mb-3 text-sm text-gray-600">Faîtes reconnaitre comme mission d&apos;intérêt général un engagement déjà réalisé au service de la société</div>
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
