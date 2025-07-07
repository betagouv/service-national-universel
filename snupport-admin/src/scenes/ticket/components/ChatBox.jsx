import * as FileSaver from "file-saver";
import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { BsArrowReturnLeft, BsArrowReturnRight } from "react-icons/bs";
import { HiOutlineDocumentDownload, HiOutlinePaperClip, HiOutlineXCircle } from "react-icons/hi";
import { MdCallSplit } from "react-icons/md";
import CreateTicketModal from "./CreateTicketModal";

import Avatar from "../../../components/Avatar";
import API from "../../../services/api";
import { classNames, htmlCleaner } from "../../../utils";
import { useSelector } from "react-redux";
import Loader from "../../../components/Loader";

export default function ChatBox({
  name,
  time,
  text,
  files,
  sender,
  id,
  update,
  ticketSubject,
  messageNumber,
  messageNumbers,
  copyRecipient = [],
  setIsCopyRecipientVisible,
  setMailCopyRecipient,
  setDest,
  canal,
  setMessageHistory,
  fromEmail,
  toEmail,
  subject,
  isSimplified = false,
  agents,
}) {
  const [splitOpen, setSplitOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const [publicUrl, setPublicUrl] = useState("");
  const [isPublicUrlLoading, setPublicUrlLoading] = useState(false);

  const clean = htmlCleaner(text);
  //remove /n from text
  const textClean = clean.replaceAll(/\n/g, "");
  const user = useSelector((state) => state.Auth.user);
  const linkRef = useRef();
  const hasPTagsOrBRTags = /<(p|br)[^>]*>/i.test(text);

  useEffect(() => {
    if (publicUrl) {
      linkRef?.current.click();
      setPublicUrlLoading(false);
    }
  }, [publicUrl]);

  useEffect(() => {
    if (!isPublicUrlLoading) {
      setPublicUrl("");
    }
  }, [isPublicUrlLoading]);

  const getPublicUrl = async (file) => {
    setPublicUrlLoading(true);
    if (publicUrl) {
      setPublicUrl("");
    }
    try {
      const { ok, data } = await API.post({ path: `/message/s3file/publicUrl`, body: { path: file.path } });
      if (!ok) {
        setPublicUrlLoading(false);
        return toast.error("Une erreur est survenue lors de l'ouverture du fichier");
      }
      setPublicUrl(data);
    } catch (e) {
      setPublicUrlLoading(false);
      toast.error("Une erreur est survenue lors de l'ouverture du fichier");
    }
  };

  const downloadFileFromS3 = async (file) => {
    try {
      const { data } = await API.post({ path: `/message/s3file`, body: { path: file.path } });
      FileSaver.saveAs(new Blob([new Uint8Array(data.data)], { type: "image/*" }), file.name);
    } catch (e) {
      toast.error(e, "Erreur");
    }
  };

  const deleteFileFromS3 = async (file) => {
    try {
      const { ok } = await API.delete({ path: `/message/s3file/${id}`, body: { path: file.path } });
      if (ok) toast.success("Fichier supprimé");
      await update();
    } catch (e) {
      toast.error(e, "Erreur");
    }
  };

  return (
    <div className="flex-col">
      {canal === "MAIL" && (
        <div
          className={`${sender ? "ml-auto " : ""} ${isVisible ? "opacity-100  duration-300 ease-in" : "invisible h-0 translate-y-10 opacity-0 duration-300 ease-out"} ${
            isSimplified ? "w-[90%]" : "w-3/4"
          }  rounded-md border border-light-grey bg-gray-600 ${isSimplified ? "p-3" : "p-5"} pr-2 text-white`}
        >
          {toEmail && (
            <div className="flex gap-3">
              <span>Destinataire : {toEmail} </span>
            </div>
          )}
          {fromEmail && (
            <div className="flex gap-3">
              <span>De : {fromEmail} </span>
            </div>
          )}
          {subject && (
            <div className="flex gap-3">
              <span>Sujet : {subject} </span>
            </div>
          )}
          {copyRecipient.length > 0 && (
            <div className="flex gap-3">
              <span>CC : </span>
              <ul>
                {copyRecipient.map((recipient) => (
                  <li key={recipient}>{recipient}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <div
        className={` ${sender ? "ml-auto bg-white" : "bg-gray-50"} ${messageNumbers === messageNumber ? "bg-yellow-50" : ""} ${canal === "MAIL" && "cursor-pointer"} ${
          isSimplified ? "w-[90%]" : "w-3/4"
        }   rounded-md border border-light-grey ${isSimplified ? "p-3" : "p-5"} pr-2`}
        onClick={() => setIsVisible(!isVisible)}
      >
        <div className={classNames(sender ? "flex-row-reverse" : "", "mb-2 flex items-center gap-3")}>
          {!isSimplified && <Avatar email={name} />}
          <div>
            <p className="mb-0.5 text-sm font-medium text-gray-900">{name}</p>
            <p className="text-sm text-gray-500">{time}</p>
          </div>
        </div>
        {hasPTagsOrBRTags ? (
          <p className={classNames(sender || isSimplified ? "" : "ml-[52px]", "overflow-hidden text-sm text-gray-700")} dangerouslySetInnerHTML={{ __html: clean }}></p>
        ) : (
          <pre>
            <p
              className={classNames(sender || isSimplified ? "" : "ml-[52px]", "overflow-hidden text-sm text-gray-700")}
              dangerouslySetInnerHTML={{ __html: clean }}
              style={{ whiteSpace: "pre-wrap" }}
            ></p>
          </pre>
        )}
        {files.map((file) => {
          return (
            <div key={file._id} className={`relative ${classNames(sender ? "" : "ml-[52px]", "mt-2.5 flex items-center text-[22px] text-grey-text")}`}>
              {isPublicUrlLoading ? (
                <Loader size={20} className="mr-1.5 h-auto w-auto" />
              ) : (
                <span className="mr-1.5">
                  <HiOutlinePaperClip />
                </span>
              )}

              <a href={publicUrl} target="_blank" className="hidden text-sm text-gray-500 underline" ref={linkRef} rel="noreferrer">
                {file.name}
              </a>
              <span
                onClick={() => !isPublicUrlLoading && getPublicUrl(file)}
                className={`${isPublicUrlLoading ? "cursor-not-allowed" : "cursor-pointer"}  text-sm text-gray-500 underline ${
                  !isPublicUrlLoading && "hover:text-indigo-500 hover:decoration-indigo-500"
                }`}
              >
                {file.name}
              </span>
              <span className="ml-2 flex">
                <HiOutlineDocumentDownload className="cursor-pointer" onClick={() => downloadFileFromS3(file)} />
                <HiOutlineXCircle className="cursor-pointer" onClick={() => deleteFileFromS3(file)} />
              </span>
            </div>
          );
        })}
      </div>
      {!isSimplified && user.role === "AGENT" && (
        <div className={` ${sender ? "ml-auto" : ""} ${isSimplified ? "w-[90%]" : "w-3/4"} flex place-content-center items-center justify-around`}>
          {canal === "MAIL" && (
            <div
              className="flex cursor-pointer items-center gap-1"
              onClick={() => {
                setIsCopyRecipientVisible(true);
                setMailCopyRecipient(copyRecipient);
                setMessageHistory("all");
              }}
            >
              <BsArrowReturnLeft className="text-2xl text-gray-600" />
              <p className="text-sm text-gray-500 ">Répondre avec historique</p>
            </div>
          )}

          <div className="flex cursor-pointer items-center gap-1" onClick={() => setSplitOpen(true)}>
            <MdCallSplit className=" rotate-180 text-2xl text-gray-600" />
            <p className="text-sm text-gray-500 ">Séparer</p>
          </div>

          {canal === "MAIL" && (
            <div
              className="flex cursor-pointer items-center gap-1"
              onClick={() => {
                setIsCopyRecipientVisible(true);
                setMailCopyRecipient(copyRecipient);
                setMessageHistory(id);
                setDest(fromEmail);
              }}
            >
              <BsArrowReturnRight className="text-2xl text-gray-600" />
              <p className="text-sm text-gray-500 ">Répondre avec message</p>
            </div>
          )}
        </div>
      )}
      {!isSimplified && <CreateTicketModal open={splitOpen} setOpen={setSplitOpen} subject={ticketSubject} message={textClean} agents={agents} />}
    </div>
  );
}
