import React from "react";
import { FiChevronLeft } from "react-icons/fi";

export default function SignupButtonContainer({ onClickNext, onClickPrevious, labelNext = "Continuer", labelPrevious = "Précédent", disabled = false }) {
  return (
    <div className="w-full mx-auto fixed md:relative bottom-0 left-0 bg-white shadow-ninaInverted md:shadow-none py-4 px-[1rem] md:px-0 ">
      <hr className="mb-8 h-px bg-gray-200 border-0 hidden md:block" />
      <div className={`flex ${labelPrevious && "flex-col-reverse md:flex-row"} justify-center md:justify-end gap-2`}>
        {onClickPrevious && (
          <button
            className={`${
              labelNext ? "w-full md:w-auto" : "w-auto"
            } flex items-center justify-center py-2 px-4 text-blue-france-sun-113 hover:text-blue-france-sun-113-hover border-[1px] border-blue-france-sun-113 hover:border-blue-france-sun-113-hover`}
            onClick={onClickPrevious}>
            {onClickNext && !labelPrevious ? <FiChevronLeft className="block md:hidden" /> : <p className="w-64 block md:hidden">{labelPrevious}</p>}
            <p className="hidden md:block">{labelPrevious}</p>
          </button>
        )}
        {onClickNext && (
          <button
            className="w-full md:w-auto flex items-center justify-center py-2 px-4 text-white bg-blue-france-sun-113 hover:bg-blue-france-sun-113-hover disabled:bg-grey-925 disabled:text-grey-625"
            onClick={onClickNext}
            disabled={disabled}>
            {labelNext}
          </button>
        )}
      </div>
    </div>
  );
}
