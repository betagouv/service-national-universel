import React, { useEffect, useState } from "react";
import { HiChevronRight, HiThumbUp, HiThumbDown, HiOutlineTicket, HiOutlineCalendar } from "react-icons/hi";
import API from "../../../services/api";
import { STATUS } from "../../../constants";
import { SNUPPORT_URL_ADMIN } from "../../../config";
import { toast } from "react-hot-toast";
import { capture } from "../../../sentry";

import { classNames, formatTicketDate } from "../../../utils";
import { serializeTicketUpdate } from "../service";
import { useSelector } from "react-redux";

// eslint-disable-next-line react/display-name
export default ({ ticket, agents }) => {
  const [tab, setTab] = useState(1);
  const [linkOpenTickets, setLinkOpenTickets] = useState([]);
  const [linkClosedTickets, setLinkClosedTickets] = useState([]);
  const [linkPendingTickets, setLinkPendingTickets] = useState([]);
  const [linkNewTickets, setLinkNewTickets] = useState([]);
  const user = useSelector((state) => state.Auth.user);
  const agent = agents.filter((agent) => agent.firstName === "Réponse" && agent.lastName === "Référent")[0];

  useEffect(() => {
    (async () => {
      try {
        if (ticket.contactId) {
          const { ok, data } = await API.get({ path: `/ticket/linkTicket/${ticket.contactId}` });
          if (ok) {
            const openTicket = [];
            const closedTicket = [];
            const pendingTicket = [];
            const newTicket = [];
            data
              .filter((e) => e._id !== ticket._id)
              .map((e) => {
                if (e.status === STATUS.OPEN) openTicket.push(e);
                if (e.status === STATUS.CLOSED) closedTicket.push(e);
                if (e.status === STATUS.NEW) newTicket.push(e);
                if (e.status === STATUS.PENDING) pendingTicket.push(e);
              });
            setLinkClosedTickets(closedTicket);
            setLinkOpenTickets(openTicket);
            setLinkNewTickets(newTicket);
            setLinkPendingTickets(pendingTicket);
          }
        }
        const { ok, data, code } = await API.get({ path: `/ticket/${ticket._id}` });
        if (!ok) return toast.error(code);
        ticket.tags = data?.tags;
      } catch (e) {
        capture(e);
        toast.error(e, "Erreur");
      }
    })();
  }, [ticket]);

  const TabButton = ({ name, tabId }) => (
    <button
      className={classNames(tab == tabId ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500", "h-9 w-full flex-1 border-b-2 bg-white text-xs")}
      onClick={() => setTab(tabId)}
    >
      {name}
    </button>
  );

  const handleAttribute = async (ticket, attribute) => {
    try {
      if (attribute === "REFERENT") {
        ticket.subject = "J'ai une question";
        ticket.formSubjectStep1 = "QUESTION";
        ticket.agentFirstName = agent.firstName;
        ticket.agentLastName = agent.lastName;
        ticket.agentEmail = agent.email;
        ticket.agentId = agent._id;
        ticket.tags.push({
          _id: "63ff039ca302abf2534553b1",
          name: "Réattribution référent",
          __v: 0,
          userVisibility: attribute === "REFERENT" ? "ALL" : "AGENT",
          createdAt: new Date(),
        });
      }
      if (attribute === "SUPPORT") {
        ticket.subject = "J'ai un problème";
        ticket.formSubjectStep1 = "TECHNICAL";
        ticket.agentFirstName = user.firstName;
        ticket.agentLastName = user.lastName;
        ticket.agentEmail = user.email;
        ticket.agentId = user._id;

        const tagIndex = ticket.tags.findIndex((tag) => tag._id === "63ff039ca302abf2534553b1");
        if (tagIndex !== -1) {
          ticket.tags.splice(tagIndex, 1);
        }
      }
      const body = serializeTicketUpdate(ticket);
      const { ok } = await API.patch({ path: `/ticket/${ticket._id}`, body });
      if (ok) {
        toast.success("Ticket mis à jour");
        setTimeout(function () {
          location.reload();
        }, 500);
        return;
      }
      throw new Error("Erreur lors de la mise à jour du ticket");
    } catch (error) {
      capture(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="w-[257px] flex-none overflow-auto border-l border-light-grey bg-gray-50 p-5">
      <div className="mb-4">
        {user.role === "AGENT" ? (
          <div className="flex flex-col">
            <span className="flex flex-row content-center items-center text-center text-[10px] font-medium uppercase text-grey-text">
              Visible référent :
              <div className="text-center">
                {ticket.formSubjectStep1 === "QUESTION" ? <HiThumbUp className="mb-1.5 text-lg text-green-500" /> : <HiThumbDown className="mt-1.5 text-lg text-red-400" />}{" "}
              </div>
            </span>

            <span className="mt-4 text-[10px] font-medium uppercase text-grey-text">Autres tickets liés</span>
          </div>
        ) : (
          <span className="text-[10px] font-medium uppercase text-grey-text">Autres messages</span>
        )}

        <div className="mt-2.5 flex overflow-hidden rounded-lg">
          {user.role === "AGENT" ? <TabButton name="Utilisateur" tabId={1} /> : <TabButton name="Historique" tabId={1} />}
          <div className="h-full border-l border-gray-200" />
          {user.role === "AGENT" && <TabButton name="Thématique" tabId={2} />}
        </div>
      </div>
      {user.role === "AGENT" && (
        <>
          <button
            className="flex h-[40px] w-full cursor-pointer items-center rounded-md border border-gray-300 bg-white  px-4 mb-1 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            onClick={() => handleAttribute(ticket, "REFERENT")}
          >
            <p className="w-full">Attribution référent</p>
          </button>
          <button
            className="flex h-[40px] w-full cursor-pointer items-center rounded-md border border-gray-300 bg-white px-4 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            onClick={() => handleAttribute(ticket, "SUPPORT")}
          >
            <p className="w-full">Attribution Support SNU</p>
          </button>
        </>
      )}

      <div className="py-4">
        {linkOpenTickets.length !== 0 && <LinkTicketComponent tickets={linkOpenTickets} status={"Ouvert"} color={"yellow"} />}
        {linkClosedTickets.length !== 0 && <LinkTicketComponent tickets={linkClosedTickets} status={"Fermé"} color={"green"} />}
        {linkNewTickets.length !== 0 && <LinkTicketComponent tickets={linkNewTickets} status={"Nouveau"} color={"red"} />}
        {linkPendingTickets.length !== 0 && <LinkTicketComponent tickets={linkPendingTickets} status={"En attente"} color={"blue"} />}
      </div>
    </div>
  );
};

const LinkTicketComponent = ({ tickets, status, color }) => {
  return (
    <div className="flex flex-col gap-6">
      <Tag name={status} color={color} />
      {tickets?.map((e, index) => (
        <>
          <TagItem ticket={e} key={index} />
          <hr className="border-gray-300" />
        </>
      ))}
    </div>
  );
};

const Tag = ({ name, color }) => <span className={`mt-3.5 inline-block w-max rounded-full py-0.5 px-2.5 text-xs ${colorStatus(color)}`}>{name}</span>;

const TagItem = ({ ticket }) => (
  <div className="flex items-center hover:cursor-pointer" onClick={() => window.open(`${SNUPPORT_URL_ADMIN}/ticket/${ticket._id}`, "_blank")}>
    <div className="text-sm text-gray-500">
      <div className="flex items-center">
        <HiOutlineTicket className="mr-1" />
        <span className="mr-2">#{ticket?.number}</span>
        <HiOutlineCalendar className="mr-1" />
        <span className="mr-2">{ticket?.createdAt ? formatTicketDate(ticket.createdAt) : ""}</span>
      </div>
      <p className="font-medium">{ticket?.subject}</p>
    </div>
    <HiChevronRight className="flex-none text-xl text-grey-text" />
  </div>
);

function colorStatus(value) {
  if (value === "red") return "text-[#C93D38] bg-[#FFDBD9]";
  if (value === "yellow") return "text-[#92400E] bg-[#FEF3C7]";
  if (value === "blue") return "text-[#324C71] bg-[#9AD2FF]";
  if (value === "green") return "text-[#1F2937] bg-[#D1FAE5]";
  return "";
}
