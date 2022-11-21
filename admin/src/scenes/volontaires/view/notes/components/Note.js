import dayjs from "dayjs";
import React from "react";
import MoreButton from "./MoreButton";
import { getPhaseLabel } from "../utils";
import quotation from "../../../../../assets/quotation.svg";

const Note = ({ note: { note, phase, createdAt, referent }, isAuthor, actions }) => {
  return (
    <div className="my-4">
      <div className="uppercase text-[11px] text-[#7E858C] font-medium mb-2">{getPhaseLabel(phase)}</div>
      <div className="bg-[#F3F4F6] rounded-lg py-3 px-4 flex justify-between items-center">
        <div className="flex-1">
          <div className="text-[#374151]">
            <div className="flex whitespace-pre-wrap">
              <div className="flex mr-3 mt-[6px] shrink-0 w-2 self-start">
                <img src={quotation} />
                <img src={quotation} />
              </div>
              {note}
            </div>
          </div>
          <div className="mt-1">
            <span className="font-bold">{isAuthor ? "Moi-même" : `${referent.firstName} ${referent.lastName}`}</span>
            {!isAuthor && <span className="font-bold capitalize">{` ${referent.role}`}</span>}
            <span>{` (le ${dayjs(createdAt).locale("fr").format("DD/MM/YYYY HH:mm")})`}</span>
          </div>
        </div>

        {isAuthor && <MoreButton className="shrink-0 ml-3" actions={actions} />}
      </div>
    </div>
  );
};

export default Note;
