import React from "react";
import { HiChevronDown, HiX } from "react-icons/hi";
import { getStatusColor, roleInitial } from "../../../../utils";
import Avatar from "../../../../components/Avatar";
import { getMinHeight } from "./utils";

const TicketPreviewList = ({ isOpen, toggleOpen, tickets, onOpen, onClose }) => {
  return (
    <div className={`transition-all ${isOpen ? "w-[260px]" : "w-[80px]"} rounded-t-lg bg-[#32257F] text-sm font-semibold shadow-xl`}>
      <div onClick={toggleOpen} className="flex h-[44px] cursor-pointer items-center justify-between px-3">
        <div className="flex items-center">
          <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white font-bold">{tickets.length}</span>
          {isOpen && <span className="ml-4 text-white">Tickets affichés</span>}
        </div>
        <HiChevronDown className={`transition-transform ${isOpen ? "rotate-0" : "rotate-180"}`} color="#C7D2FE" size={20} />
      </div>
      <ul className={`h-0 overflow-scroll bg-white transition-all ${isOpen ? getMinHeight(tickets.length) : "min-h-0"}`}>
        {tickets.map(({ contactFirstName, contactLastName, contactEmail, isOpen, _id, status, contactGroup }) => (
          <li
            onClick={() => {
              onOpen(_id);
            }}
            key={_id}
            className={`relative h-[80px] cursor-pointer border-b border-gray-200 ${isOpen ? "bg-[#EEEFFE]" : "bg-white"} text-purple-snu`}
          >
            <div className="group flex h-full items-center px-3">
              <Avatar className="mr-3" email={contactEmail} color={getStatusColor(status)} initials={roleInitial[contactGroup]} />
              <div className="flex-1 truncate">{contactFirstName && contactLastName ? `${contactFirstName} ${contactLastName.toUpperCase()}` : contactEmail} </div>
              <div className="w-[24px]">
                <button
                  className="hidden rounded-full bg-gray-100 !p-1 group-hover:block"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose(_id);
                  }}
                >
                  <HiX size={16} />
                </button>
              </div>
            </div>
            {isOpen && (
              <div className="absolute -bottom-[1px] -right-[5px] h-0 w-0 -rotate-45 border-l-[8px] border-r-[8px] border-t-[8px] border-t-purple-snu border-l-[transparent] border-r-[transparent]" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TicketPreviewList;
