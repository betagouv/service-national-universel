import React, { Fragment, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import API from "../../services/api";
import { HiTrash } from "react-icons/hi";
import Modal from "react-modal";
import Pagination, { paginate } from "../../components/Pagination";
import { capture } from "../../sentry";

import { TH, TFooter } from "../../components/Table";

export const DeleteAgent = () => {
  const [agents, setAgents] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [searchAgent, setSearchAgent] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchAgents();
  }, []);

  async function fetchAgents() {
    try {
      const response = await API.get({ path: `/agent` });
      if (response.ok) {
        setAgents(response.data);
      }
    } catch (e) {
      capture(e);
      toast.error("Un problème est survenu lors de la récupération des agents");
    }
  }

  async function deleteAgent(agentId) {
    try {
      const response = await API.delete({ path: `/agent/${agentId}` });
      if (response.ok) {
        toast.success("Agent supprimé avec succès");
        fetchAgents();
      }
    } catch (e) {
      toast.error("Un problème est survenu lors de la suppression de l'agent");
      capture(e);
    }
  }

  function openModal(agentId) {
    setSelectedAgent(agentId);
    setModalIsOpen(true);
  }

  function closeModal() {
    setModalIsOpen(false);
  }

  function confirmDelete() {
    deleteAgent(selectedAgent);
    closeModal();
  }

  function handleRoleChange(e) {
    setSelectedRole(e.target.value);
    setCurrentPage(1);
  }
  function handleSearchChange(e) {
    setSearchAgent(e.target.value);
    setCurrentPage(1);
  }

  return (
    <Fragment>
      <div className="relative flex w-full items-center mb-2">
        <input
          className="w-full py-2.5 pl-10 pr-3 text-sm text-gray-500 transition-colors rounded-md border border-gray-300 transition-colors focus:border-gray-400"
          type="text"
          placeholder="Recherche agents..."
          onChange={handleSearchChange}
          value={searchAgent}
        />
        <span className="material-icons relative right-6 text-xl text-red-400 cursor-pointer " onClick={() => setSearchAgent("")}>
          clear
        </span>
        <span className="material-icons absolute left-3 text-xl text-gray-400">search</span>
        <select
          className="ml-2 py-2.5 pr-3 text-sm text-gray-500 transition-colors rounded-md border border-gray-300 transition-colors focus:border-gray-400"
          value={selectedRole}
          onChange={handleRoleChange}
        >
          <option value="">Tout les rôles</option>
          <option value="AGENT">Agent</option>
          <option value="REFERENT_DEPARTMENT">Référent Département</option>
          <option value="REFERENT_REGION">Référent Région</option>
          <option value="DG">DG</option>
        </select>
      </div>{" "}
      <Table
        agents={Object.values(agents)
          .flat()
          .filter((agent) => `${agent.firstName} ${agent.lastName}`.toLowerCase().includes(searchAgent.toLowerCase()) && (selectedRole === "" || agent.role === selectedRole))}
        openModal={openModal}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />{" "}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={{
          overlay: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          content: {
            position: "relative",
            width: "50%",
            margin: "0 auto",
          },
        }}
      >
        <h5 className="mb-[20px] text-center text-xl font-bold text-gray-900">Confirmer suppression</h5>
        <p className="mb-4 text-center text-xs text-gray-700">Etes vous sur de vouloir supprimer cet agent ?</p>
        <div className="flex gap-2">
          <button
            className="h-[30px] flex-1 rounded-md border border-gray-300 px-3 text-center text-xs font-medium text-custom-red transition-colors hover:bg-red-50"
            onClick={closeModal}
          >
            Non
          </button>
          <button
            className="h-[30px] flex-1 rounded-md bg-accent-color px-3 text-center text-xs font-medium text-white transition-colors hover:bg-indigo-500"
            onClick={confirmDelete}
          >
            Oui
          </button>
        </div>
      </Modal>
    </Fragment>
  );
};

const Table = ({ agents, openModal, currentPage, setCurrentPage, pageSize, setPageSize }) => {
  const displayedAgents = paginate(agents, currentPage, pageSize);

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="flex justify-between rounded-t-lg border-b border-gray-200 bg-gray-50">
        <TH text="Nom" />
        <TH text="Role" />
        <TH text="Action" />
      </div>

      <div className="flex flex-col">
        {Object.values(displayedAgents)
          .flat()
          .map((agent) => (
            <div className="flex last:rounded-b-lg odd:bg-white even:bg-gray-50" key={agent._id}>
              <p className="flex-1 px-6 py-4 text-sm text-gray-500">
                {agent.firstName} {agent.lastName}
              </p>
              <p className="flex-1 px-4 mr-10 py-4 text-sm text-gray-500">{agent.role}</p>

              <div className="flex w-[64px] flex-none items-center gap-5  py-4">
                <button type="button" className="text-sm ml-2 font-medium text-accent-color transition-colors hover:text-indigo-500" onClick={() => openModal(agent._id)}>
                  <HiTrash />
                </button>
              </div>
            </div>
          ))}
      </div>
      <TFooter>
        <Pagination className="w-full" onPageChange={setCurrentPage} total={agents.length} currentPage={currentPage} range={pageSize} onSizeChange={setPageSize} />
      </TFooter>
    </div>
  );
};
