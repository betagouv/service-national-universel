import React, { useState } from "react";
import { translate } from "snu-lib";
import ExclamationCircle from "../../../assets/icons/ExclamationCircle";
import ReactTooltip from "react-tooltip";

export default function DetailsVolontaires({ young }) {
  const [selectedRepresentant, setSelectedRepresentant] = useState(1);
  return (
    <div className="p-7">
      <div className="bg-white w-full h-full rounded-lg px-8 py-6">
        <div className="text-lg font-medium text-gray-900 mb-6">Informations générales</div>
        <div className="flex flex-col items-start justify-around w-full gap-16 lg:flex-row">
          <div className="flex flex-col gap-2 w-full">
            <div className="text-xs font-medium mb-2">Identité et contact</div>
            <div className="flex flex-col gap-4">
              <Field title="Nom" value={young.lastName} />
              <Field title="Sexe" value={translate(young.gender)} />
              <Field title="Email" value={young.email} />
              <Field title="Téléphone" value={young.phone} />
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <div className="text-xs font-medium mb-2">Adresse</div>
            <div className="flex flex-col gap-4">
              <Field title="Adresse" value={young.address} />
              <div className="flex flex-row gap-3 items-end justify-around w-full">
                <div className="w-1/2">
                  <Field title="Code postal" value={young.zip} />
                </div>
                <div className="w-1/2">
                  <Field title="Ville" value={young.city} />
                </div>
              </div>
              <div className="flex flex-row gap-3 items-end justify-around w-full">
                <div className="w-1/2">
                  <Field title="Département" value={young.department} />
                </div>
                <div className="w-1/2">
                  <Field title="Région" value={young.region} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white w-full h-full rounded-lg px-8 py-6 mt-6">
        <div className="text-lg font-medium text-gray-900">Détails</div>
        <div className="flex flex-col items-start justify-around w-full gap-16 lg:flex-row">
          <div className="flex flex-col gap-2 w-full">
            <div className="text-xs font-medium mb-2 mt-6">Situation</div>
            <div className="flex flex-col gap-4">
              <Field title="Statut" value={translate(young.situation)} />
              <Field title="Ville de l'établissement" value={young.schoolCity} />
              <Field title="Nom de l'établissement" value={young.schoolName} />
              <Field title="Classe" value={translate(young.grade)} />
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <div className=" flex items-start justify-start mb-1">
              <div
                onClick={() => setSelectedRepresentant(1)}
                className={`cursor-pointer pb-3 ${selectedRepresentant === 1 && "border-b-4 text-[#3B82F6]"} border-[#3B82F6] mr-9 font-normal`}>
                Représentant légal 1
              </div>
              <div className="flex flex-row items-start justify-center" data-tip="" data-for="tooltip-status">
                <div
                  onClick={() => {
                    if (!young?.parent2Status) return;
                    setSelectedRepresentant(2);
                  }}
                  className={`cursor-pointer pb-3 ${selectedRepresentant === 2 && "border-b-4 text-[#3B82F6]"} border-[#3B82F6] ${
                    !young?.parent2Status ? "mr-2" : "mr-9"
                  } font-normal`}>
                  Représentant légal 2
                </div>
                {!young?.parent2Status && <ExclamationCircle className="text-white mt-[2px]" fill="red" />}
              </div>
            </div>
            <Representant parent={selectedRepresentant === 1 ? "1" : "2"} young={young} />
          </div>
        </div>
      </div>
      <ReactTooltip id="tooltip-status" className="bg-white shadow-sm text-black" arrowColor="white" disable={false}>
        <div className="text-[black]">Non renseigné</div>
      </ReactTooltip>
    </div>
  );
}

const Field = ({ title, value }) => {
  return (
    <div key={title} className="border-[1px] flex flex-col border-gray-300 p-2 rounded">
      <div className="text-gray-500 text-xs">{title}</div>
      <div className="text-gray-800 text-sm h-[20px]">{value ? value : ""}</div>
    </div>
  );
};

const Representant = ({ parent, young }) => {
  return (
    <div className="mt-1 flex flex-col gap-4">
      <Field title="Statut" value={parent === "1" ? translate(young.parent1Status) : translate(young.parent2Status)} />
      <div className="flex flex-row gap-3 items-end justify-around w-full">
        <div className="w-1/2">
          <Field title="Nom" value={parent === "1" ? young.parent1LastName : young.parent2LastName} />
        </div>
        <div className="w-1/2">
          <Field title="Prénom" value={parent === "1" ? young.parent1FirstName : young.parent2FirstName} />
        </div>
      </div>
      <Field title="Email" value={parent === "1" ? young.parent1Email : young.parent2Email} />
      <Field title="Téléphone" value={parent === "1" ? young.parent1Phone : young.parent2Phone} />
      <Field title="Adresse différente de celle du volontaire" value={parent === "1" ? translate(young.parent1OwnAddress) : translate(young.parent2OwnAddress)} />
      {((parent === "1" && young.parent1OwnAddress === "true") || (parent === "2" && young?.parent2OwnAddress === "true")) && (
        <div className="flex flex-col gap-4">
          <Field title="Adresse" value={parent === "1" ? young.parent1Address : young.parent2Address} />
          <div className="flex flex-row gap-3 items-end justify-around w-full">
            <div className="w-1/2">
              <Field title="Code postal" value={parent === "1" ? young.parent1Zip : young.parent2Zip} />
            </div>
            <div className="w-1/2">
              <Field title="Ville" value={parent === "1" ? young.parent1City : young.parent2City} />
            </div>
          </div>
          <div className="flex flex-row gap-3 items-end justify-around w-full">
            <div className="w-1/2">
              <Field title="Département" value={parent === "1" ? young.parent1Department : young.parent2Department} />
            </div>
            <div className="w-1/2">
              <Field title="Région" value={parent === "1" ? young.parent1Region : young.parent2Region} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
