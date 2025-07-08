import React, { useState, useEffect } from "react";
import API from "../../../services/api";
import toast from "react-hot-toast";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";

const FeedbacksEdit = ({ item }) => {
  const [feedbacks, setFeedbacks] = useState();
  const [selectedComments, setSelectedComments] = useState([]);
  const [isTreatedCommentsListOpen, setIsTreatedCommentsListOpen] = useState(true);
  const [isArchivedCommentsListOpen, setIsArchivedCommentsListOpen] = useState(false);

  useEffect(() => {
    getFeedbacks(item._id);
  }, []);

  const getFeedbacks = async (knowledgeBaseArticle) => {
    try {
      const response = await API.get({ path: `/feedback`, query: { knowledgeBaseArticle } });
      if (response.ok) {
        setFeedbacks(response.data);
      } else {
        toast.error("Une erreur est survenue lors de la récupération des commentaires");
      }
    } catch (e) {
      toast.error("Une erreur est survenue lors de la récupération des commentaires");
    }
  };

  const selectComment = async (comment) => {
    if (selectedComments.includes(comment._id)) {
      var filteredSelectedComments = selectedComments.filter(function (e) {
        return e !== comment._id;
      });
      setSelectedComments(filteredSelectedComments);
    } else {
      setSelectedComments((prevState) => [...prevState, comment._id]);
    }
  };

  const archiveComment = async () => {
    try {
      const { ok } = await API.put({ path: `/feedback/archivefeedbacks`, body: { selectedComments } });
      if (ok) {
        getFeedbacks(item._id);
        setSelectedComments([]);
        toast.success("Commentaires archivés avec succès");
      } else {
        toast.error("Une erreur s'est produite veuillez nous excusez");
      }
    } catch (e) {
      toast.error("Une erreur s'est produite veuillez nous excusez");
    }
  };

  const untreatedComments = feedbacks?.filter((feedback) => feedback.comment && !feedback.treatedAt);
  const treatedComments = feedbacks?.filter((feedback) => feedback.comment && feedback.treatedAt);
  const thumbsUp = feedbacks?.filter((feedback) => feedback.isPositive).length;
  const thumbsDown = feedbacks?.filter((feedback) => !feedback.isPositive).length;

  return (
    <>
      {feedbacks?.length > 0 && (
        <div className="mt-5 mb-2 w-full">
          <p className="text-base font-medium leading-6 text-[#374151]">Article utile</p>
          <div className="mt-2 flex w-full flex-row justify-center">
            <div className="mr-1 text-xl font-normal leading-5">👍</div>
            <p className="mr-2 text-lg font-medium leading-5 text-green-900">{thumbsUp}</p>
            <div className="ml-2 text-xl font-normal leading-5">👎</div>
            <p className="ml-1 text-lg font-medium leading-5 text-red-600">{thumbsDown}</p>
          </div>
          <div className="mt-2 mb-2 rounded-md border-2 border-gray-300">
            <div
              className="flex-row items-center justify-center 
             p-2"
            >
              <p
                onClick={() => setIsTreatedCommentsListOpen(!isTreatedCommentsListOpen)}
                className="flex cursor-pointer flex-row justify-center text-center text-sm font-semibold leading-5 text-indigo-600"
              >
                Commentaires non traités ({untreatedComments?.length}){" "}
                {isTreatedCommentsListOpen ? <HiChevronUp className="text-xl font-semibold" /> : <HiChevronDown className="text-xl font-semibold" />}
              </p>
            </div>
            {isTreatedCommentsListOpen && (
              <div className={`${untreatedComments?.length >= 5 ? "h-40 overflow-y-scroll break-words" : null}`}>
                <div className="bg-white ">
                  {untreatedComments &&
                    untreatedComments.map((comment) => (
                      <p
                        key={comment._id}
                        className={`${selectedComments.includes(comment._id) ? "bg-[#C7D2FE]" : "odd:bg-white even:bg-[#F9FAFB]"} cursor-pointer p-2
                    pl-4 text-xs font-normal leading-5 text-gray-700`}
                        onClick={() => selectComment(comment)}
                      >
                        {comment.comment}
                      </p>
                    ))}
                </div>
              </div>
            )}
            <div className="flex-row items-center justify-center p-2">
              <p
                onClick={() => setIsArchivedCommentsListOpen(!isArchivedCommentsListOpen)}
                className="flex cursor-pointer flex-row justify-center text-center text-sm font-semibold leading-5 text-indigo-600"
              >
                Commentaires archivés ({treatedComments ? treatedComments.length : 0}){" "}
                {isArchivedCommentsListOpen ? <HiChevronUp className="text-xl font-semibold" /> : <HiChevronDown className="text-xl font-semibold" />}
              </p>
            </div>
            {isArchivedCommentsListOpen && (
              <div className={`${treatedComments.length >= 5 ? "h-40 overflow-y-scroll break-words" : null}`}>
                <div className="bg-white">
                  {treatedComments.map((comment) => (
                    <p
                      key={comment._id}
                      className="p-2 pl-4 text-xs
                    font-normal leading-5 text-gray-700 odd:bg-white even:bg-[#F9FAFB]"
                    >
                      {comment.comment}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => archiveComment()}
            className={` ${selectedComments.length < 1 ? "pointer-events-none bg-indigo-200" : "bg-[#4F46E5]"} "'" mb-2 w-full cursor-pointer 
    flex-row      items-center justify-center rounded-md p-2`}
          >
            <p className="text-center text-sm font-semibold leading-5 text-white">Archiver la sélection ({selectedComments.length})</p>
          </button>
        </div>
      )}
    </>
  );
};

export default FeedbacksEdit;
