import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { HiExternalLink, HiOutlineChatAlt2, HiOutlineClipboardList, HiOutlineDesktopComputer, HiOutlineMail, HiOutlineChat } from "react-icons/hi";
import { LiaHistorySolid } from "react-icons/lia";
import { HiGlobeEuropeAfrica } from "react-icons/hi2";
import ReactTooltip from "react-tooltip";
import plausibleEvent from "@/services/plausible";
import { SNUPPORT_URL_ADMIN } from "@/config";
import TicketAgentDropdownButton from "../../components/TicketAgentDropdownButton";
import { getStatusColor, translateRole, translateParcours, getDotColorClass, formatTicketDate, getDepartmentNumber } from "@/utils";

export default function TableItem({ ticket, update, filter, selectedTicket, setSelectedTicket, agents, referentsDepartment, referentsRegion, user, openTicketPreview }) {
  const sourceToReactIcon = {
    MAIL: { icon: <HiOutlineMail />, color: "#d97706" },
    FORM: { icon: <HiOutlineClipboardList />, color: "#059669" },
    PLATFORM: { icon: <HiOutlineDesktopComputer />, color: "#ec4899" },
    CHAT: { icon: <HiOutlineChat />, color: "black" },
  };

  const lastActivity = useMemo(() => {
    const lastMessageDate = new Date(ticket.updatedAt);
    if (
      lastMessageDate.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }) ===
      new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })
    ) {
      return ("0" + lastMessageDate.getHours()).slice(-2) + ":" + ("0" + lastMessageDate.getMinutes()).slice(-2);
    }
    const difference = Math.abs(new Date().getTime() - lastMessageDate.getTime());
    return Math.ceil(difference / (1000 * 60 * 60 * 24)) === 1
      ? +Math.ceil(difference / (1000 * 60 * 60 * 24)) + " jour"
      : Math.ceil(difference / (1000 * 60 * 60 * 24)) + " jours";
  }, [ticket._id]);

  const startDrag = (ev) => ev.dataTransfer.setData("drag-item", ticket._id);

  return (
    <div
      draggable
      onDragStart={startDrag}
      className="grid cursor-pointer grid-cols-[20px_85px_1fr_225px_160px_20px_20px_20px] items-center gap-5 py-4 px-4 odd:bg-white even:bg-[#F9FAFB] pl-10"
    >
      <div>
        {user.role === "AGENT" && (
          <input
            type="checkbox"
            className="h-6 w-6 rounded border-gray-300 text-indigo-600"
            checked={selectedTicket?.includes(ticket._id)}
            onClick={(e) => e.stopPropagation()}
            onChange={() => {
              if (selectedTicket?.includes(ticket._id)) setSelectedTicket(selectedTicket?.filter((t) => ticket._id !== t));
              else setSelectedTicket([...selectedTicket, ticket._id]);
            }}
          />
        )}
      </div>
      <div className="flex flex-col gap-2.5">
        <span className={`rounded-full px-2.5 py-0.5 text-center text-xs font-medium ${getStatusColor(ticket.status)}`}>#{ticket.number}</span>
      </div>
      <Link to={`/ticket/${ticket._id}`}>
        <h6 className="mb-2 text-gray-500">
          <span className="font-bold text-gray-900 mr-2 ">{ticket.contactFirstName ? ticket.contactFirstName + " " + ticket.contactLastName : ticket.contactEmail}</span>{" "}
          <span className="border border-gray-200 rounded-xl bg-gray-100 px-2 py-1  text-gray-900 text-sm">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${getDotColorClass(ticket?.contactGroup, ticket?.parcours)} mr-1`}></span>
            {ticket?.parcours ? `${translateRole[ticket?.contactGroup]} ${translateParcours[ticket?.parcours]}` : translateRole[ticket?.contactGroup]}
          </span>
        </h6>
        <p className="text-gray-500 line-clamp-1">
          <span className="font-semibold">{ticket.type}</span> <span className="font-medium">{ticket.subject}</span>
        </p>
      </Link>
      <div>
        <div className={` flex flex-col  items-start  ${user.role === "DG" && "opacity-50 pointer-events-none"}`}>
          {user.role === "AGENT" && (
            <TicketAgentDropdownButton
              ticket={ticket}
              selectedTicket={selectedTicket}
              setSelectedTicket={setSelectedTicket}
              setTicket={() => {
                update(filter);
                plausibleEvent("List Tickets/CTA - Change agent");
              }}
              agents={agents}
              role={"AGENT"}
            />
          )}
          {(user.role === "AGENT" || user.role === "REFERENT_REGION") && (
            <TicketAgentDropdownButton
              ticket={ticket}
              selectedTicket={selectedTicket}
              setSelectedTicket={setSelectedTicket}
              setTicket={() => {
                update(filter);
                plausibleEvent("List Tickets/CTA - Change Referent region");
              }}
              agents={referentsRegion}
              role={"REFERENT_REGION"}
            />
          )}
          <TicketAgentDropdownButton
            ticket={ticket}
            selectedTicket={selectedTicket}
            setSelectedTicket={setSelectedTicket}
            setTicket={() => {
              update(filter);
              plausibleEvent("List Tickets/CTA - Change Referent department");
            }}
            agents={referentsDepartment}
            role={"REFERENT_DEPARTMENT"}
          />
        </div>
      </div>
      <div>
        <div className="mb-1 flex items-center gap-1.5">
          <span
            className="text-2xl"
            style={{ color: ticket.source && sourceToReactIcon[ticket.source] ? sourceToReactIcon[ticket.source].color : "inherit" }}
            data-tip="Date de création"
            data-for="createdAt-tooltip"
          >
            {ticket.source && sourceToReactIcon[ticket.source] ? sourceToReactIcon[ticket.source].icon : ""}
          </span>
          <ReactTooltip id="createdAt-tooltip" type="dark" place="top" effect="solid" className="custom-tooltip-radius !shadow-sm !text-white !text-xs !font-medium" />

          <span className="text-sm text-gray-900 ml-0.5">{formatTicketDate(ticket?.createdAt)}</span>
        </div>
        <div className="flex items-center text-2xl mb-1 text-gray-400">
          <LiaHistorySolid data-tip="Dernière activité" data-for="lastActivity-tooltip" />
          <ReactTooltip id="lastActivity-tooltip" type="dark" place="top" effect="solid" className="custom-tooltip-radius !shadow-sm !text-white !text-xs !font-medium" />
          <span className="text-sm text-gray-900 ml-2">{lastActivity}</span>
        </div>
        <div className="flex items-center space-x-1 mb-1">
          <span className="w-6 h-6 bg-gray-100 flex justify-center items-center rounded-full text-sm font-medium mr-1">{ticket.messageCount}</span>
          <span className="text-gray-900 text-sm">message{ticket.messageCount > 1 && "s"}</span>
        </div>
        {ticket?.contactDepartment && (
          <>
            <div className="flex items-center space-x-1">
              <HiGlobeEuropeAfrica data-tip="Département" data-for="department-tooltip" size={24} className="text-gray-400" />
              <ReactTooltip id="department-tooltip" type="dark" place="top" effect="solid" className="custom-tooltip-radius !shadow-sm !text-white !text-xs !font-medium" />
              <p className="text-gray-900 text-sm">{`${getDepartmentNumber(ticket.contactDepartment)} - ${ticket.contactDepartment}`}</p>
            </div>
          </>
        )}
      </div>
      <div className="flex w-24">
        {user.role === "AGENT" && (
          <button
            onClick={() => {
              plausibleEvent("List Tickets/CTA - Open preview");
              openTicketPreview(ticket);
            }}
            className="bg-gray-100 rounded-full p-2 inline-flex items-center justify-center  mr-3"
            style={{ width: "40px", height: "40px" }}
            data-tip="Vue réduite"
            data-for="reducedView-tooltip"
          >
            <HiOutlineChatAlt2 className="text-xl text-gray-500" />
            <ReactTooltip id="reducedView-tooltip" type="dark" place="top" effect="solid" className="custom-tooltip-radius !shadow-sm !text-white !text-xs !font-medium" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            plausibleEvent("List Tickets/CTA - Open in window");
            window.open(`${SNUPPORT_URL_ADMIN}/ticket/${ticket._id}`, "_blank");
          }}
          className="bg-gray-100 rounded-full p-2 inline-flex items-center justify-center"
          style={{ width: "40px", height: "40px" }}
          data-tip="Nouvel onglet"
          data-for="newTab-tooltip"
        >
          <HiExternalLink className="text-xl text-gray-500" />
        </button>
        <ReactTooltip id="newTab-tooltip" type="dark" place="top" effect="solid" className="custom-tooltip-radius !shadow-sm !text-white !text-xs !font-medium" />
      </div>
    </div>
  );
}
