import React from "react";
import { Disclosure } from "@headlessui/react";
import ChevronDown from "../../../assets/icons/ChevronDown";
import ChevronRight from "../../../assets/icons/ChevronRight";

const QuestionBlock = ({ questionText = "", answerText = "", readMoreLink = null }) => {
  return (
    <div className="rounded-lg border-[1px] border-gray-200">
      <Disclosure>
        <Disclosure.Button className="flex w-full items-center justify-between gap-2 py-[22px] px-6">
          <span className="text-left font-bold">{questionText}</span>
          <span className="min-w-[9px] text-gray-400">
            <ChevronDown />
          </span>
        </Disclosure.Button>
        <Disclosure.Panel className="px-6 pb-[22px] text-gray-900">
          {answerText}
          {readMoreLink && (
            <div className="flex justify-end pt-2">
              <a href={readMoreLink} rel="noreferrer" target="_blank" className="d-flex items-center gap-2 text-xs text-blue-600">
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
