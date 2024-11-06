/* eslint-disable @typescript-eslint/no-var-requires */
// noinspection HtmlUnknownAttribute

const path = require("path");
const fs = require("fs/promises");
const slugify = require("slugify");

const projectDir = path.resolve(__dirname, "..", "..");
const srcDir = path.join(projectDir, "src");
const destinationPath = path.join(srcDir, "scenes", "develop", "AssetsPresentationPage.jsx");
let uniqueId = 0;

const ASSET_COUNT_PER_LINE = 8;

(async function () {
  console.log("-------------------------------------------------------");
  console.log("🤖 Generating Assets presentation page...");

  const relativeAssetsDirFromScene = "../../assets";
  const context = await exploreDir(srcDir, "assets", relativeAssetsDirFromScene);
  const view = createView(context);

  await fs.writeFile(destinationPath, view);

  console.log("✅ Assets presentation page generated.");
  console.log("-------------------------------------------------------");
})();

function getNextUniqueId() {
  return ++uniqueId;
}

async function exploreDir(basedir, dir, relativeDir) {
  const uniqueId = getNextUniqueId();
  let context = {
    title: dir,
    folders: [],
    components: [],
  };

  const currentDir = path.join(basedir, dir);
  const files = await fs.readdir(currentDir);
  for (const file of files) {
    const stat = await fs.lstat(path.join(currentDir, file));
    if (stat.isDirectory()) {
      const folder = await exploreDir(currentDir, file, path.join(relativeDir, file));
      context.folders.push(folder);
    } else {
      if (file.endsWith(".png") || file.endsWith(".svg") || file.endsWith(".jpg") || file.endsWith(".gif")) {
        context.components.push(addImage(file, relativeDir));
      } else if (file.endsWith(".js")) {
        context.components.push(addComponent(file, relativeDir, uniqueId));
      }
    }
  }

  return context;
}

function addImage(file, dir) {
  let componentName = slugify(file, { strict: true, trim: true, lower: true, replacement: "_" }) + "_" + uniqueId;
  componentName = componentName.substring(0, 1).toUpperCase() + componentName.substring(1);
  return {
    type: "image",
    name: file,
    require: { [componentName]: path.join(dir, file) },
    item: `<img src={${componentName}} alt="${file}" crossOrigin="anonymous" className="${imageClass}"/>`,
  };
}

function addComponent(file, dir, uniqueId) {
  const dotIndex = file.lastIndexOf(".");
  let componentName = slugify(file.substring(0, dotIndex), { strict: true, trim: true, lower: true, replacement: "_" }) + "_" + uniqueId;
  componentName = componentName.substring(0, 1).toUpperCase() + componentName.substring(1);
  return {
    type: "component",
    name: file,
    require: { [componentName]: path.join(dir, file) },
    item: `<${componentName} />`,
  };
}

const pageClass = "p-8";
const titleClass = "text-3xl font-bold text-[#000000] my-8";
const itemsListClass = `grid grid-cols-${ASSET_COUNT_PER_LINE} gap-4`;
const itemClass = "border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center";
const imageClass = "";
const itemNameClass = "absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]";
const foldersListClass = "";
const folderClass = "";

function createView(context) {
  let imports = [];
  const folderView = createFolderView(context, imports);

  const input =
    '<div className="flex items-center justify-center">' +
    '<div className="mr-2 text-[#BBBBBB]">Filtre :</div>' +
    '<input type="text" value={filter} onChange={changeFilter} className="p-1 border-[1px] border-[#BBBBBB] rounded-md" />' +
    '<div className="ml-2 w-[24px] h-[24px] text-[#BBBBBB] hover:border-[1px] hover:border-[#DDDDDD] rounded-md hover:text-[#808080] cursor-pointer flex items-center justify-center" onClick={resetFilter}><div className="w-[10px] h-[10px]"><HiX /></div></div>' +
    "</div>";

  return (
    "/* eslint-disable prettier/prettier */\n\n" +
    "/* ------------------------------------------------------\n" +
    "   Cette Page est générée automatiquement par le script\n" +
    "   /utils/generate-assets-presentation-page.js\n" +
    "   ------------------------------------------------------ */\n\n" +
    `import React, { useState, useEffect } from "react";\nimport { HiX } from "react-icons/hi";
    \n${imports.join("\n")}\n\n` +
    "export default function AssetsPresentationPage() {\n" +
    'const [filter, setFilter] = useState("");\n' +
    "\tuseEffect(() => {\n" +
    '\t\tconst filterText = filter && filter.trim().length > 0 ? filter.trim().toLowerCase() : "";\n' +
    "\t\tif(filterText && filterText.length > 0) {\n" +
    '\t\t\tdocument.querySelectorAll("[data-name]").forEach((element) => {\n' +
    '\t\t\t\tif (element.getAttribute("data-name").indexOf(filterText) >= 0) {\n' +
    '\t\t\t\t\telement.style.display = "block";\n' +
    "\t\t\t\t} else {\n" +
    '\t\t\t\t\telement.style.display = "none";\n' +
    "\t\t\t\t}\n" +
    "\t\t\t});\n" +
    "\t\t} else {\n" +
    '\t\t\tdocument.querySelectorAll("[data-name]").forEach((element) => {\n' +
    '\t\t\t\telement.style.display = "block";\n' +
    "\t\t\t});\n" +
    "\t\t}\n" +
    "\t}, [filter]);\n" +
    "\tfunction changeFilter(e) {\n" +
    "\t\tsetFilter(e.target.value);\n" +
    "\t}\n" +
    "\tfunction resetFilter() {\n" +
    '\t\tsetFilter("");\n' +
    "\t}" +
    `\treturn (\n<div className="${pageClass}">${input}\n${folderView}</div>\n\t);\n}\n`
  );
}

function createFolderView(context, imports) {
  // --- prepare elements
  const components = [];
  const title = `<div className="${titleClass}">${context.title}</div>`;
  for (const item of context.components) {
    if (item.require) {
      for (const compName of Object.keys(item.require)) {
        imports.push(`import ${compName} from "${item.require[compName]}";`);
      }
    }
    components.push(`<div className="${itemClass}" data-name="${item.name.toLowerCase()}">${item.item}<div className="${itemNameClass}">${item.name}</div></div>`);
  }
  const folders = context.folders.map((folder) => createFolderView(folder, imports));

  // build view
  return `<div className="${folderClass}">${title}<div className="${itemsListClass}">${components.join("")}</div><div className="${foldersListClass}">${folders.join(
    "",
  )}</div></div>`;
}
