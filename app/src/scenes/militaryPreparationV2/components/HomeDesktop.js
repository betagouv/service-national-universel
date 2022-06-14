import React from "react";
import CheckCircle from "../../../assets/icons/CheckCircle";
import { HiOutlineSearch } from "react-icons/hi";
import FileCard from "./FileCard";
import { Link } from "react-router-dom";

export default function HomeDesktop() {
  return (
    <div className="flex flex-col bg-gray-100 mx-4 my-4 w-full">
      <div className="mx-12 mt-8">
        <div className="flex flex-row">
          <div className="flex flex-col mr-4">
            <div className="text-3xl text-gray-800 font-bold">Partez en préparation militaire</div>
            <div className="text-gray-700 text-sm mt-4">
              Vous désirez découvrir les armées et leurs métiers ? Vous cherchez la camaraderie, de l’exigence, des rencontres ? Continuer d’apprendre et rencontrer des jeunes de
              tous horizons ? Embarquez pour l’aventure en rejoignant une des missions d’intérêt général...
              <span className="font-semibold cursor-pointer underline ml-2">Lire plus</span>
            </div>
            <div className="flex items-center w-full mt-12 gap-24">
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
                      J'ai effectué mon <strong>recensement</strong> citoyen
                    </div>
                    <div className="text-gray-400 text-sm leading-5 underline cursor-pointer">En savoir plus</div>
                  </div>
                </div>
              </div>
              <div className="border-l-[1px] border-gray-200 h-2/3" />
              <div className="flex flex-col">
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
          <img className="w-1/4 mb-16 ml-10 mr-10" src={require("../../../assets/militaryPrep.png")} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="text-lg leading-6 font-semibold">Dossier d&apos;éligibilité aux préparations militaires</div>
            <div className="text-sm leading-5 font-normal text-gray-500 mt-1">Pour candidater, veuillez téléverser les documents justificatifs ci-dessous.</div>
          </div>
          <div className="rounded-lg text-blue-600 text-center text-sm py-2 px-10 border-blue-600 border-[1px] hover:bg-blue-600 hover:text-white transition duration-100 ease-in-out">
            En savoir plus
          </div>
        </div>
        <div className="flex flex-row gap-4 mt-4 w-full justify-between">
          <FileCard name="Pièce d’identité" icon="reglement" filled={false} color={"bg-blue-600 text-white"} status={"À renseigner"} onClick={() => console.log("click")} />
          <FileCard name="Autorisation parentale" icon="image" filled={false} color={"bg-blue-600 text-white"} status={"À renseigner"} onClick={() => console.log("click")} />
          <FileCard
            name="Certifical médical de non contre-indication..."
            icon="autotest"
            filled={false}
            color={"bg-blue-600 text-white"}
            status={"À renseigner"}
            onClick={() => console.log("click")}
          />
          <FileCard
            name="Attestation de recensement"
            icon="sanitaire"
            filled={false}
            color={"bg-blue-600 text-white"}
            status={"À renseigner"}
            onClick={() => console.log("click")}
          />
        </div>
      </div>
    </div>
  );
}
