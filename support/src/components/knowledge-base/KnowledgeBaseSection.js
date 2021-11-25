import router from "next/router";
import { useFieldArray, useForm } from "react-hook-form";
import { SUPPORT_ROLES } from "snu-lib/roles";
import KnowledgeBaseCard from "./KnowledgeBaseCard";
import KnowledgeBaseCreate from "./KnowledgeBaseCreate";
import withAuth from "../../hocs/withAuth";
import API from "../../services/api";
import React, { useEffect, useRef } from "react";
import { useSWRConfig } from "swr";
import Sortable from "sortablejs";
import { toast } from "react-toastify";

const KnowledgeBaseSection = ({ section, isRoot }) => {
  section.allowedRoles = isRoot ? [] : Object.keys(SUPPORT_ROLES).map((role) => ({ id: role, name: role, value: section.allowedRoles.includes(role) }));

  const { mutate } = useSWRConfig();
  const gridRef = useRef(null);
  const sortable = useRef(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: section,
  });

  useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: "allowedRoles", // unique name for your Field Array
    // keyName: "id", default to "id", you can change the key name
  });

  const onSubmit = async (body) => {
    body.allowedRoles = body.allowedRoles.filter(({ value }) => !!value).map((item) => item.id);
    const response = await API.put({ path: `/support-center/knowledge-base/${section._id}`, body });
    if (response.error) return alert(response.error);
    mutate(`/support-center/knowledge-base/${response.data.slug}`);
    mutate("/support-center/knowledge-base");
    router.replace(`/admin/knowledge-base/${response.data.slug}`);
  };

  const onListChange = async () => {
    const newSort = [...gridRef.current.children]
      .map((i) => i.dataset.position)
      .map((oldPosition) => section.children.find((item) => item.position.toString() === oldPosition))
      .map((sortedItem, index) => ({ ...sortedItem, position: index + 1 }));

    const response = await API.put({ path: "/support-center/knowledge-base/reorder", body: newSort.map(({ _id, position }) => ({ _id, position })) });
    if (!response.ok) return toast.error("Désolé, une erreur est survenue. Veuillez recommencer !");
    if (section.slug) mutate(`/support-center/knowledge-base/${section.slug}`);
    mutate("/support-center/knowledge-base");
  };

  useEffect(() => {
    sortable.current = Sortable.create(gridRef.current, { animation: 150, onEnd: onListChange });
  }, []);

  return (
    <>
      <div className="flex flex-col flex-grow flex-shrink overflow-hidden w-full">
        {!isRoot && (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col p-12 items-start">
            {/* register your input into the hook by invoking the "register" function */}
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
                    <input className="mr-4" id={role} type="checkbox" {...register(`allowedRoles.${index}.value`)} />
                    <label className="mr-2" id={role} htmlFor={`allowedRoles.${index}.value`}>
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
        )}
        <div ref={gridRef} className="flex flex-wrap  w-full py-12 flex-shrink overflow-y-auto">
          {section.children.map((item) => (
            <KnowledgeBaseCard key={item._id} position={item.position} title={item.title} date={item.createdAt} author={item.author} tags={item.allowedRoles} slug={item.slug} />
          ))}
        </div>
      </div>
      <KnowledgeBaseCreate position={section.children.length + 1} parentId={section._id} />
    </>
  );
};

export default withAuth(KnowledgeBaseSection);
