import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import API from "../../../services/api";
import KnowledgeBaseContext from "../contexts/knowledgeBase";
import Modal from "./Modal";
import Tags from "./Tags";
import TextEditor from "./TextEditor";
import KnowledgeBasePublicContent from "./KnowledgeBasePublicContent";
import { Button } from "./Buttons";

const KnowledgeBaseAdminArticle = ({ article }) => {
  const [readOnly, setReadOnly] = useState(false);
  const { refreshKB } = useContext(KnowledgeBaseContext);

  const onSave = async (content) => {
    const response = await API.put({ path: `/knowledge-base/${article._id}/content`, body: { content } });
    if (!response.ok) {
      if (response.error) return toast.error(response.error);
      return false;
    }
    toast.success("Article mis-à-jour !");
    refreshKB();
    return true;
  };

  return (
    <div className="container mx-auto  flex w-full flex-shrink flex-grow flex-col overflow-hidden bg-coolGray-100 px-6 pt-3">
      {!readOnly && (
        <header className="flex w-full justify-between px-2">
          <h2 className="flex flex-col text-lg">
            <span className="font-bold">{article.title}</span>
            {!!article.description?.length && <p className="mt-1 text-sm italic">{article.description}</p>}
            {!!article.allowedRoles?.length && (
              <p className="mt-3.5 flex flex-wrap  text-sm">
                Visible par:
                <Tags tags={article.allowedRoles} />
              </p>
            )}
          </h2>
          <Button type="button" onClick={() => setReadOnly((r) => !r)} className="my-auto py-2">
            {!readOnly ? "Prévisualiser l'article" : "Éditer"}
          </Button>
        </header>
      )}
      <div className="flex flex-shrink flex-grow flex-col overflow-hidden bg-white  px-2">
        <TextEditor key={article._id + article.slug} content={article.content} _id={article._id} slug={article.slug} onSave={onSave} />
      </div>
      <Modal
        fullScreen
        isOpen={readOnly}
        onRequestClose={() => setReadOnly(false)}
        closeButton={
          <Button type="button" className={!readOnly ? "absolute right-2 top-2" : "!fixed top-0 h-16 w-full rounded-none"} onClick={() => setReadOnly((r) => !r)}>
            {!readOnly ? "Prévisualiser l'article" : "Retour à l'édition"}
          </Button>
        }
        className="pt-16"
      >
        <KnowledgeBasePublicContent item={article} />
      </Modal>
    </div>
  );
};

export default KnowledgeBaseAdminArticle;
