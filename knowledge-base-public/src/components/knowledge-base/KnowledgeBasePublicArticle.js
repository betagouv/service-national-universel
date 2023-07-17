import TextEditor from "../TextEditor";
import { useMemo, useState } from "react";
import API from "../../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { environment, snuApiUrl } from "../../config";
import { Button } from "../Buttons";
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

    <div className="wrapper mx-auto flex w-full flex-shrink flex-grow flex-col overflow-hidden bg-coolGray-100 print:bg-transparent  print:pb-12">
      {environment === "production" ? (
        null
      ) : (
        <>
          <Breadcrumbs parents={item?.parents || []} path="/base-de-connaissance" />
          <div className="py-4">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl print:mb-0 print:text-black">{group?.title}</h2>
            <h1 className="mb-6 text-4xl font-bold md:text-5xl print:mb-0 print:text-black">{item?.title}</h1>
            <h6 className="text-base text-snu-purple-100 md:text-lg lg:text-xl print:text-black">{item?.description}</h6>
          </div>
        </>
      )}
      {item?.updatedAt && (
        <span className="mb-4 ml-auto mt-2 flex flex-col items-end text-xs italic text-gray-400 print:mb-2 print:mt-0">
          {/* <em>Article mis à jour le {Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(item.updatedAt))}</em> */}
          <button className="noprint mt-2 cursor-pointer border border-gray-300 bg-gray-100 font-normal text-black shadow-none" onClick={window.print}>
            🖨 Imprimer
          </button>
        </span>
      )}
      <TextEditor readOnly content={item.content} _id={item._id} slug={item.slug} />
      <div className="border-[rgba(0, 0, 0, 0.1)] mb-12 mt-10 w-full border-t-2"></div>
      <ToastContainer />
      {!hasSubmitted && (
        <>
          {feedback.isPositive && (
            <div className="flex  h-48 w-full flex-col items-center justify-center bg-white print:bg-transparent print:pb-12">
              <>
                <p className="text-2xl font-light not-italic text-gray-600">Cet article vous a été utile ?</p>
              </>
              <div className="mt-3 flex flex-row">
                <div
                  id="ThumbsUp"
                  className="hover:border-[#9CA3AF] mr-1 flex h-12 w-20 cursor-pointer flex-row items-center justify-center rounded-md border-2 border-gray-200 text-3xl font-medium"
                  onClick={postFeedback}
                >
                  👍
                </div>
                <div
                  className="hover:border-[#9CA3AF] ml-1 flex h-12 w-20 cursor-pointer flex-row items-center justify-center rounded-md border-2 border-gray-200 text-3xl font-medium"
                  onClick={() => setFeedback({ ...feedback, isPositive: false })}
                >
                  👎
                </div>
              </div>
            </div>
          )}
          {!feedback.isPositive && (
            <div className="flex h-full w-full flex-col items-center justify-center bg-white pb-10 pl-24 pr-24 pt-10">
              <h1 className="text-2xl font-light not-italic leading-8 text-gray-600">Aidez-nous à nous améliorer</h1>
              <p className="mt-8 justify-center leading-5 text-gray-600 ">
                ⚠️ <span className="text-lg font-semibold text-gray-600">Rappel :</span> vous n&apos;obtiendrez pas de réponse à votre question, merci de ne pas inscrire d&apos;informations
                personnelles. Pour obtenir une aide personnalisée,{" "}
                <a href="https://www.snu.gouv.fr/nous-contacter/" className="text-snu-purple-200 " target="_blank" rel="noopener noreferrer">
                  <span className="font-semibold text-[#4F46E5] ">cliquez ici.</span>
                </a>
              </p>
              <div className="mb-2 mt-8 flex w-full flex-row">
                <p className="inline-block w-full self-end text-base font-medium leading-5 text-gray-700">Quel était votre question ?</p>
                <p className="inline-block h-5 w-48 self-end text-end text-xs font-medium leading-5 text-[#6B7280]">125 caractères maximum</p>
              </div>
              <textarea
                className={`h-24 w-full rounded-md border-2 ${!feedback.comment || feedback.comment?.length <= 125 ? "border-gray-200" : "border-[#EF4444]"
                  } p-4 text-sm font-normal text-[#4B5563] focus:outline-none`}
                placeholder="Ecrivez votre question ici..."
                onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
              ></textarea>
              <p
                className={`relative -mt-8 mb-8 mr-4 self-end text-end text-xs font-medium leading-6 ${!feedback.comment || feedback.comment?.length <= 125 ? "text-[#6B7280]" : "text-[#EF4444]"
                  }`}
              >
                {feedback.comment?.length || 0}/125
              </p>
              <div className="mt-3 flex w-full flex-row">
                <button
                  className="border-1 mr-1 flex flex-1 items-center justify-center border-gray-200 bg-white text-[#6B7280]"
                  onClick={() => setFeedback({ ...defaultFeedback })}
                >
                  Annuler
                </button>
                <Button className="flex-1" onClick={postFeedback} loading={isSubmitting} disabled={feedback.comment?.length > 125}>
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
