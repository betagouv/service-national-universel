import React from "react";
import ReactTooltip from "react-tooltip";
import { HiOutlineInformationCircle } from "react-icons/hi";
import cx from "classnames";

import { Badge } from "@snu/ds/admin";
import Loader from "@/components/Loader";
import { CohesionCenterType, translate, translateTypologieCenter, translateDomainCenter, formatNameAndAddress } from "snu-lib";
import useDocumentTitle from "@/hooks/useDocumentTitle";

import { Title } from "../components/commons";

export default function Details({ center }: { center: CohesionCenterType }) {
  if (center.pmr === "") {
    center.pmr = "false";
  }
  useDocumentTitle(`Fiche du centre - ${center?.name}`);

  if (!center) return <Loader />;

  return (
    <div className="m-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Title>{center.name}</Title>
        {center?.deletedAt && <Badge title="Archivé" status="WAITING_CORRECTION" />}
      </div>
      <div className="flex flex-col gap-8 !rounded-lg bg-white p-8">
        <div className="flex items-center justify-between">
          <div className="text-lg font-medium leading-6 text-gray-900">Informations générales</div>
          <div className="flex items-center text-xs leading-4 font-medium text-gray-500">
            <p>Modifier ces informations ?</p>
            <HiOutlineInformationCircle data-tip="" data-for="tooltip-modif" className="ml-2 mt-0.5" size={20} />
            <ReactTooltip id="tooltip-modif" className="bg-white shadow-xl" arrowColor="white" disable={false} place="top">
              <div className="text-gray-700 text-xs font-[400] w-[260px] text-center">Les modifications se font uniquement dans le module de répartition SI SNU.</div>
            </ReactTooltip>
          </div>
        </div>
        <div className="flex text-sm leading-5 font-normal text-gray-900">
          <div className="flex w-[45%] flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <div className="font-bold ">Désignations</div>
              <div className="flex flex-col gap-1 bg-gray-50 rounded-md shadow-sm pl-3 py-2">
                <p>
                  <span className="text-gray-500 mr-2">Nom du Centre : </span>
                  {center.name && formatNameAndAddress(center.name)}
                </p>
                <p>
                  <span className="text-gray-500 mr-2">Matricule : </span>
                  {center._id === "66da08d8502c4f7fc1dfa921" ? "YMCA089-00" : center.matricule}
                </p>
                <p>
                  <span className="text-gray-500 mr-2">Désignation : </span>
                  {center.centerDesignation && formatNameAndAddress(center.centerDesignation)}
                </p>
                <p>
                  <span className="text-gray-500 mr-2">Typologie : </span>
                  {translateTypologieCenter(center.typology)}
                </p>
                <p>
                  <span className="text-gray-500 mr-2">Domaine : </span>
                  {translateDomainCenter(center.domain)}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex">
                <div className="font-bold">Capacité maximale d'accueil</div>
                <HiOutlineInformationCircle data-tip="" data-for="tooltip-capacite" className="ml-2 mt-0.5 text-gray-400" size={20} />
                <ReactTooltip id="tooltip-capacite" className="bg-white shadow-xl" arrowColor="white" disable={false} place="top">
                  <div className="text-gray-700 text-xs font-[400] w-[260px] text-center mb-1">Les modifications se font uniquement dans le module de répartition SI SNU.</div>
                </ReactTooltip>
              </div>
              <p className="flex items-center pl-3 bg-gray-50 rounded-md shadow-sm h-10">{center.placesTotal}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="font-bold">Accessibilité PMR</p>
              <p className="flex items-center pl-3 bg-gray-50 rounded-md shadow-sm h-10">{translate(center.pmr)}</p>
            </div>
          </div>
          <div className="flex w-[10%] items-center justify-center">
            <div className="h-full w-[1px] border-r-[1px] border-gray-300"></div>
          </div>
          <div className="flex w-[45%] flex-col  justify-between">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <div className="font-bold">Gestionnaire ou propriétaire</div>
                <p
                  className={cx("flex items-center pl-3 bg-gray-50 rounded-md shadow-sm h-10 ", {
                    "text-gray-500 italic": !center.complement || center.complement === "",
                  })}>
                  {center.complement && center.complement !== "" ? center.complement : "Non renseigné"}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="font-bold">Adresse</div>
                <div className="flex flex-col gap-1 bg-gray-50 rounded-md shadow-sm pl-3 py-2">
                  <p>{center.address && formatNameAndAddress(center.address)}</p>
                  <p>{center.zip + " " + (center.city && formatNameAndAddress(center.city))}</p>
                </div>
                <div className="flex flex-col gap-1 bg-gray-50 rounded-md shadow-sm pl-3 py-2">
                  <p>
                    <span className="text-gray-500 mr-2">Département : </span>
                    {center.department}
                  </p>
                  <p>
                    <span className="text-gray-500 mr-2">Région : </span>
                    {center.region}
                  </p>
                  <p>
                    <span className="text-gray-500 mr-2">Académie : </span>
                    {center.academy}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
