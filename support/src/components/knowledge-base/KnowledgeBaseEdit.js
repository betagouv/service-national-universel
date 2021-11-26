import { useState } from "react";
import { useSWRConfig } from "swr";
import router from "next/router";
import { SUPPORT_ROLES } from "snu-lib/roles";
import { toast } from "react-toastify";
import KnowledgeBaseForm from "./KnowledgeBaseForm";
import withAuth from "../../hocs/withAuth";
import API from "../../services/api";
import Modal from "../Modal";
import useKnowledgeBaseData from "../../hooks/useKnowledgeBaseData";

const KnowledgeBaseEdit = ({ sectionOrAnswer }) => {
  const { mutate } = useSWRConfig();
  const { flattenedData } = useKnowledgeBaseData();

  const onSubmit = async (body) => {
    body.allowedRoles = body.computedAllowedRoles.filter(({ value }) => !!value).map((item) => item.id);
    const response = await API.put({ path: `/support-center/knowledge-base/${sectionOrAnswer._id}`, body });
    if (response.error) return toast.error(response.error);
    mutate(API.getUrl({ path: `/support-center/knowledge-base/${sectionOrAnswer.slug}`, query: { withTree: true, withParents: true } }));
    mutate(API.getUrl({ path: "/support-center/knowledge-base/", query: { withTree: true, withParents: true } }));
    router.replace(`/admin/knowledge-base/${response.data.slug}`);
    setIsOpen(false);
  };

  const onDelete = async () => {
    if (window.confirm("Vouelz-vous vraiment supprimer cet élément ? Cette opération est définitive")) {
      const response = await API.delete({ path: `/support-center/knowledge-base/${sectionOrAnswer._id}` });
      if (response.error) return toast.error(response.error);
      toast.success("Élément supprimé !");
      const parent = flattenedData.find((item) => item._id === sectionOrAnswer.parentId);
      mutate(API.getUrl({ path: "/support-center/knowledge-base/", query: { withTree: true, withParents: true } }));
      mutate(API.getUrl({ path: `/admin/knowledge-base/${parent.slug}`, query: { withTree: true, withParents: true } }));
      router.replace(`/admin/knowledge-base/${parent.slug}`);
      setIsOpen(false);
    }
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <span onClick={() => setIsOpen(true)} className="text-snu-purple-900 cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </span>
      <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)}>
        <KnowledgeBaseForm
          defaultValues={{
            ...sectionOrAnswer,
            computedAllowedRoles: Object.keys(SUPPORT_ROLES).map((role) => ({ id: role, name: role, value: sectionOrAnswer.allowedRoles.includes(role) })),
          }}
          onSubmit={onSubmit}
        >
          <div className="flex justify-evenly mt-3.5 w-full">
            <button type="submit" className="w-auto">
              Enregistrer
            </button>
            <button className="bg-white !border-2 border-red-500  text-red-500" onClick={onDelete}>
              Supprimer
            </button>
          </div>
        </KnowledgeBaseForm>
      </Modal>
    </>
  );
};

export default withAuth(KnowledgeBaseEdit);
