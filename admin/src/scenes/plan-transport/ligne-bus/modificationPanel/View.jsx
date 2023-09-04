import dayjs from "@/utils/dayjs.utils";
import React from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { ROLES, translate } from "snu-lib";
import PanelV2 from "../../../../components/PanelV2";
import { capture } from "../../../../sentry";
import api from "../../../../services/api";
import { getInitials, getStatusClass, translateStatus } from "../../components/commons";
import Quote from "../components/Icons/Quote";
import Thumbs from "../components/Icons/Thumbs";
import ReactTooltip from "react-tooltip";
import Send from "../components/Icons/Send";
import Tags from "../components/Tags";

export default function View({ open, setOpen, modification, getModification, tagsOptions, getTags }) {
  const user = useSelector((state) => state.Auth.user);
  const [message, setMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [conversation, setConversation] = React.useState([]);

  const onClose = () => {
    setOpen(false);
  };

  React.useEffect(() => {
    if (modification) {
      let conversation = modification.messages || [];
      //add type field to messages
      conversation = conversation.map((message) => {
        message.type = "message";
        return message;
      });

      //add opinion to conversation
      if (modification.opinion === "true" || modification.opinion === "false") {
        conversation.push({
          opinion: modification.opinion,
          userId: modification.opinionUserId,
          userName: modification.opinionUserName,
          date: modification.opinionDate,
          type: "opinion",
        });
      }

      //sort conversation by date
      conversation = conversation.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      setConversation(conversation);
    }
  }, [modification]);

  const onSendMessage = async () => {
    try {
      setIsLoading(true);
      // Save data
      const { ok, code } = await api.put(`/demande-de-modification/${modification._id}/message`, { message });

      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de l'envoi du message", translate(code));
        return setIsLoading(false);
      }
      setMessage("");
      await getModification();
      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de l'envoi du message");
      setIsLoading(false);
    }
  };

  const onSendOpinion = async (opinion) => {
    try {
      setIsLoading(true);
      // Save data
      const { ok, code } = await api.put(`/demande-de-modification/${modification._id}/opinion`, { opinion });
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de l'envoi de votre avis", translate(code));
        return setIsLoading(false);
      }
      await getModification();
      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de l'envoi de votre avis");
      setIsLoading(false);
    }
  };

  const onSendStatus = async (status) => {
    try {
      setIsLoading(true);
      // Save data
      const { ok, code } = await api.put(`/demande-de-modification/${modification._id}/status`, { status });
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de l'envoi de votre avis", translate(code));
        return setIsLoading(false);
      }
      await getModification();
      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de l'envoi de votre avis");
      setIsLoading(false);
    }
  };

  const onCreateTags = async (inputValue) => {
    try {
      setIsLoading(true);
      // Save data
      const { ok, code, data: tags } = await api.post(`/tags`, { name: inputValue, type: "modification_bus" });
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la création du tag", translate(code));
        return setIsLoading(false);
      }
      tagsOptions.push({ value: tags._id, label: tags.name });
      getTags();
      await onChangeTags(tags._id);
      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la création du tag");
      setIsLoading(false);
    }
  };

  const onChangeTags = async (tagId) => {
    try {
      setIsLoading(true);
      // Save data
      const { ok, code } = await api.put(`/demande-de-modification/${modification._id}/tag/${tagId}`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la sauvegarde du tag", translate(code));
        return setIsLoading(false);
      }
      await getModification();
      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la sauvegarde du tag");
      setIsLoading(false);
    }
  };

  const onDeleteTags = async (tagId) => {
    try {
      setIsLoading(true);
      // Save data
      const { ok, code } = await api.put(`/demande-de-modification/${modification._id}/tag/${tagId}/delete`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la sauvegarde du tag", translate(code));
        return setIsLoading(false);
      }
      await getModification();
      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la sauvegarde du tag");
      setIsLoading(false);
    }
  };

  if (!modification) return null;

  return (
    <PanelV2 title="Demandes" open={open} onClose={onClose}>
      <>
        <div className="mt-4 flex h-full flex-col gap-4">
          <div className="mb-14 flex flex-col gap-2">
            <div className="flex w-full flex-col gap-2 rounded-xl bg-[#F6F7F9] p-4">
              <div className="flex justify-start">
                <Quote className="text-gray-400" />
              </div>
              <div className="whitespace-pre-wrap text-sm leading-5 text-gray-800">{modification.requestMessage}</div>
              <div className="flex justify-end">
                <Quote className="rotate-180 text-gray-400" />
              </div>
            </div>
            <div className="flex justify-between py-1">
              <div className="flex items-center gap-2">
                <div className={`flex items-center justify-center rounded-full px-3 pt-1 pb-1.5 text-xs text-white ${getStatusClass(modification.status)}`}>
                  {translateStatus(modification.status)}
                </div>
                {modification?.opinion && (
                  <div className="flex items-center justify-center rounded-full bg-[#3D5B85] p-1.5 text-xs text-white">
                    <Thumbs className={`h-3 w-3 text-white ${modification.opinion === "false" && "rotate-180"}`} />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center rounded-full border-[1px] border-white bg-gray-100 p-1.5 text-[10px] text-blue-600 shadow-md">
                  {getInitials(modification?.requestUserName)}
                </div>
                <div className="text-xs text-gray-800">
                  {modification?.requestUserName}, {dayjs(modification.createdAt).format("DD/MM/YYYY • HH:mm")}
                </div>
              </div>
            </div>
            <div className="mt-2">
              <Tags
                options={tagsOptions}
                placeholder="Spécifiez le type de demande..."
                onChange={onChangeTags}
                onCreateOption={onCreateTags}
                onDeleteOption={onDeleteTags}
                values={modification.tagIds}
                isLoading={isLoading}
              />
            </div>
            <div className="mt-2 text-lg font-medium leading-6 text-[#242526]">Commentaires</div>
            <div className="mt-2 flex flex-col gap-6 pl-2">
              {modification?.status !== "PENDING" && (
                <div className="flex items-start gap-3 rounded-xl">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full border-[1px] border-white p-2.5 text-sm font-bold text-white shadow-lg ${
                      modification.status === "ACCEPTED" ? "bg-[#10B981]" : "bg-[#EF4444]"
                    }`}>
                    {getInitials(modification?.statusUserName)}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="text-base font-medium text-gray-800">{user._id === modification.statusUserId ? "Vous" : modification?.statusUserName}</div>
                      <div className="text-sm text-gray-500">{dayjs(modification.statusDate).format("DD/MM/YYYY • HH:mm")}</div>
                    </div>
                    <div className="whitespace-pre-wrap text-sm leading-5 text-gray-800">
                      {modification.status === "ACCEPTED" ? "A accepté la demande de modification" : "A refusé la demande de modification"}
                    </div>
                  </div>
                </div>
              )}
              {conversation.map((message, index) => (
                <div key={index} className="flex items-start gap-3 rounded-xl">
                  {message.type === "message" && (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border-[1px] border-white bg-gray-100 p-2.5 text-sm font-bold text-blue-600 shadow-lg">
                      {getInitials(user.firstName + " " + user.lastName)}
                    </div>
                  )}
                  {message.type === "opinion" && (
                    <div className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-[1px] border-white  bg-[#3D5B85] p-2.5 text-xs text-white shadow-lg">
                      <Thumbs className={`text-white ${message.opinion === "false" && "rotate-180"}`} />
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="text-base font-medium text-gray-800">{user._id === message.userId ? "Vous" : message?.userName}</div>
                      <div className="text-sm text-gray-500">{dayjs(message.date).format("DD/MM/YYYY • HH:mm")}</div>
                    </div>
                    <div className="whitespace-pre-wrap text-sm leading-5 text-gray-800">
                      {message.type === "message" ? message?.message : message.opinion === "true" ? "A donné un avis favorable" : "A donné un avis défavorable"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 flex flex-col gap-2 bg-white pb-4">
          {modification?.status === "PENDING" ? (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSendStatus("ACCEPTED")}
                  disabled={isLoading}
                  className="flex h-full items-center justify-center rounded-full bg-[#10B981] px-4 pt-1 pb-1.5 text-xs text-white hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100">
                  Valider la demande
                </button>
                <button
                  onClick={() => onSendStatus("REJECTED")}
                  disabled={isLoading}
                  className="flex h-full items-center justify-center rounded-full bg-red-400 px-4 pt-1 pb-1.5 text-xs text-white hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100">
                  Refuser la demande
                </button>
              </div>
              <div className="flex items-start gap-2 rounded-full border-[1px] border-gray-300 p-2">
                <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full border-[1px] border-white bg-gray-100 text-[10px] text-blue-600 shadow-lg">
                  {getInitials(user.firstName + " " + user.lastName)}
                </div>
                <textarea rows={1} className="flex-1 appearance-none p-1" placeholder="Répondre" value={message} onChange={(e) => setMessage(e.target.value)} />
                {modification?.opinion !== "true" && modification?.opinion !== "false" && message === "" && user.role !== ROLES.TRANSPORTER && (
                  <>
                    <button
                      data-tip
                      data-for="tool-up"
                      disabled={isLoading}
                      onClick={() => onSendOpinion("true")}
                      className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full bg-[#3D5B85] text-xs text-white hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100">
                      <Thumbs className="h-4 w-4 text-white" />
                    </button>
                    <ReactTooltip id="tool-up" className="bg-white shadow-xl" arrowColor="white" place="left">
                      <div className="text-xs text-[#414458]">Donner un avis favorable</div>
                    </ReactTooltip>

                    <button
                      data-tip
                      data-for="tool-down"
                      disabled={isLoading}
                      onClick={() => onSendOpinion("false")}
                      className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full bg-[#3D5B85] text-xs text-white hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100">
                      <Thumbs className="h-4 w-4 rotate-180 text-white" />
                    </button>
                    <ReactTooltip id="tool-down" className="bg-white shadow-xl" arrowColor="white" place="left">
                      <div className="text-xs text-[#414458]">Donner un avis défavorable</div>
                    </ReactTooltip>
                  </>
                )}
                {message !== "" && (
                  <button
                    disabled={isLoading}
                    className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full bg-[#3D5B85] text-xs text-white hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                    onClick={onSendMessage}>
                    <Send className="h-4 w-4 text-white" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="gap-2 rounded-full border-[1px] border-gray-300 p-2">
              <div className="px-3 text-sm font-light leading-5 text-gray-600">La demande est clôturée.</div>
            </div>
          )}
        </div>
      </>
    </PanelV2>
  );
}
