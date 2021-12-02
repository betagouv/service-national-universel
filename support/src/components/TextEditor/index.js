import React, { useCallback, useEffect, useMemo, useState } from "react";
import isHotkey from "is-hotkey";
import { Editable, withReact, useSlate, Slate } from "slate-react";
import { Editor, Transforms, createEditor, Element as SlateElement } from "slate";
import { withHistory } from "slate-history";

import { Button, Icon, Spacer, Toolbar } from "./components";
import API from "../../services/api";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import useKnowledgeBaseData from "../../hooks/useKnowledgeBaseData";
import EmojiPicker from "../EmojiPicker";

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  // "mod+`": "code",
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];

const TextEditor = ({ content, _id, forceUpdateKey, setForceUpdateKey }) => {
  const router = useRouter();

  const [value, setValue] = useState(JSON.parse(localStorage.getItem(`snu-kb-content-${_id}`)) || content || empty);
  const [isSaveable, setIsSaveable] = useState(!!localStorage.getItem(`snu-kb-content-${_id}`));
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const { mutate } = useKnowledgeBaseData();

  const onChange = (value) => {
    setValue(value);

    const isAstChange = editor.operations.some((op) => "set_selection" !== op.type);
    if (isAstChange) {
      // Save the value to Local Storage.
      const content = JSON.stringify(value);
      localStorage.setItem(`snu-kb-content-${_id}`, content);
      setIsSaveable(true);
    }
  };

  const onCancel = () => {
    if (window.confirm("Êtes-vous sûr(e) ? Toutes les modifications seront alors perdues définitivement.")) {
      setValue(content || empty);
      localStorage.removeItem(`snu-kb-content-${_id}`);
      setIsSaveable(false);
      setForceUpdateKey((k) => k + 1);
    }
  };

  const onSave = async () => {
    const response = await API.put({ path: `/support-center/knowledge-base/${_id}`, body: { content: value } });
    if (!response.ok) {
      if (response.error) return toast.error(response.error);
      return;
    }
    toast.success("Article mis-à-jour !");
    mutate();
    localStorage.removeItem(`snu-kb-content-${_id}`);
    setIsSaveable(false);
  };

  const onBeforeUnload = () => {
    if (localStorage.getItem(`snu-kb-content-${_id}`)) {
      if (window.confirm("Voulez-vous enregistrer vos changements ?")) {
        onSave();
      }
    }
  };
  useEffect(() => {
    router.events.on("routeChangeStart", onBeforeUnload);
    return () => router.events.off("routeChangeStart", onBeforeUnload);
  });

  return (
    <div className="px-8 pt-8 flex-grow flex-shrink flex flex-col overflow-hidden">
      <Slate key={forceUpdateKey} editor={editor} value={value} onChange={onChange}>
        <Toolbar>
          <Button>
            <EmojiPicker size={10} className="text-2xl my-1.5 !mr-0 !h-5 !w-5" insertEmoji={editor.insertText} />
          </Button>
          <MarkButton format="bold" icon="format_bold" />
          <MarkButton format="italic" icon="format_italic" />
          <MarkButton format="underline" icon="format_underlined" />
          <BlockButton format="block-quote" icon="format_quote" />
          {/* <MarkButton format="code" icon="code" /> */}
          <Spacer />
          <BlockButton format="heading-one" icon="looks_one" />
          <BlockButton format="heading-two" icon="looks_two" />
          <BlockButton format="heading-three" icon="looks_3" />
          <Spacer />
          <BlockButton format="numbered-list" icon="format_list_numbered" />
          <BlockButton format="bulleted-list" icon="format_list_bulleted" />
        </Toolbar>
        <div id="text-editor" className="overflow-auto flex-shrink flex-grow">
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="Commencez à écrire votre article..."
            spellCheck
            autoFocus
            onKeyDown={(event) => {
              for (const hotkey in HOTKEYS) {
                if (isHotkey(hotkey, event)) {
                  event.preventDefault();
                  const mark = HOTKEYS[hotkey];
                  toggleMark(editor, mark);
                }
              }
            }}
          />
        </div>
      </Slate>
      <div className="py-2 box-border w-full flex-shrink-0 b-0 l-0 r-0 overflow-hidden flex items-center justify-around">
        <button onClick={onSave} disabled={!isSaveable} className="px-8 py-2 box-border">
          Enregistrer
        </button>
        <button onClick={onCancel} disabled={!isSaveable} className="px-8 py-2 box-border">
          Rétablir la dernière version
        </button>
      </div>
    </div>
  );
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes(n.type),
    split: true,
  });
  const newProperties = {
    type: isActive ? "paragraph" : isList ? "list-item" : format,
  };
  Transforms.setNodes(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor, format) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
  });

  return !!match;
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case "block-quote":
      return <blockquote {...attributes}>{children}</blockquote>;
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "heading-one":
      return <h1 {...attributes}>{children}</h1>;
    case "heading-two":
      return <h2 {...attributes}>{children}</h2>;
    case "heading-three":
      return <h3 {...attributes}>{children}</h3>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  // if (leaf.code) {
  //   children = <code>{children}</code>;
  // }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

const BlockButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const empty = [{ type: "paragraph", children: [{ text: "" }] }];

export default TextEditor;
