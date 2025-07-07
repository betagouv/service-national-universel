import isHotkey, { isKeyHotkey } from "is-hotkey";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { createEditor, Editor, Element as SlateElement, Range, Transforms } from "slate";
import { withHistory } from "slate-history";
import PasteLinkify from "slate-paste-linkify";
import { Editable, ReactEditor, Slate, useFocused, useSelected, useSlate, useSlateStatic, withReact } from "slate-react";

import API from "../../services/api";
import { Icon, Spacer, TextEditorButton, Toolbar } from "./components";
import { deserialize, serialize } from "./importHtml";
import { AddLinkButton, isLink, RemoveLinkButton, wrapLink } from "./links";

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  // "mod+`": "code",
};

const plugins = [PasteLinkify()];

const LIST_TYPES = ["numbered-list", "bulleted-list"];
const useKeyPress = (targetKey) => {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    const downHandler = ({ key }) => {
      if (key === targetKey) {
        setKeyPressed(true);
      }
    };

    const upHandler = ({ key }) => {
      if (key === targetKey) {
        setKeyPressed(false);
      }
    };

    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, [targetKey]);

  return keyPressed;
};

const TextEditor = ({ readOnly, setHtmlText, draftMessageHtml, setSlateContent, signature, forcedHtml, hasError, resetCount, className }) => {
  const draftMessageSlate = new DOMParser().parseFromString(draftMessageHtml, "text/html");
  const deserialized = deserialize(draftMessageSlate.body).filter((a) => a.type);
  const [value, setValue] = useState(draftMessageHtml ? (signature ? deserialized.concat(signature) : deserialized) : signature ? signature : empty);
  const [forceUpdateKey, setForceUpdateKey] = useState(0);
  const [shortcuts, setShortcuts] = useState([]);
  const [length, setLength] = useState(0);
  const { user } = useSelector((state) => state.Auth);
  const renderElement = useCallback((props) => <Element {...props} readOnly={readOnly} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const editorRef = useRef();
  const arrowUpPressed = useKeyPress("ArrowUp");
  const arrowDownPressed = useKeyPress("ArrowDown");
  const [selected, setSelected] = useState(0);
  if (!editorRef.current) editorRef.current = withPlugins(withHistory(withReact(createEditor())));
  const editor = editorRef.current;

  useEffect(() => {
    if (Editor.nodes(editor, { at: [], match: (n) => Text.isText(n) || n.type }).length > 0) {
      Transforms.removeNodes(editor, {
        at: {
          anchor: Editor.start(editor, []),
          focus: Editor.end(editor, []),
        },
      });
    }
    setForceUpdateKey(forceUpdateKey + 1);
    if (forcedHtml) {
      const draftMessageSlate = new DOMParser().parseFromString(forcedHtml, "text/html");
      const deserialized = deserialize(draftMessageSlate.body).filter((a) => a.type);
      setValue(deserialized);
    } else {
      setValue(draftMessageHtml ? (signature ? deserialized.concat(signature) : deserialized) : signature ? signature : empty);
    }
  }, [forcedHtml]);

  useEffect(() => {
    if (resetCount > 0) {
      const message = draftMessageHtml ? (signature ? deserialized.concat(signature) : deserialized) : signature ? signature : empty;
      Transforms.select(editor, Editor.start(editor, [])); // move the cursor to the beginning of the input before updating it
      editor.children = message;
    }
  }, [resetCount]);

  useEffect(() => {
    if (arrowUpPressed) {
      selected > 0 ? setSelected(selected - 1) : 0;
    }
  }, [arrowUpPressed]);

  useEffect(() => {
    // needed in case of draft message, otherwise without change the signature is not sent
    onChange(value);
  }, []);

  useEffect(() => {
    if (arrowDownPressed) {
      selected < shortcuts.length - 1 && selected < 4 ? setSelected(selected + 1) : 0;
    }
  }, [arrowDownPressed]);

  const onChange = (value) => {
    setSlateContent?.(value);

    if (readOnly) return;
    setValue(value);

    const arrayHtml = value.map((node) => serialize(node));

    if (!arrayHtml) return;
    (async () => {
      try {
        const q = arrayHtml.join("").match(/:[\w]+/i);
        if (!q) setShortcuts([]);
        if (q && q[0].length > 3) {
          const { ok, data } = await API.get({ path: "/shortcut/search", query: { q: q[0].slice(1, q[0].length) } });
          if (ok) {
            const filtered = data.filter((i) => i.status === true);
            setShortcuts(filtered);
          }
          setLength(q[0].length);
        }
      } catch (e) {
        toast.error(e);
      }
    })();

    setHtmlText(arrayHtml.join(""));
  };

  const handleShortcut = (shortcut) => {
    for (let i = 0; i < length; i++) {
      editor.deleteBackward();
    }
    Transforms.insertNodes(editor, shortcut);
    setShortcuts([]);
    Transforms.select(editor, {
      anchor: Editor.start(editor, []),
      focus: Editor.end(editor, []),
    });
  };

  useEffect(() => {
    if (!value.length) setValue(empty);
  }, [value]);

  const onKeyDown = (event) => {
    const { selection } = editor;

    if (isKeyHotkey("right", event) && shortcuts.length !== 0) {
      handleShortcut(shortcuts[selected].content);
      setSelected(0);
      return;
    }

    // Default left/right behavior is unit:'character'.
    // This fails to distinguish between two cursor positions, such as
    // <inline>foo<cursor/></inline> vs <inline>foo</inline><cursor/>.
    // Here we modify the behavior to unit:'offset'.
    // This lets the user step into and out of the inline without stepping over characters.
    // You may wish to customize this further to only use unit:'offset' in specific cases.
    if (event.key === "Enter" || (event.key === "Enter" && event.shiftKey === true)) {
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

  return (
    <>
      <div
        className={`flex flex-shrink flex-grow flex-col py-2 px-2 ${!readOnly ? "bg-white" : ""} overflow-hidden rounded border border-gray-300 print:bg-transparent ${
          hasError ? "border-[#CE0500]" : ""
        } ${className}`}
      >
        <Slate key={forceUpdateKey} editor={editor} value={value} onChange={onChange}>
          {!readOnly && (
            <Toolbar>
              {/* <TextEditorButton>
                <EmojiPicker size={10} className="my-[5px] !mr-0 !h-5 !w-5 text-2xl" insertEmoji={editor.insertText} />
              </TextEditorButton> */}
              <MarkButton format="bold" icon="format_bold" />
              <MarkButton format="italic" icon="format_italic" />
              <MarkButton format="underline" icon="format_underlined" />
              {/* <BlockButton format="block-quote" icon="format_quote" /> */}
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
              <MarkButton format="indent-decrease" icon="format_indent_decrease" />
              <Spacer /> */}
              {/* <InsertImageButton />
              <InsertVideoButton /> */}
            </Toolbar>
          )}
          <div id="text-editor" className="flex-shrink flex-grow overflow-auto whitespace-normal">
            <Editable
              readOnly={readOnly}
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              placeholder="Commencez à écrire ..."
              spellCheck
              onKeyDown={onKeyDown}
              plugins={plugins}
            />
          </div>
          <ul className="relative  mb-4 text-sm text-gray-600 ">
            {shortcuts.slice(0, 5).map((shortcut, i) => (
              <li
                className={`cursor-pointer  bg-white hover:bg-gray-50 ${i === selected ? "bg-gray-200 text-purple-800" : ""}`}
                key={shortcut._id}
                onClick={() => handleShortcut(shortcut.content)}
              >
                {shortcut.name} {user.role === "AGENT" && shortcut.dest.map((d) => `#${d}`).join(" ")}
              </li>
            ))}
          </ul>
        </Slate>
      </div>
      {/* {!readOnly && (
        <div className="flex gap-3 ">
          <button onClick={onCancel} disabled={!isSaveable} className="h-[38px] mt-6 flex-1 rounded-md border border-gray-300 px-4 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            Annuler
          </button>
          <button onClick={onSaveRequest} disabled={!isSaveable} className="h-[38px] mt-6 flex-1 rounded-md bg-accent-color  px-4 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-500">
            Enregistrer
          </button>
        </div>
      )} */}
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
    if (isLink(text)) {
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
    if (isLink(text)) {
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
    <a
      onClick={(e) => {
        e.preventDefault();
        window.open(element.url, "_blank");
      }}
      {...attributes}
      className={`${selected ? "border-2" : ""} inline text-blue-900 underline`}
    >
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
    children = <strong spellCheck={true}>{children}</strong>;
  }

  // if (leaf.code) {
  //   children = <code>{children}</code>;
  // }

  if (leaf.italic) {
    children = <em spellCheck={true}>{children}</em>;
  }

  if (leaf.underline) {
    children = <u spellCheck={true}>{children}</u>;
  }

  return (
    <span spellCheck={true} {...attributes}>
      {children}
    </span>
  );
};

const Image = ({ attributes, children, element, readOnly }) => {
  const [showDelete, setShowDelete] = useState(false);
  const editor = useSlateStatic();

  const selected = useSelected();
  const focused = useFocused();
  return (
    <div {...attributes}>
      <div contentEditable={false}>
        <img
          src={element.url}
          alt={element.alt}
          onMouseEnter={() => setShowDelete(true)}
          onMouseLeave={() => setShowDelete(false)}
          className={`block max-h-80 max-w-full ${selected && focused ? "shadow-lg" : ""}`}
        />
        {!readOnly && !!showDelete && (
          <TextEditorButton
            active
            onMouseEnter={() => setShowDelete(true)}
            onMouseLeave={() => setShowDelete(false)}
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
        <div className="relative h-0 pb-[56.25%]">
          <iframe src={`${url}?title=0&byline=0&portrait=0`} frameBorder="0" className="absolute top-0 left-0 h-full w-full" />
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
        className="relative mt-1 mb-5 box-border w-full border-2 p-2"
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
  const imageRes = await API.uploadFile("/knowledge-base/picture", files);
  if (imageRes.code === "FILE_CORRUPTED") {
    return toast.error("Le fichier semble corrompu", "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support", {
      timeOut: 0,
    });
  }
  if (!imageRes.ok) return toast.error("Une erreur s'est produite lors du téléversement de votre fichier");
  toast.success("Fichier téléversé");
  return [imageRes.data, imageAlt];
};

const isImageUrl = (url) => {
  if (!url) return false;
  if (!url.includes("cellar-c2.services.clever-cloud.com/")) return false;
  if (!url.startsWith("https://")) return false;
  const ext = new URL(url).pathname.split(".").pop();
  return ["png", "jpg", "jpeg"].includes(ext);
};

const empty = [{ type: "paragraph", children: [{ text: "" }] }];

export default TextEditor;
