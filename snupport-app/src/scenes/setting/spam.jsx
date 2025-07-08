import React, { Fragment } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { setOrganisation } from "../../redux/auth/actions";

import API from "../../services/api";
import { HiTrash } from "react-icons/hi";

import { TH } from "../../components/Table";

export default function Spam() {
  const [spams, setSpams] = useState([]);
  const [newSpam, setNewSpam] = useState("");
  const organisation = useSelector((state) => state.Auth.organisation);
  const dispatch = useDispatch();

  useEffect(() => {
    setSpams(organisation.spamEmails);
  }, [organisation]);

  async function addSpam() {
    try {
      const response = await API.patch({ path: `/organisation/${organisation._id}`, body: { spamEmails: [...spams, newSpam] } });
      if (response.ok) {
        dispatch(setOrganisation(response.data));
        toast.success("Ok");
      }
    } catch (e) {
      toast.error(e.message);
    }
  }
  async function delSpam(deletedSpam) {
    try {
      const response = await API.patch({ path: `/organisation/${organisation._id}`, body: { spamEmails: spams.filter((spam) => spam !== deletedSpam) } });
      if (response.ok) {
        dispatch(setOrganisation(response.data));
        toast.success("Ok");
      }
    } catch (e) {
      toast.error(e.message);
    }
  }
  return (
    <Fragment>
      <Header />
      <div className="mb-5 flex gap-3">
        <div className="flex h-[38px] flex-1 items-center gap-5 rounded-md border border-gray-300 bg-white px-3.5 shadow-sm">
          <input
            type="text"
            className="flex-1 border-none p-0 text-sm text-gray-800 placeholder:text-gray-500"
            value={newSpam}
            onChange={(e) => setNewSpam(e.target.value)}
            placeholder="Renseignez un e-mail"
          />
        </div>
        <button
          className="h-[38px] flex-none rounded-md bg-accent-color px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          onClick={() => {
            addSpam(newSpam);
            setNewSpam("");
          }}
        >
          Ajouter aux spams
        </button>
      </div>
      <Table spams={spams} delSpam={delSpam} />
    </Fragment>
  );
}

const Header = () => {
  return (
    <div className="mb-[38px] flex items-center justify-between pl-[22px]">
      <div>
        <span className="text-sm font-medium uppercase text-gray-500">Tickets</span>
        <h4 className="mt-1.5 text-3xl font-bold text-black-dark">Spam</h4>
      </div>
    </div>
  );
};

const Table = ({ spams, delSpam }) => {
  return (
    <div className="rounded-lg bg-white shadow">
      <div className="flex justify-between rounded-t-lg border-b border-gray-200 bg-gray-50">
        <TH text="Email" />
        <TH text="Action" />
      </div>

      <div className="flex flex-col">
        {spams.map((spam, index) => (
          <div className="flex last:rounded-b-lg odd:bg-white even:bg-gray-50" key={index}>
            <p className="flex-1 px-6 py-4 text-sm text-gray-500">{spam}</p>

            <div className="flex w-[64px] flex-none items-center gap-5  py-4">
              <button type="button" className="text-sm font-medium text-accent-color transition-colors hover:text-indigo-500" onClick={() => delSpam(spam)}>
                <HiTrash />
              </button>
              {/* <button type="button" className="flex items-center text-xl text-grey-text transition-colors hover:text-red-500">
                <HiTrash />
              </button> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
