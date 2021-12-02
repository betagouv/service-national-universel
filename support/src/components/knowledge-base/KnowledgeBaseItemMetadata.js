import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SUPPORT_ROLES } from "snu-lib/roles";
import { toast } from "react-toastify";
import API from "../../services/api";
import useKnowledgeBaseData from "../../hooks/useKnowledgeBaseData";
import InputWithEmojiPicker from "../InputWithEmojiPicker";

const KnowledgeBaseItemMetadata = ({ visible, setVisible }) => {
  const router = useRouter();

  const [slug, setSlug] = useState(router.query?.slug || "");
  useEffect(() => {
    setSlug(router.query?.slug || "");
  }, [router.query?.slug]);

  const { flattenedData, item, mutate } = useKnowledgeBaseData({ slug });

  const onSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const body = { allowedRoles: [] };
    for (let [key, value] of formData.entries()) {
      if (key.includes(".")) {
        // allowedRole in fieldset
        const [checkboxFieldset, checkboxName] = key.split(".");
        if (["on", true].includes(value)) body[checkboxFieldset].push(checkboxName);
      } else {
        body[key] = value;
      }
    }
    const response = await API.put({ path: `/support-center/knowledge-base/${item._id}`, body });
    if (response.error) return toast.error(response.error);
    mutate();
    router.replace(`/admin/knowledge-base/${response.data.slug}`);
  };

  const onDelete = async () => {
    if (window.confirm("Voulez-vous vraiment supprimer cet élément ? Cette opération est définitive")) {
      const response = await API.delete({ path: `/support-center/knowledge-base/${item._id}` });
      if (response.error) return toast.error(response.error);
      toast.success("Élément supprimé !");
      const parent = flattenedData.find((otherItems) => otherItems._id === item.parentId);
      mutate();
      router.replace(`/admin/knowledge-base/${parent?.slug || ""}`);
    }
  };
  console.log(item);

  return (
    <div className={`flex-grow-0 flex-shrink-0 border-l-2 shadow-md resize-x dir-rtl overflow-hidden ${visible ? "w-80" : "w-0 hidden"}`}>
      <aside className="flex flex-col p-2 border-6 overflow-scroll h-full dir-ltr">
        <svg
          onClick={() => setVisible(false)}
          xmlns="http://www.w3.org/2000/svg"
          className="flex-grow-0 flex-shrink-0 ml-auto m-2 h-6 w-6 cursor-pointer"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        <form onSubmit={onSubmit} className="flex flex-col w-full items-start" key={item._id}>
          <label htmlFor="title">Titre</label>
          <InputWithEmojiPicker
            inputClassName="p-2"
            className="border-2 mb-5 bg-white w-full"
            placeholder={`Titre ${item.type === "section" ? "de la rubrique" : "de l'article"}`}
            name="title"
            defaultValue={item.title}
          />
          <label htmlFor="slug">Slug (Url)</label>
          <input className="p-2 border-2 mb-5 w-full" placeholder={`Slug ${item.type === "section" ? "de la rubrique" : "de l'article"}`} name="slug" defaultValue={item.slug} />
          <label htmlFor="description">Description</label>
          <textarea
            className="p-2 border-2 mb-5 w-full"
            placeholder={`Description ${item.type === "section" ? "de la rubrique" : "de l'article"}`}
            name="description"
            defaultValue={item.description}
          />
          <fieldset className="mb-5">
            <legend className="mb-2">Visible par:</legend>
            <div className="flex flex-col ml-4">
              {Object.keys(SUPPORT_ROLES).map((role) => (
                <div className="flex items-center" key={role}>
                  <input className="mr-4" id={`allowedRoles.${role}`} type="checkbox" name={`allowedRoles.${role}`} defaultChecked={item.allowedRoles?.includes(role)} />
                  <label className="mr-2" id={role} htmlFor={`allowedRoles.${role}`}>
                    {SUPPORT_ROLES[role]}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
          <div className="flex justify-start items-center">
            <label htmlFor="status">Visibilité: </label>
            <select className="border-2 ml-5 p-2" name="status" defaultValue={item.status}>
              <option value="PUBLISHED">Publié</option>
              <option value="DRAFT">Brouillon</option>
            </select>
          </div>
          <button type="submit" className="mr-auto mt-8 mb-2">
            Enregistrer
          </button>
          <button className="bg-white !border-2 border-red-500  text-red-500 mr-auto" onClick={onDelete}>
            Supprimer
          </button>
        </form>
      </aside>
    </div>
  );
};

export default KnowledgeBaseItemMetadata;
