import React from "react";
import { Disclosure } from "@headlessui/react";
import ChevronDown from "../../../assets/icons/ChevronDown";
import ChevronRight from "../../../assets/icons/ChevronRight";

const QuestionBlock = ({ questionText = "", answerText = "", readMoreLink = null }) => {
  return (
    <div className="rounded-lg border-[1px] border-gray-200">
      <Disclosure>
        <Disclosure.Button className="py-[22px] px-6 flex justify-between w-full items-center">
          <span className="font-bold">{questionText}</span>
          <ChevronDown />
        </Disclosure.Button>
        <Disclosure.Panel className="text-gray-500 pb-[22px] px-6">
          {answerText}
          {readMoreLink && (
            <div className="flex justify-end pt-2">
              <a href={readMoreLink} rel="noreferrer" target="_blank" className="d-flex gap-2 items-center text-blue-600 text-xs">
                Lire plus <ChevronRight className="mt-1" />
              </a>
            </div>
          )}
        </Disclosure.Panel>
      </Disclosure>
    </div>
  );
};

export default QuestionBlock;
