import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { mutate } from "swr";
import API from "../../services/api";
import Modal from "../Modal";

const KnowledgeBaseCreate = ({ position, parentId = null }) => {
  const [type, setType] = useState(null);

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (body) => {
    body.type = type;
    body.position = position;
    body.parentId = parentId;
    const response = await API.post({ path: "/support-center/knowledge-base", body });
    if (response.error) return alert(response.error);
    if (response.data) {
      if (router.query.slug) mutate(`/support-center/knowledge-base/${router.query.slug}`);
      mutate("/support-center/knowledge-base/", null);
      router.push(`/admin/knowledge-base/${response.data.slug}`);
      setType(null);
    }
  };

  return (
    <>
      <Modal isOpen={!!type} onRequestClose={() => setType(null)}>
        <form onSubmit={handleSubmit(onSubmit)} className="w-screen-1/2 h-full flex flex-col">
          <h1 className="text-center mb-5 font-bold">Créer une {type === "section" ? "section" : "réponse"}</h1>
          {/* include validation with required or other standard HTML validation rules */}
          <input placeholder={`Titre de la ${type === "section" ? "section" : "réponse"}`} className="p-2 border-2 mb-5" type="text" {...register("title", { required: true })} />
          {/* errors will return when field validation fails  */}
          {errors.titleRequired && <span>Il faut un titre !</span>}

          <div className="flex justify-evenly mt-3.5">
            <button type="submit" className="w-auto">
              Créer
            </button>
            <button type="reset" onClick={() => setType(null)}>
              Annuler
            </button>
          </div>
        </form>
      </Modal>
      <div className=" py-2 box-border w-full flex-shrink-0 b-0 l-0 r-0 overflow-hidden flex items-center justify-around">
        <button onClick={() => setType("section")} className="px-8 py-2 box-border">
          + Nouvelle section
        </button>
        <button onClick={() => setType("answer")} className="px-8 py-2">
          + Nouvelle réponse
        </button>
      </div>
    </>
  );
};

export default KnowledgeBaseCreate;
