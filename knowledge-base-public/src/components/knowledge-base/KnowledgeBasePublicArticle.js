import TextEditor from "../TextEditor";
import { useState } from "react";
import API from "../../services/api";

const KnowledgeBasePublicArticle = ({ item, isLoading }) => {
  const [isThumbsUp, setIsThumbsUp] = useState(false);
  const [isThumbsDown, setIsThumbsDown] = useState(false);
  const [validated, setIsValidated] = useState(false);
  const [counter, setCounter] = useState(0);
  const [comment, setComment] = useState("");

  const myComment = (e) => {
    setCounter(e.target.value.length);
    setComment(e.target.value);
  };

  async function postGoodFeedback() {
    const data = {
      knowledgeBaseArticle: item._id,
      isPositive: true,
    };
    const response = await API.post({ path: `/feedback`, body: data });
    if (response.ok) {
      setIsThumbsUp(!isThumbsUp);
    } else {
      alert("Une erreure s'est produite veuillez nous excusez");
    }
  }

  async function postBadFeedback() {
    const data = {
      knowledgeBaseArticle: item._id,
      isPositive: false,
      comment: comment,
    };
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(data),
    };
    // const response = await API.get({ path: `/knowledge-base/${restriction}/search`, query: { search } });

    const response = await fetch("http://localhost:3000/feedback", requestOptions);
    if (response.status === 200) {
      setIsValidated(true);
      setIsThumbsDown(false);
      setIsThumbsUp(true);
      return response;
    } else {
      console.log("Response", response.status);
      alert("Une erreure s'est produite veuillez nous excusez");
    }
    return response;
  }

  if (isLoading) return <ArticleLoader />;
  return (
    <div className="wrapper mx-auto flex w-full flex-shrink flex-grow flex-col overflow-hidden bg-coolGray-100 print:bg-transparent  print:pb-12">
      {item?.updatedAt && (
        <span className="ml-auto mt-2 mb-4 flex flex-col items-end text-xs italic text-gray-400 print:mt-0 print:mb-2">
          {/* <em>Article mis à jour le {Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(item.updatedAt))}</em> */}
          <button className="noprint mt-2 cursor-pointer border border-gray-300 bg-gray-100 font-normal text-black shadow-none" onClick={window.print}>
            🖨 Imprimer
          </button>
        </span>
      )}
      <TextEditor readOnly content={item.content} _id={item._id} slug={item.slug} />
      <div className="border-[rgba(0, 0, 0, 0.1)] mt-10 mb-12 w-full border-t-2"></div>
      {isThumbsUp === isThumbsDown ? (
        <div className="flex flex h-48 w-full flex-col items-center justify-center bg-white print:bg-transparent print:pb-12">
          <>
            <p className="text-2xl font-light not-italic text-gray-600">Cet article vous à été utile ?</p>
          </>
          <div className="mt-3 flex flex-row">
            <div
              className="mr-1 flex h-12 w-20 cursor-pointer flex-row items-center justify-center rounded-md border-2 border-gray-200 text-3xl font-medium hover:border-[#9CA3AF]"
              onClick={() => postGoodFeedback()}
            >
              👍
            </div>
            <div
              className="ml-1 flex h-12 w-20 cursor-pointer flex-row items-center justify-center rounded-md border-2 border-gray-200 text-3xl font-medium hover:border-[#9CA3AF]"
              onClick={() => setIsThumbsDown(!isThumbsDown)}
            >
              👎
            </div>
          </div>
        </div>
      ) : (
        <>
          {isThumbsDown && (
            <div className="flex flex h-full w-full flex-col items-center justify-center bg-white pr-24 pl-24 pb-10 pt-10">
              <h1 className="text-2xl font-light not-italic leading-8 text-gray-600">Aidez-nous à nous améliorer</h1>
              <p className="mt-8 justify-center leading-5 text-gray-600 ">
                ⚠️ <span className="text-lg font-semibold text-gray-600">Rappel :</span> vous n'obtiendrez pas de réponse à votre question, merci de ne pas inscrire d'informations
                personnelles. Pour obtenir une aide personnalisée, <span className="cursor-pointer text-lg font-semibold text-[#4F46E5] ">cliquez ici.</span>
              </p>
              <div className="mt-8 mb-2 flex w-full flex-row">
                <p className="inline-block w-full self-end text-base font-medium leading-5 text-gray-700">Quel était votre question ?</p>
                <p className="inline-block h-5 w-48 self-end text-end text-xs font-medium leading-5 text-[#6B7280]">125 caractères maximum</p>
              </div>
              <textarea
                className={`h-24 w-full rounded-md border-2 ${counter <= 125 ? "border-gray-200" : "border-[#EF4444]"} p-4 text-sm font-normal text-[#4B5563] focus:outline-none`}
                placeholder="Describe yourself here..."
                onChange={(e) => myComment(e)}
              ></textarea>
              <p className={`relative -mt-8 mr-4 mb-8 self-end text-end text-xs font-medium leading-6 ${counter <= 125 ? "text-[#6B7280]" : "text-[#EF4444]"}`}>{counter}/125</p>
              <div className="mt-3 flex w-full flex-row">
                <div
                  className="mr-1 flex h-12 w-6/12 cursor-pointer flex-row items-center justify-center rounded-md border-2 border-gray-200 text-sm font-medium leading-5 text-[#6B7280]"
                  onClick={() => setIsThumbsDown(false)}
                >
                  Annuler
                </div>
                <div
                  className={`${
                    counter > 125 && "pointer-events-none"
                  } ml-1 flex h-12 w-6/12 cursor-pointer flex-row items-center justify-center rounded-md border-2 border-gray-200 ${
                    counter > 125 ? "bg-indigo-200" : "bg-[#4F46E5]"
                  } text-sm font-medium leading-5 text-[#FFFFFF]`}
                  onClick={() => postBadFeedback()}
                >
                  Envoyer
                </div>
              </div>
            </div>
          )}
          {isThumbsUp && (
            <div className="flex flex h-24 w-full flex-col items-center justify-center bg-white print:bg-transparent print:pb-12">
              <p className={`text-2xl font-light not-italic ${validated ? "text-[#6B7280]" : "text-[#50B981]"}`}>Merci pour votre contribution !</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const ArticleLoader = () => (
  <div className="wrapper mx-auto flex w-full flex-shrink flex-grow flex-col overflow-hidden bg-coolGray-100 print:bg-transparent">
    <div className="relative mt-16  mb-5 h-2 w-full bg-gray-200">
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
