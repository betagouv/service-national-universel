import React, { useCallback, useEffect, useRef, useState } from "react";
import isHotkey, { isKeyHotkey } from "is-hotkey";
import isUrl from "is-url";
import { Editable, withReact, useSlate, Slate, useSlateStatic, useSelected, ReactEditor, useFocused } from "slate-react";
import { Editor, Transforms, createEditor, Element as SlateElement, Range } from "slate";
import { withHistory } from "slate-history";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import PasteLinkify from "slate-paste-linkify";

import API from "../../services/api";
import { TextEditorButton, Icon, Spacer, Toolbar } from "./components";
import { wrapLink, AddLinkButton, RemoveLinkButton } from "./links";
import EmojiPicker from "../EmojiPicker";
import { deserialize } from "./importHtml";

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  // "mod+`": "code",
};

const plugins = [PasteLinkify()];

const LIST_TYPES = ["numbered-list", "bulleted-list"];

const TextEditor = ({ content, _id, readOnly, onSave }) => {
  const router = useRouter();

  const [value, setValue] = useState(JSON.parse(localStorage.getItem(`snu-kb-content-${_id}`)) || content || empty);
  const [isSaveable, setIsSaveable] = useState(!!localStorage.getItem(`snu-kb-content-${_id}`));
  const [forceUpdateKey, setForceUpdateKey] = useState(0);

  const renderElement = useCallback((props) => <Element {...props} readOnly={readOnly} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const editorRef = useRef();
  if (!editorRef.current) editorRef.current = withPlugins(withHistory(withReact(createEditor())));
  const editor = editorRef.current;

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

  useEffect(() => {
    if (!value.length) setValue(empty);
  }, [value]);

  const onKeyDown = (event) => {
    const { selection } = editor;

    // Default left/right behavior is unit:'character'.
    // This fails to distinguish between two cursor positions, such as
    // <inline>foo<cursor/></inline> vs <inline>foo</inline><cursor/>.
    // Here we modify the behavior to unit:'offset'.
    // This lets the user step into and out of the inline without stepping over characters.
    // You may wish to customize this further to only use unit:'offset' in specific cases.
    if (event.key === "Enter" && event.shiftKey === true) {
      console.log("SOFT ");
      event.preventDefault();
      editor.insertText("\n");
      return;
    }

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

  console.log(value);

  return (
    <>
      <div className={`py-2 flex-grow flex-shrink flex flex-col ${!readOnly ? "bg-white" : ""}  overflow-hidden`}>
        <Slate key={forceUpdateKey} editor={editor} value={value} onChange={onChange}>
          {!readOnly && (
            <Toolbar>
              <TextEditorButton>
                <EmojiPicker size={10} className="text-2xl my-1.5 !mr-0 !h-5 !w-5" insertEmoji={editor.insertText} />
              </TextEditorButton>
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
              {/* <MarkButton format="indent-increase" icon="format_indent_increase" />
              <MarkButton format="indent-decrease" icon="format_indent_decrease" /> */}
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
              plugins={plugins}
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

const withPlugins = (editor) => {
  const { insertData, isVoid, insertText, isInline } = editor;

  editor.isVoid = (element) => {
    // images
    if (element.type === "image") return true;
    if (element.type === "video") return true;
    return isVoid(element);
  };

  editor.isInline = (element) => ["link"].includes(element.type) || isInline(element);

  editor.insertText = (text) => {
    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertText(text);
    }
  };

  editor.insertData = async (data) => {
    const text = data.getData("text/plain");
    const { files } = data;
    const html = data.getData("text/html");

    // images
    if (files && files.length > 0) {
      const file = files[0];
      const [mime] = file.type.split("/");

      if (mime === "image") {
        const [imageUrl, imageAlt] = await uploadImage(files);
        if (!!imageUrl && !!imageAlt) insertImage(editor, imageUrl, imageAlt);
      }
      return;
    }
    if (text && isImageUrl(text)) {
      const imageAlt = await new Promise((resolve) => {
        const alt = window.prompt("Veuillez saisir la description de l'image (accessibilité personne mal-voyante) :");
        resolve(alt);
      });
      if (!imageAlt) {
        toast.error("Désolé, une description est obligatoire !");
      } else {
        insertImage(editor, text, imageAlt);
      }
      return;
    }
    if (text && isUrl(text)) {
      wrapLink(editor, text);
      return;
    }
    if (html) {
      const parsed = new DOMParser().parseFromString(html, "text/html");
      const fragment = deserialize(parsed.body);
      Transforms.insertFragment(editor, fragment);
      return;
    }
    insertData(data);
  };

  return editor;
};

const insertImage = (editor, url, alt) => {
  const text = { text: "" };
  const image = { type: "image", url, alt, children: [text] };
  Transforms.insertNodes(editor, image);
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
  const [showDelete, setShowDelete] = useState(false);
  const editor = useSlateStatic();

  const selected = useSelected();
  const focused = useFocused();
  return (
    <div {...attributes}>
      <div contentEditable={false} className="relative" style={{ userSelect: "none" }}>
        <img
          src={element.url}
          alt={element.alt}
          onMouseEnter={() => {
            console.log("plaf");
            setShowDelete(true);
          }}
          onMouseLeave={() => {
            console.log("plaf");
            setShowDelete(false);
          }}
          className={`block max-w-full max-h-80 ${selected && focused ? "shadow-lg" : ""}`}
        />
        {!readOnly && !!showDelete && (
          <TextEditorButton
            active
            onMouseEnter={() => {
              console.log("plaf");
              setShowDelete(true);
            }}
            onMouseLeave={() => {
              console.log("plaf");
              setShowDelete(false);
            }}
            onClick={() => {
              const path = ReactEditor.findPath(editor, element);
              Transforms.removeNodes(editor, { at: path });
            }}
            className={`absolute top-2 left-2 bg-white ${selected && focused && !readOnly ? "inline" : "none"} ${readOnly ? "none" : ""}`}
          >
            <Icon>delete</Icon>
          </TextEditorButton>
        )}
        {!readOnly && (
          <MetaDataInput
            initValue={element.alt}
            label="Description"
            name="alt"
            onChange={(val) => {
              const path = ReactEditor.findPath(editor, element);
              const newProperties = {
                ...element,
                alt: val,
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
          <MetaDataInput
            initValue={url}
            label="Url"
            name="url"
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

const MetaDataInput = ({ initValue, onChange, label, name }) => {
  const [value, setValue] = React.useState(initValue);
  return (
    <>
      <label className="text-xs text-gray-400" htmlFor={name}>
        {label} <span className="italic">(Champ visible seulement en mode édition)</span>
      </label>
      <input
        value={value}
        name={name}
        onClick={(e) => e.stopPropagation()}
        id="text-editor-metadata-input"
        className="mt-1 box-border p-2 border-2 mb-5 w-full relative"
        onChange={(e) => {
          const newUrl = e.target.value;
          setValue(newUrl);
          onChange(newUrl);
        }}
      />
    </>
  );
};

const BlockButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <TextEditorButton
      active={isBlockActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </TextEditorButton>
  );
};

const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <TextEditorButton
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </TextEditorButton>
  );
};

const uploadImage = async (files) => {
  const imageAlt = await new Promise((resolve) => {
    const alt = window.prompt("Veuillez saisir la description de l'image (accessibilité personne mal-voyante) :");
    resolve(alt);
  });
  if (!imageAlt) {
    toast.error("Désolé, une description est obligatoire !");
    return [null, null];
  }
  const imageRes = await API.uploadFile("/support-center/knowledge-base/picture", files);
  if (imageRes.code === "FILE_CORRUPTED") {
    return toast.error("Le fichier semble corrompu", "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support", {
      timeOut: 0,
    });
  }
  if (!imageRes.ok) return toast.error("Une erreur s'est produite lors du téléversement de votre fichier");
  toast.success("Fichier téléversé");
  return [imageRes.data, imageAlt];
};

const InsertImageButton = () => {
  const [reloadKey, setReloadKey] = useState(0);
  const inputFileRef = useRef(null);
  const editor = useSlateStatic();
  const onUploadImage = async (event) => {
    const [imageUrl, imageAlt] = await uploadImage(event.target.files);
    if (!!imageUrl && !!imageAlt) insertImage(editor, imageUrl, imageAlt);
    // if no reload key, you can't upload the same file twice.
    setReloadKey((k) => k + 1);
  };
  return (
    <TextEditorButton
      onMouseDown={(event) => {
        event.preventDefault();
        inputFileRef.current.click();
      }}
    >
      <Icon>image</Icon>
      <input key={reloadKey} type="file" ref={inputFileRef} onChange={onUploadImage} className="hidden" />
    </TextEditorButton>
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
    <TextEditorButton
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
    </TextEditorButton>
  );
};

const empty = [{ type: "paragraph", children: [{ text: "" }] }];

export default TextEditor;
