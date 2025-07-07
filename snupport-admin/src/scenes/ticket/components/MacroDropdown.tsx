import React from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import DropdownButton from "../../../components/DropdownButton";
import API from "../../../services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Loader from "../../../components/Loader";
import { getMacros, Macro } from "../../../services/macro";

export default function MacroDropdown({ selectedTicket, onClose, onRefresh, handleAddMessage = async () => {} }) {
  const user = useSelector((state: { Auth: { user: any } }) => state.Auth.user);

  const queryClient = useQueryClient();

  const { data: macros, isPending, isError } = useQuery({ queryKey: ["macros"], queryFn: getMacros });

  const { mutate: applyMacro } = useMutation({
    mutationFn: async (macro: Macro) => {
      const res = await API.post({ path: `/macro/${macro._id}`, body: { ticketsId: selectedTicket, agentId: user._id } });
      if (!res.ok) throw new Error(res.code);
      return res;
    },
    onError: () => {
      toast.error("Erreur lors de l'application de la macro");
    },
    onSuccess: async (_, variables) => {
      toast.success("La macro a bien été appliquée.");
      queryClient.invalidateQueries({ queryKey: ["ticket"] });
      if (variables.stayOnCurrentPage) {
        await onRefresh();
      } else {
        await onClose();
      }
    },
  });

  async function handleSelectMacro(macro: Macro) {
    if (selectedTicket.length === 0) {
      toast.error("Veuillez sélectionner au moins un ticket avant d'appliquer une macro");
      return;
    }
    if (macro.sendCurrentMessage && handleAddMessage) {
      await handleAddMessage();
    }
    applyMacro(macro);
    return;
  }

  if (isPending) return <Loader />;

  if (isError) return <p>Erreur lors de la récupération des macros</p>;

  return macros.map((macro) => <DropdownButton key={macro._id} name={macro.name} handleClick={() => handleSelectMacro(macro)} isActive={macro.isActive} />);
}
