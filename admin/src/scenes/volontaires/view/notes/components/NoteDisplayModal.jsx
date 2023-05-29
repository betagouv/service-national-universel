import dayjs from "dayjs";
import { Modal } from "reactstrap";

import React from "react";
import { BorderButton } from "../../../../plan-transport/components/Buttons";
import quotation from "../../../../../assets/quotation.svg";
import { getPhaseLabel } from "../utils";

const NoteDisplayModal = ({ notes, isOpen, onClose, user }) => {
  return (
    <Modal isOpen={isOpen} toggle={onClose} centered>
      <div className="w-[512px] p-6">
        <div className="flex max-h-[500px] flex-col items-center overflow-y-auto px-6">
          <div className="mb-3 text-xl font-medium">{`Notes internes${notes[0]?.phase ? ` - ${getPhaseLabel(notes[0].phase)}` : ""}`}</div>
          {notes.map(({ referent, createdAt, note, _id }) => {
            const isAuthor = referent._id === user._id;
            return (
              <div className="w-full" key={_id}>
                <div className="mb-2">
                  <span className="font-bold">{isAuthor ? "Moi-même" : `${referent.firstName} ${referent.lastName}`}</span>
                  {!isAuthor && <span className="font-bold capitalize">{` ${referent.role}`}</span>}
                  <span>{` (le ${dayjs(createdAt).locale("fr").format("DD/MM/YYYY HH:mm")})`}</span>
                </div>
                <div className="mb-3 flex items-center justify-between rounded-lg bg-[#F3F4F6] py-3 px-3">
                  <div className="mr-2 flex self-start">
                    <img src={quotation} />
                    <img src={quotation} />
                  </div>
                  <div className="flex-1">
                    <div className="my-3 whitespace-pre-wrap text-[#374151]">{note}</div>
                  </div>
                  <div className="ml-2 flex rotate-180 self-end">
                    <img src={quotation} />
                    <img src={quotation} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex w-[100%] justify-between bg-white pt-4">
          <BorderButton className="grow" onClick={onClose}>
            Retour
          </BorderButton>
        </div>
      </div>
    </Modal>
  );
};

export default NoteDisplayModal;
