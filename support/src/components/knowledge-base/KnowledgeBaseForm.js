import { SUPPORT_ROLES } from "snu-lib/roles";
import InputWithEmojiPicker from "../InputWithEmojiPicker";

const KnowledgeBaseForm = ({ type, defaultValues, onSubmit, children }) => {
  return (
    <form onSubmit={onSubmit} className="flex flex-col w-screen-3/4 items-start">
      {/* register your input into the hook by invoking the "register" function */}
      <h2 className="font-bold ml-4 mb-4 text-xl">Créer {type === "section" ? "une rubrique" : "un article"}</h2>
      <div className="flex w-full">
        <div className="flex flex-col flex-grow">
          <label htmlFor="title">Titre</label>
          <InputWithEmojiPicker inputClassName="p-2" className="border-2  mb-5" placeholder={`Titre ${type === "section" ? "de la rubrique" : "de l'article"}`} name="title" />
          <label htmlFor="slug">Slug (Url)</label>
          <input className="p-2 border-2 mb-5" placeholder={`Slug ${type === "section" ? "de la rubrique" : "de l'article"}`} name="slug" />
          <label htmlFor="description">Description</label>
          <textarea className="p-2 border-2 mb-5" placeholder={`Description ${type === "section" ? "de la rubrique" : "de l'article"}`} name="description" />
        </div>
        <div className="ml-10 flex flex-col flex-grow">
          <fieldset className="mb-5">
            <div className=" flex flex-row">
              <legend>Visible par:</legend>
              <div className="flex flex-col ml-10">
                {Object.keys(SUPPORT_ROLES).map((role, index) => (
                  <div className="flex items-center" key={role}>
                    <input className="mr-4" id={role} type="checkbox" {...register(`computedAllowedRoles.${index}.value`)} />
                    <label className="mr-2" id={role} htmlFor={`computedAllowedRoles.${index}.value`}>
                      {SUPPORT_ROLES[role]}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </fieldset>
          <div className="flex flex-row items-center">
            <label htmlFor="status">Status: </label>
            <select className="border-2 ml-10 p-2" {...register("status")}>
              <option value="PUBLISHED">Publié</option>
              <option value="DRAFT">Brouillon</option>
            </select>
          </div>
        </div>
      </div>
      {children}
    </form>
  );
};

export default KnowledgeBaseForm;
