import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import ReactPaginate from "react-paginate";
import API from "../../services/api";
import { fakeTicketsFolders } from "../../utils/ticketsFolders";
import TicketsTable from "./TicketsTable";

const TicketsInbox = ({ onTicketClick }) => {
  const router = useRouter();
  const inbox = useMemo(() => fakeTicketsFolders.find((folder) => folder._id === router.query?.inbox || "inbox"), [router.query?.inbox]);

  const [limitPerPage, setLimitPerPage] = useState(() => JSON.parse(localStorage.getItem("snu-tickets-limit-per-page")) || 50);
  useEffect(() => {
    localStorage.setItem("snu-tickets-limit-per-page", limitPerPage);
  }, [limitPerPage]);

  const [page, setPage] = useState(() => JSON.parse(localStorage.getItem("snu-tickets-page")) || 0);
  useEffect(() => {
    localStorage.setItem("snu-tickets-limit-per-page", limitPerPage);
  }, [limitPerPage]);
  useEffect(() => {
    if (router.query?.inbox) setPage(0);
  }, [router.query?.inbox]);

  const { data } = useSWR(API.getUrl({ path: "/support-center/ticket", query: { limit: limitPerPage, page } }));

  return (
    <div className="w-{calc(100% - 3rem)} my-1 ml-1 mr-2 mt-2 flex flex-1 flex-col overflow-hidden rounded-lg bg-white drop-shadow-md">
      <span className="block p-6 text-xl font-bold">{inbox?.name}</span>
      <div className="flex basis-full overflow-scroll">
        <TicketsTable onTicketClick={onTicketClick} tickets={data?.data || []} />
      </div>
      <div className="flex justify-between px-6 pb-2 pt-3">
        <select onChange={(e) => setLimitPerPage(e.target.value)} value={limitPerPage}>
          {[10, 20, 50, 100].map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <div className="flex rounded-l-lg">
          <ReactPaginate
            className="flex"
            pageClassName="border border-r-0 w-10 h-10 flex justify-center items-center"
            breakClassName="border w-10 h-10 flex justify-center items-center"
            previousClassName="border border-r-0 w-10 h-10 flex justify-center items-center  rounded-l-lg"
            nextClassName="border w-10 h-10 flex justify-center items-center  rounded-r-lg"
            pageLinkClassName="flex justify-center items-center"
            breakLabel="..."
            nextLabel=">"
            activeClassName="font-bold color-snu-purple-900 bg-snu-purple-100 "
            forcePage={page}
            onPageChange={({ selected }) => setPage(selected)}
            pageRangeDisplayed={3}
            pageCount={data?.total / limitPerPage}
            previousLabel="<"
            renderOnZeroPageCount={null}
          />
        </div>
      </div>
    </div>
  );
};

export default TicketsInbox;
