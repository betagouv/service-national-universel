import { Menu, Transition } from "@headlessui/react";
import { formatDistance, format } from "date-fns";
import { fr } from "date-fns/locale";
import React, { useEffect, useRef, useState } from "react";
import ReactTooltip from "react-tooltip";
import { toast } from "react-hot-toast";
import { BsArrowReturnLeft } from "react-icons/bs";
import { HiChevronDown, HiRefresh, HiSave, HiXCircle } from "react-icons/hi";
import Avatar from "../../../components/Avatar";
import TextEditor from "../../../components/TextEditor";

import ThreadMacroDropdown from "./macros/ThreadDropdown";
import SendFileEmailModal from "./SenfFileEmailModal";
import ChatBox from "./ChatBox";
import { getMacroById } from "../../../services/macro";

import API from "../../../services/api";
import { removeLineBreakFromStartAndEnd, getMessageWithoutSignature } from "../../../components/TextEditor/importHtml";
import { fillShortcut } from "../utils";
import { TRANSLATE_ROLE } from "../../../utils";
import { serializeTicketUpdate } from "../service";
import PreviewMacroDropdown from "./macros/PreviewDropDown";
import { useMacroSelection } from "./macros/useMacro";
import CopyRecipientEditor from "./CopyRecipientEditor";
import useAutoSave from "../hooks/useAutoSave";

const Thread = ({
  messages,
  setMessages,
  agents,
  ticket,
  user,
  updateTicket,
  ticketId,
  viewingAgents = [],
  signature,
  isPreview = false,
  className,
  onMacroApply = () => {
    window.location.href = "/ticket";
  },
}) => {
  const [message, setMessage] = useState(ticket.messageDraft);
  const [slateContent, setSlateContent] = useState();
  const [selectedImage, setSelectedImage] = useState(null);
  const [files, setFiles] = useState([]);
  const [open, setOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isCopyRecipientVisible, setIsCopyRecipientVisible] = useState(false);
  const [mailCopyRecipient, setMailCopyRecipient] = useState([]);
  const [copyRecipient, setCopyRecipient] = useState([]);
  const [messageHistory, setMessageHistory] = useState(null);
  const [dest, setDest] = useState(ticket.contactEmail);
  const [editorResetCount, setEditorResetCount] = useState(0);
  const [macroSlateContent, setMacroSlateContent] = useState(null);
  const [selectedMacro, setSelectedMacro] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [isMessageFullyLoaded, setIsMessageFullyLoaded] = useState(false);

  // is needed to make message available in cleanup function
  const messageRef = useRef("");

  const getMessageTextWithoutHTMLTags = (message) => {
    if (!message) return "";
    return message.replace(/(<([^>]+)>)/gi, "").trim();
  };

  const scrollDiv = useRef(null);

  useEffect(() => {
    updateMessages();
  }, [ticketId]);

  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  useEffect(() => {
    setCopyRecipient(mailCopyRecipient);
  }, [mailCopyRecipient]);

  useEffect(() => {
    if (selectedImage) {
      setFiles([...files, selectedImage[0]]);
    }
  }, [selectedImage]);

  async function updateMessages(shouldScroll = true) {
    const { ok, data } = await API.get({ path: "/message", query: { ticketId: ticket._id } });
    if (!ok) return toast.error("Une erreur est survenue");
    setMessages(data);
    if (shouldScroll && scrollDiv.current) {
      scrollDiv.current.scrollIntoView({ behavior: "smooth" });
    }
    return;
  }

  const isSaving = useAutoSave(message, () => handleAddDraftMessage(false), {
    delayMs: 500,
    isEnabled: !isPreview && user.role !== "DG" && isMessageFullyLoaded, //message is considered fully loaded after it is updated by the TextEditor component
  });

  const onUploadImage = async (formatedMessage) => {
    try {
      const { ok } = await API.uploadFile(`/message/sendEmailFile/${ticket._id}`, files, { message: formatedMessage, copyRecipient, dest, messageHistory });
      if (!ok) return false;
      setReloadKey((k) => k + 1);
      setOpen(false);
      updateMessages();
      return ok;
    } catch (e) {
      toast.error("Erreur", e);
    }
  };
  const formatMessageForSending = (message) => {
    const formattedMessage = message.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
    return formattedMessage;
  };

  const formatMessageForDisplay = (message) => {
    const formattedMessage = message.replace(/\\n/g, "<br>");
    return formattedMessage;
  };

  const handleSending = async () => {
    if (selectedMacro) {
      try {
        await handleSelectMacro(selectedMacro, true);
      } catch (error) {
        console.error("Error applying macro:", error);
        toast.error("Erreur lors de l'application de la macro");
      } finally {
        setSelectedMacro(null);
        setMacroSlateContent(null);
        setMessage("");
        await updateTicket();
        setEditorResetCount(editorResetCount + 1);
        await updateMessages();
        setFiles([]);
        setSelectedImage(null);
      }
    } else {
      handleAddMessage();
    }
  };

  const handleAddMessage = async () => {
    try {
      const messageWithoutSigniture = getMessageWithoutSignature(message, signature);
      const messageWithoutHTMLTags = getMessageTextWithoutHTMLTags(messageWithoutSigniture);
      if (!messageWithoutHTMLTags && !selectedImage) {
        return true;
      }
      let formatedMessage = fillShortcut(message, user, { firstName: ticket.contactFirstName, lastName: ticket.contactLastName });
      formatedMessage = formatMessageForSending(formatedMessage); // Convertir les caractères spéciaux
      let ok;
      if (selectedImage) {
        ok = await onUploadImage(formatedMessage);
        if (!ok) {
          toast.error("Une erreur est survenue");
          return false;
        }
        toast.success("Message avec pièce jointe envoyé");
      } else {
        ok = await API.post({
          path: "/message",
          body: { message: formatedMessage, ticketId: ticket._id, slateContent, copyRecipient: copyRecipient, dest, messageHistory },
        });
        if (!ok) {
          toast.error("Une erreur est survenue");
          return false;
        }
        toast.success("Message envoyé");
      }
      setMessage("");
      await updateTicket();
      setEditorResetCount(editorResetCount + 1);
      await updateMessages();
      setFiles([]);
      setSelectedImage(null);
      return true;
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message");
      return false;
    }
  };

  const handleAddDraftMessage = async (displayToast = true) => {
    const messageWithoutSigniture = getMessageWithoutSignature(message, signature);
    const messageWithoutHTMLTags = getMessageTextWithoutHTMLTags(messageWithoutSigniture);

    try {
      const body = serializeTicketUpdate({ messageDraft: messageWithoutHTMLTags ? removeLineBreakFromStartAndEnd(messageWithoutSigniture) : "", ticketId: ticket._id });
      const { ok, code } = await API.patch({
        path: `/ticket/${ticket._id}`,
        body,
      });
      if (!ok) return toast.error(`Une erreur est survenue : ${code}`);
      if (displayToast) {
        toast.success("Message enregistré");
      }
      setLastSavedAt(new Date());
      await updateMessages(false);
      await updateTicket();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement du message");
    }
  };

  const onPreviewMacro = async (id) => {
    if (!ticket._id) {
      toast.error("Aucun ticket sélectionné pour la prévisualisation de la macro");
      return;
    }
    try {
      const response = await getMacroById(id);
      if (!response) {
        toast.error("Erreur lors de la récupération de la macro");
        return;
      }
      console.log(response);
      setSelectedMacro(id);
      const macroContent = response.macroAction
        .filter((action) => action.action === "ADDMESSAGE")
        .map((action) => action.message.content)
        .flat();
      setMacroSlateContent(macroContent);
    } catch (error) {
      toast.error("Erreur lors de la récupération de la macro");
    }
  };

  const Button = ({ text, icon, handleClick }) => (
    <button
      className="flex h-[inherit] grow items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-2.5 transition-colors hover:bg-gray-50"
      disabled={user.role === "DG"}
      onClick={handleClick}
    >
      {icon && <span className="text-2xl text-gray-400">{icon}</span>}
      {!isPreview && <span className="text-sm font-medium text-grey-text">{text}</span>}
    </button>
  );

  const { handleSelectMacro } = useMacroSelection({
    selectedTicket: [ticket._id],
    handleAddMessage,
    onClose: onMacroApply,
    onRefresh: async () => {
      await updateTicket();
    },
  });

  return (
    <div className={`flex w-full flex-1 flex-col overflow-y-auto bg-white py-5 ${isPreview ? "px-3" : "pl-7 pr-[30px]"} ${className}`}>
      <div className={`${isPreview ? "min-h-[60%]" : "max-h-[63vh] "} flex min-h-[40%] flex-1 flex-col gap-3.5 overflow-auto pr-4`}>
        {messages?.map((message, index) => (
          <ChatBox
            key={message._id}
            name={`${message.authorFirstName ? message.authorFirstName + " " + message.authorLastName : message.authorEmail}`}
            time={formatDistance(Date.now(), new Date(message.createdAt), { locale: fr })}
            text={formatMessageForDisplay(message.text)}
            sender={message.authorId === user._id}
            files={message.files}
            id={message._id}
            update={updateMessages}
            ticketSubject={ticket.subject}
            messageNumber={index + 1}
            messageNumbers={messages.length}
            copyRecipient={message.copyRecipient}
            setIsCopyRecipientVisible={setIsCopyRecipientVisible}
            setMailCopyRecipient={setMailCopyRecipient}
            setDest={setDest}
            canal={ticket.canal}
            setMessageHistory={setMessageHistory}
            fromEmail={message.fromEmail}
            toEmail={message.toEmail}
            subject={message.subject}
            isSimplified={isPreview}
            agents={agents}
          />
        ))}
        <div className="mb-3 flex place-content-end">
          {viewingAgents.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-center text-sm font-medium text-grey-text">Actuellement sur {user.role === "AGENT" ? "le ticket" : "la demande"} : </span>
              {viewingAgents.map((agent) => (
                <div key={agent._id} data-tip={`${agent.firstName} ${agent.lastName} - ${TRANSLATE_ROLE[agent.role]}`}>
                  <Avatar email={agent.email} />
                  <ReactTooltip multiline={true} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div ref={scrollDiv} className="max-w-full"></div>
      </div>
      <div className={`flex-2 pr-4 ${isPreview ? "overflow-auto" : ""}${user.role === "DG" && "opacity-50 pointer-events-none"}`}>
        <CopyRecipientEditor isVisible={isCopyRecipientVisible} copyRecipient={copyRecipient} setCopyRecipient={setCopyRecipient} dest={dest} setDest={setDest} />
        <TextEditor
          resetCount={editorResetCount}
          key={ticket._id}
          setHtmlText={(text) => {
            setMessage(text);
            setIsMessageFullyLoaded(true);
          }}
          draftMessageHtml={ticket.messageDraft}
          setSlateContent={setSlateContent}
          reloadKey={reloadKey}
          signature={signature}
          macroSlateContent={macroSlateContent}
        />
        <div>
          {files.length > 0 && (
            <div className="mb-3 flex justify-between">
              <div className="flex">
                <label className="text-md mr-5 inline-block font-medium text-gray-700 underline">Pièce jointe attachée(s):</label>
                <ul>
                  {files.map((file, i) => (
                    <li key={i} className="flex  ">
                      <img src={""} alt={file.name} height="100px" />

                      <button onClick={() => setFiles(files.filter((file) => files.indexOf(file) !== i))}>
                        <HiXCircle className="ml-3 mr-2 text-2xl text-red-700" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={`mt-5 flex h-[42px] gap-2 ${user.role === "DG" && "opacity-50 pointer-events-none"}`}>
        <SendFileEmailModal
          key={ticket._id}
          open={open}
          setOpen={setOpen}
          ticket={ticket}
          update={updateMessages}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          iconButton={isPreview}
        />
        {["AGENT", "REFERENT_DEPARTMENT", "REFERENT_REGION"].includes(user.role) && !isPreview && (
          <Button text="Ajouter destinataires" icon={<BsArrowReturnLeft />} handleClick={() => setIsCopyRecipientVisible(true)} />
        )}
        <div className="relative z-0 flex h-[42px] grow rounded-md">
          {lastSavedAt && (
            <span className="absolute -top-4 text-xs text-gray-500 truncate">
              <div className="flex items-center">
                {`Enregistré le ${format(lastSavedAt, "dd/MM/yyyy HH:mm:ss", { locale: fr })}`}
                {isSaving && <HiRefresh className="ml-2 animate-spin" />}
              </div>
            </span>
          )}
          {user.role === "AGENT" ? (
            <Button icon={<HiSave />} text="Enregistrer" handleClick={() => handleAddDraftMessage()} />
          ) : (
            <Button icon={<HiSave />} text="Enregistrer comme brouillon" handleClick={() => handleAddDraftMessage()} />
          )}
        </div>
        <div className="relative z-0 flex h-[42px] grow rounded-md">
          <button
            type="button"
            className={`relative flex flex-1 items-center justify-center ${
              user.role === "AGENT" && !selectedMacro ? "rounded-l-md" : "rounded-md"
            } bg-accent-color px-[18px] text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus:z-10`}
            onClick={handleSending}
            disabled={user.role === "DG"}
          >
            <p>Envoyer {selectedMacro && "et appliquer la macro"}</p>
          </button>
          {user.role === "AGENT" && !selectedMacro && (
            <Menu as="span" className="relative block">
              <Menu.Button className="relative flex h-full w-[42px] items-center justify-center rounded-r-md border-l border-[#726BEA] bg-accent-color text-xl text-white transition-colors hover:bg-indigo-500 focus:z-10">
                <HiChevronDown />
              </Menu.Button>
              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute bottom-12 right-0 flex w-56 origin-bottom-right flex-col rounded-md bg-white shadow-lg">
                  <ThreadMacroDropdown
                    selectedTicket={[ticket._id]}
                    handleAddMessage={handleAddMessage}
                    onClose={onMacroApply}
                    onRefresh={async () => {
                      await updateTicket();
                    }}
                  />
                </Menu.Items>
              </Transition>
            </Menu>
          )}
        </div>
      </div>
      {user.role === "AGENT" && (
        <div className="mt-3 flex w-full justify-end">
          <PreviewMacroDropdown
            selectedTicket={[ticket._id]}
            handleAddMessage={handleAddMessage}
            onClose={onPreviewMacro}
            onRefresh={async () => {
              await updateTicket();
            }}
            className="w-[250px]"
            filtered={true}
            disabled={isSaving}
          />
        </div>
      )}
    </div>
  );
};

export default Thread;
