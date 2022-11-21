import dayjs from "dayjs";
import { Modal } from "reactstrap";

import React from "react";
import { BorderButton } from "../../../../plan-transport/components/Buttons";
import quotation from "../../../../../assets/quotation.svg";
import { getPhaseLabel } from "../utils";

const NoteDisplayModal = ({ notes, isOpen, onClose, user }) => {
  return (
    <Modal isOpen={isOpen} toggle={onClose} centered>
      <div className="p-6 w-[512px]">
        <div className="max-h-[500px] overflow-y-auto flex flex-col items-center px-6">
          <div className="text-xl font-medium mb-3">{`Notes internes${notes[0]?.phase ? ` - ${getPhaseLabel(notes[0].phase)}` : ""}`}</div>
          {notes.map(({ referent, createdAt, note, _id }) => {
            const isAuthor = referent._id === user._id;
            return (
              <div className="w-full" key={_id}>
                <div className="mb-2">
                  <span className="font-bold">{isAuthor ? "Moi-même" : `${referent.firstName} ${referent.lastName}`}</span>
                  {!isAuthor && <span className="font-bold capitalize">{` ${referent.role}`}</span>}
                  <span>{` (le ${dayjs(createdAt).locale("fr").format("DD/MM/YYYY HH:mm")})`}</span>
                </div>
                <div className="bg-[#F3F4F6] rounded-lg py-3 px-3 mb-3 flex justify-between items-center">
                  <div className="flex mr-2 self-start">
                    <img src={quotation} />
                    <img src={quotation} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[#374151] my-3 whitespace-pre-wrap">{note}</div>
                  </div>
                  <div className="flex rotate-180 ml-2 self-end">
                    <img src={quotation} />
                    <img src={quotation} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between w-[100%] pt-4 bg-white">
          <BorderButton className="grow" onClick={onClose}>
            Retour
          </BorderButton>
        </div>
      </div>
    </Modal>
  );
};

export default NoteDisplayModal;
