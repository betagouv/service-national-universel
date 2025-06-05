import api from "@/services/api";
import { Button } from "@snu/ds/admin";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { toastr } from "react-redux-toastr";
import { formatLongDateFR, translate } from "snu-lib";

export default function RenewInvitation({ userId }: { userId: string }) {
  const { mutate } = useMutation({
    mutationFn: async () => {
      const { ok, code, data } = await api.post(`/referent/${userId}/renew-invitation`);
      if (!ok) {
        throw new Error(code);
      }
      return data;
    },
    onSuccess: (response) => {
      toastr.success("Date d'expiration d'invitation renouvelée avec succès", formatLongDateFR(response?.invitationExpires));
    },
    onError: (error) => {
      toastr.error("Une erreur est survenue lors du renouvellement de l'invitation", translate(error.message));
    },
  });

  return <Button title="Renouveler invitation" type="cancel" className="mt-3 mr-3" onClick={() => mutate()} />;
}
