import React, { useEffect, useState } from "react";
import API from "@/services/api";
import { translate } from "snu-lib";
import { toastr } from "react-redux-toastr";
import { capture } from "@/sentry";

export default function Index() {
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
}
