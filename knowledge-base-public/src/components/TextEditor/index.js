import React, { useCallback, useRef } from "react";
import { Editable, withReact, Slate, useSlateStatic, useSelected, ReactEditor, useFocused } from "slate-react";
import { Transforms, createEditor } from "slate";
import { withHistory } from "slate-history";

const TextEditor = ({ content, readOnly }) => {
  const renderElement = useCallback((props) => <Element {...props} readOnly={readOnly} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const editorRef = useRef();
  if (!editorRef.current) editorRef.current = withHistory(withReact(createEditor()));
  const editor = editorRef.current;

  return (
    <>
      <div className={`flex flex-shrink flex-grow flex-col py-2 px-2 ${!readOnly ? "bg-white" : ""} overflow-hidden print:bg-transparent`}>
        <Slate editor={editor} value={content} onChange={console.log}>
          <div id="text-editor" className="flex-shrink flex-grow overflow-auto">
            <Editable readOnly={readOnly} renderElement={renderElement} renderLeaf={renderLeaf} placeholder="Commencez à écrire votre article..." spellCheck autoFocus />
          </div>
        </Slate>
      </div>
    </>
  );
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
    <a {...attributes} href={element.url} className={`${selected ? "border-2" : ""} text-blue-600 underline`}>
      <InlineChromiumBugfix />
      {children}
      <InlineChromiumBugfix />
    </a>
  );
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

const Image = ({ attributes, children, element }) => {
  const selected = useSelected();
  const focused = useFocused();
  return (
    <div {...attributes}>
      <div contentEditable={false} className="relative" style={{ userSelect: "none" }}>
        <img src={element.url} alt={element.alt} className={`block max-h-80 max-w-full ${selected && focused ? "shadow-lg" : ""}`} />
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

export default TextEditor;
