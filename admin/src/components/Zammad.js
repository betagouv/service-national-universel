import { useEffect } from "react";
import { useSelector } from "react-redux";
import { adminURL } from "../config";
import api from "../services/api";
import { translate } from "../utils";

function sendMessage(chat, message) {
  chat.send("chat_session_message", {
    content: message.join("<br />"),
    id: chat._messageCount,
    session_id: chat.sessionId,
  });
}

export default function Zammad() {
  const user = useSelector((state) => state.Auth.user);

  useEffect(() => {
    if (!window) return;

    window.$(function () {
      if (typeof ZammadChat === "undefined") return;

      const chat = new ZammadChat({
        title: "Une question ?",
        background: "#5145cd",
        fontSize: "12px",
        chatId: 5,
        show: true,
        flat: true,
        target: $("#zammad-chat"),
      });

      // === Monkey patch Zammad ===

      // This send the user informations to zammad.
      chat.onConnectionEstablished = (data) => {
        const isNew = Boolean(data.session_id);
        ZammadChat.prototype.onConnectionEstablished.call(chat, data);
        if (isNew) {
          if (user) {
            const info = [
              `🧑‍🏫 <a href="${adminURL}/user/${user._id}">${user.firstName + " " + user.lastName}</a> ${user.email} ${translate(user.role) + (user.subRole ? ` (${translate(user.subRole)})` : "")
              }`,
              (user.department || "") +
              (user.department && user.structureId ? " | " : "") +
              (user.structureId ? '<a href="' + adminURL + "/structure/" + user.structureId + '">Voir la structure</a>' : ""),
            ];
            // We have to create a ticket before initializing first chat message
            // because we have to include link.
            api
              .post("/support-center/ticket", {
                subject: `${user.firstName} ${user.lastName} - ${new Date().toLocaleString()}`,
                type: "💬 Chat",
                message: "Chat initialisé",
              })
              .then((res) => {
                chat.waitingForTicketAdditionalInformation = true;
                chat.ticketId = res.data.id;
                // Actually send the message when ticket is created
                sendMessage(chat, [...info, `📝 Ticket : https://support.snu.gouv.fr/#ticket/zoom/${res.data.id}`]);
              })
              .catch((e) => {
                // We don't care about errors.
                sendMessage(chat, [...info, `Échec de la création du ticket, il faut le créer manuellement`]);
              });
          } else {
            sendMessage(chat, [`🧑‍🏫 Non connecté.`]);
          }
        }
      };

      // This is needed to ensure users never sees their informations when they refresh page.
      chat.onReopenSession = (data) => {
        data.session = (data.session || []).filter((message) => message.content.startsWith("INFO USER: ") === false && message.content.startsWith("🧑‍🏫 ") === false);
        ZammadChat.prototype.onReopenSession.call(chat, data);
      };

      // When the first response is received, we got the internal chat ID,
      // so we can update the ticket that was created on session open.
      chat.receiveMessage = function (data) {
        ZammadChat.prototype.receiveMessage.call(chat, data);
        if (chat.waitingForTicketAdditionalInformation && data?.message?.chat_session_id) {
          chat.waitingForTicketAdditionalInformation = false;
          api
            .put(`/support-center/ticket/${chat.ticketId}`, {
              message: `https://support.snu.gouv.fr/#customer_chat/session/${data.message.chat_session_id}`,
            })
            .then((res) => {
              //
            });
        }
      };

      // === End of monkey patch ===
    });
  }, []);

  return null;
}
