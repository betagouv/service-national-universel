import dayjs from "dayjs";
import React from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { translate } from "snu-lib";
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
        <div className="flex flex-col mt-4 gap-4 h-full">
          <div className="flex flex-col gap-2 mb-14">
            <div className="flex flex-col gap-2 rounded-xl bg-[#F6F7F9] w-full p-4">
              <div className="flex justify-start">
                <Quote className="text-gray-400" />
              </div>
              <div className="text-sm text-gray-800 leading-5 whitespace-pre-wrap">{modification.requestMessage}</div>
              <div className="flex justify-end">
                <Quote className="text-gray-400 rotate-180" />
              </div>
            </div>
            <div className="flex justify-between py-1">
              <div className="flex gap-2 items-center">
                <div className={`flex items-center justify-center text-white text-xs rounded-full pt-1 pb-1.5 px-3 ${getStatusClass(modification.status)}`}>
                  {translateStatus(modification.status)}
                </div>
                {modification?.opinion && (
                  <div className="flex items-center justify-center text-white text-xs rounded-full p-1.5 bg-[#3D5B85]">
                    <Thumbs className={`text-white h-3 w-3 ${modification.opinion === "false" && "rotate-180"}`} />
                  </div>
                )}
              </div>
              <div className="flex gap-2 items-center">
                <div className="flex items-center justify-center text-blue-600 text-[10px] rounded-full p-1.5 bg-gray-100 border-[1px] border-white shadow-md">
                  {getInitials(modification?.requestUserName)}
                </div>
                <div className="text-xs text-gray-800">
                  {modification?.requestUserName}, {dayjs(modification.createdAt).locale("fr").format("DD/MM/YYYY • HH:mm")}
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
            <div className="text-lg leading-6 font-medium text-[#242526] mt-2">Commentaires</div>
            <div className="flex flex-col gap-6 pl-2 mt-2">
              {modification?.status !== "PENDING" && (
                <div className="flex items-start gap-3 rounded-xl">
                  <div
                    className={`flex items-center justify-center text-white text-sm font-bold rounded-full p-2.5 border-[1px] border-white shadow-lg h-11 w-11 ${
                      modification.status === "ACCEPTED" ? "bg-[#10B981]" : "bg-[#EF4444]"
                    }`}>
                    {getInitials(modification?.statusUserName)}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="text-base text-gray-800 font-medium">{user._id === modification.statusUserId ? "Vous" : modification?.statusUserName}</div>
                      <div className="text-sm text-gray-500">{dayjs(modification.statusDate).locale("fr").format("DD/MM/YYYY • HH:mm")}</div>
                    </div>
                    <div className="text-gray-800 text-sm leading-5 whitespace-pre-wrap">
                      {modification.status === "ACCEPTED" ? "A accepté la demande de modification" : "A refusé la demande de modification"}
                    </div>
                  </div>
                </div>
              )}
              {conversation.map((message, index) => (
                <div key={index} className="flex items-start gap-3 rounded-xl">
                  {message.type === "message" && (
                    <div className="flex items-center justify-center text-blue-600 font-bold text-sm rounded-full p-2.5 bg-gray-100 border-[1px] border-white shadow-lg h-11 w-11">
                      {getInitials(user.firstName + " " + user.lastName)}
                    </div>
                  )}
                  {message.type === "opinion" && (
                    <div className="flex items-center justify-center text-white text-xs rounded-full p-2.5 bg-[#3D5B85] cursor-pointer  border-[1px] border-white shadow-lg h-11 w-11">
                      <Thumbs className={`text-white ${message.opinion === "false" && "rotate-180"}`} />
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="text-base text-gray-800 font-medium">{user._id === message.userId ? "Vous" : message?.userName}</div>
                      <div className="text-sm text-gray-500">{dayjs(message.date).locale("fr").format("DD/MM/YYYY • HH:mm")}</div>
                    </div>
                    <div className="text-gray-800 text-sm leading-5 whitespace-pre-wrap">
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
                  className="flex items-center justify-center text-white text-xs rounded-full h-full px-4 pt-1 pb-1.5 bg-[#10B981] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                  Valider la demande
                </button>
                <button
                  onClick={() => onSendStatus("REJECTED")}
                  disabled={isLoading}
                  className="flex items-center justify-center text-white text-xs rounded-full h-full px-4 pt-1 pb-1.5 bg-red-400 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                  Refuser la demande
                </button>
              </div>
              <div className="rounded-full flex items-start border-[1px] border-gray-300 gap-2 p-2">
                <div className="flex items-center justify-center text-blue-600 text-[10px] rounded-full h-[30px] w-[30px] bg-gray-100 border-[1px] border-white shadow-lg">
                  {getInitials(user.firstName + " " + user.lastName)}
                </div>
                <textarea rows={1} className="flex-1 appearance-none p-1" placeholder="Répondre" value={message} onChange={(e) => setMessage(e.target.value)} />
                {modification?.opinion !== "true" && modification?.opinion !== "false" && message === "" && (
                  <>
                    <button
                      data-tip
                      data-for="tool-up"
                      disabled={isLoading}
                      onClick={() => onSendOpinion("true")}
                      className="flex items-center justify-center text-white text-xs rounded-full h-[30px] w-[30px] bg-[#3D5B85] cursor-pointer hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                      <Thumbs className="text-white h-4 w-4" />
                    </button>
                    <ReactTooltip id="tool-up" className="bg-white shadow-xl" arrowColor="white" place="left">
                      <div className="text-[#414458] text-xs">Donner un avis favorable</div>
                    </ReactTooltip>

                    <button
                      data-tip
                      data-for="tool-down"
                      disabled={isLoading}
                      onClick={() => onSendOpinion("false")}
                      className="flex items-center justify-center text-white text-xs rounded-full h-[30px] w-[30px] bg-[#3D5B85] cursor-pointer hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                      <Thumbs className="text-white h-4 w-4 rotate-180" />
                    </button>
                    <ReactTooltip id="tool-down" className="bg-white shadow-xl" arrowColor="white" place="left">
                      <div className="text-[#414458] text-xs">Donner un avis défavorable</div>
                    </ReactTooltip>
                  </>
                )}
                {message !== "" && (
                  <button
                    disabled={isLoading}
                    className="flex items-center justify-center text-white text-xs rounded-full h-[30px] w-[30px] bg-[#3D5B85] cursor-pointer hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    onClick={onSendMessage}>
                    <Send className="text-white h-4 w-4" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-full border-[1px] border-gray-300 gap-2 p-2">
              <div className="text-gray-600 text-sm leading-5 font-light px-3">La demande est clôturée.</div>
            </div>
          )}
        </div>
      </>
    </PanelV2>
  );
}
