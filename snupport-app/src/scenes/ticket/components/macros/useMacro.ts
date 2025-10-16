import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { getMacros, Macro } from "@/services/macro";
import API from "@/services/api";

export interface UseMacroSelectionProps {
  selectedTicket: string[];
  onClose?: (id?: string) => void;
  onRefresh?: () => Promise<void>;
  handleAddMessage?: () => Promise<boolean>;
  filtered?: boolean;
  disabled?: boolean;
}

export function useMacroSelection({ selectedTicket, onClose, onRefresh, handleAddMessage, filtered, disabled }: UseMacroSelectionProps) {
  const user = useSelector((state: { Auth: { user: any } }) => state.Auth.user);
  const queryClient = useQueryClient();

  const {
    data: macros,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["macros"],
    queryFn: getMacros,
  });

  const { mutate: applyMacro, isPending: isApplying } = useMutation({
    mutationFn: async ({ macro, needSpecificMessage }: { macro: Macro; needSpecificMessage: boolean }) => {
      const res = await API.post({
        path: `/macro/${macro._id}`,
        body: { ticketsId: selectedTicket, agentId: user._id, needSpecificMessage },
      });
      if (!res.ok) throw new Error(res.code);
      return res;
    },
    onError: () => {
      toast.error("Erreur lors de l'application de la macro");
    },
    onSuccess: async (_, variables) => {
      toast.success("La macro a bien été appliquée.");
      queryClient.invalidateQueries({ queryKey: ["ticket"] });
      if (variables.macro.stayOnCurrentPage) {
        await onRefresh?.();
      } else {
        await onClose?.();
      }
    },
  });

  const handleSelectMacro = useCallback(
    async (macroId: string, needSpecificMessage: boolean) => {
      if (!macros) return;

      const macro = macros.find((m) => m._id === macroId);
      if (!macro) return;

      if (selectedTicket.length === 0) {
        toast.error("Veuillez sélectionner au moins un ticket avant d'appliquer une macro");
        return;
      }

      if (macro.sendCurrentMessage && handleAddMessage) {
        const messageSuccess = await handleAddMessage();
        if (!messageSuccess) {
          return;
        }
      }

      applyMacro({ macro, needSpecificMessage });
    },
    [macros, selectedTicket, handleAddMessage, applyMacro]
  );

  const macroOptions = useMemo(() => {
    return (
      macros
        ?.filter((macro) => !filtered || macro.sendCurrentMessage === true)
        ?.map((macro) => ({
          value: macro._id,
          label: macro.name,
        })) || []
    );
  }, [macros, filtered]);

  const canSelectMacro = useMemo(() => {
    return selectedTicket.length > 0 && !disabled;
  }, [selectedTicket.length, disabled]);

  return {
    macros,
    macroOptions,
    isPending,
    isError,
    isApplying,
    handleSelectMacro,
    canSelectMacro,
    applyMacro,
  };
}
