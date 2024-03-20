import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import Loader from "../../components/Loader";
import "dayjs/locale/fr";
// import { translateState } from "../../utils";
import { toastr } from "react-redux-toastr";
import { capture } from "../../sentry";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";

const Echanges = () => {
  const [userTickets, setUserTickets] = useState([]);

  //   Temporaire ils faut trouver un moyen de mieux gérer les status
  const renderStatus = (status) => {
    let classes;
    let translatedStatus;

    switch (status) {
      case "open":
      case "OPEN":
        classes = "text-[#27AF66] border border-[#A4D8BC] bg-[#A4D8BC] font-bold";
        translatedStatus = "Ouvert";
        break;
      case "new":
      case "NEW":
        classes = "text-blue-600 border border-blue-300 bg-blue-300 font-bold";
        translatedStatus = "Envoyé";
        break;
      case "closed":
      case "CLOSED":
        classes = "text-gray-400 border border-gray-300 bg-gray-300 font-normal";
        translatedStatus = "Résolu";
        break;
      case "pending reminder":
      case "PENDING REMINDER":
        classes = "text-gray-400 border border-gray-300 bg-gray-300 font-normal";
        translatedStatus = "En attente";
        break;
      case "pending closure":
      case "PENDING CLOSURE":
        classes = "text-gray-400 border border-gray-300 bg-gray-300 font-normal";
        translatedStatus = "En attente";
        break;
      case "pending":
      case "PENDING":
        classes = "text-gray-400 border border-gray-300 bg-gray-300 font-normal";
        translatedStatus = "En attente";
        break;
      default:
        classes = "text-gray-500 bg-gray-50 border border-gray-500 font-normal";
        translatedStatus = status;
    }

    return <span className={`capitalize py-1 px-2 text-sm leading-5 rounded-2xl inline-block ${classes}`}>{translatedStatus}</span>;
  };

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await API.get(`/SNUpport/tickets`);
        if (response && response.ok) {
          const { data } = response;
          setUserTickets(data);
        } else {
          toastr.error("Erreur pendant la récupération des Tickets");
          setUserTickets([]);
        }
      } catch (error) {
        capture(error);
        toastr.error("Le fichier n'a pas pu être téléchargé");
      }
    };
    fetchTickets();
  }, []);

  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.extend(relativeTime);
  dayjs.locale("fr");
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const renderSubject = (ticket) => {
    const subject = ticket.subject;
    const isNew = ticket.status === "OPEN";
    const index = subject.indexOf(" - ");
    const firstPart = index !== -1 ? subject.substring(0, index) : subject;
    const secondPart = index !== -1 ? subject.substring(index + 3) : null;

    return (
      <div className="flex flex-col">
        <span className={`text-sm leading-5 ${isNew ? "font-bold" : "font-normal"} text-gray-900`}>{firstPart}</span>
        {secondPart && <span className={`text-sm leading-5 ${isNew ? "font-bold" : "font-normal"} text-gray-500 truncate`}>{secondPart}</span>}
      </div>
    );
  };

  return (
    <div className="pt-12 md:px-10">
      <div className="px-[1rem] md:px-[0rem]">
        <h4 className="text-3xl leading-9 font-bold text-gray-900 mb-4">Mes échanges</h4>
        <p className="text-base leading-6 font-normal text-gray-600 mb-4">Retrouvez ici vos échanges avec le support ou votre référent.</p>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <section className="border-b py-[2rem] px-[1rem] md:px-[2rem] flex justify-between text-xs leading-4 font-medium tracking-wider uppercase text-gray-500">
          <span className="w-1/7 md:w-1/5 truncate hidden md:block">Nº demande</span>
          <span className="w-1/7 md:w-1/5 truncate md:hidden">Nº</span>
          <span className="w-2/5 md:w-3/5">Sujet</span>
          <span className="w-1/5 md:w-1/5">État</span>
          <span className="w-1/6 md:w-1/5 truncate">Dernière mise à jour</span>
        </section>
        {!userTickets ? (
          <Loader />
        ) : (
          userTickets
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .map((ticket) => (
              <Link to={`/echanges/${ticket._id}`} key={ticket._id} className="border-b flex justify-between py-[2rem] px-[1rem] md:px-[2rem] hover:bg-gray-100">
                <div className="flex w-full justify-between items-center">
                  <span className="text-sm leading-5 font-normal text-gray-500 w-1/7 md:w-1/5">{ticket.number}</span>
                  <span className="text-sm leading-5 font-normal text-gray-500 w-2/5 md:w-3/5 truncate">{renderSubject(ticket)}</span>
                  <div className="w-1/5 md:w-1/5 flex justify-start">{renderStatus(ticket.status)}</div>
                  <span className="text-sm leading-5 font-normal text-gray-500 truncate w-1/6 md:w-1/5">{dayjs.utc(new Date(ticket.updatedAt)).tz(userTimezone).fromNow()}</span>
                </div>
              </Link>
            ))
        )}
      </div>
    </div>
  );
};

export default Echanges;
