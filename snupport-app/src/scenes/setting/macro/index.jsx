import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import API from "../../../services/api";
import MacroTable from "./components/MacroTable";
import MacroModal from "./components/MacroModal";
import Header from "../components/Header";
import { statusValues, defaultMacro } from "./utils";
import { filterObjectByKeys } from "../../../utils";

function serializeMacro(source) {
  const macro = filterObjectByKeys(source, ["name", "description", "isActive", "stayOnCurrentPage", "sendCurrentMessage"]);
  if (source.macroAction) {
    macro.macroAction = source.macroAction.map((i) => filterObjectByKeys(i, ["action", "field", "value"]));
  }
  return macro;
}

export default function Macro() {
  const [macro, setMacro] = useState(undefined);
  const [macros, setMacros] = useState([]);
  const [tagValues, setTagValues] = useState([]);
  const [agentValues, setAgentValues] = useState([]);
  const [messageValues, setMessageValues] = useState([]);
  const [folderValues, setFolderValues] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const macroValues = {
    tagsId: tagValues,
    agentId: agentValues,
    folder: folderValues,
    message: messageValues,
    status: statusValues,
  };

  const getMacros = async () => {
    try {
      const { ok, data } = await API.get({ path: "/macro" });
      if (ok) {
        setMacros(data);
      } else {
        toast.error("Erreur lors de la récupération des macros");
      }
    } catch (e) {
      toast.error("Erreur lors de la récupération des macros");
    }
  };

  const getTags = async () => {
    try {
      const { ok, data } = await API.get({ path: "/tag" });
      if (ok) {
        setTagValues(data.map(({ _id, name }) => ({ value: _id, label: name })).sort((tag1, tag2) => (tag1.label < tag2.label ? -1 : 1)));
      } else {
        toast.error("Erreur lors de la récupération des étiquettes");
      }
    } catch (e) {
      toast.error("Erreur lors de la récupération des étiquettes");
    }
  };

  const getAgents = async () => {
    try {
      const { ok, data } = await API.get({ path: `/agent/` });
      if (ok) {
        setAgentValues(
          data.AGENT.map(({ _id, firstName, lastName }) => ({ value: _id, label: `${firstName} ${lastName}` })).sort((agent1, agent2) => (agent1.label < agent2.label ? -1 : 1))
        );
      } else {
        toast.error("Erreur lors de la récupération des agents");
      }
    } catch (e) {
      toast.error("Erreur lors de la récupération des agents");
    }
  };

  const getFolders = async () => {
    try {
      const { ok, data } = await API.get({ path: "/folder" });
      if (ok) {
        setFolderValues(data.map(({ name, _id }) => ({ value: _id, label: name })).sort((folder1, folder2) => (folder1.label < folder2.label ? -1 : 1)));
      } else {
        toast.error("Erreur lors de la récupération des dossiers");
      }
    } catch (e) {
      toast.error("Erreur lors de la récupération des dossiers");
    }
  };

  const getShortcuts = async () => {
    try {
      // @todo: use GET /shortcut
      const { ok, data } = await API.get({ path: "/shortcut/search" });
      if (ok) {
        setMessageValues(data.map(({ _id, name }) => ({ value: _id, label: name })).sort((shortcut1, shortcut2) => (shortcut1.label < shortcut2.label ? -1 : 1)));
      } else {
        toast.error("Erreur lors de la récupération des modules de textes");
      }
    } catch (e) {
      toast.error("Erreur lors de la récupération des modules de textes");
    }
  };

  useEffect(() => {
    getMacros();
    getTags();
    getFolders();
    getShortcuts();
    getAgents();
  }, []);

  useEffect(() => {
    if (macro) {
      setModalOpen(true);
    }
  }, [macro]);

  useEffect(() => {
    if (!isModalOpen) {
      setMacro(undefined);
    }
  }, [isModalOpen]);

  const onSave = async (macro) => {
    setLoading(true);
    const isCreation = !macro._id;
    const body = serializeMacro(macro);
    try {
      const { ok } = isCreation ? await API.post({ path: `/macro`, body }) : await API.patch({ path: `/macro/${macro._id}`, body });
      if (ok) {
        toast.success(isCreation ? "La macro a bien été créée" : "La macro a bien été mise à jour");
        await getMacros();
        setModalOpen(false);
      } else {
        toast.error(isCreation ? "Erreur lors de la création de la macro" : "Erreur lors de la mise à jour de la macro");
      }
    } catch (e) {
      toast.error(isCreation ? "Erreur lors de la création de la macro" : "Erreur lors de la mise à jour de la macro");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette macro ? Cette opération est définitive")) {
      setLoading(true);
      try {
        const { ok } = await API.delete({ path: `/macro/${id}` });
        await getMacros();
        setModalOpen(false);
        if (ok) {
          toast.success("La macro a bien été supprimée");
        } else {
          toast.error("Erreur lors de la suppression de la macro");
        }
      } catch (e) {
        toast.error("Erreur lors de la suppression de la macro");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <MacroModal open={isModalOpen} setOpen={setModalOpen} macro={macro} setMacro={setMacro} macroValues={macroValues} onSave={onSave} onDelete={onDelete} isLoading={isLoading} />
      <Header
        action={{
          name: "Nouveau",
          onClick: () => {
            setMacro(defaultMacro);
          },
        }}
        subTitle="Macros"
        title="Tickets"
      />
      <MacroTable setMacro={setMacro} macros={macros} />
    </>
  );
}
