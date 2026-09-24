import dayjs from "@/utils/dayjs.utils";
import React from "react";
import { useSelector } from "react-redux";
import PanelV2 from "../../../../components/PanelV2";
import { getInitials, getStatusClass, translateStatus } from "../../components/commons";
import Quote from "../components/Icons/Quote";
import Thumbs from "../components/Icons/Thumbs";

// Consultation seule : la réponse, l'avis, la validation/le refus et l'étiquetage des demandes de modification ont été supprimés.
export default function View({ open, setOpen, modification, tagsOptions }) {
  const user = useSelector((state) => state.Auth.user);
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

  if (!modification) return null;

  const tagLabels = (modification.tagIds || []).map((tagId) => tagsOptions?.find((option) => option.value === tagId)?.label).filter(Boolean);

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
            {tagLabels.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tagLabels.map((label) => (
                  <div key={label} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-800">
                    {label}
                  </div>
                ))}
              </div>
            )}
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
          <div className="gap-2 rounded-full border-[1px] border-gray-300 p-2">
            <div className="px-3 text-sm font-light leading-5 text-gray-600">
              {modification?.status === "PENDING" ? "La demande n'a pas été traitée." : "La demande est clôturée."}
            </div>
          </div>
        </div>
      </>
    </PanelV2>
  );
}
