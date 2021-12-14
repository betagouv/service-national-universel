import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import isHotkey, { isKeyHotkey } from "is-hotkey";
import isUrl from "is-url";
import { Editable, withReact, useSlate, Slate, useSlateStatic, useSelected, ReactEditor, useFocused } from "slate-react";
import { Editor, Transforms, createEditor, Element as SlateElement, Range } from "slate";
import { withHistory } from "slate-history";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

import API from "../../services/api";
import { Button, Icon, Spacer, Toolbar } from "./components";
import EmojiPicker from "../EmojiPicker";

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  // "mod+`": "code",
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];

const TextEditor = ({ content, _id, readOnly, onSave }) => {
  const router = useRouter();

  const [value, setValue] = useState(JSON.parse(localStorage.getItem(`snu-kb-content-${_id}`)) || content || empty);
  const [isSaveable, setIsSaveable] = useState(!!localStorage.getItem(`snu-kb-content-${_id}`));
  const [forceUpdateKey, setForceUpdateKey] = useState(0);

  const renderElement = useCallback((props) => <Element {...props} readOnly={readOnly} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withInlines(withEmbeds(withImages(withReact(createEditor()))))), []);

  const onChange = (value) => {
    if (readOnly) return;
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
    if (readOnly) return;
    if (window.confirm("Êtes-vous sûr(e) ? Toutes les modifications seront alors perdues définitivement.")) {
      setValue(content || empty);
      localStorage.removeItem(`snu-kb-content-${_id}`);
      setIsSaveable(false);
      setForceUpdateKey((k) => k + 1);
    }
  };

  const onSaveRequest = async () => {
    if (readOnly) return;
    const success = await onSave(value);
    if (!success) return;
    localStorage.removeItem(`snu-kb-content-${_id}`);
    setIsSaveable(false);
  };

  const onBeforeUnload = () => {
    if (readOnly) return;
    if (localStorage.getItem(`snu-kb-content-${_id}`)) {
      if (window.confirm("Voulez-vous enregistrer vos changements ?")) {
        onSaveRequest();
      }
    }
  };
  useEffect(() => {
    if (!readOnly) {
      router.events.on("routeChangeStart", onBeforeUnload);
      return () => router.events.off("routeChangeStart", onBeforeUnload);
    }
  });

  const onKeyDown = (event) => {
    const { selection } = editor;

    // Default left/right behavior is unit:'character'.
    // This fails to distinguish between two cursor positions, such as
    // <inline>foo<cursor/></inline> vs <inline>foo</inline><cursor/>.
    // Here we modify the behavior to unit:'offset'.
    // This lets the user step into and out of the inline without stepping over characters.
    // You may wish to customize this further to only use unit:'offset' in specific cases.
    for (const hotkey in HOTKEYS) {
      if (isHotkey(hotkey, event)) {
        event.preventDefault();
        const mark = HOTKEYS[hotkey];
        toggleMark(editor, mark);
      }
    }
    if (selection && Range.isCollapsed(selection)) {
      const { nativeEvent } = event;
      if (isKeyHotkey("left", nativeEvent)) {
        event.preventDefault();
        Transforms.move(editor, { unit: "offset", reverse: true });
        return;
      }
      if (isKeyHotkey("right", nativeEvent)) {
        event.preventDefault();
        Transforms.move(editor, { unit: "offset" });
        return;
      }
    }
  };

  return (
    <>
      <div className={`py-2 flex-grow flex-shrink flex flex-col ${!readOnly ? "bg-white" : ""}  overflow-hidden`}>
        <Slate key={forceUpdateKey} editor={editor} value={value} onChange={onChange}>
          {!readOnly && (
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
              <AddLinkButton />
              <RemoveLinkButton />
              <Spacer />
              <BlockButton format="heading-one" icon="looks_one" />
              <BlockButton format="heading-two" icon="looks_two" />
              <BlockButton format="heading-three" icon="looks_3" />
              <Spacer />
              <BlockButton format="numbered-list" icon="format_list_numbered" />
              <BlockButton format="bulleted-list" icon="format_list_bulleted" />
              <Spacer />
              <InsertImageButton />
              <InsertVideoButton />
            </Toolbar>
          )}
          <div id="text-editor" className="overflow-auto flex-shrink flex-grow">
            <Editable
              readOnly={readOnly}
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              placeholder="Commencez à écrire votre article..."
              spellCheck
              autoFocus
              onKeyDown={onKeyDown}
            />
          </div>
        </Slate>
      </div>
      {!readOnly && (
        <div className="py-2 px-8 pt-8 box-border w-full flex-shrink-0 b-0 l-0 r-0 border-t-2 overflow-hidden flex items-center justify-around">
          <button onClick={onSaveRequest} disabled={!isSaveable} className="px-8 py-2 box-border">
            Enregistrer
          </button>
          <button onClick={onCancel} disabled={!isSaveable} className="px-8 py-2 box-border">
            Rétablir la dernière version
          </button>
        </div>
      )}
    </>
  );
};

const withImages = (editor) => {
  const { insertData, isVoid } = editor;

  editor.isVoid = (element) => {
    return element.type === "image" ? true : isVoid(element);
  };

  editor.insertData = (data) => {
    const text = data.getData("text/plain");
    const { files } = data;

    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader();
        const [mime] = file.type.split("/");

        if (mime === "image") {
          reader.addEventListener("load", () => {
            const url = reader.result;
            insertImage(editor, url);
          });

          reader.readAsDataURL(file);
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};

const withEmbeds = (editor) => {
  const { isVoid } = editor;
  editor.isVoid = (element) => (element.type === "video" ? true : isVoid(element));
  return editor;
};

const withInlines = (editor) => {
  const { insertData, insertText, isInline } = editor;

  editor.isInline = (element) => ["link"].includes(element.type) || isInline(element);

  editor.insertText = (text) => {
    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertText(text);
    }
  };

  editor.insertData = (data) => {
    const text = data.getData("text/plain");

    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};

const insertImage = (editor, url) => {
  const text = { text: "" };
  const image = { type: "image", url, children: [text] };
  Transforms.insertNodes(editor, image);
};

const insertLink = (editor, url) => {
  if (editor.selection) {
    wrapLink(editor, url);
  }
};

const isLinkActive = (editor) => {
  const [link] = Editor.nodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
  });
  return link;
};

const unwrapLink = (editor) => {
  Transforms.unwrapNodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
  });
};

const wrapLink = (editor, url) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link = {
    type: "link",
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: "end" });
  }
};

// Put this at the start and end of an inline component to work around this Chromium bug:
// https://bugs.chromium.org/p/chromium/issues/detail?id=1249405
const InlineChromiumBugfix = () => (
  <span contentEditable={false} className="text-0">
    ${String.fromCodePoint(160) /* Non-breaking space */}
  </span>
);

const LinkComponent = ({ attributes, children, element }) => {
  const selected = useSelected();
  return (
    <a {...attributes} href={element.url} className={`${selected ? "border-2" : ""} underline text-blue-900`}>
      <InlineChromiumBugfix />
      {children}
      <InlineChromiumBugfix />
    </a>
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

const Element = (props) => {
  const { attributes, children, element } = props;
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
    case "image":
      return <Image {...props} />;
    case "video":
      return <VideoElement {...props} />;
    case "link":
      return <LinkComponent {...props} />;
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

const Image = ({ attributes, children, element, readOnly }) => {
  const editor = useSlateStatic();
  const path = ReactEditor.findPath(editor, element);

  const selected = useSelected();
  const focused = useFocused();
  return (
    <div {...attributes}>
      {children}
      <div contentEditable={false} className="relative">
        <img src={element.url} className={`block max-w-full max-h-80 ${selected && focused ? "shadow-lg" : ""}`} />
        <Button
          active
          onClick={() => Transforms.removeNodes(editor, { at: path })}
          className={`absolute top-2 left-2 bg-white ${selected && focused && !readOnly ? "inline" : "none"} ${readOnly ? "none" : ""}`}
        >
          <Icon>delete</Icon>
        </Button>
      </div>
    </div>
  );
};

const VideoElement = ({ attributes, children, element, readOnly }) => {
  const editor = useSlateStatic();
  const { url } = element;
  return (
    <div {...attributes}>
      <div contentEditable={false}>
        <div className="pb-[56.25%] h-0 relative">
          <iframe src={`${url}?title=0&byline=0&portrait=0`} frameBorder="0" className="absolute top-0 h-full w-full left-0" />
        </div>
        {!readOnly && (
          <UrlInput
            url={url}
            onChange={(val) => {
              const path = ReactEditor.findPath(editor, element);
              const newProperties = {
                url: val,
              };
              Transforms.setNodes(editor, newProperties, {
                at: path,
              });
            }}
          />
        )}
      </div>
      {children}
    </div>
  );
};

const UrlInput = ({ url, onChange }) => {
  const [value, setValue] = React.useState(url);
  return (
    <input
      value={value}
      onClick={(e) => e.stopPropagation()}
      id="text-editor-video-url"
      className="mt-1 box-border p-2 border-2 mb-5 w-full relative"
      onChange={(e) => {
        const newUrl = e.target.value;
        setValue(newUrl);
        onChange(newUrl);
      }}
    />
  );
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

const InsertImageButton = () => {
  const inputFileRef = useRef(null);
  const editor = useSlateStatic();
  const onUploadImage = async (event) => {
    const imageRes = await API.uploadFile("/support-center/knowledge-base/picture", event.target.files);
    if (imageRes.code === "FILE_CORRUPTED") {
      return toast.error("Le fichier semble corrompu", "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support", {
        timeOut: 0,
      });
    }
    if (!imageRes.ok) return toast.error("Une erreur s'est produite lors du téléversement de votre fichier");
    toast.success("Fichier téléversé");
    insertImage(editor, imageRes.data);
  };
  return (
    <Button
      onMouseDown={(event) => {
        event.preventDefault();
        inputFileRef.current.click();
      }}
    >
      <Icon>image</Icon>
      <input type="file" ref={inputFileRef} onChange={onUploadImage} className="hidden" />
    </Button>
  );
};

const isImageUrl = (url) => {
  if (!url) return false;
  if (!url.includes("cellar-c2.services.clever-cloud.com/")) return false;
  if (!url.startsWith("https://")) return false;
  const ext = new URL(url).pathname.split(".").pop();
  return ["png", "jpg", "jpeg"].includes(ext);
};

const InsertVideoButton = () => {
  const editor = useSlateStatic();
  return (
    <Button
      onMouseDown={(event) => {
        event.preventDefault();
        const videoId = window.prompt("Entrez l'id Viméo de la vidéo - Viméo seulement pour le moment");
        if (isNaN(videoId)) return;
        const video = { type: "video", url: `https://player.vimeo.com/video/${videoId}`, children: [{ text: "" }] };
        Transforms.insertNodes(editor, video);
        Transforms.insertNodes(editor, { type: "paragraph", children: [{ text: "" }] });
      }}
    >
      <Icon>tv</Icon>
    </Button>
  );
};

const AddLinkButton = () => {
  const editor = useSlate();
  return (
    <Button
      active={isLinkActive(editor)}
      onMouseDown={(event) => {
        event.preventDefault();
        const url = window.prompt("Entrez l'URL du lien:", isLinkActive(editor)?.[0]?.url);
        if (!url) return;
        insertLink(editor, url);
      }}
    >
      <Icon>link</Icon>
    </Button>
  );
};

const RemoveLinkButton = () => {
  const editor = useSlate();

  return (
    <Button
      active={isLinkActive(editor)}
      onMouseDown={() => {
        if (isLinkActive(editor)) {
          unwrapLink(editor);
        }
      }}
    >
      <Icon>link_off</Icon>
    </Button>
  );
};

const empty = [{ type: "paragraph", children: [{ text: "" }] }];

export default TextEditor;
