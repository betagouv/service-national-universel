import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { HiOutlineChevronLeft } from "react-icons/hi";
import { Link, useHistory } from "react-router-dom";

import { HiPlus, HiX, HiXCircle } from "react-icons/hi";
import TextEditor from "../../../components/TextEditor";
import AgentSelect from "../../../components/AgentSelect";
import API from "../../../services/api";
import Right from "./right";
import Left from "./left";
import SendFileEmailModal from "../components/SenfFileEmailModal";
import { useSelector } from "react-redux";

import { sourceToIcon } from "../../../utils";
import { fillShortcut } from "../utils";
const useKeyPress = (targetKey) => {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    const downHandler = ({ key }) => {
      if (key === targetKey) {
        setKeyPressed(true);
      }
    };

    const upHandler = ({ key }) => {
      if (key === targetKey) {
        setKeyPressed(false);
      }
    };

    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, [targetKey]);

  return keyPressed;
};

const CopyRecipients = ({ copyRecipients, setCopyRecipients }) => {
  const [defaultCopyRecipients, setDefaultCopyRecipients] = useState([]);
  const [inputCc, setInputCc] = useState("");

  useEffect(() => {
    updateCc();
  }, [inputCc]);

  async function updateCc() {
    if (!inputCc) return setDefaultCopyRecipients([]);
    const { ok, data } = await API.get({ path: `/contact/search`, query: { q: inputCc } });
    if (ok) setDefaultCopyRecipients(data);
  }

  const addCopyRecipient = async (value) => {
    try {
      setCopyRecipients([...copyRecipients, value]);
      setInputCc("");
    } catch (e) {
      toast.error(e, "Erreur lors de l'ajout du destinataire");
    }
  };

  const removeCopyRecipient = async (value) => {
    try {
      setCopyRecipients(copyRecipients.filter((recipient) => recipient !== value));
    } catch (e) {
      toast.error(e, "Erreur lors de la suppression du destinataire");
    }
  };

  return (
    <div>
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
            setCopyRecipients([...copyRecipients, inputCc]);
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
              {defaultCopyRecipient.firstName} {defaultCopyRecipient.lastName?.toUpperCase()} - {defaultCopyRecipient.email}
            </li>
          ))}
        </ul>
      </div>
      <div className="relative flex flex-wrap gap-2.5">
        {copyRecipients.map((email, i) => (
          <span className=" flex items-center gap-0.5 rounded-full bg-purple-100 py-0.5 pl-2.5 pr-1" key={i}>
            <span className="text-sm font-medium text-purple-800">{email}</span>
            <HiX onClick={() => removeCopyRecipient(email)} className="cursor-pointer text-base text-indigo-400" />
          </span>
        ))}
      </div>
    </div>
  );
};

const AutoCompleteContact = ({ setContact, contact, user }) => {
  const [input, setInput] = useState("");
  const [options, setOptions] = useState([]);

  const arrowUpPressed = useKeyPress("ArrowUp");
  const arrowDownPressed = useKeyPress("ArrowDown");
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (arrowUpPressed) {
      selected > 0 ? setSelected(selected - 1) : 0;
    }
  }, [arrowUpPressed]);

  useEffect(() => {
    if (arrowDownPressed) {
      selected < options.length - 1 && selected < 4 ? setSelected(selected + 1) : 0;
    }
  }, [arrowDownPressed]);

  useEffect(() => {
    if (options !== null) {
      getOptions(input);
    }
  }, [input]);

  const getOptions = async (q) => {
    if (!q) {
      setOptions([]);
      return;
    }
    try {
      const { ok, data, code } = await API.get({ path: `/contact/search`, query: { q } });
      if (!ok) return toast.error(code);
      setOptions(data);
    } catch (e) {
      console.log(e.message);
    }
  };

  return (
    <div className="w-full">
      <div className="mt-2 mb-4 flex divide-x divide-gray-300 overflow-hidden rounded-md border border-gray-300">
        <input
          onClick={() => setInput("")}
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          className="w-[200px] flex-1 border-0 text-sm text-gray-600 placeholder:text-[#979797] focus:border-transparent"
          placeholder={"A"}
        />
        {user.role === "AGENT" && (
          <button
            className="flex h-10 w-11 flex-none items-center justify-center bg-white text-2xl text-gray-500 transition-colors hover:bg-gray-50"
            onClick={() => {
              setContact({ email: input });
              setInput("");
            }}
          >
            <HiPlus />
          </button>
        )}
      </div>
      <div className="relative ">
        <ul className={`absolute z-10 mb-4 w-full rounded ${options.length > 0 && "border-2"}  bg-white text-sm text-gray-600`}>
          {options.map((defaultD) => {
            const cohort = defaultD?.attributes?.filter((attr) => attr.name === "cohorte")[0]?.value;
            return (
              <li
                className="z-10  cursor-pointer bg-white p-2  hover:bg-gray-50"
                key={defaultD._id}
                onClick={() => {
                  setContact(defaultD);
                  setInput("");
                }}
              >
                {user.role === "AGENT" ? (
                  <>
                    <b>{defaultD.email} </b>
                    <span>
                      - {defaultD.firstName} {defaultD.lastName?.toUpperCase()}
                    </span>
                  </>
                ) : (
                  <>
                    <b>
                      {defaultD.firstName} {defaultD.lastName?.toUpperCase()}
                    </b>
                    <span>
                      {cohort ? " Cohorte : " + cohort : ""} - {defaultD.department ? "Département : " + defaultD.department : ""}
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {contact && (
        <div className="relative flex flex-wrap gap-2.5">
          <span className=" flex items-center gap-0.5 rounded-full bg-purple-100 py-0.5 pl-2.5 pr-1">
            <span className="text-sm font-medium text-purple-800">{user.role === "AGENT" ? contact.email : contact.firstName + " " + contact.lastName}</span>
            <HiX onClick={() => setContact(null)} className="cursor-pointer text-base text-indigo-400" />
          </span>
        </div>
      )}
    </div>
  );
};

export default () => {
  const history = useHistory();
  const user = useSelector((state) => state.Auth.user);
  const [templates, setTemplates] = useState([]);
  const [template, setTemplate] = useState(null);
  const [tags, setTags] = useState([]);
  const [subject, setSubject] = useState(null);
  const [contact, setContact] = useState(null);
  const [copyRecipients, setCopyRecipients] = useState([]);
  const [canal, setCanal] = useState(null);
  const [message, setMessage] = useState(null);
  const [agent, setAgent] = useState(null);

  //files
  const [selectedImage, setSelectedImage] = useState(null);
  const [files, setFiles] = useState([]);

  const resetTicket = () => {
    setTags([]);
    setSubject(null);
    setMessage(null);
    setContact(null);
    setCopyRecipients([]);
    setCanal(null);
    setSelectedImage(null);
    setFiles([]);
    setAgent(null);
  };

  const getTemplates = async () => {
    try {
      const { ok, data } = await API.get({ path: "/template" });
      if (ok) {
        setTemplates(data);
      } else {
        toast.error("Erreur lors de la récupération des modèles de tickets");
      }
    } catch (e) {
      toast.error("Erreur lors de la récupération des modèles de tickets");
    }
  };

  useEffect(() => {
    resetTicket();
    if (template) {
      setSubject(template.subject);
      setMessage(template.message);
      setCanal(template.canal);
      setTags(template.tags || []);
      setAgent(template.attributedTo);
    }
  }, [template]);

  useEffect(() => {
    getTemplates();
  }, []);

  useEffect(() => {
    if (selectedImage) {
      setFiles([...files, selectedImage[0]]);
    }
  }, [selectedImage]);

  const onUploadImage = async (formatedMessage, ticket) => {
    try {
      const { ok, code } = await API.uploadFile(`/message/sendEmailFile/${ticket._id}`, files, {
        message: formatedMessage,
        copyRecipient: copyRecipients,
        dest: contact.email,
      });
      if (!ok) return toast.error(`Une erreur est survenue : ${code}`);
      toast.success("Ticket créé avec succés");
      history.push(`/ticket/${ticket._id}`);
      return;
    } catch (e) {
      toast.error(e, "Erreur");
    }
  };

  const handleNewTicket = async () => {
    if (!subject || !contact || !message) return toast.error("Veuillez renseigner tous les champs");
    if (message?.length < 15) return toast.error("Le message doit contenir au moins 15 caractères");

    try {
      let formatedMessage = message.replaceAll("\n", "<br>");
      formatedMessage = fillShortcut(message, user, contact);

      const body = {
        subject,
        contactEmail: contact.email,
        canal: canal || "PLATFORM",
        tags: tags.map((i) => i._id),
        message: formatedMessage,
        files: files,
        copyRecipients: copyRecipients,
      };

      if (agent) {
        body.agentId = agent._id;
      }

      const { data } = await API.post({
        path: "/ticket",
        body,
      });
      if (files.length > 0) {
        return await onUploadImage(formatedMessage, data.ticket);
      }
      toast.success("Ticket créé avec succés");
      history.push(`/ticket/${data.ticket._id}`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="inset-0 flex h-full flex-col bg-gray-100">
      <Header user={user} />
      <div className="flex h-full justify-between bg-white">
        <Left tags={tags} setTags={setTags} user={user} />
        <div className="m-5 w-full">
          <Middle
            subject={subject}
            setSubject={setSubject}
            setContact={setContact}
            contact={contact}
            copyRecipients={copyRecipients}
            setCopyRecipients={setCopyRecipients}
            files={files}
            setFiles={setFiles}
            canal={canal}
            setCanal={setCanal}
            message={message}
            setMessage={setMessage}
            handleNewTicket={handleNewTicket}
            setSelectedImage={setSelectedImage}
            selectedImage={selectedImage}
            user={user}
            template={template}
            agent={agent}
            setAgent={setAgent}
          />
        </div>
        <Right templates={templates} appliedTemplate={template} setAppliedTemplate={setTemplate} user={user} />
      </div>
    </div>
  );
};

const Header = ({ user }) => {
  return (
    <div className="flex items-center justify-between border-b border-t border-gray-300 bg-white pl-7 pr-5 pt-[22px] pb-5">
      <div className="flex items-center gap-7">
        <Link to="/ticket" className="text-2xl text-grey-text">
          <HiOutlineChevronLeft />
        </Link>
        <div className="font-bold">{user.role === "AGENT" ? "Créer un nouveau ticket" : "Rédiger un nouveau message"}</div>
      </div>
    </div>
  );
};

const Middle = ({
  subject,
  setSubject,
  canal,
  setCanal,
  contact,
  setContact,
  copyRecipients,
  setCopyRecipients,
  files,
  setFiles,
  setMessage,
  handleNewTicket,
  setSelectedImage,
  selectedImage,
  user,
  template,
  agent,
  setAgent,
}) => {
  const [open, setOpen] = useState(false);
  //use key to force input update
  const [key, setKey] = useState(0);
  const [slateContent, setSlateContent] = useState();

  useEffect(() => {
    setKey(key + 1);
  }, [template]);

  return (
    <div className="w-full ">
      {user.role === "AGENT" && (
        <div className="mb-4 flex flex-row border-b border-gray-200 pb-4">
          <div className=" mb-2 inline-block w-1/3 text-sm font-medium text-gray-700">Canal de réception*</div>
          <div className="flex w-2/3 flex-col ">
            <div>
              <input
                type="radio"
                name="canal"
                value="MAIL"
                checked={canal === "MAIL"}
                className="mr-1 h-4 rounded-xl border-gray-300 text-indigo-500 "
                onChange={() => setCanal("MAIL")}
              />
              {sourceToIcon.MAIL}
              <label className="ml-1 text-sm text-gray-600">E-mail</label>
            </div>
            <div>
              <input
                type="radio"
                name="canal"
                value="PLATFORM"
                checked={canal === "PLATFORM"}
                className="mr-1 h-4 rounded-xl border-gray-300 text-indigo-500"
                onChange={() => setCanal("PLATFORM")}
              />
              {sourceToIcon.PLATFORM}
              <label className="ml-1 text-sm text-gray-600">Plateforme</label>
            </div>
          </div>
        </div>
      )}
      <div className="mb-4 flex flex-row items-center border-b border-gray-200 pb-4">
        <div className="w-1/3">
          <label className="mb-1 inline-block text-sm font-medium text-gray-700"> {user.role === "AGENT " ? "Nom ou sujet du ticket*" : "Objet du message"}</label>
        </div>
        <div className="w-2/3">
          <input
            key={key}
            type="text"
            className="w-full rounded border border-gray-300 bg-white py-2.5 px-3.5 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
            placeholder={user.role === "AGENT " ? "Nom ou sujet du ticket*" : "Objet du message"}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
      </div>
      <div className="mb-4 flex flex-row items-center border-b border-gray-200 pb-4">
        <div className="w-1/3">
          <label className="mb-1 inline-block text-sm font-medium text-gray-700">Contact*</label>
        </div>
        <div className="w-2/3">
          <AutoCompleteContact setContact={setContact} contact={contact} user={user} />
        </div>
      </div>
      {user.role === "AGENT" && (
        <div className="mb-4 flex flex-row items-center border-b border-gray-200 pb-4">
          <div className="w-1/3">
            <label className="mb-1 inline-block text-sm font-medium text-gray-700">Agent</label>
          </div>
          <div className="w-2/3">
            <AgentSelect key={key} value={agent} onChange={setAgent} className="w-[100%]" />
          </div>
        </div>
      )}
      {canal === "MAIL" && (
        <div className="mb-4 flex flex-row items-center border-b border-gray-200 pb-4">
          <div className="w-1/3">
            <label className="mb-1 inline-block text-sm font-medium text-gray-700">Copie</label>
          </div>
          <div className="w-2/3">
            <CopyRecipients copyRecipients={copyRecipients} setCopyRecipients={setCopyRecipients} />
          </div>
        </div>
      )}
      <TextEditor forcedHtml={template?.message} setHtmlText={setMessage} setSlateContent={setSlateContent} />
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

      <div className="mt-4 flex h-[42px] gap-2">
        <SendFileEmailModal open={open} setOpen={setOpen} selectedImage={selectedImage} setSelectedImage={setSelectedImage} />

        <div className="relative z-0 flex h-[42px] grow rounded-md">
          <button
            type="button"
            className="relative flex flex-1 items-center justify-center rounded-md bg-accent-color px-[18px] text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus:z-10"
            onClick={handleNewTicket}
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
};
