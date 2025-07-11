import React from "react";
import API from "@/services/api";
import { useMutation } from "@tanstack/react-query";
import { YoungType, translate } from "snu-lib";
import { queryClient } from "@/services/react-query";
import { toastr } from "react-redux-toastr";
import { capture } from "@/sentry";
import { Button } from "@snu/ds/admin";

interface RoadCodeRefundSetter {
  roadCodeRefund: "true" | "false";
}

export default function ButtonRoadCodeRefund({ young }: { young: YoungType }) {
  const setRoadCodeRefund = useMutation({
    mutationFn: async ({ roadCodeRefund }: RoadCodeRefundSetter) => {
      const { ok, data, code } = await API.put(`/referent/young/${young._id}`, { roadCodeRefund });
      if (!ok) throw new Error(code);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["young", young._id], data);
      toastr.success("Succès", "Le remboursement a été mis à jour");
    },
    onError: (error) => {
      console.log(error);
      capture(error);
      toastr.error("Erreur !", translate(error.message));
    },
  });

  return (
    <Button
      title={young.roadCodeRefund === "true" ? "Annuler" : "Indiquer comme remboursé"}
      loading={setRoadCodeRefund.isPending}
      onClick={() =>
        setRoadCodeRefund.mutate({
          roadCodeRefund: young.roadCodeRefund === "true" ? "false" : "true",
        })
      }
    />
  );
}
