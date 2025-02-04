import React from "react";
import { Switch, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { SentryRoute } from "../../../sentry";

import useClass from "../utils/useClass";
import Loader from "@/components/Loader";
import api from "@/services/api";

import Details from "./Details";
import Historique from "./Historique";
import Inscriptions from "./Inscriptions";

export default function Index() {
  const { id } = useParams<{ id: string }>();
  useDocumentTitle("Classes");

  const { data: classe, refetch } = useClass(id);

  const { data: studentStatus } = useQuery<{ [key: string]: number }>({
    queryKey: ["young", classe?._id],
    queryFn: async () => (await api.get(`/cle/young/by-classe-stats/${classe?._id}`))?.data,
    enabled: !!classe?._id,
    refetchOnWindowFocus: false,
  });

  if (!id || !classe || !studentStatus) return <Loader />;

  return (
    <Switch>
      <SentryRoute path="/classes/:id/historique" component={() => <Historique classe={classe} getClasse={refetch} onChange={refetch} studentStatus={studentStatus} />} />;
      <SentryRoute path="/classes/:id/inscriptions" component={() => <Inscriptions classe={classe} getClasse={refetch} onChange={refetch} studentStatus={studentStatus} />} />;
      <SentryRoute exact path="/classes/:id" component={() => <Details classe={classe} getClasse={refetch} onChange={refetch} studentStatus={studentStatus} />} />;
    </Switch>
  );
}
