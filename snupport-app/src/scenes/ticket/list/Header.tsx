import React from "react";
import ReactTooltip from "react-tooltip";
import { toast } from "react-hot-toast";
import { SORTING } from "@/constants";
import HeaderMacroDropdown from "../components/macros/HeaderDropDown";
import SortDropdown from "@/components/SortDropdown";
import { SNU_URL_API } from "@/config";
import useUpdateTicket from "../hooks/useUpdateTicket";
import { useQuery } from "@tanstack/react-query";
import Tab from "./partials/Tab";
import Filter from "./partials/Filter";

export default function Header({ filter, update, aggregations, selectedTicket, setSelectedTicket, tickets, user, advancedSearch, agents }) {
  const newTicketsCount = aggregations.status?.find((a) => a.key === "NEW")?.doc_count || 0;
  const openTicketsCount = aggregations.status?.find((a) => a.key === "OPEN")?.doc_count || 0;
  const pendingTicketsCount = aggregations.status?.find((a) => a.key === "PENDING")?.doc_count || 0;
  const toTreatTicket = newTicketsCount + openTicketsCount + pendingTicketsCount;

  const { data: cohortList } = useQuery<string[]>({
    queryKey: ["cohort"],
    queryFn: async () => {
      const res = await fetch(`${SNU_URL_API}/cohort/public`);
      const json = await res.json();
      const { ok, code, data } = json;
      if (!ok) throw new Error(code);
      return data.map((cohort) => cohort.name);
    },
  });

  const { mutate: updateTicket } = useUpdateTicket();

  const handleDesassigner = async (selectedTicket) => {
    if (!selectedTicket?.length) return;

    const body = {
      agentFirstName: "",
      agentLastName: "",
      agentEmail: "",
      agentId: "",
    };

    for await (let ticketId of selectedTicket) {
      updateTicket(
        { ticketId, payload: body },
        {
          onSuccess: () => {
            toast.success("Ticket désassigné");
          },
        }
      );
    }
    update(filter);
  };

  const commonSortAction = [
    { name: "Du plus récent (date de création)", handleClick: () => update({ ...filter, sorting: SORTING.CREATIONDATE }) },
    { name: "Du plus récent (date de mise à jour)", handleClick: () => update({ ...filter, sorting: SORTING.UPDATEDATE }) },
  ];

  const sortActions = user.role === "AGENT" ? [{ name: "Par agent", handleClick: () => update({ ...filter, sorting: SORTING.AGENT }) }, ...commonSortAction] : commonSortAction;

  return (
    <>
      <div className="mb-4 flex items-center justify-between pl-6 pr-[30px]">
        <h6 className="flex text-gray-900">
          <strong>{advancedSearch ? "Recherche avancée" : "Boîte de réception"}</strong>
          {user.role === "AGENT" ? <div className="pl-3"> ({toTreatTicket} tickets à traiter) </div> : <div className="pl-3"> ({toTreatTicket} messages à traiter) </div>}
        </h6>

        <div className="flex">
          {user.role === "AGENT" && (
            <>
              <ReactTooltip
                id="desassigner-tooltip"
                disable={selectedTicket.length > 0}
                type="dark"
                place="top"
                effect="solid"
                className="custom-tooltip-radius !shadow-sm !text-white !text-xs !font-medium"
              />
              <div data-tip="Sélectionnez au moins un ticket" data-for="desassigner-tooltip" className="inline-block">
                <button
                  className="flex h-[40px] cursor-pointer items-center rounded-md border border-gray-300 bg-white px-4 mr-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
                  disabled={selectedTicket.length === 0}
                  onClick={() => handleDesassigner(selectedTicket)}
                >
                  <p className="w-full">Désassigner</p>
                </button>
              </div>

              <HeaderMacroDropdown
                selectedTicket={selectedTicket}
                onClose={() => {
                  update(filter);
                  setSelectedTicket([]);
                }}
                onRefresh={() => update(filter)}
                className="w-[250px] max-w-[250px]"
              />
            </>
          )}
        </div>
      </div>
      <Tab filter={filter} setFilter={(f) => update(f)} statusArr={aggregations.status} toTreatTicket={toTreatTicket} />
      <div className={`flex ${user.role === "AGENT" || user.role === "DG" ? "justify-between" : "justify-end"}`}>
        {(user.role === "AGENT" || user.role === "DG") && <Filter filter={filter} setFilter={(f) => update(f)} agents={agents} cohortList={cohortList} />}
        <SortDropdown className="h-[40px] mr-3" items={sortActions} buttonClass={"rounded-md"} />
      </div>
    </>
  );
}
