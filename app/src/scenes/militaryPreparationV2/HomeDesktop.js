import React from "react";
import { HiOutlineSearch } from "react-icons/hi";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import CheckCircle from "../../assets/icons/CheckCircle";
import { permissionPhase2 } from "../../utils";
import DocumentsPM from "./components/DocumentsPM";

export default function HomeDesktop() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const [readMore, setReadMore] = React.useState(false);

  if (!young || !permissionPhase2(young)) history.push("/");

  return (
    <div className="flex flex-col bg-gray-100 mx-4 my-4 w-full">
      <div className="mx-12 mt-8">
        <div className="flex flex-col-reverse items-center  lg:!flex-row  mb-8">
          <div className="flex flex-col mr-4 items-center lg:items-start">
            <div className="text-3xl text-gray-800 font-bold">Partez en préparation militaire</div>
            {!readMore ? (
              <div className="text-gray-700 text-sm mt-4 text-center lg:!text-left">
                Vous désirez découvrir les armées et leurs métiers ? Vous cherchez la camaraderie, de l’exigence, des rencontres ? Continuer d’apprendre et rencontrer des jeunes de
                tous horizons ? Embarquez pour l’aventure en rejoignant une des missions d’intérêt général...
                <span className="font-semibold cursor-pointer underline ml-2" onClick={() => setReadMore(true)}>
                  Lire plus
                </span>
              </div>
            ) : (
              <div className="text-gray-700 text-sm mt-4 text-center lg:!text-left">
                Vous désirez découvrir les armées et leurs métiers ? Vous cherchez la camaraderie, de l’exigence, des rencontres ? Continuer d’apprendre et rencontrer des jeunes de
                tous horizons ? Embarquez pour l’aventure en rejoignant une des missions d’intérêt général proposées par l’armée de terre, la marine nationale, l’armée de l’air et
                de l’espace, le service de santé des armées, le service du commissariat des armées et le service de l’énergie opérationnelle. Vous effectuerez une période militaire
                d’initiation-défense nationale qui ne vous engagera à rien mais vous permettra, si vous le souhaitez, de postuler plus tard pour un engagement dans l’active ou dans
                la réserve.
                <span className="font-semibold cursor-pointer underline ml-2" onClick={() => setReadMore(false)}>
                  Voir moins
                </span>
              </div>
            )}
            <div className="flex items-center w-full mt-12 gap-8 mb-8 flex-wrap lg:!flex-nowrap justify-center lg:justify-start">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div className="flex flex-col">
                    <div className="text-gray-700 text-sm leading-5">
                      J’ai <strong>16 ans</strong> révolus
                    </div>
                    <div className="text-gray-400 text-sm leading-5">Le 1er jour de la mission choisie</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div className="flex flex-col">
                    <div className="text-gray-700 text-sm leading-5">
                      Je suis apte aux <strong>activités sportives</strong>
                    </div>
                    <div className="text-gray-400 text-sm leading-5">Pas de contre-indication médicale</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div className="flex flex-col">
                    <div className="text-gray-700 text-sm leading-5">
                      J&apos;ai effectué mon <strong>recensement</strong> citoyen
                    </div>
                    <a
                      href="https://www.service-public.fr/particuliers/vosdroits/F870"
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-400 text-sm leading-5 underline cursor-pointer hover:underline">
                      En savoir plus
                    </a>
                  </div>
                </div>
              </div>
              <div className="hidden lg:flex  border-l-[1px] border-gray-200 h-2/3" />
              <div className="flex flex-col ">
                <div className="text-lg leading-6 font-semibold">Vous remplissez les conditions ?</div>
                <div className="text-lg leading-6 font-semibold"> N’attendez plus !</div>
                <Link
                  to='/mission?MILITARY_PREPARATION=%5B"true"%5D'
                  className="group flex gap-1 rounded-[10px] border-[1px] py-2.5 px-3 items-center bg-blue-600 hover:bg-white hover:border-blue-600 mt-4">
                  <HiOutlineSearch className="text-[#ffffff] group-hover:text-blue-600 mr-2" />
                  <div className="text-[#ffffff] group-hover:text-blue-600 text-sm flex-1">Trouver une préparation militaire</div>
                </Link>
              </div>
            </div>
          </div>
          <div className="flex flex-shrink-0 w-1/3">
            <img className="object-contain" src={require("../../assets/militaryPrep.png")} />
          </div>
        </div>
        <DocumentsPM />
      </div>
    </div>
  );
}
