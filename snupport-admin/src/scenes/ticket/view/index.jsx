import React, { useEffect, useState, useMemo } from "react";
import { HiGlobeEuropeAfrica } from "react-icons/hi2";
import { toast } from "react-hot-toast";
import { HiOutlineChevronLeft, HiOutlineDesktopComputer, HiOutlineTicket, HiOutlineMail, HiOutlineCalendar } from "react-icons/hi";
import { LiaHistorySolid } from "react-icons/lia";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory, useParams } from "react-router-dom";
import ChangeTicketNameModal from "../components/ChangeTicketNameModal";
import DeleteTicketModal from "../components/DeleteTicketModal";
import ReactTooltip from "react-tooltip";

import Loader from "../../../components/Loader";
import { FEEDBACK, STATUS } from "../../../constants";
import API from "../../../services/api";
import { getDocumentTitle, getStatusColor, translateFeedback, translateRole, translateState, formatTicketDate, getDepartmentNumber } from "../../../utils";
import TicketAgentDropdownButton from "../components/TicketAgentDropdownButton";
import { setOrganisation, setUser } from "../../../redux/auth/actions";
import Left from "./left";
import Right from "./right";
import Thread from "../components/Thread";
import { serializeTicketUpdate } from "../service";

export default () => {
  const { id: ticketId } = useParams();
  const [ticket, setTicket] = useState();
  const [agents, setAgents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tags, setTags] = useState([]);
  const [referentsDepartment, setReferentsDepartment] = useState([]);
  const [referentsRegion, setReferentsRegion] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewingAgents, setViewingAgents] = useState([]);
  const [signature, setSignature] = useState(null);
  const history = useHistory();
  const user = useSelector((state) => state.Auth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (ticket) {
      document.title = `${ticket.contactFirstName} ${ticket.contactLastName} ${translateRole[ticket.contactGroup]} - ${getDocumentTitle()}`;
    }
  }, [ticket]);

  async function getViewingAgents(id) {
    if (!id) return;

    const currentPage = location.pathname;

    await API.put({ path: `/ticket/viewing/${id}`, body: { isViewing: true } });
    const interval = setInterval(async function () {
      if (location.pathname !== currentPage || !ticketId) {
        clearInterval(interval);
        await API.put({ path: `/ticket/viewing/${id}`, body: { isViewing: false } });
        return;
      } else {
        const { ok, data, status } = await API.get({ path: `/ticket/viewing/${id}` });
        if (status === 401) {
          dispatch(setUser(null));
          dispatch(setOrganisation(null));
          API.setToken("");
        }
        if (ok) {
          const filteredAgents = data.filter((agent, index, array) => {
            const isNotDuplicate = agent.email !== user.email;
            const isFirstOccurrence = array.findIndex((a) => a.email === agent.email) === index;
            return isNotDuplicate && isFirstOccurrence;
          });
          setViewingAgents(filteredAgents);
        }
      }
    }, 5000);
  }

  useEffect(() => {
    if (!user) return;

    getViewingAgents(ticketId);
  }, [user]);

  useEffect(() => {
    update();
    if (!agents.length) getAgents();
  }, [ticketId]);

  const getAgents = async () => {
    try {
      const { ok, data } = await API.get({ path: `/agent/` });
      if (ok) {
        setAgents(data.AGENT);
        setReferentsDepartment(data.REFERENT_DEPARTMENT);
        setReferentsRegion(data.REFERENT_REGION);
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  const update = async () => {
    try {
      const { ok, data, code } = await API.get({ path: `/ticket/${ticketId}` });
      if (!ok) {
        toast.error(code);
        return history.push("/ticket");
      }
      if (user.role === "AGENT") {
        const response = await API.get({ path: `/shortcut`, query: { signatureDest: data.ticket.contactGroup } });
        setSignature(response.data?.content);
      }
      setTags(data.tags);
      setTicket(data.ticket);
      console.log("TICKET", data);
    } catch (e) {
      toast.error(e, "Erreur");
    }
  };

  if (!ticket) return <Loader />;

  return (
    <div className="inset-0 flex h-full flex-col bg-gray-100">
      <Header
        ticket={ticket}
        setTicket={setTicket}
        deleteModalOpen={deleteModalOpen}
        setDeleteModalOpen={setDeleteModalOpen}
        agents={agents}
        referentsRegion={referentsRegion}
        referentsDepartment={referentsDepartment}
        user={user}
      />
      <div className="flex h-full justify-between bg-white">
        <Left ticket={ticket} setTicket={setTicket} tags={tags} setTags={setTags} agents={agents} />
        <Thread
          ticket={ticket}
          user={user}
          setTicket={setTicket}
          updateTicket={update}
          ticketId={ticketId}
          viewingAgents={viewingAgents}
          signature={signature}
          className="mb-7"
          messages={messages}
          setMessages={setMessages}
          agents={agents}
        />
        <Right ticket={ticket} agents={agents} />
      </div>
    </div>
  );
};

const Header = ({ ticket, setTicket, deleteModalOpen, setDeleteModalOpen, agents, referentsDepartment, referentsRegion, user }) => {
  const [changeTicketNameModalOpen, setChangeTicketNameModalOpen] = useState(false);
  const history = useHistory();

  const handleChangeStatus = async (status) => {
    try {
      const body = serializeTicketUpdate({ status });
      const { ok, data } = await API.patch({ path: `/ticket/${ticket._id}`, body });
      if (!ok) return toast.error("Erreur lors de la mise à jour du statut");
      setTicket(data.ticket);
      toast.success("Statut modifié");
      if (status === "CLOSED") history.push("/ticket");
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeCanal = async (canal) => {
    try {
      const body = serializeTicketUpdate({ canal });
      const { ok, data } = await API.patch({ path: `/ticket/${ticket._id}`, body });
      if (!ok) return toast.error("Erreur lors de la mise à jour du canal");
      setTicket(data.ticket);
      console.log(data);
      toast.success("Canal modifié");
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeFeedback = async (feedback) => {
    try {
      const body = serializeTicketUpdate({ feedback });
      const { ok, data } = await API.patch({ path: `/ticket/${ticket._id}`, body });
      if (!ok) return toast.error("Erreur lors de la mise à jour du feedback");
      setTicket(data.ticket);
      toast.success("Feedback modifié");
    } catch (e) {
      console.error(e);
    }
  };
  const canalToReactIcon = {
    MAIL: <HiOutlineMail />,
    PLATFORM: <HiOutlineDesktopComputer />,
  };

  const lastActivity = useMemo(() => {
    const lastMessageDate = new Date(ticket.updatedAt);
    if (
      lastMessageDate.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }) ===
      new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })
    ) {
      return ("0" + lastMessageDate.getHours()).slice(-2) + ":" + ("0" + lastMessageDate.getMinutes()).slice(-2);
    }
    const difference = Math.abs(new Date() - lastMessageDate);
    return Math.ceil(difference / (1000 * 60 * 60 * 24)) === 1
      ? +Math.ceil(difference / (1000 * 60 * 60 * 24)) + " jour"
      : Math.ceil(difference / (1000 * 60 * 60 * 24)) + " jours";
  }, [ticket._id]);
  return (
    <div className={`flex items-center justify-between border-b border-t border-gray-300 bg-white pl-7 pr-5 ${user.role === "AGENT" ? "pt-[22px]" : "pt-2"} pb-5`}>
      <div className="flex items-center gap-7">
        <Link to="/ticket" className="text-2xl text-grey-text">
          <HiOutlineChevronLeft />
        </Link>
        <div>
          <div className="flex">
            <select
              onChange={(e) => handleChangeStatus(e.target.value)}
              className={`rounded-full px-2.5 py-0.5 border-gray-200 text-center text-xs font-medium w-[110px] mr-2 cursor-pointer ${getStatusColor(ticket.status)} `}
              disabled={user.role === "DG"}
            >
              {Object.values(STATUS)
                .filter((v) => v !== "TOTREAT")
                .map((key) => (
                  <option key={key} value={key} selected={key === ticket?.status}>
                    {translateState[STATUS[key]]}
                  </option>
                ))}
            </select>
            {user.role === "AGENT" && (
              <>
                <p className="relative mr-[-30px] ml-[30px] pt-1.5">
                  <span style={{ fontSize: "16px", color: "#4B5563" }}>{canalToReactIcon[ticket.canal]}</span>
                </p>
                <select
                  onChange={(e) => handleChangeCanal(e.target.value)}
                  className="rounded-full px-2.5 py-0.5 border-gray-200 text-center text-xs font-medium w-[130px] mr-2 bg-gray-100 cursor-pointer"
                  value={ticket.canal}
                >
                  <option value="MAIL">E-mail</option>
                  <option value="PLATFORM">Plateforme</option>
                </select>
              </>
            )}
            <div className="flex mt-1 ml-2">
              <HiOutlineTicket className="text-lg mr-1 text-gray-500" />
              <span className="mb-1 text-sm text-gray-900 mr-2">{`#${ticket.number}`}</span>
              <HiOutlineCalendar className="text-lg mr-1 text-gray-500" data-tip="Date de création" data-for="createdAt-tooltip" />
              <ReactTooltip id="createdAt-tooltip" type="dark" place="top" effect="solid" className="custom-tooltip-radius !shadow-sm !text-white !text-xs !font-medium" />
              <span className="mb-1 text-sm text-gray-900 mr-2">{ticket?.createdAt ? formatTicketDate(ticket.createdAt) : ""}</span>
              <LiaHistorySolid className="text-lg mr-1 text-gray-500" data-tip="Dernière activité" data-for="lastActivity-tooltip" />
              <ReactTooltip id="lastActivity-tooltip" type="dark" place="top" effect="solid" className="custom-tooltip-radius !shadow-sm !text-white !text-xs !font-medium" />
              <span className="mb-1 text-sm text-gray-900 mr-2">{lastActivity}</span>
              {ticket?.contactDepartment && (
                <>
                  <HiGlobeEuropeAfrica data-tip="Département" data-for="department-tooltip" size={18} className="text-gray-400 mr-1" />
                  <ReactTooltip id="department-tooltip" type="dark" place="top" effect="solid" className="custom-tooltip-radius !shadow-sm !text-white !text-xs !font-medium" />
                  <p className="text-gray-900 text-sm">{`${getDepartmentNumber(ticket.contactDepartment)} - ${ticket.contactDepartment}`}</p>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <h6 className="text-lg font-bold text-gray-900">{ticket?.subject}</h6>
            {user.role === "AGENT" && (
              <ChangeTicketNameModal
                open={changeTicketNameModalOpen}
                setOpen={setChangeTicketNameModalOpen}
                ticket={ticket}
                setTicket={setTicket}
                onClick={() => setChangeTicketNameModalOpen(true)}
              />
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <div className={`flex flex-col  ${user.role === "DG" && "opacity-50 pointer-events-none"}`}>
          {user.role === "AGENT" && <TicketAgentDropdownButton setTicket={setTicket} ticket={ticket} agents={agents} role={"AGENT"} />}
          {(user.role === "AGENT" || user.role === "REFERENT_REGION") && (
            <TicketAgentDropdownButton setTicket={setTicket} ticket={ticket} agents={referentsRegion} role={"REFERENT_REGION"} />
          )}
          <TicketAgentDropdownButton setTicket={setTicket} ticket={ticket} agents={referentsDepartment} role={"REFERENT_DEPARTMENT"} />
        </div>
        {/* TODO Color */}
        {user.role === "AGENT" && (
          <select
            className=" ml-6 flex h-10 gap-9 rounded-md border-b border-gray-200 text-sm text-gray-500 transition-colors"
            onChange={(e) => handleChangeFeedback(e.target.value)}
          >
            {Object.values(FEEDBACK).map((key) => (
              <option key={key} value={key} selected={key === ticket?.feedback}>
                {translateFeedback[FEEDBACK[key]]}
              </option>
            ))}
          </select>
        )}
        {user.role === "AGENT" && (
          <div className="ml-3">
            <DeleteTicketModal
              open={deleteModalOpen}
              setOpen={setDeleteModalOpen}
              ticket={ticket}
              update={() => {
                history.push("/ticket");
              }}
              filter={""}
              onClick={(e) => {
                e.stopPropagation();
                setDeleteModalOpen(true);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
