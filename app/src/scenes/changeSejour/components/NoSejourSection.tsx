import React from "react";
import { Link } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi";
import usePermissions from "@/hooks/usePermissions";

const NoSejourSection = () => {
  const { hasAccessToDesistement, hasAccessToAVenir } = usePermissions();
  return (
    <section className="mt-6 rounded-md border">
      {hasAccessToAVenir ? (
        <Link to="/changer-de-sejour/prevenir-sejour" className="flex p-3 gap-3 justify-between items-center w-full">
          <div>
            <p className="text-sm leading-5 font-medium">Être alerté(e) lors de l’ouverture des inscriptions pour les prochains séjours</p>
            <p className="mt-1 text-sm leading-5 font-normal text-gray-500">Vous recevrez un e-mail </p>
          </div>
          <HiArrowRight className="text-blue-500 flex-none" />
        </Link>
      ) : null}

      {hasAccessToDesistement ? (
        <Link to="/changer-de-sejour/se-desister" className="flex p-3 gap-6 justify-between items-center w-full border-t border-gray-300">
          <div>
            <p className="text-sm leading-5 font-medium">Se désister</p>
            <p className="mt-1 text-sm leading-5 font-normal text-gray-500">Vous ne souhaitez plus participer au séjour</p>
          </div>
          <HiArrowRight className="text-blue-500 flex-none" />
        </Link>
      ) : null}
    </section>
  );
};

export default NoSejourSection;
