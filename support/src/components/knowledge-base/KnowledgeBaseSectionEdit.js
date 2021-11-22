import { useState } from "react";
import { useSWRConfig } from "swr";
import router from "next/router";
import { useFieldArray, useForm } from "react-hook-form";
import { SUPPORT_ROLES } from "snu-lib/roles";
import withAuth from "../../hocs/withAuth";
import API from "../../services/api";
import Modal from "../Modal";

const KnowledgeBaseSectionEdit = ({ section }) => {
  section.computedAllowedRoles = Object.keys(SUPPORT_ROLES).map((role) => ({ id: role, name: role, value: section.allowedRoles.includes(role) }));

  const { mutate } = useSWRConfig();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: section,
  });

  const { fields } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: "computedAllowedRoles", // unique name for your Field Array
    // keyName: "id", default to "id", you can change the key name
  });

  const onSubmit = async (body) => {
    body.allowedRoles = body.computedAllowedRoles.filter(({ value }) => !!value).map((item) => item.id);
    const response = await API.put({ path: `/support-center/knowledge-base/${section._id}`, body });
    if (response.error) return alert(response.error);
    mutate(`/support-center/knowledge-base/${response.data.slug}`, response.data);
    mutate("/support-center/knowledge-base/", null);
    router.replace(`/admin/knowledge-base/${response.data.slug}`);
    setIsOpen(false);
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-screen-3/4 items-start">
          {/* register your input into the hook by invoking the "register" function */}
          <h2 className="font-bold ml-4 mb-4 text-xl">Éditer la section</h2>
          <div className="flex w-full">
            <div className="flex flex-col flex-grow">
              <label htmlFor="title">Titre</label>
              <input className="p-2 border-2 mb-5" placeholder="Titre de la section" {...register("title")} />
              {errors.titleRequired && <span>This field is required</span>}
              <label htmlFor="slug">Slug (Url)</label>
              <input className="p-2 border-2 mb-5" placeholder="Slug de la section" {...register("slug")} />
              <label htmlFor="description">Description</label>
              <textarea className="p-2 border-2 mb-5" placeholder="Description de la section" {...register("description")} />
            </div>
            <fieldset className="ml-10  flex-grow">
              <legend className="mb-5">Visible par:</legend>
              {Object.keys(SUPPORT_ROLES).map((role, index) => (
                <div className="flex items-center" key={role}>
                  <input className="mr-4" id={role} type="checkbox" {...register(`computedAllowedRoles.${index}.value`)} />
                  <label className="mr-2" id={role} htmlFor={`computedAllowedRoles.${index}.value`}>
                    {SUPPORT_ROLES[role]}
                  </label>
                </div>
              ))}
            </fieldset>
          </div>
          <button type="submit" className="w-auto">
            Enregistrer
          </button>
        </form>
      </Modal>
    </>
  );
};

export default withAuth(KnowledgeBaseSectionEdit);
