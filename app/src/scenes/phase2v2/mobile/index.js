import React from "react";
import { BsArrowUpRight } from "react-icons/bs";
import { MdOutlineContentCopy } from "react-icons/md";
import Header from "./Header";

export default function IndexPhase2Mobile() {
  return (
    <div className="bg-white pb-5">
      {/* <Header /> */}
      <div className="mx-10 ">
        <div className=" flex">
          <div className="border shadow-md rounded-lg -translate-y-4 bg-white p-3 w-300">
            <div className="text-xs bg-indigo-600 text-white px-1 rounded-sm">Mission en cours</div>
            <div className="text-gray-500 text-xs mt-2">CASC DU SDMIS</div>
            <div className="font-bold text-sm mt-2">Je participe à l&apos;accueil du public au Musée des sapeurs-pompiers...</div>
            <div className="text-gray-500 text-xs mt-3">Voir ma candidature</div>
          </div>
          <div className="border shadow-md rounded-lg -translate-y-4 bg-white p-3 ">
            <div className="text-xs bg-indigo-600 text-white px-1 rounded-sm">Mission en cours</div>
            <div className="text-gray-500 text-xs mt-2">CASC DU SDMIS</div>
            <div className="font-bold text-sm mt-2">Je participe à l&apos;accueil du public au Musée des sapeurs-pompiers...</div>
            <div className="text-gray-500 text-xs mt-3">Voir ma candidature</div>
          </div>
        </div>
        <div className="text-gray-700 bg-gray-100 rounded-lg p-2 text-center"> Toutes mes candidatures (5)</div>
      </div>
      <div className="mx-5 mt-10 ">
        <div>
          <div className="border border-gray-200 rounded-lg py-2 px-3">
            <div className="flex items-center justify-between">
              <div className="font-bold">Contacter mon référent </div>
              <MdOutlineContentCopy className="text-gray-400" />
            </div>
            <div className="text-sm text-gray-600">André Dupont - andre.dupont@gmail.com</div>
          </div>
          <div className="border border-gray-200 rounded-lg  mt-3 py-2 px-3 flex items-start justify-between">
            <div className="font-bold ">J’ai des questions sur la mission d’intérêt général</div>
            <BsArrowUpRight className="text-gray-400 m-0.5 text-2xl" />
          </div>
          <div className="border border-gray-200 rounded-lg   mt-3 py-2 px-3  flex items-start justify-between">
            <div className="font-bold">J’ai des questions sur la reconnaissance d’engagement</div>
            <BsArrowUpRight className="text-gray-400 m-0.5 text-2xl" />
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg mt-3  py-2 px-3 flex items-center">
          <div className="mr-3">
            <img src={require("../../../assets/prépa.png")} height={96} />
          </div>
          <div className="w-full">
            <div className="flex items-center justify-between">
              <div className="font-bold"> Partez en préparation militaire</div>
              <BsArrowUpRight className="text-gray-400 m-0.5 " />
            </div>
            <div className="text-sm text-gray-600">Partez à la découverte des métiers de la Défense en réalisant une préparation militaire au sein d&apos;un corps d’armée</div>
          </div>
        </div>
        <div className="mt-4 mb-2">Vous avez déjà fait preuve de solidarité ?</div>
        <div className="border-0 rounded-lg shadow-lg items-center">
          <img src={require("../../../assets/phase2MobileReconnaissance.png")} className="rounded-lg w-full" />
          <div className="px-3 pb-4">
            <div className="font-bold text-lg ">Demandez la reconnaissance d’un engagement déjà réalisé</div>
            <div className="text-gray-600 text-sm mt-2 mb-3">Faîtes reconnaitre comme mission d’intérêt général un engagement déjà réalisé au service de la société</div>
            <div className=" rounded-lg text-blue-700 text-center py-1 border-blue-700 border ">Faire ma demande</div>
          </div>
        </div>
      </div>
    </div>
  );
}
