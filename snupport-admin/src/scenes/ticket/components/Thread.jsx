import { Menu, Transition } from "@headlessui/react";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import React, { Fragment, useEffect, useRef, useState } from "react";
import ReactTooltip from "react-tooltip";
import { toast } from "react-hot-toast";
import { BsArrowReturnLeft } from "react-icons/bs";
import { HiChevronDown, HiPlus, HiSave, HiX, HiXCircle } from "react-icons/hi";
import Avatar from "../../../components/Avatar";
import TextEditor from "../../../components/TextEditor";

import MacroDropdown from "./MacroDropdown";
import SendFileEmailModal from "./SenfFileEmailModal";
import ChatBox from "./ChatBox";

import API from "../../../services/api";
import { isMessageValid, removeLineBreakFromStartAndEnd, getMessageWithoutSignature } from "../../../components/TextEditor/importHtml";
import { fillShortcut } from "../utils";
import { TRANSLATE_ROLE } from "../../../utils";
import { serializeTicketUpdate } from "../service";

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

  async function updateMessages() {
    const { ok, data } = await API.get({ path: "/message", query: { ticketId: ticket._id } });
    if (!ok) return toast.error("Une erreur est survenue");
    setMessages(data);
    scrollDiv.current.scrollIntoView({ behavior: "smooth" });
  }

  const onUploadImage = async (formatedMessage) => {
    try {
      const { ok } = await API.uploadFile(`/message/sendEmailFile/${ticket._id}`, files, { message: formatedMessage, copyRecipient, dest, messageHistory });
      if (!ok) return false;
      setReloadKey((k) => k + 1);
      setOpen(false);
      updateMessages();
      return ok;
    } catch (e) {
      toast.error(e, "Erreur");
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

  const handleAddMessage = async () => {
    const messageWithoutSigniture = getMessageWithoutSignature(message, signature);
    const messageWithoutHTMLTags = getMessageTextWithoutHTMLTags(messageWithoutSigniture);
    console.log("messageWithoutSigniture", messageWithoutSigniture);
    console.log("messageWithoutHTMLTags", messageWithoutHTMLTags);
    console.log(isMessageValid(message), "isMessageValid(message)");
    try {
      if (!messageWithoutHTMLTags || !isMessageValid(message)) return toast.error("Veuillez renseigner un message");
      let formatedMessage = fillShortcut(message, user, { firstName: ticket.contactFirstName, lastName: ticket.contactLastName });
      formatedMessage = formatMessageForSending(formatedMessage); // Convertir les caractères spéciaux
      let ok;
      if (selectedImage) {
        ok = await onUploadImage(formatedMessage);
        if (!ok) return toast.error("Une erreur est survenue");
        toast.success("Message avec pièce jointe envoyé");
      } else {
        ok = await API.post({
          path: "/message",
          body: { message: formatedMessage, ticketId: ticket._id, slateContent, copyRecipient: copyRecipient, dest, messageHistory },
        });
        if (!ok) return toast.error("Une erreur est survenue");
        toast.success("Message envoyé");
      }
      setMessage("");
      await updateTicket();
      setEditorResetCount(editorResetCount + 1);
      await updateMessages();
      setFiles([]);
      setSelectedImage(null);
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message");
    }
  };

  const handleAddDraftMessage = async () => {
    const messageWithoutSigniture = getMessageWithoutSignature(message, signature);
    const messageWithoutHTMLTags = getMessageTextWithoutHTMLTags(messageWithoutSigniture);

    try {
      const body = serializeTicketUpdate({ messageDraft: messageWithoutHTMLTags ? removeLineBreakFromStartAndEnd(messageWithoutSigniture) : "", ticketId: ticket._id });
      const { ok, code } = await API.patch({
        path: `/ticket/${ticket._id}`,
        body,
      });
      if (!ok) return toast.error(`Une erreur est survenue : ${code}`);
      toast.success("Message enregistré");
      await updateMessages();
      await updateTicket();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement du message");
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
          htmlText={message}
          setHtmlText={setMessage}
          draftMessageHtml={ticket.messageDraft}
          setSlateContent={setSlateContent}
          reloadKey={reloadKey}
          signature={signature}
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
        {user.role === "AGENT" && !isPreview && <Button text="Ajouter destinataires" icon={<BsArrowReturnLeft />} handleClick={() => setIsCopyRecipientVisible(true)} />}
        {user.role === "AGENT" ? (
          <Button icon={<HiSave />} text="Enregistrer" handleClick={() => handleAddDraftMessage()} />
        ) : (
          <Button icon={<HiSave />} text="Enregistrer comme brouillon" handleClick={() => handleAddDraftMessage()} />
        )}

        <div className="relative z-0 flex h-[42px] grow rounded-md">
          <button
            type="button"
            className={`relative flex flex-1 items-center justify-center ${
              user.role === "AGENT" ? "rounded-l-md" : "rounded-md"
            } bg-accent-color px-[18px] text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus:z-10`}
            onClick={handleAddMessage}
            disabled={user.role === "DG"}
          >
            Envoyer
          </button>
          {user.role === "AGENT" && (
            <Menu as="span" className="relative block">
              <Menu.Button className="relative flex h-full w-[42px] items-center justify-center rounded-r-md border-l border-[#726BEA] bg-accent-color text-xl text-white transition-colors hover:bg-indigo-500 focus:z-10">
                <span className="sr-only">Open options</span>
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
                <Menu.Items className="absolute bottom-12 right-0 flex w-56 origin-bottom-right flex-col rounded-md bg-white py-1 shadow-lg">
                  <MacroDropdown
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
    </div>
  );
};

const CopyRecipientEditor = ({ copyRecipient, isVisible, setCopyRecipient, dest, setDest }) => {
  const [defaultCopyRecipients, setDefaultCopyRecipients] = useState([]);
  const [defaultDest, setDefaultDest] = useState([]);
  const [inputDest, setInputDest] = useState("");
  const [inputCc, setInputCc] = useState("");

  useEffect(() => {
    updateCc();
  }, [inputCc]);

  useEffect(() => {
    updateDest();
  }, [inputDest]);

  async function updateCc() {
    if (!inputCc) return setDefaultCopyRecipients([]);
    const { ok, data } = await API.get({ path: `/contact/search`, query: { q: inputCc } });
    if (ok) setDefaultCopyRecipients(data);
  }

  async function updateDest() {
    if (!inputDest) return setDefaultDest([]);
    const { ok, data } = await API.get({ path: `/contact/search`, query: { q: inputDest } });
    if (ok) setDefaultDest(data);
  }

  const addCopyRecipient = async (value) => {
    try {
      setCopyRecipient([...copyRecipient, value]);
      setInputCc("");
    } catch (e) {
      toast.error(e, "Erreur lors de l'ajout du destinataire");
    }
  };

  const removeCopyRecipient = async (value) => {
    try {
      setCopyRecipient(copyRecipient.filter((recipient) => recipient !== value));
    } catch (e) {
      toast.error(e, "Erreur lors de la suppression du destinataire");
    }
  };

  return (
    <div className={` ${isVisible ? "" : "hidden"} mb-4 `}>
      <label className="text-xs text-gray-500">{"A"}</label>

      <div className="mt-2 mb-4 flex divide-x divide-gray-300 overflow-hidden rounded-md border border-gray-300">
        <input
          onClick={() => setInputDest("")}
          onChange={(e) => setInputDest(e.target.value)}
          value={inputDest}
          type="text"
          className="w-[200px] flex-1 border-0 text-sm text-gray-600 placeholder:text-[#979797] focus:border-transparent"
          placeholder={"A"}
        />
        <button
          className="flex h-10 w-11 flex-none items-center justify-center bg-white text-2xl text-gray-500 transition-colors hover:bg-gray-50"
          onClick={() => {
            setDest(inputDest);
            setInputDest("");
          }}
        >
          <HiPlus />
        </button>
      </div>
      <div className="relative ">
        <ul className="absolute z-10 mb-4 w-full  bg-white text-sm text-gray-600">
          {defaultDest.map((defaultD) => (
            <li
              className="z-10  cursor-pointer bg-white hover:bg-gray-50"
              key={defaultD._id}
              onClick={() => {
                setDest(defaultD.email);
                setInputDest("");
              }}
            >
              {defaultD.email}
            </li>
          ))}
        </ul>
      </div>

      {dest && (
        <div className="relative flex flex-wrap gap-2.5">
          <span className=" flex items-center gap-0.5 rounded-full bg-purple-100 py-0.5 pl-2.5 pr-1">
            <span className="text-sm font-medium text-purple-800">{dest}</span>
            <HiX onClick={() => setDest(null)} className="cursor-pointer text-base text-indigo-400" />
          </span>
        </div>
      )}
      <label className="text-xs text-gray-500">{"COPIE"}</label>

      <div className="mt-2 mb-4 flex divide-x divide-gray-300 overflow-hidden rounded-md border border-gray-300">
        <input
          onClick={() => setInputCc("")}
          onChange={(e) => setInputCc(e.target.value)}
          value={inputCc}
          type="text"
          className="w-[200px] flex-1 border-0 text-sm text-gray-600 placeholder:text-[#979797] focus:border-transparent"
          placeholder={"COPIE"}
        />
        <button
          className="flex h-10 w-11 flex-none items-center justify-center bg-white text-2xl text-gray-500 transition-colors hover:bg-gray-50"
          onClick={() => {
            setCopyRecipient([...copyRecipient, inputCc]);
            setInputCc("");
          }}
        >
          <HiPlus />
        </button>
      </div>
      <div className="relative ">
        <ul className="absolute z-10 mb-4 w-full  bg-white text-sm text-gray-600">
          {defaultCopyRecipients.map((defaultCopyRecipient) => (
            <li className="z-10  cursor-pointer bg-white hover:bg-gray-50" key={defaultCopyRecipient._id} onClick={() => addCopyRecipient(defaultCopyRecipient.email)}>
              {defaultCopyRecipient.email}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative flex flex-wrap gap-2.5">
        {copyRecipient.map((email, i) => (
          <span className=" flex items-center gap-0.5 rounded-full bg-purple-100 py-0.5 pl-2.5 pr-1" key={i}>
            <span className="text-sm font-medium text-purple-800">{email}</span>
            <HiX onClick={() => removeCopyRecipient(email)} className="cursor-pointer text-base text-indigo-400" />
          </span>
        ))}
      </div>
    </div>
  );
};

export default Thread;
