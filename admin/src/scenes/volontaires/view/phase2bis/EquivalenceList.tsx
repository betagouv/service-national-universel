import React, { useEffect, useState } from "react";
import CardEquivalence from "../../components/Equivalence";
import API from "@/services/api";
import { MissionEquivalenceType, YoungType } from "snu-lib";
import Loader from "@/components/Loader";
import { capture } from "@/sentry";
import { toastr } from "react-redux-toastr";

export default function EquivalenceList({ young }: { young: YoungType }) {
  const [loading, setLoading] = useState(false);
  const [equivalences, setEquivalences] = useState<MissionEquivalenceType[]>([]);

  async function getEquivalences() {
    setLoading(true);
    try {
      const { ok, data } = await API.get(`/young/${young._id.toString()}/phase2/equivalence`);
      if (ok) setEquivalences(data);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue", e.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!young?._id) return;
    getEquivalences();
  }, [young]);

  if (loading) return <Loader />;

  return (
    <section id="equivalences">
      {equivalences.map((equivalence) => (
        <CardEquivalence key={equivalence._id} equivalence={equivalence} young={young} />
      ))}
    </section>
  );
}
