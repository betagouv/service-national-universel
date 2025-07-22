import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Pagination, { paginate } from "../../../components/Pagination";
import SortDropdown from "../../../components/SortDropdown";
import { Table, THead, TBody, TR, TD, TFooter } from "../../../components/Table";
import API from "../../../services/api";
import { Link } from "react-router-dom";

const SORT_BY_MOST_USEFUL = "SORT_BY_MOST_USEFUL";
const SORT_BY_MOST_COMMENTED = "SORT_BY_MOST_COMMENTED";
const SORT_BY_MOST_UNTREATED_COMMENTS = "SORT_BY_MOST_UNTREATED_COMMENTS";
const SORT_BY_MOST_TREATED_COMMENTS = "SORT_BY_MOST_TREATED_COMMENTS";

const MOST_USEFUL_TITLE = "Articles les plus utiles";
const MOST_COMMENTED_TITLE = "Articles les moins utiles";
const MOST_UNTREATED_COMMENTS = "Commentaires non traités";
const MOST_TREATED_COMMENTS = "Commentaires traités";

const KnowledgeBase = () => {
  const [mostUsefulArticles, setMostUsefulArticles] = useState([]);
  const [lessLikedArticles, setLessLikedArticles] = useState([]);
  const [mostUntreatedComments, setMostUntreatedComments] = useState([]);
  const [mostTreatedComments, setMostTreatedComments] = useState([]);
  const [sortByUseful, setSortByUseful] = useState(SORT_BY_MOST_USEFUL);
  const [sortByComment, setSortByComment] = useState(SORT_BY_MOST_UNTREATED_COMMENTS);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageComment, setCurrentPageComment] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  async function getFeedbackData() {
    try {
      const { data, ok } = await API.get({ path: "/feedback/usefulArticles" });
      if (ok) {
        const { mostUsefulArticles, lessLikedArticles, mostUntreatedComments, mostTreatedComments } = data;
        setMostUsefulArticles(mostUsefulArticles);
        setLessLikedArticles(lessLikedArticles);
        setMostUntreatedComments(mostUntreatedComments);
        setMostTreatedComments(mostTreatedComments);
      } else {
        toast.error("Une erreur est survenue lors de la récupération des commentaires");
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la récupération des commentaires");
    }
  }

  useEffect(() => {
    getFeedbackData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortByUseful]);

  useEffect(() => {
    setCurrentPageComment(1);
  }, [sortByComment]);

  const currentArticles = sortByUseful === SORT_BY_MOST_USEFUL ? mostUsefulArticles : lessLikedArticles;

  const currentComments = sortByComment === SORT_BY_MOST_UNTREATED_COMMENTS ? mostUntreatedComments : mostTreatedComments;

  const displayedArticles = paginate(currentArticles, currentPage, pageSize);
  const displayedComments = paginate(currentComments, currentPageComment, pageSize);
  const icon = sortByUseful === SORT_BY_MOST_USEFUL ? "👍" : "👎";

  return (
    <div className="flex flex-row">
      <div className="w-full">
        <Table>
          <THead textTransform="normal-case">
            <div className="flex w-full items-center px-6 py-3 text-gray-500">
              <div className="mr-5 rounded-md border border-[#D1D1D1] p-3 pl-4 pr-4">{icon}</div>
              <div className="flex-1">
                <div className="text-sm uppercase">Classement</div>
                <div className="text-2xl font-semibold text-black-dark">
                  {sortByUseful === SORT_BY_MOST_USEFUL ? MOST_USEFUL_TITLE : sortByUseful === SORT_BY_MOST_COMMENTED ? MOST_COMMENTED_TITLE : null}
                </div>
              </div>
              <SortDropdown
                items={[
                  {
                    name: MOST_USEFUL_TITLE,
                    handleClick: () => {
                      setSortByUseful(SORT_BY_MOST_USEFUL);
                    },
                    isActive: sortByUseful === SORT_BY_MOST_USEFUL,
                  },
                  {
                    name: MOST_COMMENTED_TITLE,
                    handleClick: () => {
                      setSortByUseful(SORT_BY_MOST_COMMENTED);
                    },
                    isActive: sortByUseful === SORT_BY_MOST_COMMENTED,
                  },
                ]}
              />
            </div>
          </THead>
          <TBody>
            {displayedArticles.map(({ _id: { slug, title, _id }, negativeFeedback, positiveFeedback }) => (
              <Link key={_id} to={`/knowledge-base/${slug}`} className="cursor-pointer">
                <TR>
                  <TD className={`flex-1`}>{title}</TD>
                  <TD className="w-[70px] !px-3 font-semibold" color={sortByUseful === SORT_BY_MOST_USEFUL ? "text-emerald-600" : "text-red-600"}>
                    {sortByUseful === SORT_BY_MOST_USEFUL ? `👍 ${positiveFeedback}` : `👎 ${negativeFeedback}`}
                  </TD>
                  <TD className="w-[80px] pl-3 font-semibold" color={sortByUseful === SORT_BY_MOST_USEFUL ? "text-red-600" : "text-emerald-600"}>
                    {sortByUseful === SORT_BY_MOST_USEFUL ? `👎 ${negativeFeedback}` : `👍 ${positiveFeedback}`}
                  </TD>
                </TR>
              </Link>
            ))}
          </TBody>
          <TFooter>
            <Pagination className="w-full" onPageChange={setCurrentPage} total={currentArticles.length} currentPage={currentPage} range={pageSize} onSizeChange={setPageSize} />
          </TFooter>
        </Table>
      </div>
      <div className="ml-2 mr-2" />
      <div className="w-full">
        <Table>
          <THead textTransform="normal-case">
            <div className="flex w-full items-center px-6 py-3 text-gray-500">
              <div className="mr-5 rounded-md border border-[#D1D1D1] p-3 pl-4 pr-4">💬</div>
              <div className="flex-1">
                <div className="text-sm uppercase">Classement</div>
                <div className="text-2xl font-semibold text-black-dark">{sortByComment === SORT_BY_MOST_UNTREATED_COMMENTS ? MOST_UNTREATED_COMMENTS : MOST_TREATED_COMMENTS}</div>
              </div>
              <SortDropdown
                items={[
                  {
                    name: MOST_UNTREATED_COMMENTS,
                    handleClick: () => {
                      setSortByComment(SORT_BY_MOST_UNTREATED_COMMENTS);
                    },
                    isActive: sortByComment === SORT_BY_MOST_UNTREATED_COMMENTS,
                  },
                  {
                    name: MOST_TREATED_COMMENTS,
                    handleClick: () => {
                      setSortByComment(SORT_BY_MOST_TREATED_COMMENTS);
                    },
                    isActive: sortByComment === SORT_BY_MOST_TREATED_COMMENTS,
                  },
                ]}
              />
            </div>
          </THead>
          <TBody>
            {displayedComments.map(({ _id: { slug, title, _id }, untreatedComment, treatedComment }) => (
              <Link key={_id} to={`/knowledge-base/${slug}`} className="cursor-pointer">
                <TR>
                  <TD className="flex-1">{title}</TD>
                  <TD className="w-[80px] pl-3 font-semibold">{sortByComment === SORT_BY_MOST_UNTREATED_COMMENTS ? `💬 ${untreatedComment}` : `💬 ${treatedComment}`}</TD>
                </TR>
              </Link>
            ))}
          </TBody>
          <TFooter>
            <Pagination
              className="w-full"
              onPageChange={setCurrentPageComment}
              total={currentComments.length}
              currentPage={currentPageComment}
              range={pageSize}
              onSizeChange={setPageSize}
            />
          </TFooter>
        </Table>
      </div>
    </div>
  );
};

export default KnowledgeBase;
