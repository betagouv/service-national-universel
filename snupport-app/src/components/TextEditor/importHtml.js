import escapeHtml from "escape-html";
import { Text, Transforms } from "slate";
import { jsx } from "slate-hyperscript";

const ELEMENT_TAGS = {
  A: (el) => ({ type: "link", url: el.getAttribute("href") }),
  BLOCKQUOTE: () => ({ type: "quote" }),
  H1: () => ({ type: "heading-one" }),
  H2: () => ({ type: "heading-two" }),
  H3: () => ({ type: "heading-three" }),
  H4: () => ({ type: "heading-four" }),
  H5: () => ({ type: "heading-five" }),
  H6: () => ({ type: "heading-six" }),
  IMG: (el) => ({ type: "image", url: el.getAttribute("src") }),
  LI: () => ({ type: "list-item" }),
  OL: () => ({ type: "numbered-list" }),
  P: () => ({ type: "paragraph" }),
  SECTION: () => ({ type: "section" }),
  PRE: () => ({ type: "code" }),
  UL: () => ({ type: "bulleted-list" }),
};

// COMPAT: `B` is omitted here because Google Docs uses `<b>` in weird ways.
const TEXT_TAGS = {
  CODE: () => ({ code: true }),
  DEL: () => ({ strikethrough: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  S: () => ({ strikethrough: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true }),
};

export const deserialize = (el) => {
  try {
    if (el.nodeType === 3) {
      return el.textContent;
    } else if (el.nodeType !== 1) {
      return null;
    } else if (el.nodeName === "BR") {
      return "\n";
    }

    const { nodeName } = el;
    let parent = el;

    if (nodeName === "PRE" && el.childNodes[0] && el.childNodes[0].nodeName === "CODE") {
      parent = el.childNodes[0];
    }
    let children = Array.from(parent.childNodes).map(deserialize).flat();

    if (children.length === 0) {
      children = [{ text: "" }];
    }

    if (el.nodeName === "BODY") {
      return jsx("fragment", {}, children);
    }

    if (ELEMENT_TAGS[nodeName]) {
      const attrs = ELEMENT_TAGS[nodeName](el);
      return jsx("element", attrs, children);
    }

    if (TEXT_TAGS[nodeName]) {
      const attrs = TEXT_TAGS[nodeName](el);
      return children.map((child) => jsx("text", attrs, child));
    }

    return children;
  } catch (e) {
    console.log("ERROR DESERIALIZE", e);
    console.log(el);
  }
  return null;
};

//  export const serialize = (node) => {
//    try{
//      if(node.type ==='parag');
//    }catch (e) {
//      console.log("ERROR SERIALIZE", e);
//      console.log(node);
//    }
//  }

export const serialize = (node) => {
  if (Text.isText(node)) {
    let string = escapeHtml(node.text);
    if (node.bold) {
      string = `<strong>${string}</strong>`;
    }
    if (node.italic) {
      string = `<i>${string}</i>`;
    }
    if (node.underline) {
      string = `<u>${string}</u>`;
    }
    return string;
  }
  const children = node.children.map((n) => serialize(n)).join("");

  switch (node.type) {
    case "quote":
      return `<blockquote><p>${children}</p></blockquote>`;
    case "paragraph":
      //dirty setInnerHtml not supporting \n
      return `<p>${children === "" ? "<br>" : children}</p>`;
    case "link":
      return `<a href="${escapeHtml(node.url)}">${children}</a>`;
    case "numbered-list":
      return `<ol>${children}</ol>`;
    case "list-item":
      return `<li>${children}</li>`;
    case "bulleted-list":
      return `<ul>${children}</ul>`;
    case "heading-one":
      return `<h1>${children}</h1>`;
    case "heading-two":
      return `<h2>${children}</h2>`;
    case "heading-three":
      return `<h3>${children}</h3>`;
    case "section":
      return `<section>${children}</section>`;
    default:
      return children;
  }
};
export const withHtml = (editor) => {
  const { insertData, isInline, isVoid } = editor;

  editor.isInline = (element) => {
    return element.type === "link" ? true : isInline(element);
  };

  editor.isVoid = (element) => {
    return element.type === "image" ? true : isVoid(element);
  };

  editor.insertData = (data) => {
    const html = data.getData("text/html");

    console.log({ html, data });

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

export const isMessageValid = (message) => {
  if (!message || message === "<p></p>" || message === "<p><br></p>" || message.length < 10) return false;
  return true;
};

export const removeLineBreakFromStartAndEnd = (message) => {
  return message.replace(/(^(<p><br><\/p>|<p>[\r\n]<\/p>)+|(<p><br><\/p>|<p>[\r\n]<\/p>)+$)/gm, "");
};

export const getMessageWithoutSignature = (message, signature) => {
  if (!message || !signature) return message;
  const signatureHtml = signature.map((node) => serialize(node)).join("");

  return message.replace(removeLineBreakFromStartAndEnd(signatureHtml), "");
};
