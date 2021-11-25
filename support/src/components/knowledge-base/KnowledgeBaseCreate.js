import { useRouter } from "next/router";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { SUPPORT_ROLES } from "snu-lib/roles";
import { useSWRConfig } from "swr";
import API from "../../services/api";
import InputWithEmojiPicker from "../InputWithEmojiPicker";
import Modal from "../Modal";

const KnowledgeBaseCreate = ({ type, position, parentId = null }) => {
  const [open, setOpen] = useState(null);

  const router = useRouter();
  const { mutate } = useSWRConfig();
  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      status: "DRAFT",
    },
  });

  const { fields } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: "computedAllowedRoles", // unique name for your Field Array
    // keyName: "id", default to "id", you can change the key name
  });

  const onSubmit = async (body) => {
    body.allowedRoles = body.computedAllowedRoles.filter(({ value }) => !!value).map((item) => item.id);
    body.type = type;
    body.position = position;
    body.parentId = parentId;
    const response = await API.post({ path: "/support-center/knowledge-base", body });
    if (response.error) return alert(response.error);
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-screen-3/4 items-start">
          {/* register your input into the hook by invoking the "register" function */}
          <h2 className="font-bold ml-4 mb-4 text-xl">Créer {type === "section" ? "une rubrique" : "un article"}</h2>
          <div className="flex w-full">
            <div className="flex flex-col flex-grow">
              <label htmlFor="title">Titre</label>
              <InputWithEmojiPicker
                setValue={setValue}
                getValues={getValues}
                inputClassName="p-2"
                className="border-2  mb-5"
                placeholder={`Titre ${type === "section" ? "de la rubrique" : "de l'article"}`}
                {...register("title")}
              />
              {errors.titleRequired && <span>This field is required</span>}
              <label htmlFor="slug">Slug (Url)</label>
              <input className="p-2 border-2 mb-5" placeholder={`Slug ${type === "section" ? "de la rubrique" : "de l'article"}`} {...register("slug")} />
              <label htmlFor="description">Description</label>
              <textarea className="p-2 border-2 mb-5" placeholder={`Description ${type === "section" ? "de la rubrique" : "de l'article"}`} {...register("description")} />
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
      <button className="w-8 h-8 rounded-full p-0 ml-3" onClick={() => setOpen(true)}>
        +
      </button>
    </>
  );
};

export default KnowledgeBaseCreate;
