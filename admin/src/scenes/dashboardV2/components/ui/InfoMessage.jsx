import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { toastr } from "react-redux-toastr";
import { translate } from "snu-lib";
import { capture } from "@/sentry";
import { IoWarningOutline } from "react-icons/io5";
import { HiOutlineInformationCircle, HiOutlineExclamationCircle } from "react-icons/hi";

export default function InfoMessage() {
  const [message, setMessage] = useState([]);
  let listMessage = [];

  const getMessage = async () => {
    try {
      const { ok, code, data: response } = await api.get(`/alerte-message`);

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

  if (message && Array.isArray(message)) {
    listMessage = message.map((hit) => {
      let bg, Icon;

      switch (hit.priority) {
        case "normal":
          bg = "bg-blue-800";
          Icon = HiOutlineInformationCircle;
          break;
        case "important":
          bg = "bg-yellow-700";
          Icon = HiOutlineExclamationCircle;
          break;
        case "urgent":
          bg = "bg-red-800";
          Icon = IoWarningOutline;
          break;
        default:
          bg = "bg-blue-800";
          Icon = HiOutlineInformationCircle;
          break;
      }

      return {
        bg,
        Icon,
        content: hit.content,
      };
    });
  }

  return (
    <div>
      {listMessage.length
        ? listMessage.map((e, index) => (
            <div key={index} className={`flex items-center gap-4 rounded-xl ${e.bg} p-4 text-base leading-5 text-white`}>
              <e.Icon className="h-10 w-10 text-white stroke-[1.5px]" />
              <span>{e.content}</span>
            </div>
          ))
        : null}
    </div>
  );
}
