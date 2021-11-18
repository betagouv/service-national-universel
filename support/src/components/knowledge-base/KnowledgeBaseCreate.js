import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import API from "../../services/api";
import Modal from "../Modal";

const KnowledgeBaseCreate = ({ position }) => {
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
    const response = await API.post({ path: "/support-center/knowledge-base", body });
    if (response.error) return alert(response.error);
    if (response.data) {
      router.push(`/admin/knowledge-base/${response.data.slug}`);
      setType(null);
    }
  };

  return (
    <>
      <Modal isOpen={!!type} onRequestClose={() => setType(null)}>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full h-full flex flex-col">
          <h1 className="text-center mb-5 font-bold">Créer une {type === "section" ? "section" : "réponse"}</h1>
          {/* include validation with required or other standard HTML validation rules */}
          <input placeholder={`Titre de la ${type === "section" ? "section" : "réponse"}`} className="p-2 border-2 mb-5" type="text" {...register("title", { required: true })} />
          {/* errors will return when field validation fails  */}
          {errors.titleRequired && <span>Il faut un titre !</span>}

          <div className="flex justify-evenly mt-3.5">
            <button type="submit" className="w-auto">
              Créer
            </button>
            <button type="reset">Annuler</button>
          </div>
        </form>
      </Modal>
      <div className="my-1 px-1 w-72 flex-shrink-0 flex-grow-0 lg:my-4 lg:px-4 overflow-hidden flex flex-col items-center justify-center">
        <button onClick={() => setType("section")} className="w-full">
          + Nouvelle section
        </button>
        <button onClick={() => setType("answer")} className="w-full">
          + Nouvelle réponse
        </button>
      </div>
    </>
  );
};

export default KnowledgeBaseCreate;
