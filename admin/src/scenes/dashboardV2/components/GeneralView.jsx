import React, { useEffect, useState } from "react";
import API from "@/services/api";
import { translate, ROLES } from "snu-lib";
import { toastr } from "react-redux-toastr";
import { capture } from "@/sentry";
import { useSelector } from "react-redux";
import InfoMessage from "./ui/InfoMessage";
import Todos from "./Todos";
import KeyNumbers from "./KeyNumbers";

export default function Index({ cohortsNotFinished }) {
  const user = useSelector((state) => state.Auth.user);
  const [message, setMessage] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const updateStats = async () => {
      const response = await API.post("/elasticsearch/dashboard/general/todo");
      const s = response.data;
      setStats(s);
    };
    updateStats();
  }, []);

  const getMessage = async () => {
    try {
      const { ok, code, data: response } = await API.get(`/alerte-message`);

      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération des messages", translate(code));
      }
      setMessage(response.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des messages");
    }
  };
  useEffect(() => {
    getMessage();
  }, []);

  return (
    <>
      {message?.length ? message.map((hit) => <InfoMessage key={hit._id} data={hit} />) : null}
      <h1 className="text-[28px] font-bold leading-8 text-gray-900">En ce moment</h1>
      <div className="flex w-full gap-4">
        <Todos stats={stats} user={user} cohortsNotFinished={cohortsNotFinished} />
        {user.role !== ROLES.HEAD_CENTER && <KeyNumbers />}
      </div>
    </>
  );
}
