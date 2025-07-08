import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useHistory } from "react-router-dom";
import TextEditor from "../../../components/TextEditor";
import API from "../../../services/api";
import { sourceToIcon, sortAgents } from "../../../utils";
import Modal from "./../../setting/components/Modal";

export default function TicketModal({ open, setOpen, message, subject, agents }) {
  const history = useHistory();

  const [canal, setCanal] = useState("");
  const [ticketSubject, setTicketSubject] = useState(subject || "");
  const [ticketMessage, setTicketMessage] = useState(message || "");
  const [slateContent, setSlateContent] = useState();
  const [agentEmail, setAgentEmail] = useState("");
  const [contactEmail, setContactEmail] = useState(null);
  const [newContactFirstName, setNewContactFirstName] = useState("");
  const [newContactLasttName, setNewContactLastName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const specificOrder = ["Réponse", "Hélène", "Margaux", "Inès", "Clara", "Mathilde"];
  const sortedAgents = agents.sort((a, b) => sortAgents(specificOrder, a, b));

  const handleNewTicket = async () => {
    if (!ticketSubject || !agentEmail || !canal) return toast.error("Veuillez renseigner tous les champs");
    if (contactEmail && (newContactEmail || newContactFirstName || newContactLasttName)) return toast.error("Veuillez utiliser une seule méthode pour ajouter un contact");

    try {
      if (!contactEmail) {
        const { ok } = await API.post({ path: `/contact`, body: { firstName: newContactFirstName, lastName: newContactLasttName, email: newContactEmail } });
        if (!ok) return toast.error("Erreur lors de la création du contact");
      }
      const { data } = await API.post({ path: `/ticket/draft`, body: { subject: ticketSubject, agentEmail: agentEmail, contactEmail: contactEmail || newContactEmail, canal } });
      if (ticketMessage?.length > 15) {
        const formatedMessage = ticketMessage.replaceAll("\n", "<br>");
        const { ok, code } = await API.post({ path: "/message", body: { message: formatedMessage, ticketId: data.ticket._id } });
        if (!ok) return toast.error(`Une erreur est survenue : ${code}`);
      }
      toast.success("Ticket créé avec succés");
      history.push(`/ticket/${data.ticket._id}`);
      setOpen(false);
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <h5 className="mb-[36px] text-center text-2xl font-bold text-gray-900">Création d'un nouveau ticket</h5>
      <div className="mb-7">
        <label className="mb-1 inline-block text-sm font-medium text-gray-700">Nom ou sujet du ticket*</label>
        <input
          type="text"
          className="w-full rounded border border-gray-300 bg-white py-2.5 px-3.5 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
          placeholder="Nom ou sujet du ticket"
          value={ticketSubject}
          onChange={(e) => setTicketSubject(e.target.value)}
        />
      </div>
      <div className="flex justify-between">
        <label className=" mb-2 inline-block text-sm font-medium text-gray-700">Canal*</label>

        <div>
          <input
            type="radio"
            name="canal"
            value="MAIL"
            checked={canal === "MAIL"}
            className="mr-3 h-4 w-4 rounded-xl border-gray-300 text-indigo-500 "
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
            className="mr-3 h-4 w-4 rounded-xl border-gray-300 text-indigo-500"
            onChange={() => setCanal("PLATFORM")}
          />
          {sourceToIcon.PLATFORM}
          <label className="ml-1 text-sm text-gray-600">Plateforme</label>
        </div>
      </div>
      <div className="mb-4">
        <label className="mb-5 inline-block text-sm font-medium text-gray-700">Agent*</label>
        <div className="flex items-center gap-4">
          <select
            type="text"
            className="flex-none rounded border border-gray-300 bg-white py-2.5 px-3.5 pr-10 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
            placeholder="Nom de l'agent"
            onChange={(e) => setAgentEmail(e.target.value)}
            defaultValue={"DEFAULT"}
          >
            <option value="DEFAULT"> Choisissez un agent</option>
            {sortedAgents
              ?.filter((agent) => agent.firstName && agent.lastName && agent.email)
              .map((agent) => {
                return (
                  <option key={agent.email} value={agent.email} label={`${agent.firstName} ${agent.lastName}`}>
                    {agent.firstName} {agent.lastName}
                  </option>
                );
              })}
          </select>
        </div>
      </div>
      <div className="mb-5">
        <label className="mb-5 inline-block text-sm font-medium text-gray-700">Contact*</label>
        <div className="flex w-full items-center gap-4">
          <AutoCompleteContact setContactEmail={setContactEmail} />
        </div>
        <hr />
        <div>
          <span className="mt-2 text-sm text-gray-500">Veuillez remplir le contact via la barre de recherche ou via les champs ci-dessous pour un nouveau contact.</span>

          <div className="mt-2 flex gap-3">
            <input
              type="text"
              className="w-full rounded border border-gray-300 bg-white py-2.5 px-3.5 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
              placeholder="Prénom"
              onChange={(e) => setNewContactFirstName(e.target.value)}
            />
            <input
              type="text"
              className="w-full rounded border border-gray-300 bg-white py-2.5 px-3.5 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
              placeholder="Nom"
              onChange={(e) => setNewContactLastName(e.target.value)}
            />
          </div>
          <input
            type="text"
            className="mt-4 w-full rounded border border-gray-300 bg-white py-2.5 px-3.5 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
            placeholder="Email"
            onChange={(e) => setNewContactEmail(e.target.value)}
          />
        </div>
      </div>
      <hr />
      <label className="my-2 inline-block text-sm font-medium text-gray-700">Premier message du ticket</label>
      <TextEditor htmlText={ticketMessage} setHtmlText={setTicketMessage} setSlateContent={setSlateContent} draftMessageHtml={ticketMessage} />
      <div className="mt-3 flex gap-3">
        <button
          type="button"
          className="h-[38px] flex-1 rounded-md border border-gray-300 px-4 text-center text-sm font-medium text-custom-red transition-colors hover:bg-red-50"
          onClick={() => setOpen(false)}
        >
          Annuler
        </button>
        <button
          type="button"
          className="h-[38px] flex-1 rounded-md bg-accent-color  px-4 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          onClick={handleNewTicket}
        >
          Créer
        </button>
      </div>
    </Modal>
  );
}

const AutoCompleteContact = ({ setContactEmail }) => {
  const [input, setInput] = useState("");
  const [options, setOptions] = useState([]);

  const arrowUpPressed = useKeyPress("ArrowUp");
  const arrowDownPressed = useKeyPress("ArrowDown");
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (arrowUpPressed) {
      //dispatch({ type: "arrowUp" });
      selected > 0 ? setSelected(selected - 1) : 0;
      console.log("arrowUpPressed");
    }
  }, [arrowUpPressed]);

  useEffect(() => {
    if (arrowDownPressed) {
      //dispatch({ type: "arrowDown" });
      selected < options.length - 1 && selected < 4 ? setSelected(selected + 1) : 0;
      console.log("arrowDownPressed");
    }
  }, [arrowDownPressed]);

  useEffect(() => {
    getOptions(input);
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
      <div className="mb-4 flex w-full divide-x divide-gray-300 overflow-hidden rounded-md border border-gray-300">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          className="w-[200px] flex-1 border-0 text-sm text-gray-600 placeholder:text-[#979797] focus:border-transparent"
          placeholder="Contact"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setContactEmail(options[selected].email);
              setInput(`${options[selected].email}`);
              setOptions([]);
            }
          }}
        />
      </div>
      <ul className="mb-4  text-sm text-gray-600 ">
        {options.map((option, i) => (
          <li
            className={`cursor-pointer hover:bg-gray-50 ${i === selected ? "bg-gray-200 text-purple-800" : ""}`}
            key={i}
            onClick={() => {
              setContactEmail(option.email);
              setInput(`${option.email}`);
              setOptions([]);
            }}
          >
            {option.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

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
