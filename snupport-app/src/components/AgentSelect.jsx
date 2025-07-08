import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";
import { sortAgents } from "../utils";

const AgentSelect = ({ value, onChange, className = "" }) => {
  const [agents, setAgents] = useState([]);
  const specificOrder = ["Réponse", "Hélène", "Margaux", "Inès", "Clara", "Mathilde"];
  const sortedAgents = agents.sort((a, b) => sortAgents(specificOrder, a, b));

  const getAgents = async () => {
    try {
      const { ok, data } = await API.get({ path: `/agent/` });
      if (ok) setAgents(data.AGENT);
    } catch (e) {
      toast.error(e.message);
    }
  };

  useEffect(() => {
    getAgents();
  }, []);
  return (
    <select
      value={value?._id}
      className={`w-[100%] rounded border border-gray-300 bg-white py-2.5 px-3.5 pr-10 text-sm text-gray-800 shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400 ${className}`}
      placeholder="Nom de l'agent"
      onChange={(e) => onChange(agents.find(({ _id }) => _id === e.target.value))}
    >
      <option value=""> Choisissez un agent</option>
      {sortedAgents.map((agent) => {
        return (
          <option key={agent._id} value={agent._id} label={`${agent.firstName} ${agent.lastName}`}>
            {agent.firstName} {agent.lastName}
          </option>
        );
      })}
    </select>
  );
};

export default AgentSelect;
