import { useState } from "react";
import router from "next/router";
import { SUPPORT_ROLES } from "snu-lib/roles";
import { toast } from "react-toastify";
import API from "../../services/api";
import useKnowledgeBaseData from "../../hooks/useKnowledgeBaseData";

const KnowledgeBaseItemMetadata = ({ visible, setVisible }) => {
  const { flattenedData, mutate } = useKnowledgeBaseData();

  const onSubmit = async (body) => {
    body.allowedRoles = body.computedAllowedRoles.filter(({ value }) => !!value).map((item) => item.id);
    const response = await API.put({ path: `/support-center/knowledge-base/${sectionOrAnswer._id}`, body });
    if (response.error) return toast.error(response.error);
    mutate();
    router.replace(`/admin/knowledge-base/${response.data.slug}`);
  };

  const onDelete = async () => {
    if (window.confirm("Vouelz-vous vraiment supprimer cet élément ? Cette opération est définitive")) {
      const response = await API.delete({ path: `/support-center/knowledge-base/${sectionOrAnswer._id}` });
      if (response.error) return toast.error(response.error);
      toast.success("Élément supprimé !");
      const parent = flattenedData.find((item) => item._id === sectionOrAnswer.parentId);
      mutate();
      router.replace(`/admin/knowledge-base/${parent.slug}`);
      setIsOpen(false);
    }
  };

  return (
    <div className={`flex-grow-0 flex-shrink-0 border-l-2 shadow-md resize-x dir-rtl overflow-hidden ${visible ? "w-80" : "w-0 hidden"}`}>
      <aside className={`flex flex-col p-2 overflow-hidden dir-ltr`}>
        <svg onClick={() => setVisible(false)} xmlns="http://www.w3.org/2000/svg" className="m-2 h-6 w-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        <div className="flex justify-evenly mt-3.5 w-full">
          <button type="submit" className="w-auto">
            Enregistrer
          </button>
          <button className="bg-white !border-2 border-red-500  text-red-500" onClick={onDelete}>
            Supprimer
          </button>
        </div>
      </aside>
    </div>
  );
};

export default KnowledgeBaseItemMetadata;
