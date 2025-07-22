import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import TicketPreviewContainer from "../components/TicketPreviewContainer";

import Pagination from "../../../components/Pagination";
import { getFiltersFromUrl, formatSearchString } from "@/utils/searchParams.utils";
import Header from "./Header";
import SideBar from "./SideBar";
import Loader from "@/components/Loader";

import useAgents from "@/hooks/useAgents";
import useTickets from "../hooks/useTickets";
import API from "@/services/api";
import { addTicket } from "@/redux/ticketPreview/actions";
import TableItem from "./partials/TableItem";

export default function Home() {
  const dispatch = useDispatch();
  const user = useSelector((state: { Auth: { user: any } }) => state.Auth.user); // Todo: type globally
  const history = useHistory();
  const defaultFilters = {
    page: 1,
    status: "TOTREAT",
    sources: [],
    agent: [],
    agentId: "",
    contactId: "",
    contactDepartment: [],
    contactCohort: [],
    parcours: [],
    folderId: "",
    sorting: "",
    ticketId: "",
    tag: [],
    contactGroup: [],
    size: 30,
    advancedSearch: "",
    creationDate: { from: "", to: "" },
    lastActivityDate: { from: "", to: "" },
  };
  const filter = getFiltersFromUrl(defaultFilters);
  const [selectedTicket, setSelectedTicket] = useState([]);
  const { isPending, data: { tickets = [], aggregations = {}, total = 0 } = {} } = useTickets(filter);
  const {
    data: { agents, referentsDepartment, referentsRegion },
  } = useAgents();

  const openTicketPreview = async (ticket) => {
    try {
      const { ok, data, code } = await API.get({ path: `/ticket/${ticket._id}` });
      if (!ok) {
        toast.error(code);
        return;
      }
      const messageReponse = await API.get({ path: "/message", query: { ticketId: ticket._id } });
      if (!messageReponse.ok) {
        toast.error(code);
        return;
      }
      const storedTicket = { ticket: data.ticket, tags: data.tags, messages: messageReponse.data };
      if (user.role === "AGENT") {
        const signatureResponse = await API.get({ path: `/shortcut`, query: { signatureDest: data.ticket.contactGroup } });
        dispatch(addTicket({ ...storedTicket, signature: signatureResponse.data?.content }));
      } else {
        dispatch(addTicket(storedTicket));
      }
    } catch (e) {
      toast.error("Une error est survenue");
    }
    return;
  };

  function update(newFilter: Record<string, any>) {
    const search = formatSearchString(newFilter);
    history.replace({ pathname: window.location.pathname, search });
  }

  return (
    <div className="relative flex flex-1 overflow-hidden">
      {user?.role === "AGENT" && <TicketPreviewContainer filter={filter} update={update} />}
      <SideBar filter={filter} aggregations={aggregations} update={update} />
      <div className="flex flex-1 flex-col justify-between gap-6 overflow-y-auto p-[22px] pb-0 ">
        <div className="flex h-max flex-col rounded-lg bg-white pt-[30px] pb-[50px] shadow-block">
          <Header
            filter={filter}
            aggregations={aggregations}
            update={update}
            selectedTicket={selectedTicket}
            tickets={tickets}
            setSelectedTicket={setSelectedTicket}
            user={user}
            advancedSearch={!!filter.advancedSearch}
            agents={agents}
          />
          <Pagination
            className="px-6 pb-6 pt-2"
            total={total}
            currentPage={parseInt(filter.page)}
            range={parseInt(filter.size)}
            onPageChange={(page) => update({ ...filter, page })}
            onSizeChange={(size) => update({ ...filter, size })}
            tickets={tickets}
            selectedTicket={selectedTicket}
            setSelectedTicket={setSelectedTicket}
          />
          {isPending ? (
            <Loader />
          ) : (
            <div className="mb-[42px] flex flex-col divide-y divide-gray-200 border-t border-b border-gray-200">
              {tickets.map((ticket) => (
                <TableItem
                  key={ticket._id}
                  ticket={ticket}
                  update={update}
                  filter={filter}
                  selectedTicket={selectedTicket}
                  setSelectedTicket={setSelectedTicket}
                  agents={agents}
                  referentsRegion={referentsRegion}
                  referentsDepartment={referentsDepartment}
                  user={user}
                  openTicketPreview={openTicketPreview}
                />
              ))}
            </div>
          )}
          <Pagination
            className="px-6"
            total={total}
            currentPage={parseInt(filter.page)}
            range={parseInt(filter.size)}
            onPageChange={(page) => update({ ...filter, page })}
            onSizeChange={(size) => update({ ...filter, size })}
            tickets={tickets}
            selectedTicket={selectedTicket}
            setSelectedTicket={setSelectedTicket}
          />
        </div>
      </div>
    </div>
  );
}
