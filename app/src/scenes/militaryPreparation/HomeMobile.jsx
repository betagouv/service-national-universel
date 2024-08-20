import Img2 from "../../assets/militaryPrepMobile.png";
import React from "react";
import { HiArrowLeft, HiOutlineSearch } from "react-icons/hi";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import CheckCircle from "../../assets/icons/CheckCircle";
import plausibleEvent from "../../services/plausible";
import { permissionPhase2 } from "../../utils";
import DocumentsPM from "./components/DocumentsPM";

export default function HomeMobile() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const [readMore, setReadMore] = React.useState(false);

  if (!young || !permissionPhase2(young)) history.push("/");
  return (
    <div className="mb-4 w-full flex-col rounded-lg bg-white pb-4 shadow-nina">
      <div className="pl-4">
        <div className="flex justify-between pt-4">
          <div className="flex w-2/3 flex-col">
            <button onClick={() => history.goBack()} className="flex items-center">
              <HiArrowLeft className="text-2xl text-gray-500" />
            </button>
            <div className="mt-4 text-3xl font-bold text-gray-800">Partez en préparation militaire</div>
            {!readMore ? (
              <div className="mt-4 text-left text-sm text-gray-700">
                Vous désirez découvrir les armées et leurs métiers ? Vous cherchez la camaraderie, de l’exigence...
                <span className="ml-2 cursor-pointer font-semibold underline" onClick={() => setReadMore(true)}>
                  Lire plus
                </span>
              </div>
            ) : (
              <div className="mt-4 text-left text-sm text-gray-700">
                Vous désirez découvrir les armées et leurs métiers ? Vous cherchez la camaraderie, de l’exigence, des rencontres ? Continuer d’apprendre et rencontrer des jeunes de
                tous horizons ? Embarquez pour l’aventure en rejoignant une des missions d’intérêt général proposées par l’armée de terre, la marine nationale, l’armée de l’air et
                de l’espace, le service de santé des armées, le service du commissariat des armées et le service de l’énergie opérationnelle. Vous effectuerez une période militaire
                d’initiation-défense nationale qui ne vous engagera à rien mais vous permettra, si vous le souhaitez, de postuler plus tard pour un engagement dans l’active ou dans
                la réserve.
                <span className="ml-2 cursor-pointer font-semibold underline" onClick={() => setReadMore(false)}>
                  Voir moins
                </span>
              </div>
            )}
          </div>
          <div className="flex items-start">
            <img className="object-scale-down" src={Img2} />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div className="flex flex-col">
              <div className="text-sm leading-5 text-gray-700">
                J’ai <strong>16 ans</strong> révolus
              </div>
              <div className="text-sm leading-5 text-gray-400">Le 1er jour de la mission choisie</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div className="flex flex-col">
              <div className="text-sm leading-5 text-gray-700">
                Je suis apte aux <strong>activités sportives</strong>
              </div>
              <div className="text-sm leading-5 text-gray-400">Pas de contre-indication médicale</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div className="flex flex-col">
              <div className="text-sm leading-5 text-gray-700">
                J&apos;ai effectué mon <strong>recensement</strong> citoyen
              </div>
              <a
                href="https://www.service-public.fr/particuliers/vosdroits/F870"
                target="_blank"
                rel="noreferrer"
                className="cursor-pointer text-sm leading-5 text-gray-400 underline hover:underline">
                En savoir plus
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-col items-center bg-gray-50 py-4 px-4">
        <div className="text-lg font-semibold leading-6">Vous remplissez les conditions ?</div>
        <div className="text-lg font-semibold leading-6"> N’attendez plus !</div>
        <Link
          to='/mission?MILITARY_PREPARATION=%5B"true"%5D'
          onClick={() => plausibleEvent("Phase2/CTA - PM - TrouvezPM")}
          className="group mt-4 flex items-center gap-1 rounded-[10px] border-[1px] bg-blue-600 py-2.5 px-3 hover:border-blue-600 hover:bg-white">
          <HiOutlineSearch className="mr-2 text-[#ffffff] group-hover:text-blue-600" />
          <div className="flex-1 text-sm text-[#ffffff] group-hover:text-blue-600">Trouver une préparation militaire</div>
        </Link>
      </div>
      <div className="mt-4 px-4">
        <DocumentsPM showFolder={!["VALIDATED"].includes(young.statusMilitaryPreparationFiles)} />
      </div>
    </div>
  );
}
