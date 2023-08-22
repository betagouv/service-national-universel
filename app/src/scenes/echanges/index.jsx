import React, { useEffect, useState } from "react";
import { Switch, useHistory, useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { SentryRoute } from "../../sentry";
import { useDispatch, useSelector } from "react-redux";
import API from "../../services/api";
import styled from "styled-components";
import Loader from "../../components/Loader";
import MailCloseIcon from "../../components/MailCloseIcon";
import MailOpenIcon from "../../components/MailOpenIcon";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { colors, translateState, urlWithScheme } from "../../utils";
import { toastr } from "react-redux-toastr";

const Echanges = () => {
  const user = useSelector((state) => state.Auth.young);
  const location = useLocation();
  const userTickets = location.state.userTickets;

  dayjs.extend(relativeTime).locale("fr");

  const renderSubject = (ticket) => {
    const subject = ticket.subject;
    const isNew = ticket.status === "NEW";
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
      <div className="px-4 md:px-0">
        <h4 className="text-3xl leading-9 font-bold text-gray-900 mb-4">Mes échanges</h4>
        <p className="text-base leading-6 font-normal text-gray-600 mb-4">Retrouvez ici vos échanges avec le support ou votre référent.</p>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <section className="border-b px-6 py-3 flex justify-between text-xs leading-4 font-medium tracking-wider uppercase text-gray-500">
          <span className="truncate md:w-1/5">Nº demande</span>
          <span className="w-1/4 md:w-2/5">Sujet</span>
          <span className="w-1/4 md:w-1/5">État</span>
          <span className="w-1/4 md:w-1/5 truncate">Dernière mise à jour</span>
        </section>
        {!userTickets ? (
          <Loader />
        ) : (
          userTickets
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .map((ticket) => (
              <NavLink to={`/besoin-d-aide/ticket/${ticket._id}`} key={ticket._id} className="border-b flex justify-between p-6 hover:bg-gray-100">
                <div className="flex w-full justify-between items-center">
                  <span className="text-sm leading-5 font-normal text-gray-500 w-1/4 md:w-1/5">{ticket.number}</span>
                  <span className="text-sm leading-5 font-normal text-gray-500 w-1/4 md:w-2/5">{renderSubject(ticket)}</span>
                  <div className="w-1/4 md:w-1/5 flex justify-start">
                    <span
                      className={`capitalize py-1 px-2 text-sm leading-5 rounded-2xl inline-block ${
                        ticket.status === "NEW" ? "text-[#27AF66] border border-[#A4D8BC] bg-[#A4D8BC]" : "text-gray-500 bg-gray-50 border border-gray-500"
                      }`}>
                      {translateState(ticket.status)}
                    </span>
                  </div>
                  <span className="text-sm leading-5 font-normal text-gray-500 truncate w-1/4 md:w-1/5">{dayjs(new Date(ticket.updatedAt)).fromNow()}</span>
                </div>
              </NavLink>
            ))
        )}
      </div>
    </div>
  );
};

export default Echanges;
