import React from "react";
import { HiInformationCircle } from "react-icons/hi";

export default function BandeauInfo() {
  return (
    <div className="mb-6 bg-sky-50 text-sky-600 border-sky-500 p-4 text-sm leading-5 border-l-4 print:hidden">
      <div className="flex">
        <HiInformationCircle className="text-sky-500" size={24} />
        <p className="font-bold ml-3">Vous constatez une différence entre les résultats ?</p>
      </div>
      <p className="font-medium ml-10">
        Les jeunes scolarisés dans votre département sont comptabilisés dans les données du Tableau de Bord. La disparité entre les chiffres affichés et la liste que vous obtenez
        en cliquant provient des jeunes scolarisés dans votre département mais domiciliés dans un autre département.
      </p>
    </div>
  );
}
