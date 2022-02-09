import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";
import { SUPPORT_ROLES } from "snu-lib/roles";
import useKnowledgeBaseData from "../../hooks/useKnowledgeBaseData";
import API from "../../services/api";
import { Button, CancelButton } from "../Buttons";
import InputWithEmojiPicker from "../InputWithEmojiPicker";
import Modal from "../Modal";

const KnowledgeBaseAdminItemCreate = ({ type, position, parentId = null }) => {
  const [open, setOpen] = useState(null);

  const router = useRouter();
  const { mutate, flattenedData } = useKnowledgeBaseData();

  const [isCreating, setIsCreating] = useState(false);
  const onSubmit = async (event) => {
    event.preventDefault();
    setIsCreating(true);
    const formData = new FormData(event.currentTarget);
    const body = { type, position, parentId, allowedRoles: [] };
    for (let [key, value] of formData.entries()) {
      if (key.includes(".")) {
        // allowedRole in fieldset
        const [checkboxFieldset, checkboxName] = key.split(".");
        if (["on", true].includes(value)) body[checkboxFieldset].push(checkboxName);
      } else {
        body[key] = value;
      }
    }
    const response = await API.post({ path: "/support-center/knowledge-base", body });
    setIsCreating(false);
    if (response.error) return toast.error(response.error);
    if (response.data) {
      mutate({ ok: true, data: [...flattenedData, response.data] });
      router.push(`/admin/base-de-connaissance/${response.data.slug}`);
      setOpen(false);
    }
  };

  return (
    <>
      <Modal isOpen={!!open} onRequestClose={() => setOpen(false)}>
        <form onSubmit={onSubmit} className="flex w-screen-3/4 flex-col items-start">
          <h2 className="ml-4 mb-4 text-xl font-bold">Créer {type === "section" ? "une rubrique" : "un article"}</h2>
          <div className="flex w-full">
            <div className="flex flex-grow flex-col">
              <label htmlFor="title">Titre</label>
              <InputWithEmojiPicker inputClassName="p-2" className="mb-5  border-2" placeholder={`Titre ${type === "section" ? "de la rubrique" : "de l'article"}`} name="title" />
              {/* <label htmlFor="slug">Slug (Url)</label>
              <input className="p-2 border-2 mb-5" placeholder={`Slug ${type === "section" ? "de la rubrique" : "de l'article"}`} name="slug" /> */}
              <label htmlFor="description">Description</label>
              <textarea className="mb-5 border-2 p-2" placeholder={`Description ${type === "section" ? "de la rubrique" : "de l'article"}`} name="description" />
            </div>
            <div className="ml-10 flex flex-grow flex-col">
              <fieldset className="mb-5">
                <div className=" flex flex-row">
                  <legend>Visible par:</legend>
                  <div className="ml-10 flex flex-col">
                    {Object.keys(SUPPORT_ROLES).map((role) => (
                      <div className="flex items-center" key={role}>
                        <input className="mr-4" id={`allowedRoles.${role}`} type="checkbox" name={`allowedRoles.${role}`} defaultChecked />
                        <label className="mr-2" id={role} htmlFor={`allowedRoles.${role}`}>
                          {SUPPORT_ROLES[role]}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
          <div className="mt-3.5 flex w-full justify-evenly">
            <Button type="submit" className="w-auto" disabled={isCreating} loading={isCreating}>
              Créer
            </Button>
            <CancelButton type="reset" onClick={() => setOpen(null)}>
              Annuler
            </CancelButton>
          </div>
        </form>
      </Modal>
      <button className="ml-3 flex h-8 w-8 items-center justify-center rounded-full p-0 text-center" onClick={() => setOpen(true)}>
        +
      </button>
    </>
  );
};

export default KnowledgeBaseAdminItemCreate;
