import { useState, useEffect } from "react";
import { fetchReInscriptionOpen } from "../services/reinscriptionService";

export const useReInscription = () => {
  const [isReinscriptionOpen, setIsReinscriptionOpen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReInscriptionStatus = async () => {
      setLoading(true);
      const data = await fetchReInscriptionOpen();
      setIsReinscriptionOpen(data);
      setLoading(false);
    };

    loadReInscriptionStatus();
  }, []);

  return { isReinscriptionOpen, loading };
};

export default useReInscription;
