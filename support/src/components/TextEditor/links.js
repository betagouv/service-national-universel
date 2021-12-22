import React, { useState, useEffect } from "react";
import { useSlate } from "slate-react";
import isUrl from "is-url";
import { Editor, Transforms, Element as SlateElement, Range } from "slate";
import { TextEditorButton, Icon } from "./components";
import Modal from "../Modal";
import { Button, CancelButton } from "../Buttons";
import AdminKBTree from "../knowledge-base/AdminKBTree";
import useKnowledgeBaseData from "../../hooks/useKnowledgeBaseData";

export const isLinkActive = (editor) => {
  const [link] = Editor.nodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
  });
  return link;
};

export const unwrapLink = (editor) => {
  Transforms.unwrapNodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
  });
};

export const wrapLink = (editor, url) => {
  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link = isLinkActive(editor);
  if (isCollapsed && !!link) {
    Transforms.select(editor, {
      anchor: { path: link[1], offset: 0 },
      focus: { path: link[1], offset: link?.[0]?.children[0]?.text?.length },
    });
  }
  if (!!link) {
    unwrapLink(editor);
  }

  const leaf = {
    type: "link",
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed && !link) {
    Transforms.insertNodes(editor, leaf);
  } else {
    Transforms.wrapNodes(editor, leaf, { split: true });
    Transforms.collapse(editor, { edge: "end" });
  }
};

export const insertLink = (editor, url) => {
  if (editor.selection) {
    wrapLink(editor, url);
  }
};

export const AddLinkButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const editor = useSlate();
  return (
    <>
      <TextEditorButton
        active={isLinkActive(editor)}
        onMouseDown={(event) => {
          event.preventDefault();
          setIsOpen(true);
        }}
      >
        <Icon>link</Icon>
      </TextEditorButton>
      <AddLinkModal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} />
    </>
  );
};

export const AddLinkModal = ({ isOpen, onRequestClose }) => {
  const editor = useSlate();
  const link = isLinkActive(editor);
  const { flattenedData } = useKnowledgeBaseData();
  const [url, setUrl] = useState(link?.[0]?.url);
  const [error, setError] = useState("");
  const computeError = () => {
    const isSlug = flattenedData.map((item) => `/base-de-connaissance/${item.slug}`).includes(url);
    if (url.startsWith("/")) {
      if (!isSlug) return "Ce lien ne redirige vers aucun article";
      return "";
    }
    if (!isUrl(url)) return "Ce lien n'est pas valide";
    return "";
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (!!computeError()) return setError(computeError());
    if (!!url) insertLink(editor, url);
    onRequestClose();
  };

  useEffect(() => {
    if (!!isOpen) setUrl(link?.[0]?.url);
  }, [isOpen]);

  useEffect(() => {
    if (!!error) setError("");
  }, [url]);

  const onUrlChange = (event) => setUrl(event.target.value);
  const onSlugChange = (slug) => setUrl(`/base-de-connaissance/${slug}`);

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <form onSubmit={onSubmit} className="flex flex-col w-screen-3/4 items-start overflow-hidden">
        <h2 className="font-bold ml-4 mb-4 text-xl">{!!link ? "Éditer" : "Ajouter"} un lien</h2>
        <div className="flex flex-col flex-shrink  w-full overflow-hidden">
          <label htmlFor="title">Veuillez saisir une url, ou cliquer sur un lien vers la base de connaissance ci-dessous</label>
          <input className="p-2 border-2" placeholder="https://snu.gouv.fr/ ?" name="url" value={url} onChange={onUrlChange} />
          <span className="text-red-500 text-xs mb-10 mt-1">{error}</span>
          <div className="overflow-auto">
            <AdminKBTree visible onClick={onSlugChange} />
          </div>
        </div>
        <div className="flex justify-evenly mt-3.5 w-full">
          <Button type="submit" className="w-auto">
            Enregistrer
          </Button>
          <CancelButton type="reset" onClick={onRequestClose}>
            Annuler
          </CancelButton>
        </div>
      </form>
    </Modal>
  );
};

export const RemoveLinkButton = () => {
  const editor = useSlate();

  return (
    <TextEditorButton
      active={isLinkActive(editor)}
      onMouseDown={() => {
        if (isLinkActive(editor)) {
          unwrapLink(editor);
        }
      }}
    >
      <Icon>link_off</Icon>
    </TextEditorButton>
  );
};
