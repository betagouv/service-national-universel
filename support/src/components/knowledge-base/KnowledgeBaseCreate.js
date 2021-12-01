import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";
import { SUPPORT_ROLES } from "snu-lib/roles";
import useKnowledgeBaseData from "../../hooks/useKnowledgeBaseData";
import API from "../../services/api";
import InputWithEmojiPicker from "../InputWithEmojiPicker";
import Modal from "../Modal";

const KnowledgeBaseCreate = ({ type, position, parentId = null }) => {
  const [open, setOpen] = useState(null);

  const router = useRouter();
  const { mutate, flattenedData } = useKnowledgeBaseData();

  const onSubmit = async (event) => {
    event.preventDefault();
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
    if (response.error) return toast.error(response.error);
    if (response.data) {
      mutate({ ok: true, data: [...flattenedData, response.data] });
      router.push(`/admin/knowledge-base/${response.data.slug}`);
      setOpen(false);
    }
  };

  return (
    <>
      <Modal isOpen={!!open} onRequestClose={() => setOpen(false)}>
        <form onSubmit={onSubmit} className="flex flex-col w-screen-3/4 items-start">
          <h2 className="font-bold ml-4 mb-4 text-xl">Créer {type === "section" ? "une rubrique" : "un article"}</h2>
          <div className="flex w-full">
            <div className="flex flex-col flex-grow">
              <label htmlFor="title">Titre</label>
              <InputWithEmojiPicker inputClassName="p-2" className="border-2  mb-5" placeholder={`Titre ${type === "section" ? "de la rubrique" : "de l'article"}`} name="title" />
              {/* <label htmlFor="slug">Slug (Url)</label>
              <input className="p-2 border-2 mb-5" placeholder={`Slug ${type === "section" ? "de la rubrique" : "de l'article"}`} name="slug" /> */}
              <label htmlFor="description">Description</label>
              <textarea className="p-2 border-2 mb-5" placeholder={`Description ${type === "section" ? "de la rubrique" : "de l'article"}`} name="description" />
            </div>
            <div className="ml-10 flex flex-col flex-grow">
              <fieldset className="mb-5">
                <div className=" flex flex-row">
                  <legend>Visible par:</legend>
                  <div className="flex flex-col ml-10">
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
              {/* <div className="flex flex-row items-center">
                <label htmlFor="status">Status: </label>
                <select className="border-2 ml-10 p-2" name="status" value="DRAFT">
                  <option value="PUBLISHED">Publié</option>
                  <option value="DRAFT">Brouillon</option>
                </select>
              </div> */}
            </div>
          </div>
          <div className="flex justify-evenly mt-3.5 w-full">
            <button type="submit" className="w-auto">
              Créer
            </button>
            <button type="reset" onClick={() => setOpen(null)}>
              Annuler
            </button>
          </div>
        </form>
      </Modal>
      <button className="flex justify-center items-center text-center w-8 h-8 rounded-full p-0 ml-3" onClick={() => setOpen(true)}>
        +
      </button>
    </>
  );
};

export default KnowledgeBaseCreate;
