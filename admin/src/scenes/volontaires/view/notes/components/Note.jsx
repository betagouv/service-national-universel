import dayjs from "@/utils/dayjs.utils";
import React from "react";
import MoreButton from "./MoreButton";
import { getPhaseLabel } from "../utils";
import quotation from "../../../../../assets/quotation.svg";

const Note = ({ note: { note, phase, createdAt, referent }, isAuthor, actions }) => {
  return (
    <div className="my-4">
      <div className="mb-2 text-[11px] font-medium uppercase text-[#7E858C]">{getPhaseLabel(phase)}</div>
      <div className="flex items-center justify-between rounded-lg bg-[#F3F4F6] py-3 px-4">
        <div className="flex-1">
          <div className="text-[#374151]">
            <div className="flex whitespace-pre-wrap">
              <div className="mr-3 mt-[6px] flex w-2 shrink-0 self-start">
                <img src={quotation} />
                <img src={quotation} />
              </div>
              {note}
            </div>
          </div>
          <div className="mt-1">
            <span className="font-bold">{isAuthor ? "Moi-même" : `${referent.firstName} ${referent.lastName}`}</span>
            {!isAuthor && <span className="font-bold capitalize">{` ${referent.role}`}</span>}
            <span>{` (le ${dayjs(createdAt).format("DD/MM/YYYY HH:mm")})`}</span>
          </div>
        </div>

        {isAuthor && <MoreButton className="ml-3 shrink-0" actions={actions} />}
      </div>
    </div>
  );
};

export default Note;
