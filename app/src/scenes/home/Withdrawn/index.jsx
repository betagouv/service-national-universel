import React, { useEffect, useState } from "react";
import { capture } from "@/sentry";
import { toastr } from "react-redux-toastr";
import { hasAccessToReinscription } from "../../../utils";
import API from "@/services/api";
import useAuth from "@/services/useAuth";
import Loader from "@/components/Loader";
import WaitingReinscription from "./components/WaitingReinscription";
import Leaving from "./components/Leaving";

export default function Withdrawn() {
  const { young } = useAuth();
  const [isReinscriptionOpen, setReinscriptionOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchInscriptionOpen = async () => {
    try {
      const { ok, data, code } = await API.get(`/cohort-session/isInscriptionOpen`);
      if (!ok) {
        capture(new Error(code));
        return toastr.error("Oups, une erreur est survenue", code);
      }
      setReinscriptionOpen(data);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInscriptionOpen();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (hasAccessToReinscription(young) && isReinscriptionOpen) {
    return <WaitingReinscription reinscriptionOpen={isReinscriptionOpen} />;
  }

  return <Leaving />;
}
