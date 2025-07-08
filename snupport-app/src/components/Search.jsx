import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiSearch, HiXCircle } from "react-icons/hi";
import { useHistory } from "react-router-dom";
import API from "../services/api";
import { sourceToIcon } from "../utils";
import Loader from "./Loader";
import { DebounceInput } from "react-debounce-input";
import { translateRole, useKeyPress } from "../utils";

export default function Search({ user }) {
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [hideItems, setHideItems] = useState(false);
  const history = useHistory();
  const messageTicketName = user.role === "AGENT" ? "ticket" : "message";
  const arrowUpPressed = useKeyPress("ArrowUp");
  const arrowDownPressed = useKeyPress("ArrowDown");
  const [selected, setSelected] = useState(-1);

  useEffect(() => {
    if (search) getTickets(search);
  }, [search]);

  useEffect(() => {
    if (arrowUpPressed) {
      selected > -1 ? setSelected(selected - 1) : -1;
    }
  }, [arrowUpPressed]);

  useEffect(() => {
    if (arrowDownPressed) {
      selected < tickets.length - 1 ? setSelected(selected + 1) : 0;
    }
  }, [arrowDownPressed]);

  const getTickets = async () => {
    if (search.length > 0 && !isSearching) setIsSearching(true);
    if (!search.length) {
      setIsSearching(false);
      setSearch("");
      setTickets([]);
      return;
    }
    try {
      setIsSearching(true);
      setHideItems(false);
      const { ok, data, code } = await API.get({ path: "/ticket/searchAll", query: { q: search } });
      setIsSearching(false);
      if (!ok) return toast.error(code);
      setTickets(data);
    } catch (e) {
      console.log(e.message);
    }
  };

  return (
    <div className="relative flex w-full flex-col items-center">
      <div className="relative flex w-full items-center">
        <HiSearch />
        <DebounceInput
          className="w-full !border-none py-2.5 pl-10 pr-3 text-sm text-gray-500 transition-colors"
          type="text"
          placeholder={`Rechercher un ${messageTicketName}`}
          onChange={(e) => setSearch(e.target.value)}
          minLength={3}
          debounceTimeout={500}
          value={search}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (selected === -1) window.open(`/ticket?advancedSearch=${search}`, "_blank");
              else window.open(`/ticket/${tickets[selected]._id}`, "_blank");
              setHideItems(true);
            }
          }}
        />
        <HiXCircle className="mr-3 text-xl text-red-700" onClick={() => setSearch("")} />
      </div>
      <div className="relative flex w-full items-center">
        {!hideItems && search.length > 0 && (
          <div className="absolute top-0 left-0 z-50 max-h-80 w-full overflow-auto  bg-white drop-shadow-lg">
            {search.length > 0 && isSearching && !tickets.length && <Loader size={20} className="my-4" />}
            {search.length > 0 && !isSearching && !tickets.length && <span className="block py-2 px-8 text-sm text-black">Il n'y a pas de résultat 👀</span>}
            {tickets?.map((ticket, index) => (
              <TicketCard
                key={ticket._id}
                _id={ticket._id}
                contactLastName={ticket.contactLastName}
                contactFirstName={ticket.contactFirstName}
                contactGroup={ticket.contactGroup}
                subject={ticket.subject}
                className="!my-0"
                contentClassName="!py-2 !shadow-none !rounded-none border-b-2"
                tags={ticket.tags}
                history={history}
                setHideItems={setHideItems}
                source={ticket.source}
                createdAt={new Date(ticket.createdAt)}
                isSelected={selected === index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const TicketCard = ({
  _id,
  subject,
  className = "",
  contentClassName = "",
  tags,
  setHideItems,
  source,
  createdAt,
  contactLastName = "",
  contactFirstName = " ",
  contactGroup,
  isSelected,
}) => {
  console.log(isSelected);
  return (
    <div
      key={_id}
      className={`my-1 w-full shrink-0 grow-0 cursor-pointer lg:my-4 ${className} `}
      onClick={() => {
        window.open(`/ticket/${_id}`, "_blank");
        setHideItems(true);
      }}
    >
      <article className={`flex items-center overflow-hidden rounded-lg bg-white py-6 shadow-lg ${contentClassName} ${isSelected ? "bg-gray-200" : ""}`}>
        <div className="flex flex-grow flex-col">
          <header className="flex items-center pl-4 pr-8 leading-tight">
            <span>{sourceToIcon[source]}</span>
            <h3 className="my-0 pl-5 text-lg text-black">{subject}</h3>
          </header>

          <footer className=" flex flex-col items-start justify-between gap-1 px-8 leading-none">
            <span className="ml-2  text-sm text-gray-500">
              {contactLastName} {contactFirstName} - {translateRole[contactGroup]}
            </span>
            <p className="flex flex-wrap">
              <Tags tags={tags} />
            </p>
          </footer>
        </div>
        <span className="justify-end">{createdAt.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}</span>

        <svg xmlns="http://www.w3.org/2000/svg" className="mr-6 h-4 w-4 shrink-0 grow-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </article>
    </div>
  );
};

const Tags = ({ tags = [] }) =>
  tags.map((tag) => (
    <span className="text-snu-purple-700 ml-2 mb-2 rounded-md bg-snu-purple-100 px-2 py-0.5 text-xs" key={tag}>
      {tag}
    </span>
  ));
