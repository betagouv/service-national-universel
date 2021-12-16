import { jsx } from "slate-hyperscript";
import { Transforms } from "slate";

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
/*
// because of DOMParser, and because DOMParser works quite well this script needs to be run in the browser
const onImportSections = async (event) => {
  event.preventDefault();
  const done = [];
  const fail = [];
  const sections = zammad
    .filter((item) => item.type === "section")
    .sort((s1, s2) => {
      if (s1.zammadId > s2.zammadId) return 1;
      if (s1.zammadId < s2.zammadId) return -1;
      if (s1.zammadParentId < s2.zammadParentId) return -1;
      return 1;
    });
  console.log(sections);
  for (const section of sections) {
    try {
      const body = {
        zammadId: section.zammadId,
        title: section.title,
        zammadParentId: section.zammadParentId,
        type: "section",
        status: "DRAFT",
        position: 0,
        parentId: null,
      };
      if (section.zammadParentId !== null) {
        const parentId = done.find((newSection) => newSection.zammadId === section.zammadParentId)._id;
        body.parentId = parentId;
      }
      const response = await API.post({ path: "/support-center/knowledge-base", body });
      if (!response.ok) {
        console.log("ALERT", response, section);
        fail.push(response);
      } else {
        done.push(response.data);
      }
    } catch (e) {
      console.log(e, section);
      fail.push(section);
      return;
    }
  }
  // const done = await API.get({ path: "/all-slugs", query: { type: "section" } });
  console.log({ done, fail });
  const articles = zammad
    .filter((item) => item.type === "article" && item.status !== "PUBLISHED")
    .sort((s1, s2) => {
      if (s1.zammadId > s2.zammadId) return 1;
      if (s1.zammadId < s2.zammadId) return -1;
      if (s1.zammadParentId < s2.zammadParentId) return -1;
      return 1;
    });
  for (const article of articles) {
    const body = {
      zammadId: article.zammadId,
      title: article.title,
      zammadParentId: article.zammadParentId,
      type: "article",
      status: "DRAFT",
      position: 0,
    };
    const parentId = done.find((newSection) => newSection.zammadId === article.zammadParentId)._id;
    body.parentId = parentId;
    try {
      const parsed = new DOMParser().parseFromString(article.body, "text/html");
      const content = deserialize(parsed.body)
        .map((item) => {
          if (Object.keys(item).length === 1 && Object.keys(item)[0] === "text") {
            if (item.text.includes("widget: video, provider: vimeo, id: ")) {
              return {
                type: "video",
                url: `https://player.vimeo.com/video/${item.text.replace("(", "").replace(")", "").trim().replace("widget: video, provider: vimeo, id: ", "")}`,
                children: [{ text: "" }],
              };
            }
            return { type: "paragraph", children: [item] };
          }
          if (item.type === "link") {
            return { type: "paragraph", children: [item] };
          }
          if (item.type === "paragraph" && item.children.length === 1 && item.children[0]?.text === "\n") {
            return null;
          }
          if (item.type === "bulleted-list") {
            return { type: "bulleted-list", children: item.children.filter((child) => child.type === "list-item") };
          }
          return item;
        })
        .filter(Boolean)
        .map((item) => (Object.keys(item).length === 1 && Object.keys(item)[0] === "text" ? { type: "paragraph", children: item } : item));
      console.log({ content });
      body.content = content;
      // ( widget: video, provider: vimeo, id: 597321949 )

      const response = await API.post({ path: "/support-center/knowledge-base", body });
      if (!response.ok) {
        console.log("ALERT", response, article);
        fail.push(response);
      } else {
        done.push(response.data);
      }
    } catch (e) {
      console.log(e);
      console.log(article);
      fail.push(article);
    }
  }
  console.log({ done, fail });
};
 */
