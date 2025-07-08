import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateTicket } from "../service";

export default function useUpdateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, payload }: { ticketId: string; payload: any }) => updateTicket({ ticketId, payload }),
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}
