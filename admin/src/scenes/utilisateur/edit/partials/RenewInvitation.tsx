import api from "@/services/api";
import { Button, Tooltip } from "@snu/ds/admin";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { toastr } from "react-redux-toastr";
import { ReferentStatus, ReferentType, formatLongDateFR, translate } from "snu-lib";

export default function RenewInvitation({ userId, user }: { userId: string; user: ReferentType }) {
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

  return (
    <Tooltip title="Vous ne pouvez pas renouveler l'invitation d'un utilisateur désactivé" disabled={user.status !== ReferentStatus.INACTIVE}>
      <Button
        title="Renouveler invitation"
        type="cancel"
        className={`mt-3 mr-3 ${user.status === ReferentStatus.INACTIVE ? "cursor-not-allowed" : "cursor-pointer"}`}
        onClick={() => mutate()}
        disabled={user.status === ReferentStatus.INACTIVE}
      />
    </Tooltip>
  );
}
