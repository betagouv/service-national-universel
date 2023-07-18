import TextEditor from "../TextEditor";
import { useMemo, useState } from "react";
import API from "../../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { snuApiUrl } from "../../config";
import { Button } from "../Buttons";
import KnowledgeBasePublicNoAnswer from "./KnowledgeBasePublicNoAnswer";
import Breadcrumbs from "../breadcrumbs";

const defaultFeedback = { isPositive: true };

const KnowledgeBasePublicArticle = ({ item, isLoading }) => {
  const [feedback, setFeedback] = useState({ ...defaultFeedback });
  const [hasSubmitted, setSubmitted] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const group = useMemo(() => {
    return item?.group || item?.parents?.[0]?.group;
  }, [item]);

  async function postFeedback() {
    try {
      setSubmitting(true);
      const response = await API.post({
        origin: snuApiUrl,
        path: `/zammood/knowledgeBase/feedback`,
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

  if (isLoading) return <ArticleLoader />;
  return (
    <div className="w-full bg-white">
      <section className="mx-auto flex max-w-[792px] flex-shrink flex-grow flex-col overflow-hidden px-4 text-gray-800 print:bg-transparent print:pb-12">
        <Breadcrumbs parents={item?.parents || []} path="/base-de-connaissance" />
        <div className="py-4">
          <h2 className="mb-6 text-3xl font-bold print:mb-0 print:text-black">{group?.title}</h2>
          <h1 className="mb-6 text-3xl font-bold print:mb-0 print:text-black">{item?.title}</h1>
          <h6 className="text-base text-snu-purple-100 md:text-lg lg:text-xl print:text-black">{item?.description}</h6>
        </div>
        {item?.updatedAt && (
          <span className="mb-4 ml-auto mt-2 flex flex-col items-end text-xs italic text-gray-400 print:mb-2 print:mt-0">
            {/* <em>Article mis à jour le {Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(item.updatedAt))}</em> */}
            <button
              className="noprint mt-2 hidden cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-3 font-normal text-black shadow-none md:block"
              onClick={window.print}
            >
              <div className="flex justify-start">
                <span className="material-icons mr-3 w-[20px] text-[20px] text-[#374151]">printer</span>
                <p>Imprimer</p>
              </div>
            </button>
          </span>
        )}
        <hr className="mb-6 mt-4" />
        <TextEditor readOnly content={item.content} _id={item._id} slug={item.slug} />
        <ToastContainer />
        {!hasSubmitted && (
          <>
            {feedback.isPositive && (
              <div className="my-12 flex h-[130px] w-full flex-col items-center justify-center bg-[#F3F4F6] print:bg-transparent print:pb-12">
                <>
                  <p className="mt-2 text-[20px] font-bold not-italic leading-7 text-gray-900">Cet article vous a été utile ?</p>
                </>
                <div className="mb-4 mt-4 flex flex-row">
                  <div
                    id="ThumbsUp"
                    className="mr-6 flex h-12 w-20 cursor-pointer flex-row items-center justify-center rounded-md border-[1px] border-[#2563EB] px-20 text-3xl font-medium hover:border-[#9CA3AF]"
                    onClick={postFeedback}
                  >
                    <span className="material-icons w-[20px] text-[20px] text-[#2563EB]">thumb_up</span>
                    <p className="ml-2 text-[16px] text-[#2563EB]">Oui</p>
                  </div>
                  <div
                    className="ml-1 flex h-12 w-20 cursor-pointer flex-row items-center justify-center rounded-md border-[1px] border-[#2563EB] px-20 text-3xl font-medium hover:border-[#9CA3AF]"
                    onClick={() => setFeedback({ ...feedback, isPositive: false })}
                  >
                    <span className="material-icons w-[20px] text-[20px] text-[#2563EB]">thumb_down</span>
                    <p className="ml-2 text-[16px] text-[#2563EB]">Non</p>
                  </div>
                </div>
              </div>
            )}
            {!feedback.isPositive && (
              <div className="mb-6 mt-6 flex h-full w-full flex-col rounded-xl border-[1px] bg-white pt-6">
                <div className="flex flex-col items-center justify-center px-10">
                  <h1 className="mt-2 text-[20px] font-bold not-italic leading-7 text-gray-900">Aidez-nous à nous améliorer</h1>
                  <div className="flex flex-row mt-8 py-4 justify-center bg-[#EFF6FF] px-4 text-[14px] leading-5 text-gray-600 ">
                    <span className="material-icons w-[20px] text-[20px] text-[#60A5FA] mt-2 mr-4">info</span>
                    <div>
                      <span className="text-[#1E40AF]">
                        Rappel : vous n&apos;obtiendrez pas de réponse à votre question, merci de ne pas inscrire d&apos;informations personnelles. Pour obtenir une aide
                        personnalisée,
                      </span>{" "}
                      <a href="https://www.snu.gouv.fr/nous-contacter/" className="text-snu-purple-200 " target="_blank" rel="noopener noreferrer">
                        <span className="underline text-[#4F46E5] ">cliquez ici.</span>
                      </a>
                    </div>
                  </div>
                  <div className="mb-2 mt-8 flex w-full flex-row">
                    <p className="inline-block w-full self-end text-[12px] font-medium leading-4 text-[#111827]">Quel était votre question ?</p>
                    <p className="inline-block h-5 w-48 self-end text-end text-xs font-medium leading-5 text-[#6B7280]">125 caractères maximum</p>
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
                    className="mr-1 items-center justify-center rounded-md border-[1px] border-gray-200 bg-white px-4 text-[14px] font-medium leading-5 text-[#374151]"
                    onClick={() => setFeedback({ ...defaultFeedback })}
                  >
                    Annuler
                  </button>
                  <Button
                    className="rounded-md border-[1px] bg-[#2563EB] border-[#2563EB] px-4 text-[14px] font-medium leading-5 text-[#FFFFFF]"
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
          <div className="flex h-24 w-full flex-col items-center justify-center bg-white print:bg-transparent print:pb-12">
            <p className={`text-2xl font-light not-italic ${!feedback.isPositive ? "text-[#6B7280]" : "text-[#50B981]"}`}>Merci pour votre contribution !</p>
          </div>
        )}
        <hr className="mb-6 mt-4" />
        <KnowledgeBasePublicNoAnswer />
      </section>
    </div>
  );
};

const ArticleLoader = () => (
  <div className="wrapper mx-auto flex w-full flex-shrink flex-grow flex-col overflow-hidden bg-coolGray-100 print:bg-transparent">
    <div className="relative mb-5  mt-16 h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-5  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-5  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-5  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-5  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-16  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-5  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-5  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-5  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-5  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-5  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-16  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-5  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-5  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
    <div className="relative mb-5  h-2 w-full bg-gray-200">
      <div className="animated-background" />
    </div>
  </div>
);

export default KnowledgeBasePublicArticle;
