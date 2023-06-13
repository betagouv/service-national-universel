import React from "react";
import { FiChevronLeft } from "react-icons/fi";

export default function SignupButtonContainer({ onClickNext, onClickPrevious, labelNext = "Continuer", labelPrevious = "Précédent", disabled = false, collapsePrevious = false }) {
  return (
    <div className="fixed bottom-0 left-0 mx-auto w-full bg-white py-4 px-[1rem] shadow-ninaInverted md:relative md:px-0 md:shadow-none ">
      <hr className="mb-8 hidden h-px border-0 bg-gray-200 md:block" />
      <div className={`flex ${!collapsePrevious && "flex-col-reverse md:flex-row"} justify-center gap-2 md:justify-end`}>
        {onClickPrevious && (
          <button
            className={`${
              collapsePrevious ? "w-auto" : "w-full md:w-auto"
            } flex items-center justify-center border-[1px] border-blue-france-sun-113 py-2 px-4 text-blue-france-sun-113 hover:border-blue-france-sun-113-hover hover:text-blue-france-sun-113-hover`}
            onClick={onClickPrevious}>
            {onClickNext && collapsePrevious ? <FiChevronLeft className="block md:hidden" /> : <p className="block w-64 md:hidden">{labelPrevious}</p>}
            <p className="hidden md:block">{labelPrevious}</p>
          </button>
        )}
        {onClickNext && (
          <button
            className="flex w-full items-center justify-center bg-blue-france-sun-113 py-2 px-4 text-white hover:bg-blue-france-sun-113-hover disabled:bg-grey-925 disabled:text-grey-625 md:w-auto"
            onClick={onClickNext}
            disabled={disabled}>
            {labelNext}
          </button>
        )}
      </div>
    </div>
  );
}
