import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setOrganisation } from "../../redux/auth/actions";
import API from "../../services/api";

const KnowledgeBaseUrl = () => {
  const dispatch = useDispatch();
  const organisation = useSelector((state) => state.Auth.organisation);
  const [knowledgeBaseBaseUrl, setKnowledgeBaseBaseUrl] = useState(organisation?.knowledgeBaseBaseUrl);

  useEffect(() => {
    setKnowledgeBaseBaseUrl(organisation?.knowledgeBaseBaseUrl);
  }, [organisation?.knowledgeBaseBaseUrl]);

  const onUpdate = async () => {
    try {
      const response = await API.patch({ path: `/organisation/${organisation._id}`, body: { knowledgeBaseBaseUrl } });
      if (response.ok) {
        dispatch(setOrganisation(response.data));
        toast.success("Ok");
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mb-8 pl-[22px]">
        <span className="text-sm font-medium uppercase text-gray-500">Base de connaissance</span>
        <h4 className="mt-1.5 text-3xl font-bold text-black-dark">URL de la base de connaissances publique</h4>
      </div>

      <div className="mb-[34px]">
        <label className="mb-1 inline-block text-sm font-medium text-gray-700">URL de la base de connaissances publique</label>
        <input
          type="text"
          value={knowledgeBaseBaseUrl || ""}
          onChange={(e) => setKnowledgeBaseBaseUrl(e.target.value)}
          className="w-full rounded border border-gray-300 bg-white py-2.5 px-3.5 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
          placeholder="http://zamoud.com"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onUpdate}
          type="submit"
          className="mr-auto h-[38px] rounded-md  bg-accent-color px-4 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-25"
          disabled={knowledgeBaseBaseUrl === organisation?.knowledgeBaseBaseUrl}
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
};

export default KnowledgeBaseUrl;
