import { useState } from "react";
import { toast } from "react-toastify";
import useKnowledgeBaseData from "../../hooks/useKnowledgeBaseData";
import API from "../../services/api";
import Modal from "../Modal";
import Tags from "../Tags";
import TextEditor from "../TextEditor";
import KnowledgeBasePublicContent from "./KnowledgeBasePublicContent";

const KnowledgeBaseAdminArticle = ({ article }) => {
  const [readOnly, setReadOnly] = useState(false);
  const { mutate } = useKnowledgeBaseData();

  const onSave = async (content) => {
    const response = await API.put({ path: `/support-center/knowledge-base/${article._id}`, body: { content } });
    if (!response.ok) {
      if (response.error) return toast.error(response.error);
      return false;
    }
    toast.success("Article mis-à-jour !");
    mutate();
    return true;
  };

  return (
    <div className="container bg-coolGray-100  mx-auto flex flex-col px-6 pt-3 flex-grow flex-shrink overflow-hidden w-full">
      {!readOnly && (
        <header className="flex w-full justify-between px-2">
          <h2 className="flex flex-col text-lg">
            <span className="font-bold">{article.title}</span>
            {!!article.description?.length && <p className="mt-1 text-sm italic">{article.description}</p>}
            {!!article.allowedRoles?.length && (
              <p className="flex flex-wrap mt-3.5  text-sm">
                Visible par:
                <Tags tags={article.allowedRoles} />
              </p>
            )}
          </h2>
          <button type="button" className="my-auto" onClick={() => setReadOnly((r) => !r)}>
            {!readOnly ? "Prévisualiser" : "Éditer"}
          </button>
        </header>
      )}
      <div className="bg-white px-2 flex-grow flex-shrink flex flex-col  overflow-hidden">
        <TextEditor key={article._id + article.slug} content={article.content} _id={article._id} slug={article.slug} onSave={onSave} />
      </div>
      <Modal
        fullScreen
        isOpen={readOnly}
        onRequestClose={() => setReadOnly(false)}
        closeButton={
          <button type="button" className="absolute right-2 top-2" onClick={() => setReadOnly((r) => !r)}>
            {!readOnly ? "Prévisualiser" : "Éditer"}
          </button>
        }
      >
        <KnowledgeBasePublicContent item={article} />
      </Modal>
    </div>
  );
};

export default KnowledgeBaseAdminArticle;
