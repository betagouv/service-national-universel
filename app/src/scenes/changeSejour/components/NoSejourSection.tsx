import React from "react";
import { Link } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi";

const NoSejourSection = () => {
  return (
    <section className="mt-6 rounded-md border border-gray-500">
      <Link to="/changer-de-sejour/prevenir-sejour" className="flex py-3 px-2 justify-between items-center w-full">
        <div className="flex flex-col items-start text-start">
          <p className="text-sm leading-5 font-medium">Être alerté(e) lors de l’ouverture des inscriptions pour les prochains séjours</p>
          <p className="mt-1 text-sm leading-5 font-normal text-[#6B7280]">Vous recevrez un e-mail </p>
        </div>
        <HiArrowRight className="text-blue-500 flex-none mt-0.5 mr-2" />
      </Link>
      <Link to="/changer-de-sejour/se-desister" className="flex py-3 px-2 justify-between items-center w-full border-t border-gray-300">
        <div className="flex flex-col items-start text-start">
          <p className="text-sm leading-5 font-medium">Se désister</p>
          <p className="mt-1 text-sm leading-5 font-normal text-[#6B7280]">Vous ne souhaitez plus participer au séjour</p>
        </div>
        <HiArrowRight className="text-blue-500 flex-none mt-0.5 mr-2" />
      </Link>
    </section>
  );
};

export default NoSejourSection;
