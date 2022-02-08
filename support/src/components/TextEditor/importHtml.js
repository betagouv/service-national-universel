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

// because of DOMParser, and because DOMParser works quite well this script needs to be run in the browser
export const onImportSections = (API, zammad) => async (event) => {
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
  sections.unshift({
    zammadId: 0,
    title: "Zammad",
    zammadParentId: null,
    type: "section",
    createdAt: "2021-08-27T05:03:45.883Z",
    updatedAt: "2021-09-02T06:56:55.624Z",
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
  // const { data: done } = await API.getasync({ path: "/support-center/knowledge-base/all", query: { type: "section" } });
  console.log({ done, fail });
  const articles = zammad
    .filter((item) => item.type === "article")
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
          // get videos
          // ( widget: video, provider: vimeo, id: 597321949 )
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
          return item;
        })
        .filter(Boolean)
        .map((item) => {
          // remove extra line breaks
          try {
            if (item.type === "paragraph" && item.children.length === 1 && item.children[0]?.text === "\n") {
              return null;
            }
          } catch (e) {
            console.log("CANNOT REMOVE LINE BREAKS", e);
            console.log(item);
          }
          return item;
        })
        .filter(Boolean)
        .map((item) => {
          // format list
          try {
            if (["bulleted-list", "numbered-list"].includes(item.type)) {
              return { type: item.type, children: item.children.filter((child) => child.type === "list-item") };
            }
          } catch (e) {
            console.log("CANNOT MAP LISTS", e);
            console.log(item);
          }
          return item;
        })
        .filter(Boolean)
        .reduce((items, item, index) => {
          // when double-break inside text, split in other paragraph
          try {
            if (item.type !== "paragraph") return [...items, item];
            if (item.children?.length !== 1) return [...items, item];
            if (item.children[0]?.text.includes("\n\n")) {
              const texts = item.children[0]?.text?.split("\n\n")?.filter(Boolean);
              return [...items, ...texts.map((text) => ({ type: "paragraph", children: [{ text }] }))];
            }
            return [...items, item];
          } catch (e) {
            console.log("CANNOT REDUCE DOUBLE BREAKS", e);
            console.log(items, item, index);
          }
          return [...items, item];
        }, [])
        // format official bullet list from artificial
        .reduce((items, item, index) => {
          try {
            if (item.type !== "paragraph") return [...items, item];
            if (item.children?.length !== 1) return [...items, item];
            if (item.children[0]?.text?.startsWith("- ") || item.children[0]?.text?.startsWith("\n- ")) {
              const updatedItem = {
                type: "bulleted-list",
                children: item.children[0]?.text
                  ?.split("- ")
                  .map((text) => text.replace("\n", ""))
                  .filter(Boolean)
                  .map((text) => ({ type: "list-item", children: [{ text }] })),
              };
              return [...items, updatedItem];
            }
          } catch (e) {
            console.log("CANNOT REDUCE BULLET LISTS", e);
            console.log(items, item, index);
          }
          return [...items, item];
        }, [])
        .filter(Boolean)
        // format official bullet list from artificial
        .reduce((items, item, index) => {
          try {
            if (item.type !== "list-item") return [...items, item];
            if (item.children?.length !== 1) return [...items, item];
            const previousItem = items[items.length - 1];
            if (!previousItem || !["bulleted-list", "numbered-list"].includes(previousItem.type)) {
              return [
                ...items,
                {
                  type: "bulleted-list",
                  children: item.children[0]?.text
                    ?.split("- ")
                    .filter(Boolean)
                    .map((text) => ({ type: "list-item", children: [{ text: text.replaceAll("\n", "") }] })),
                },
              ];
            } else {
              return [
                ...items.filter((i, ind) => ind < items.length - 1),
                {
                  ...previousItem,
                  children: [...previousItem.children, { type: "list-item", children: [{ text: item.children[0]?.text?.replaceAll("\n", "") }] }],
                },
              ];
            }
          } catch (e) {
            console.log("CANNOT REDUCE LISTS", e);
            console.log(items, item, index);
          }
          return [...items, item];
        }, [])
        .filter(Boolean)
        // format links
        .reduce((items, item, index) => {
          try {
            if (item.type !== "link") return [...items, item];
            const previousItem = items[items.length - 1];
            if (!items.length) return [...items, item];
            if (previousItem.type === "paragraph" && previousItem.children.length) {
              return items.map((existingItem, existingIndex) => {
                if (existingIndex !== items.length - 1) return existingItem;
                return {
                  ...existingItem,
                  children: [...existingItem.children, item],
                };
              });
            }
          } catch (e) {
            console.log("CANNOT REDUCE FORMAT LINK", e);
            console.log(items, item, index);
          }
          return [...items, item];
        }, [])
        .filter(Boolean)
        // remove standalone dots like { type: 'paragraph', children: [{ text: '.' }] }
        .reduce((items, item, index) => {
          try {
            if (item.type !== "paragraph") return [...items, item];
            if (item.children?.length !== 1) return [...items, item];
            if (item.children[0]?.text?.trim() !== ".") return [...items, item];
            if (!items.length) return [...items, item];
            const previousItem = items[items.length - 1];
            if (previousItem.type === "paragraph" && previousItem.children.length) {
              return items.map((existingItem, existingIndex) => {
                if (existingIndex !== items.length - 1) return existingItem;
                return {
                  ...existingItem,
                  children: [...existingItem.children, { text: "." }],
                };
              });
            }
          } catch (e) {
            console.log("CANNOT REDUCE STANDOLONE DOTS", e);
            console.log(items, item, index);
          }
          return [...items, item];
        }, [])
        .filter(Boolean)
        // remove leading dots like { type: 'paragraph', children: [{ text: '. Pour commencer' }] }
        .reduce((items, item, index) => {
          try {
            if (item.type !== "paragraph") return [...items, item];
            if (!item.children?.[0]?.text?.trimStart()) return [...items, item];
            if (!item.children?.[0]?.text?.trimStart().startsWith(".")) return [...items, item];
            const previousItem = items[items.length - 1];
            if (previousItem.type === "paragraph" && previousItem.children.length) {
              return [
                ...items.map((existingItem, existingIndex) => {
                  if (existingIndex !== items.length - 1) return existingItem;
                  return {
                    ...existingItem,
                    children: [...existingItem.children, { text: "." }],
                  };
                }),
                {
                  ...item,
                  children: item.children.map((child, index) => {
                    if (index !== 0) return child;
                    if (!child.text) return child;
                    return { text: child.text.trimStart().substring(1) };
                  }),
                },
              ];
            }
          } catch (e) {
            console.log("CANNOT REDUCE LEADING DOTS", e);
            console.log(items, item, index);
          }
          return [...items, item];
        }, [])
        .filter(Boolean)
        // make children an array
        .map((item) => {
          if (!item.children) return item;
          if (Array.isArray(item.children)) return item;
          return { ...item, children: [item.children] };
        })
        .filter(Boolean)
        // transform uneditable { text: 'sfsdf' } into { type: 'paragraph', children: [{ text: 'sfsdf' }] }
        // or add it to the previous paragraph
        .reduce((items, item, index, original) => {
          try {
            if (!Object.keys(item).includes("text")) return [...items, item];
            const previousItem = items[items.length - 1];
            if (!previousItem) return [...items, { type: "paragraph", children: [item] }];
            return items.map((existingItem, existingIndex) => {
              if (existingIndex !== items.length - 1) return existingItem;
              return {
                ...existingItem,
                children: [...existingItem.children, item],
              };
            });
          } catch (e) {
            console.log("CANNOT REDUCE TEXT TRANSFORM", e);
            console.log({ items, item, index, original });
          }
          return [...items, item];
        }, [])
        .filter(Boolean)
        // remove empty children
        .filter((item) => !item.children || !!item.children.length);

      body.content = content;
      console.log(body);

      const response = await API.post({ path: "/support-center/knowledge-base", body });
      if (!response.ok) {
        console.log("ALERT", response, article);
        fail.push(response);
      } else {
        done.push(response.data);
      }
    } catch (e) {
      console.log("ERROR BABY");
      console.log(e);
      const parsed = new DOMParser().parseFromString(article.body, "text/html");
      console.log({ article, parsed });
      fail.push(article);
    }
  }
  const findAndUpdateLink = (item) => {
    if (item.type === "link") {
      try {
        if (item.url.includes("https://support.snu.gouv.fr")) {
          console.log("changing", item.url);
          if (["https://support.snu.gouv.fr", "https://support.snu.gouv.fr/", "https://support.snu.gouv.fr/#"].includes(item.url)) {
            console.log("JUST FORMAT");
            return {
              ...item,
              url: "https://support.snu.gouv.fr/",
            };
          }
          if (["https://support.snu.gouv.fr/help/fr-fr", "https://support.snu.gouv.fr/help/fr-fr/", "https://support.snu.gouv.fr/help/fr-fr/#"].includes(item.url)) {
            console.log("JUST ROOT");
            return {
              ...item,
              url: "/base-de-connaissance",
            };
          }
          console.log("update url", item.url);
          const zammadId = Number(
            item.url
              .split("/")
              .filter(Boolean)
              .map((slug) => slug.split("-")[0])
              .filter(Boolean)
              .filter((item) => !isNaN(item))
              .filter((_, index, array) => index === array.length - 1)[0]
          );
          const articleSlug = done.find((item) => item.zammadId === zammadId && item.type === "article").slug;
          const url = `/base-de-connaissance/${articleSlug}`;
          return {
            ...item,
            url,
          };
        }
      } catch (e) {
        console.log("ERROR UPDATING LINK", e);
        console.log(item);
      }
      return item;
    }
    if (item.children) {
      return {
        ...item,
        children: item.children.map(findAndUpdateLink),
      };
    }
    return item;
  };
  for (const article of done.filter((item) => item.type === "article")) {
    const { content, _id } = article;
    await API.put({ path: `/support-center/knowledge-base/${_id}`, body: { content: content.map(findAndUpdateLink) } });
  }
  console.log({ done, fail });
};
