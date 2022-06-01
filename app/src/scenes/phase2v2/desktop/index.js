import React from "react";
import { BsArrowUpRight } from "react-icons/bs";
import { HiOutlineAdjustments, HiOutlineSearch } from "react-icons/hi";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { MdOutlineContentCopy } from "react-icons/md";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";
import api from "../../../services/api";
import { copyToClipboard } from "../../../utils";
import ArrowUpRight from "../../../assets/icons/ArrowUpRight";

export default function IndexDesktop() {
  const young = useSelector((state) => state.Auth.young);

  const [referentManagerPhase2, setReferentManagerPhase2] = React.useState();
  React.useEffect(() => {
    (async () => {
      const { ok, data } = await api.get(`/referent/manager_phase2/${young.department}`);
      if (ok) return setReferentManagerPhase2(data);
    })();
  }, []);

  return (
    <div className="bg-white mx-4 pb-5 mt-3">
      {/* BEGIN HEADER */}
      <div className="bg-gray-700 rounded-t-lg flex">
        <div className="p-14">
          <div className="text-white font-bold text-3xl">Réalisez votre mission d&apos;intérêt général</div>
          <div className="text-gray-300 text-sm mt-2 mb-4">
            Mettez votre énergie au service d’une société plus solidaire et découvrez {"\n"} votre talent pour l’engagement en réalisant une mission d’intérêt général !
          </div>
          <div className="flex">
            <Link to="/preferences">
              <div className="flex gap-1 rounded-[10px] border-[1px] py-2.5 px-3 items-center">
                <HiOutlineAdjustments className="text-white" />
                <div className="text-white  text-sm">Renseigner mes préférences </div>
              </div>
            </Link>
            <Link to="/mission">
              <div className="flex rounded-[10px] py-2.5 px-4 ml-4 bg-blue-600 items-center">
                <HiOutlineSearch className="text-white mr-1" />
                <div className="text-white text-sm">Trouver une mission</div>
              </div>
            </Link>
          </div>
        </div>
        <img className="rounded-t-lg" src={require("../../../assets/phase2Header.png")} />
      </div>
      {/* END HEADER */}
      <div className="mx-10 flex">
        <div className="border shadow-md rounded-lg w-1/4 -translate-y-4 bg-white p-3">
          <div className="text-xs bg-indigo-600 text-white px-1 rounded-sm">Mission en cours</div>
          <div className="text-gray-500 text-xs mt-2">CASC DU SDMIS</div>
          <div className="font-bold text-sm mt-2">Je participe à l&apos;accueil du public au Musée des sapeurs-pompiers...</div>
          <div className="text-gray-500 text-xs mt-3">Voir ma candidature</div>
        </div>
      </div>
      <div className="text-gray-700 bg-gray-100 rounded-lg p-2 text-center"> Toutes mes candidatures (5)</div>
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
              className="flex gap-1 items-start justify-between p-3 hover:text-gray-800">
              <div className="font-bold flex-1">J’ai des questions sur la mission d’intérêt général</div>
              <ArrowUpRight className="text-gray-400 text-2xl group-hover:scale-105 group-hover:text-blue-600" />
            </a>
          </div>
          <div className="group w-1/3 border-[1px] border-gray-200 rounded-lg">
            <a
              href={`https://support.snu.gouv.fr/base-de-connaissance/`}
              target="_blank"
              rel="noreferrer"
              className="flex gap-1 items-start justify-between p-3 hover:text-gray-800">
              <div className="font-bold flex-1">J’ai des questions sur la reconnaissance d’engagement</div>
              <ArrowUpRight className="text-gray-400 text-2xl group-hover:scale-105 group-hover:text-blue-600" />
            </a>
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
        <div className="border-0 flex rounded-lg shadow-lg w-1/2 items-center">
          <img src={require("../../../assets/phase2Reconnaissance.png")} className="rounded-lg" />
          <div className=" pr-2 ml-3">
            <div className="flex items-end">
              <div className="font-bold text-lg ">Demandez la reconnaissance d’un engagement déjà réalisé</div>
              <IoIosInformationCircleOutline className="text-2xl" />
            </div>
            <div className="text-gray-600 text-sm mt-2 mb-3">Faîtes reconnaitre comme mission d’intérêt général un engagement déjà réalisé au service de la société</div>
            <Link to="phase2/equivalence">
              <div className=" rounded-lg text-blue-700 text-center py-1 mr-4 border-blue-700 border ">Faire ma demande</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
