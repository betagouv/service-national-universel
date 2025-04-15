import React from "react";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { HiChevronDown, HiChevronRight } from "react-icons/hi";

type Props = {
  questionText: string | React.ReactNode;
  answerText: string | React.ReactNode;
  readMoreLink?: string | null;
};

const QuestionBlock = ({ questionText = "", answerText = "", readMoreLink = null }: Props) => {
  return (
    <div className="rounded-lg border-[1px] border-gray-200">
      <Disclosure>
        <DisclosureButton className="flex w-full items-center justify-between gap-2 py-[22px] px-6">
          <span className="text-left font-bold">{questionText}</span>
          <span className="min-w-[9px] text-gray-400">
            <HiChevronDown className="h-5 w-5" />
          </span>
        </DisclosureButton>
        <DisclosurePanel className="px-6 pb-[22px] text-gray-900">
          {answerText}
          {readMoreLink && (
            <div className="flex justify-end pt-2">
              <a href={readMoreLink} rel="noreferrer" target="_blank" className="d-flex items-center gap-2 text-xs text-blue-600">
                Lire plus
                <HiChevronRight className="h-4 w-4" />
              </a>
            </div>
          )}
        </DisclosurePanel>
      </Disclosure>
    </div>
  );
};

export default QuestionBlock;
