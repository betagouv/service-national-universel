import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiChevronDown, HiExternalLink, HiX, HiMail, HiLocationMarker, HiHashtag, HiThumbUp, HiThumbDown, HiDuplicate, HiChevronUp, HiCheck } from "react-icons/hi";
import API from "../../../../services/api";
import Avatar from "../../../../components/Avatar";
import TagsEditor from "../../../../components/TagEditor";
import Thread from "../Thread";
import { useDispatch, useSelector } from "react-redux";
import { updateTicket } from "../../../../redux/ticketPreview/actions";
import { getStatusColor, roleInitial, sourceToIcon, translateState } from "../../../../utils";
import { STATUS } from "../../../../constants";
import { capture } from "../../../../sentry";
import { serializeTicketUpdate } from "../../service";

const TicketPreview = ({ isOpen, openInNewTab, toggleOpen, onClose, ticketId, user }) => {
  const dispatch = useDispatch();
  const [isHeaderOpen, setHeaderOpen] = useState(true);
  const [isStatusPickerOpen, setIsStatusPickerOpen] = useState(false);
  const { ticket, tags, signature, messages } = useSelector((state) => {
    return state.TicketPreview.tickets.find(({ ticket }) => ticket._id === ticketId);
  });

  useEffect(() => {
    getData();
  }, []);

  const handleChangeStatus = async (status) => {
    try {
      const body = serializeTicketUpdate({ status });
      const { ok } = await API.patch({ path: `/ticket/${ticket._id}`, body });
      if (!ok) throw new Error("Erreur lors de la mise à jour du statut");
      getData();
      setIsStatusPickerOpen(!isStatusPickerOpen);
      toast.success("Statut modifié");
      if (status === "CLOSED");
    } catch (e) {
      capture(e);
      toast.error(e.message);
    }
  };

  const getData = async () => {
    try {
      const { ok, data, code } = await API.get({ path: `/ticket/${ticketId}` });
      if (!ok) return toast.error(code);
      if (user.role === "AGENT") {
        const response = await API.get({ path: `/shortcut`, query: { signatureDest: data.ticket.contactGroup } });
        dispatch(updateTicket(ticketId, { ticket: data.ticket, tags: data.tags, signature: response.data?.content }));
      } else {
        dispatch(updateTicket({ ticket: data.ticket, tags: data.tags }));
      }
    } catch (e) {
      toast.error("Une error est survenue");
    }
  };

  const updateTags = async (callback) => {
    const updatedTags = callback(tags);
    try {
      const body = serializeTicketUpdate({ tags: updatedTags });
      const { ok, data } = await API.patch({ path: `/ticket/${ticketId}`, body });
      if (!ok) return toast.error(updatedTags.length > tags.length ? "Erreur lors de l'ajout du tag" : "Erreur lors de la suppression du tag");
      dispatch(updateTicket(ticketId, { ticket: data.ticket, tags: data.tags }));
      toast.success(updatedTags.length > tags.length ? "Tag ajouté" : "Tag supprimé");
    } catch (e) {
      return toast.error(updatedTags.length > tags.length ? "Erreur lors de l'ajout du tag" : "Erreur lors de la suppression du tag");
    }
  };

  const setMessages = (messages) => {
    dispatch(updateTicket(ticketId, { messages }));
  };

  const { contactFirstName, contactLastName, contactEmail, contactDepartment, contactRegion, subject, status, contactGroup, contactAttributes, canal } = ticket;

  const contactProfile = contactAttributes.filter((contactAttribute) => contactAttribute?.name === "lien vers profil");

  return (
    <div className={`transition-all ${isOpen ? "w-[500px]" : "w-[260px]"} rounded-t-lg shadow-xl`}>
      <div onClick={toggleOpen} className="flex h-[44px] cursor-pointer items-center justify-between rounded-t-lg bg-snu-purple-200 pl-3 text-sm font-semibold text-white">
        <Avatar email={contactEmail} className="mr-4 h-7 w-7" color={getStatusColor(status)} initials={roleInitial[contactGroup]} />
        <div className="flex-1">
          {contactProfile && contactProfile.length !== 0 ? (
            <button
              className="cursor-pointer truncate text-sm font-semibold text-white underline"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`${contactProfile[0].value}`, "_blank");
              }}
            >
              {contactFirstName && contactLastName ? `${contactFirstName} ${contactLastName.toUpperCase()}` : contactEmail}
            </button>
          ) : (
            <span className="truncate">{contactFirstName && contactLastName ? `${contactFirstName} ${contactLastName.toUpperCase()}` : contactEmail}</span>
          )}
        </div>

        <HiChevronDown className={`transition-transform ${isOpen ? "rotate-0" : "rotate-180"} mr-1`} color="#C7D2FE" size={20} />
        <button
          onClick={(e) => {
            e.stopPropagation();
            openInNewTab();
          }}
          className="h-full px-1"
        >
          <HiExternalLink color="#C7D2FE" size={20} />
        </button>
        <button onClick={onClose} className="h-full pl-1 pr-3">
          <HiX color="#C7D2FE" size={20} />
        </button>
      </div>
      <div className={`h-0 transition-all ${isOpen ? "min-h-[700px]" : "min-h-0"} flex flex-col`}>
        <div className=" flex flex-col bg-gray-100 pt-1 text-[13px] text-purple-snu">
          {isHeaderOpen && (
            <div className="flex flex-col gap-2 px-3 pt-2">
              <div className="relative flex flex-row">
                <HiMail size={20} className="mr-2" />
                <div className="flex">
                  <span className="flex">{contactEmail}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(contactEmail);
                      toast.success("Copié!");
                    }}
                  >
                    <HiDuplicate size={20} className="ml-2" />
                  </button>
                </div>
                <div
                  className={`absolute right-0 flex w-[100px] cursor-pointer justify-center rounded-md ${getStatusColor(ticket.status)}`}
                  onClick={() => setIsStatusPickerOpen(!isStatusPickerOpen)}
                >
                  <p>{translateState[STATUS[ticket.status]]}</p>
                  {isStatusPickerOpen ? <HiChevronDown className="text-xl font-semibold" /> : <HiChevronUp className="text-xl font-semibold" />}
                </div>

                {isStatusPickerOpen && (
                  <div className="absolute right-0 mt-6 w-[100px] cursor-pointer rounded-md border border-gray-100  bg-white p-2 text-center">
                    {Object.values(STATUS)
                      .filter((v) => v !== "TOTREAT")
                      .map((key) => (
                        <div key={key} onClick={() => handleChangeStatus(key)} className="flex flex-row rounded-md hover:bg-blue-300">
                          {key === ticket.status ? <HiCheck className="flex self-center text-base font-semibold" /> : <HiCheck className="invisible text-base font-semibold" />}
                          {translateState[STATUS[key]]}
                        </div>
                      ))}
                  </div>
                )}
              </div>
              {(contactDepartment || contactRegion) && (
                <div className="flex">
                  <HiLocationMarker size={20} className="mr-2" />
                  {contactDepartment && contactRegion
                    ? `${contactDepartment} / ${contactRegion}`
                    : `${contactDepartment ? contactDepartment : ""}${contactRegion ? contactRegion : ""} `}
                </div>
              )}
              <div className="flex items-center">
                <span className="mr-2 w-[20px]">{sourceToIcon[canal]}</span>
                <span className="mr-2 flex-1 truncate">{subject}</span>
                <span>{ticket.formSubjectStep1 === "QUESTION" ? <HiThumbUp size={20} className="text-green-500" /> : <HiThumbDown size={20} className="text-red-400" />}</span>
              </div>
              <div className="flex items-start">
                <HiHashtag size={20} className="mr-2 mt-2 shrink-0" />
                <TagsEditor placeholder="Ajouter une étiquette" labelClassName="hidden" name="Ajouter une étiquette" tags={tags} setTags={updateTags} maxDisplayCount={2} />
              </div>
            </div>
          )}
          <div className="flex justify-center">
            <button onClick={() => setHeaderOpen(!isHeaderOpen)} className="p-2 pt-1">
              {isHeaderOpen ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}
            </button>
          </div>
        </div>
        <Thread
          ticket={ticket}
          user={user}
          updateTicket={getData}
          ticketId={ticket.id}
          signature={signature}
          isPreview
          onMacroApply={onClose}
          messages={messages}
          setMessages={setMessages}
        />
      </div>
    </div>
  );
};

export default TicketPreview;
