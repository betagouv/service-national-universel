import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";
import { useSWRConfig } from "swr";
import API from "../../services/api";
import Modal from "../Modal";
import KnowledgeBaseForm from "./KnowledgeBaseForm";

const KnowledgeBaseCreate = ({ type, position, parentId = null }) => {
  const [open, setOpen] = useState(null);

  const router = useRouter();
  const { mutate } = useSWRConfig();

  const onSubmit = async (body) => {
    body.allowedRoles = body.computedAllowedRoles.filter(({ value }) => !!value).map((item) => item.id);
    body.type = type;
    body.position = position;
    body.parentId = parentId;
    const response = await API.post({ path: "/support-center/knowledge-base", body });
    if (response.error) return toast.error(response.error);
    if (response.data) {
      if (router.query.slug) mutate(API.getUrl({ path: `/support-center/knowledge-base/${router.query.slug}`, query: { withTree: true, withParents: true } }));
      mutate(API.getUrl({ path: "/support-center/knowledge-base/", query: { withTree: true, withParents: true } }));
      router.push(`/admin/knowledge-base/${response.data.slug}`);
      setOpen(false);
    }
  };

  return (
    <>
      <Modal isOpen={!!open} onRequestClose={() => setOpen(false)}>
        <KnowledgeBaseForm type={type} defaultValues={{ status: "DRAFT" }} onSubmit={onSubmit}>
          <div className="flex justify-evenly mt-3.5 w-full">
            <button type="submit" className="w-auto">
              Créer
            </button>
            <button type="reset" onClick={() => setOpen(null)}>
              Annuler
            </button>
          </div>
        </KnowledgeBaseForm>
      </Modal>
      <button className="w-8 h-8 rounded-full p-0 ml-3" onClick={() => setOpen(true)}>
        +
      </button>
    </>
  );
};

export default KnowledgeBaseCreate;
