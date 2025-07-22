import React, { useContext, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import API from "./../../../services/api";
import { Button, CancelButton, NewButton } from "./Buttons";
import KnowledgeBaseContext from "./../contexts/knowledgeBase";
import InputWithEmojiPicker from "./InputWithEmojiPicker";
import Modal from "./Modal";
import { translateRoleBDC } from "../../../utils";

const KnowledgeBaseAdminItemCreateV2 = ({ type, position, parentId = null, isRoot }) => {
  const [open, setOpen] = useState(null);
  const organisation = useSelector((state) => state.Auth.organisation);
  const history = useHistory();
  const { knowledgeBaseTree, setFlattenedKB, flattenedKB } = useContext(KnowledgeBaseContext);

  const [isCreating, setIsCreating] = useState(false);
  const onSubmit = async (event) => {
    event.preventDefault();
    setIsCreating(true);
    const formData = new FormData(event.currentTarget);
    const body = { type, position, parentId: formData.get("subTheme") || formData.get("theme") || parentId, allowedRoles: [] };
    for (let [key, value] of formData.entries()) {
      if (key === "subTheme" || key === "theme") continue;
      if (key.includes(".")) {
        // allowedRole in fieldset
        const [checkboxFieldset, checkboxName] = key.split(".");
        if (["on", true].includes(value)) body[checkboxFieldset].push(checkboxName);
      } else {
        body[key] = value;
      }
    }
    const response = await API.post({ path: "/knowledge-base", body });
    setIsCreating(false);
    if (response.error) return toast.error(response.error);
    if (response.data) {
      setFlattenedKB([...flattenedKB, response.data]);
      history.push(`/knowledge-base/${response.data.slug}`);
      setOpen(false);
    }
  };
  const [thematiques, setThematiques] = useState([]);
  const [sousThematiques, setSousThematiques] = useState([]);

  async function getThematique(knowledgeBaseTree) {
    const thematique = knowledgeBaseTree.children;
    const thematiqueArray = [];
    const filteredThematiques = thematique.filter((item) => item.parentId === null && item.type === "section");
    filteredThematiques.map((item) => {
      thematiqueArray.push(item);
    });
    return thematiqueArray;
  }

  const handleThematiqueChange = (event) => {
    const selectedThematiqueId = event.target.value;
    const thematique = thematiques.find((item) => item._id === selectedThematiqueId);

    if (thematique?.children?.length > 0) {
      const sousThematiquesFiltered = thematique.children.filter((child) => child.type === "section");
      setSousThematiques(sousThematiquesFiltered);
    } else {
      setSousThematiques([]);
    }
  };

  useEffect(() => {
    getThematique(knowledgeBaseTree).then((options) => {
      setThematiques(options);
    });
  }, [knowledgeBaseTree]);

  return (
    <>
      <Modal isOpen={!!open} onRequestClose={() => setOpen(false)}>
        <form onSubmit={onSubmit} className="flex w-screen-3/4 flex-col items-start">
          <h2 className="ml-4 mb-4 text-xl font-bold">Créer {type === "section" ? "une thématique" : "un article"}</h2>
          <div className="flex w-full">
            <div className="flex flex-grow flex-col">
              <label htmlFor="title">Titre</label>
              <InputWithEmojiPicker
                inputClassName="p-2"
                className="mb-5  border-2"
                placeholder={`Titre ${type === "section" ? "de la thématique" : "de l'article"}`}
                name="title"
              />
              {/* <label htmlFor="slug">Slug (Url)</label>
              <input className="p-2 border-2 mb-5" placeholder={`Slug ${type === "section" ? "de la rubrique" : "de l'article"}`} name="slug" /> */}
              <label htmlFor="description">Description</label>
              <textarea className="mb-5 border-2 p-2" placeholder={`Description ${type === "section" ? "de la thématique" : "de l'article"}`} name="description" />
              {type !== "section" && isRoot ? (
                <>
                  <label htmlFor="theme">Thématique concernée</label>
                  <select className="mb-5 border-2 p-2" name="theme" onChange={handleThematiqueChange} required>
                    {thematiques.map((thematique) => (
                      <option value={thematique._id} key={thematique.title}>
                        {thematique.title}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="subTheme">Sous-thématique concernée</label>
                  <select className="mb-5 border-2 p-2" name="subTheme">
                    {sousThematiques.map((sousThematique) => (
                      <option value={sousThematique._id} key={sousThematique.title}>
                        {sousThematique.title}
                      </option>
                    ))}
                    <option defaultValue value="">
                      Article flottant dans la thématique
                    </option>
                  </select>
                </>
              ) : null}
            </div>
            <div className="ml-10 flex flex-grow flex-col">
              <fieldset className="mb-5">
                <div className=" flex flex-row">
                  <legend>Visible par:</legend>
                  <div className="ml-10 flex flex-col">
                    {organisation.knowledgeBaseRoles.map((role) => (
                      <div className="flex items-center" key={role}>
                        <input className="mr-4" id={`allowedRoles.${role}`} type="checkbox" name={`allowedRoles.${role}`} defaultChecked />
                        <label className="mr-2" id={role} htmlFor={`allowedRoles.${role}`}>
                          {translateRoleBDC[role]}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
          <div className="mt-3.5 flex w-full justify-evenly">
            <Button type="submit" className="w-auto" disabled={isCreating} loading={isCreating}>
              Créer
            </Button>
            <CancelButton type="reset" onClick={() => setOpen(null)}>
              Annuler
            </CancelButton>
          </div>
        </form>
      </Modal>
      <NewButton className="ml-2 flex h-8 w-8 items-center justify-center !rounded-full !p-0 text-center" onClick={() => setOpen(true)}>
        +
      </NewButton>
    </>
  );
};

export default KnowledgeBaseAdminItemCreateV2;
