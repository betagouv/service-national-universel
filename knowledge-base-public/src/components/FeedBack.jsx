import React, { useState } from "react";
import { Button } from "./Buttons";
import { toast } from "react-toastify";
import API from "../services/api";
import { snuApiUrl } from "../config";
import { HiThumbUp } from "react-icons/hi";
import { HiThumbDown } from "react-icons/hi";

const defaultFeedback = { isPositive: true };

function FeedbackComponent({ item }) {
  const [feedback, setFeedback] = useState({ ...defaultFeedback });
  const [hasSubmitted, setSubmitted] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  async function postFeedback() {
    try {
      setSubmitting(true);
      const response = await API.post({
        origin: snuApiUrl,
        path: `/SNUpport/knowledgeBase/feedback`,
        body: { ...feedback, knowledgeBaseArticle: item?._id },
      });
      if (response.ok) {
        setSubmitted(true);
      } else {
        toast.error("Une erreure s'est produite veuillez nous excusez");
      }
    } catch (error) {
      toast.error("Une erreure s'est produite veuillez nous excusez");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {!hasSubmitted && (
        <>
          {feedback.isPositive && (
            <div className="flex w-full flex-col items-center justify-center rounded-lg bg-[#F3F4F6] mt-8 py-8 md:my-8 md:h-[130px] print:bg-transparent print:pb-12">
              <p className="mt-2 text-[20px] font-bold not-italic leading-7 text-gray-900">Cet article vous a été utile ?</p>
              <div className="mb-4 mt-4 flex flex-col md:flex-row">
                <button
                  id="ThumbsUp"
                  className="mb-4 mr-6 flex h-12 w-full cursor-pointer flex-row items-center justify-center rounded-md border-[1px] border-[#2563EB] bg-[#F3F4F6] px-16 text-3xl font-medium text-[#2563EB] hover:bg-blue-600 hover:text-white md:mb-0"
                  onClick={postFeedback}
                >
                  <HiThumbUp className="w-[20px] text-[20px]" />
                  <p className="ml-2 text-[16px]">Oui</p>
                </button>
                <button
                  id="ThumbsDown"
                  className="flex h-12 w-full cursor-pointer flex-row items-center justify-center rounded-md border-[1px] border-[#2563EB] bg-[#F3F4F6] px-16 text-3xl font-medium text-[#2563EB] hover:bg-blue-600 hover:text-white md:ml-1"
                  onClick={() => setFeedback({ ...feedback, isPositive: false })}
                >
                  <HiThumbDown className="w-[20px] text-[20px]" />
                  <p className="ml-2 text-[16px]">Non</p>
                </button>
              </div>
            </div>
          )}
          {!feedback.isPositive && (
            <div className="mb-6 mt-6 flex h-full w-full flex-col rounded-xl border-[1px] bg-white pt-6">
              <div className="flex flex-col items-center justify-center px-10">
                <h1 className="mt-2 text-[20px] font-bold not-italic leading-7 text-gray-900">Aidez-nous à nous améliorer</h1>
                <div className="mt-8 flex flex-row justify-center bg-[#EFF6FF] px-4 py-4 text-[14px] leading-5 text-gray-600">
                  <span className="material-icons mr-4 mt-2 w-[20px] text-[20px] text-[#60A5FA]">info</span>
                  <div>
                    <span className="text-[#1E40AF]">
                      Rappel : vous n&apos;obtiendrez pas de réponse à votre question, merci de ne pas inscrire d&apos;informations personnelles. Pour obtenir une aide
                      personnalisée,
                    </span>{" "}
                    <a href="https://www.snu.gouv.fr/nous-contacter/" className="text-snu-purple-200" target="_blank" rel="noopener noreferrer">
                      <span className="text-[#4F46E5] underline ">cliquez ici.</span>
                    </a>
                  </div>
                </div>
                <div className="mb-2 mt-8 flex w-full flex-row">
                  <p className="inline-block w-full self-center text-[12px] font-medium leading-4 text-[#111827]">Quel était votre question ?</p>
                  <p className="inline-block w-[50%] h-5 w-48 self-center text-end text-xs font-medium leading-5 text-[#6B7280]">125 caractères maximum</p>
                </div>
                <textarea
                  className={`h-24 w-full rounded-md border-2 ${
                    !feedback.comment || feedback.comment?.length <= 125 ? "border-gray-200" : "border-[#EF4444]"
                  } p-4 text-sm font-normal text-[#4B5563] focus:outline-none`}
                  placeholder="Ecrivez votre question ici..."
                  onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                ></textarea>
                <p
                  className={`relative -mt-8 mb-8 mr-4 self-end text-end text-xs font-medium leading-6 ${
                    !feedback.comment || feedback.comment?.length <= 125 ? "text-[#6B7280]" : "text-[#EF4444]"
                  }`}
                >
                  {feedback.comment?.length || 0}/125
                </p>
              </div>
              <div className="mt-3 flex flex-row justify-end bg-[#F9FAFB] p-4">
                <button
                  className="mr-1 items-center justify-center rounded-md border-[1px] border-gray-200 bg-white px-4 py-1 text-[14px] font-medium leading-5 text-[#374151]"
                  onClick={() => setFeedback({ ...defaultFeedback })}
                >
                  Annuler
                </button>
                <Button
                  className="rounded-md border-[1px] border-[#2563EB] bg-[#2563EB] px-4 py-1 text-[14px] font-medium leading-5 text-[#FFFFFF]"
                  onClick={postFeedback}
                  loading={isSubmitting}
                  disabled={feedback.comment?.length > 125}
                >
                  Envoyer
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      {hasSubmitted && (
        <div className="mb-12 mt-8 flex h-28 w-full flex-row items-center justify-center rounded-lg border-[1px] bg-white text-[#111827] shadow-md print:bg-transparent print:pb-12">
          <span className="material-icons mr-2 mt-1 w-[20px] text-[20px] text-[#111827]">done</span>
          <p className="text-xl font-bold not-italic leading-7">Merci pour votre contribution</p>
        </div>
      )}
    </>
  );
}

export default FeedbackComponent;
