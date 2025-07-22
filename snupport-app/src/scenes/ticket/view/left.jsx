import React, { Fragment, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  HiLockClosed,
  HiOutlineDesktopComputer,
  HiChevronRight,
  HiOutlineDuplicate,
  HiLink,
  HiOutlineLocationMarker,
  HiOutlineMail,
  HiX,
  HiChevronDown,
  HiChevronLeft,
} from "react-icons/hi";
import { LiaHistorySolid } from "react-icons/lia";
import { BsPeople } from "react-icons/bs";
import { HiOutlineIdentification } from "react-icons/hi2";
import { useSelector } from "react-redux";
import API from "../../../services/api";
import { translateAttributesSNU, translateRole, urlify, htmlCleaner, TRANSLATE_ROLE, translateParcours } from "../../../utils";
import Button from "../components/Button";
import Textarea from "../components/Textarea";
import TransferTicketModal from "../components/TransferTicketModal";
import CreateTicketModal from "./../components/CreateTicketModal";
import { capture } from "../../../sentry";
import { serializeTicketUpdate } from "../service";

import PenImg from "../../../assets/pen.svg";
import CrossImg from "../../../assets/cross.svg";

export default ({ ticket, setTicket, tags, setTags, agents }) => {
  const [contact, setContact] = useState({});
  const [open, setOpen] = useState(true);
  const user = useSelector((state) => state.Auth.user);

  useEffect(() => {
    (async () => {
      if (ticket.contactId) {
        const { data } = await API.get({ path: `/contact/${ticket.contactId}` });
        setContact(data);
      }
    })();
  }, [ticket]);

  const handleChangeRole = async (contactGroup) => {
    try {
      const body = serializeTicketUpdate({ contactGroup });
      const { ok, data } = await API.patch({ path: `/ticket/${ticket._id}`, body });
      if (!ok) return toast.error("Erreur lors de la mise à jour du role");
      setTicket(data.ticket);
      toast.success("Role modifié");
    } catch (e) {
      capture(e);
    }
  };
  const contactProfile = ticket.contactAttributes.filter((contactAttribute) => contactAttribute?.name === "lien vers profil");

  return (
    <div className="flex w-[378px] flex-none flex-col border-r border-light-grey bg-gray-50 p-8 pt-5">
      <div className="">
        <div className="flex" onClick={() => (contactProfile.length !== 0 ? window.open(`${contactProfile[0].value}`, "_blank") : 0)}>
          {contact && (
            <>
              <h6 className="mb-2 cursor-pointer text-lg font-bold text-gray-900">{`${contact.firstName ? contact.firstName + " " + contact.lastName : contact.email}`}</h6>
              <HiChevronRight className="mt-1 text-xl text-gray-900" />
            </>
          )}
        </div>
        <select
          onChange={(e) => handleChangeRole(e.target.value)}
          className={`  mb-5 block h-10 w-full rounded-md border-gray-200 pl-4 text-center text-sm font-medium  `}
          disabled={user.role === "DG"}
        >
          {Object.keys(translateRole).map((key) => (
            <option key={key} value={key} selected={key === ticket.contactGroup}>
              {translateRole[key]}
            </option>
          ))}
        </select>
        {user.role === "AGENT" && ticket.contactGroup === "unknown" && (
          <>
            <span className="z-10 w-max bg-gray-50 pl-3  text-xs font-bold text-grey-text">Lier au contact</span>
            {user.role !== "DG" && <AutoCompleteTicketAttributes ticket={ticket} setTicket={setTicket} value="" />}
          </>
        )}
      </div>
      <div className="relative mb-3 flex cursor-pointer items-center justify-center" onClick={() => setOpen(!open)}>
        <hr className="absolute w-full border-gray-300" />
        <span className="z-10 w-max bg-gray-50 pl-3  text-xs font-bold text-grey-text">Attributs</span>
        {open ? <HiChevronDown className="z-10 bg-gray-50 pr-1 text-xl" /> : <HiChevronLeft className="z-10 bg-gray-50 pr-1 text-xl" />}
      </div>
      {open && (
        <div className=" flex h-max flex-1 flex-col overflow-y-auto">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-1.5 mb-2">
            <Mail icon={<HiOutlineMail />} name={contact?.email} />
          </div>
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-1.5 mb-2">
            <span className="text-xl text-[#C4C4C4]">
              <BsPeople />
            </span>
            <span className="text-sm font-medium text-gray-500">auteur: {ticket.author ? ticket.author : "null"}</span>
          </div>
          {ticket?.parcours && (
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-1.5 text-xl text-[#C4C4C4] mb-2">
              <HiOutlineIdentification />
              <span className="text-sm font-medium text-gray-500">parcours: {translateParcours[ticket.parcours]}</span>
            </div>
          )}

          <Attributes attributes={ticket.contactAttributes.filter((contactAttribute) => contactAttribute?.name !== "lien vers profil")} />
        </div>
      )}
      <TagsEditor name="Etiquettes" ticket={ticket} tags={tags || []} setTicket={setTicket} setTags={setTags} user={user} />

      <Notes ticket={ticket} setTicket={setTicket} agents={agents} />
    </div>
  );
};

const AutoCompleteTicketAttributes = ({ ticket, setTicket, value }) => {
  const [input, setInput] = useState(value);
  const [options, setOptions] = useState([]);
  const arrowUpPressed = useKeyPress("ArrowUp");
  const arrowDownPressed = useKeyPress("ArrowDown");
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (arrowUpPressed) {
      selected > 0 ? setSelected(selected - 1) : 0;
      console.log("arrowUpPressed");
    }
  }, [arrowUpPressed]);

  useEffect(() => {
    if (arrowDownPressed) {
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
      const { ok, data, code } = await API.get({ path: "/contact/search", query: { q } });
      if (!ok) return toast.error(code);
      setOptions(data);
    } catch (e) {
      console.log(e.message);
    }
  };

  async function updateTicketContact(updatedTicketContact) {
    try {
      const body = serializeTicketUpdate({
        contactGroup: updatedTicketContact.role,
        contactDepartment: updatedTicketContact.department,
        contactAttributes: updatedTicketContact.attributes,
      });
      const { data } = await API.patch({
        path: `/ticket/${ticket._id}`,
        body,
      });
      setTicket(data.ticket);
      toast.success("Ticket mis à jour");

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du ticket :", error);
      toast.error("Erreur lors de la mise à jour du ticket");
    }
  }

  return (
    <div>
      <div className="mb-2 flex divide-x divide-gray-300 overflow-hidden rounded-md border border-gray-300">
        <input
          onClick={() => setInput("")}
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          className="w-32 flex-1 border-0 text-sm text-gray-600 placeholder:text-[#979797] focus:border-transparent"
          placeholder="Contact"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setInput(`${options[selected].firstName} ${options[selected].lastName}`);
              setOptions([]);
            }
          }}
        />
      </div>
      <ul className="mb-2  text-sm text-gray-600 ">
        {options.slice(0, 5)?.map((option, index) => (
          <li
            className={`cursor-pointer hover:bg-blue-50 ${index === selected ? "bg-gray-200 text-purple-800" : ""}`}
            key={index}
            onClick={() => {
              updateTicketContact(option);
              setInput(`${option.firstName} ${option.lastName}`);
              setOptions([]);
            }}
          >
            {option.firstName} {option.lastName} | {option.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Notes = ({ ticket, setTicket, agents }) => {
  const [str, setStr] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [open, setOpen] = useState(true);
  const [editedNote, setEditedNode] = useState({});

  const user = useSelector((state) => state.Auth.user);

  async function addNote() {
    const note = {};
    note.authorName = `${user.firstName} ${user.lastName} - ${TRANSLATE_ROLE[user.role]}`;
    note.createdAt = new Date();
    note.content = str;
    const body = serializeTicketUpdate({ notes: [...(ticket.notes || []), note] });
    const { data } = await API.patch({ path: `/ticket/${ticket._id}`, body });
    setTicket(data.ticket);
    setStr("");
    toast.success("Note ajoutée");
  }

  async function deleteNote(id) {
    if (window.confirm("Voulez-vous vraiment supprimer cette note ? Cette opération est définitive")) {
      const body = serializeTicketUpdate({ notes: ticket.notes.filter((note) => note._id !== id) });
      const { data } = await API.patch({ path: `/ticket/${ticket._id}`, body });
      setTicket(data.ticket);
      toast.success("Note supprimée");
    }
  }

  async function updateNote(updatedNote) {
    const body = serializeTicketUpdate({
      notes: ticket.notes.map((note) => {
        if (note._id === updatedNote._id) {
          return { ...note, content: updatedNote.content };
        }
        return note;
      }),
    });
    const { data } = await API.patch({
      path: `/ticket/${ticket._id}`,
      body,
    });
    setTicket(data.ticket);
    setEditedNode({});
    toast.success("Note mise à jour");
  }

  return (
    <div className="mt-6">
      <div className="relative mb-4 flex cursor-pointer items-center justify-center" onClick={() => setOpen(!open)}>
        <hr className="absolute w-full border-gray-300" />
        <span className="z-10 w-max bg-gray-50 pl-3  text-xs font-bold text-grey-text">Notes internes</span>
        {open ? <HiChevronDown className="z-10 bg-gray-50 pr-1 text-xl" /> : <HiChevronLeft className="z-10 bg-gray-50 pr-1 text-xl" />}
      </div>

      {open && (
        <div className={`${!editedNote?._id && "max-h-64"} min-h-0 overflow-y-auto`} disabled={user.role !== "DG"}>
          {ticket.notes?.map((e, index) => {
            const cleanContent = htmlCleaner(e.content);
            if (e._id === editedNote?._id) {
              return (
                <div key={e._id} className="flex flex-col pr-3">
                  <Textarea
                    focus
                    value={editedNote?.content}
                    onChange={(value) => {
                      setEditedNode({ ...editedNote, content: value });
                    }}
                  />
                  <div className="mb-8 flex justify-end gap-1">
                    <Button
                      onClick={() => {
                        setEditedNode({});
                      }}
                    >
                      Annuler
                    </Button>
                    <Button className="bg-accent-color !text-white transition-colors hover:bg-indigo-500" onClick={() => updateNote(editedNote)}>
                      Enregistrer
                    </Button>
                  </div>
                </div>
              );
            }
            return (
              <div key={e._id} className={`mb-[22px] text-xs text-gray-500 ${index === ticket.notes.length - 1 && "rounded-lg "}`}>
                <span className="font-semibold">
                  {e.authorName} -{" "}
                  {new Date(e.createdAt).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  : <br />
                </span>
                <div className="flex items-center pr-2">
                  <span className="mr-2 flex-1" dangerouslySetInnerHTML={{ __html: urlify(cleanContent) }}></span>
                  {user.role === "AGENT" && (
                    <>
                      <button disabled={!!editedNote?._id} className={`flex h-6 w-6 items-center justify-center rounded-full hover:scale-125`}>
                        <img
                          className="w-[100%]"
                          src={PenImg}
                          onClick={() => {
                            setEditedNode(e);
                          }}
                        />
                      </button>
                      <button disabled={!!editedNote?._id} className={`flex h-6 w-6 items-center justify-center rounded-full hover:scale-125`}>
                        <img
                          className="w-[70%]"
                          src={CrossImg}
                          onClick={() => {
                            deleteNote(e._id);
                          }}
                        />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!editedNote._id && (
        <>
          <Textarea value={str} onChange={setStr} disabled={!!editedNote._id || user.role === "DG"} />
          <div className="flex justify-between gap-1">
            <Button disabled={!!editedNote._id || user.role === "DG"} onClick={addNote}>
              Enregistrer
            </Button>
            {user.role === "AGENT" && (
              <>
                <TransferTicketModal disabled={!!editedNote._id} open={transferOpen} setOpen={setTransferOpen} ticket={ticket} />
                <Button
                  disabled={!!editedNote._id}
                  onClick={() => {
                    window.open("/ticket/new", "_blank");
                  }}
                >
                  Créer un ticket
                </Button>
                <CreateTicketModal open={createOpen} setOpen={setCreateOpen} agents={agents} />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const Mail = ({ icon, name }) => (
  <Fragment>
    <span className="text-xl text-[#C4C4C4]">{icon}</span>
    <span className="text-sm font-medium text-gray-500">{name}</span>
    <button
      onClick={() => {
        navigator.clipboard.writeText(name);
        toast.success("Copié!");
      }}
    >
      <HiOutlineDuplicate className="text-gray-500" />
    </button>
  </Fragment>
);

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

const TagsEditor = ({ name, tags, ticket, setTicket, setTags, user }) => {
  const [defaultTags, setDefaultTags] = useState([]);
  const [input, setInput] = useState("");
  const arrowUpPressed = useKeyPress("ArrowUp");
  const arrowDownPressed = useKeyPress("ArrowDown");
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (arrowUpPressed) {
      selected > 0 ? setSelected(selected - 1) : 0;
      console.log("arrowUpPressed");
    }
  }, [arrowUpPressed]);

  useEffect(() => {
    if (arrowDownPressed) {
      selected < defaultTags.length - 1 && selected < 4 ? setSelected(selected + 1) : 0;
      console.log("arrowDownPressed");
    }
  }, [arrowDownPressed]);

  useEffect(() => {
    update();
  }, [input]);

  async function update() {
    if (!input) return setDefaultTags([]);
    const { ok, data } = await API.get({
      path: "/tag/search",
      query: { q: input },
    });
    if (ok) {
      const filteredData = data.filter((tag) => tag.userVisibility !== "OLD");
      setDefaultTags(filteredData);
    }
  }

  const addTag = async (tag) => {
    try {
      const body = serializeTicketUpdate({ tags: [...new Set([...tags, tag])] });
      const { ok, data } = await API.patch({ path: `/ticket/${ticket._id}`, body });
      if (!ok) return toast.error("Erreur lors de l'ajout du tag");
      setTicket(data.ticket);
      setTags(data.tags);
      toast.success("Tag ajouté");
      setInput("");
    } catch (e) {
      toast.error(e, "Erreur lors de l'ajout du tag");
    }
  };

  const removeTag = async (tag) => {
    try {
      const body = serializeTicketUpdate({ tags: tags.filter((t) => t !== tag) });
      const { ok, data } = await API.patch({ path: `/ticket/${ticket._id}`, body });
      if (ok) {
        setTicket(data.ticket);
        setTags(data.tags);
        toast.success("Tag supprimé");
      }
    } catch (e) {
      toast.error(e, "Erreur lors de la suppression du tag");
    }
  };

  return (
    <div>
      <div className="relative mb-3 flex items-center justify-center mt-2">
        <hr className="absolute w-full border-gray-300" />
        <span className="z-10 w-max bg-gray-50 pl-3 pr-3  text-xs font-bold text-grey-text">{name}</span>
      </div>

      <div className="mb-4 mt-2 flex divide-x divide-gray-300 overflow-hidden rounded-md border border-gray-300">
        <input
          onClick={() => setInput("")}
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          disabled={user.role === "DG"}
          className="w-[200px] flex-1 border-0 text-sm text-gray-600 placeholder:text-[#979797] focus:border-transparent"
          placeholder="Commencez à taper"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addTag(defaultTags[selected]);
            }
          }}
        />
      </div>
      <ul className="mb-4  text-sm  ">
        {defaultTags.slice(0, 10).map((tag, i) => (
          <li
            className={`cursor-pointer hover:bg-gray-200 ${i === selected ? "bg-gray-200 text-purple-800" : ""}`}
            key={tag._id}
            onClick={() => {
              addTag(tag);
            }}
            onKeyDown={(e) => {
              console.log(e);
              if (e.key === "Enter") {
                addTag(tag);
              }
            }}
          >
            {tag.name}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2.5">
        {tags.map((tag) => (
          <span className="flex items-center gap-0.5 rounded-full bg-purple-100 py-0.5 pl-2.5 pr-1" key={tag.id}>
            <span className="text-sm font-medium text-purple-800">{tag.name}</span>
            {(tag.userVisibility !== "AGENT" && user.role !== "DG") || (tag.userVisibility === "AGENT" && user.role === "AGENT") ? (
              <HiX onClick={() => removeTag(tag)} className="cursor-pointer text-base text-indigo-400" />
            ) : (
              <HiLockClosed className="text-gray-400" />
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

const Attributes = ({ attributes }) => {
  return (
    <div className="flex flex-col">
      {attributes?.map((e, index) => (
        <Attribute attribute={e} key={index} />
      ))}
    </div>
  );
};

const Attribute = ({ attribute }) => {
  let emoji = "";
  switch (attribute?.name) {
    case "departement":
      emoji = <HiOutlineLocationMarker />;
      break;
    case "region":
      emoji = <HiOutlineLocationMarker />;
      break;
    case "date de création":
      emoji = <HiOutlineDesktopComputer className="mb-2" />;
      break;
    case "dernière connexion":
      emoji = <LiaHistorySolid className="mb-2" />;
      break;
    default:
      emoji = <HiLink />;
  }

  if (attribute?.format === "date")
    return (
      <div className="flex">
        <span className="text-xl text-[#C4C4C4]">{emoji}</span>
        <span className="pl-1 text-sm font-medium text-gray-500">{attribute?.name}</span>
        <span className="text-sm font-medium text-gray-500">
          {":"} {attribute?.value?.slice(8, 10)}
          {"-"}
          {attribute?.value?.slice(5, 7)}
          {"-"}
          {attribute?.value?.slice(0, 4)}
        </span>
        <br></br>
      </div>
    );
  if (attribute?.format === "link" || attribute.value?.includes("https://"))
    return (
      <div className="flex mb-2">
        <span className="text-xl text-[#C4C4C4]">{emoji}</span>
        <a href={attribute.value} target="_blank" className="pl-1 text-sm font-medium text-gray-500 underline " rel="noreferrer">
          {attribute.name}
        </a>
      </div>
    );
  if (attribute?.name === "role" || attribute?.name === undefined) {
    return <></>;
  }
  return (
    <div className="flex mb-2">
      <span className=" text-xl text-[#C4C4C4]">{emoji}</span>
      <span className=" px-1 pl-1 text-sm font-medium text-gray-500">
        {attribute?.name} : {translateAttributesSNU(attribute?.value)}
      </span>
    </div>
  );
};
